import { useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { useLiveMapLocations } from './services/useLiveMapLocations';
import type { Location } from './LocationData';
import './StaticMap.css';

const MAX_POINTS = 1800; // safety cap for canvas drawing

export default function StaticMap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const topoRef = useRef<any | null>(null);
  const countriesRef = useRef<any | null>(null);
  const selectedCountryRef = useRef<any | null>(null);

  const locations = useLiveMapLocations();
  const visibleLocations = useMemo(() => (locations ? locations.slice(0, MAX_POINTS) : []), [locations]);

  // Draw function: renders countries + graticule + points onto canvas
  const draw = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pixel ratio for crisp rendering on high-DPI screens
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Fill background
    ctx.fillStyle = '#071226';
    ctx.fillRect(0, 0, width, height);

    if (!topoRef.current) return;

  // Prepare projection and path
  // Use a plain rectangular projection (Equirectangular) for a non-globe, rectangular map
  const projection: any = d3.geoEquirectangular();

  const countries = countriesRef.current || feature(topoRef.current, topoRef.current.objects.countries) as any;

    // Fit to canvas but preserve a sensible world aspect ratio so the
    // projection is not horizontally stretched when the canvas is much
    // wider than tall (we often expand canvas width for horizontal panning).
    // Use equirectangular world aspect (approx 2:1 width:height) as a cap.
    try {
      const WORLD_ASPECT = 2.0; // world width / height for equirectangular
      // Determine the maximum width we should use for fitting to preserve
      // aspect: don't let fitWidth exceed height * WORLD_ASPECT.
      const fitMaxWidth = Math.max(200, Math.floor(height * WORLD_ASPECT));
      const fitWidth = Math.min(width, fitMaxWidth);

      if (height < 700) {
        // fill vertical space but cap width to preserve aspect
        const margin = 0;
        projection.fitExtent([[margin, margin], [fitWidth, height]], countries as any);
      } else {
        const margin = Math.max(6, Math.min(30, Math.round(Math.min(width, height) * 0.02)));
        projection.fitExtent([[margin, margin], [Math.max(margin + 8, fitWidth - margin), height - margin]], countries as any);
      }
      // If we fitted to a narrower virtual fitWidth than the actual canvas
      // width, shift the projection horizontally to center the fitted world
      // within the canvas so extra horizontal space becomes scrollable area
      // rather than stretching the projection.
      const currentTranslate = projection.translate();
      const extra = Math.max(0, Math.floor((width - fitWidth) / 2));
      if (extra > 0) {
        projection.translate([currentTranslate[0] + extra, currentTranslate[1]]);
      }

      // We don't apply a post-fit scale here. The resize loop controls the
      // initial 'visual zoom' by setting a larger CSS canvas width before
      // calling draw so projection.fitExtent uses that width. Keeping draw
      // deterministic avoids repeated small-scale tweaks here.

      // Deterministic full-world width calculation: sample projected X for a
      // grid of longitudes and representative latitudes to compute the pixel
      // span needed to render the entire world under the current projection.
      // This avoids relying on country geometries which might be clustered
      // and ensures left/right edges are reachable by scrolling.
      const lonSamples = 180; // 2° steps
      const latSamples = [-80, -40, 0, 40, 80];
      const xs: number[] = [];
      for (let li = 0; li < latSamples.length; li++) {
        const lat = latSamples[li];
        for (let i = 0; i <= lonSamples; i++) {
          const lon = -180 + (360 * i) / lonSamples;
          try {
            const p = projection([lon, lat] as any);
            if (p && Number.isFinite(p[0])) xs.push(p[0]);
          } catch (e) {
            // ignore invalid projections
          }
        }
      }
      if (xs.length > 0) {
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const pad = Math.max(8, Math.round(Math.min(width, height) * 0.01));
        const projectedWidth = Math.max(0, maxX - minX);
        const requiredWidth = Math.ceil(projectedWidth + pad * 2);

        // shift projection so minX aligns with left padding and expand width
        if (requiredWidth > width) {
          const translate = projection.translate();
          const shiftX = Math.ceil(pad - minX);
          projection.translate([translate[0] + shiftX, translate[1]]);
          // expand draw width so the canvas contains the full projected world
          width = requiredWidth;
          // Also adjust the canvas style so the scrollable area matches
          const canvas = canvasRef.current;
          if (canvas) canvas.style.width = `${width}px`;
        }
      }
    } catch (e) {
      // fallback
      projection.scale(width / 6.5).translate([width / 2, height / 1.7]);
    }

    const path = d3.geoPath().projection(projection).context(ctx as any);

  // If a country is selected, draw it later with an accent so it appears
  // interactive. We'll compute selection after drawing base map.

    // Draw graticule (two layers: fine + coarse) to help orient many points
    // Choose step sizes based on canvas size to avoid overcrowding on small screens
    const computeSteps = () => {
      // base fine step (degrees)
      let fine = 5;
      let coarse = 30;
      if (width < 600) {
        fine = 10;
        coarse = 30;
      } else if (width < 900) {
        fine = 7.5;
        coarse = 30;
      }
      return { fine, coarse };
    };

    const { fine, coarse } = computeSteps();

    // fine graticule - subtle
    ctx.save();
    ctx.beginPath();
    const graticuleFine = d3.geoGraticule().step([fine, fine]);
    path(graticuleFine() as any);
  ctx.strokeStyle = 'rgba(14,165,233,0.12)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();

    // coarse graticule - more visible
    ctx.save();
    ctx.beginPath();
    const graticuleCoarse = d3.geoGraticule().step([coarse, coarse]);
    path(graticuleCoarse() as any);
  ctx.strokeStyle = 'rgba(14,165,233,0.22)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    // Draw countries
    ctx.save();
    ctx.beginPath();
    path(countries as any);
    // slightly brighter fill + stronger stroke for better contrast
    ctx.fillStyle = '#0b1220';
    ctx.fill();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = '#164e63';
    ctx.stroke();
    ctx.restore();

    // If selected country exists, draw a highlighted overlay
  const selected = selectedCountryRef.current;
  // Do not render selection highlight on small/mobile viewports because
  // it can cause jank; keep selection disabled visually for <=640px.
  const deviceWidth = typeof window !== 'undefined' ? window.innerWidth : width;
  if (selected && deviceWidth > 640) {
      ctx.save();
      ctx.beginPath();
      path(selected as any);
      ctx.fillStyle = 'rgba(14,165,233,0.12)'; // subtle sky-blue overlay
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(14,165,233,0.9)';
      ctx.stroke();
      ctx.restore();
      // no label drawn for selected country — only highlight overlay and stroke
    }

  // Compute base radius depending on the VISIBLE viewport width (not the CSS-scaled
  // canvas width). When we scale the canvas horizontally for pan/zoom the drawing
  // width can be larger than the visible device width; use the smaller of the two
  // so bullet sizes remain appropriate on small devices.
  const visibleWidth = Math.min(width, (typeof window !== 'undefined' ? window.innerWidth : width));
  // Make bullets noticeably smaller on sm-and-below
  const baseRadius = visibleWidth <= 400 ? 0.6 : (visibleWidth <= 480 ? 0.9 : 2.2);

      // Draw points (smaller by default to avoid hiding small countries)
    for (let i = 0; i < visibleLocations.length; i++) {
      const loc = visibleLocations[i] as Location;
      if (!loc || !loc.coords) continue;
      const p = projection(loc.coords as any);
      if (!p) continue;
      const [x, y] = p;
        // Compute display radius and clamp to sensible range.
        // IMPORTANT: ignore any radius/brightness values from incoming SSE data and use
        // a consistent default for the static map so small countries are not hidden.
    // Allow smaller minimum radius on very small viewports
    const minRadius = visibleWidth <= 400 ? 0.5 : (visibleWidth <= 480 ? 0.8 : 1.0);
    const r = Math.min(4, Math.max(minRadius, baseRadius));

      // Draw subtle glow only slightly larger than the point (avoid huge glows)
  // Reduce glow on small screens so points don't appear oversized
  const glowExtra = visibleWidth <= 480 ? 0.9 : 2;
  const glowRadius = Math.max(r * 1.6, r + glowExtra);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      // Use semi-transparent stops so glow is gentle
      gradient.addColorStop(0, (loc.color || '#8b5cf6'));
      gradient.addColorStop(0.45, (loc.color || '#8b5cf6'));
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Main circle (smaller, with subtle stroke)
      ctx.beginPath();
      ctx.fillStyle = loc.color || '#8b5cf6';
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = Math.max(0.4, r * 0.25);
      // Darker stroke that doesn't overwhelm tiny points
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.stroke();
    }

  }, [visibleLocations]);

  // Resize observer to make canvas responsive
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    const resize = () => {
      const bounds = container.getBoundingClientRect();

      // Determine a horizontal zoom factor for small viewports so the map is
      // drawn larger and users can pan horizontally. We apply zoom only to
      // the canvas width (horizontal scroll) so height stays equal to the
      // container (no vertical scroll).
    const visibleWidth = typeof window !== 'undefined' ? window.innerWidth : bounds.width;
    let zoomFactor = 1;
  // Increase visual zoom on small viewports so initial visible portion is
  // noticeably larger. These factors are larger than before but still
  // conservative to avoid extreme over-zoom.
  if (visibleWidth <= 400) zoomFactor = 1.9;
  else if (visibleWidth <= 480) zoomFactor = 1.6;
  else if (visibleWidth <= 640) zoomFactor = 1.4;
    else zoomFactor = 1.0;

      // Clear any existing country selection on small/mobile viewports to
      // avoid rendering highlights and reduce potential jank.
      try {
        if (visibleWidth <= 640 && selectedCountryRef.current) selectedCountryRef.current = null;
      } catch (e) {
        // ignore
      }

      // Desired canvas CSS size. Height we keep equal to container height.
      let desiredCssW = Math.max(1, Math.floor(bounds.width * zoomFactor));
      const desiredCssH = Math.max(1, Math.floor(bounds.height));

  // Reset any previous expansion marker so draw() can recompute bounds.
  if (canvas.dataset._expanded) delete canvas.dataset._expanded;

  // Apply CSS size to canvas so scroll area equals drawn width.
  canvas.style.width = `${desiredCssW}px`;
      canvas.style.height = `${desiredCssH}px`;

      // Draw using the actual CSS-rendered size (clientWidth/clientHeight)
      // to ensure pixel sizes and projection fit match what's visible to user.
      const cssW = Math.max(bounds.width, Math.floor(canvas.clientWidth || desiredCssW));
      const cssH = Math.max(bounds.height, Math.floor(canvas.clientHeight || desiredCssH));
      draw(cssW, cssH);

      // Ensure scroller is at the leftmost so users can pan right to see
      // the full map; avoid centering which hid the leftmost countries.
      requestAnimationFrame(() => {
        try {
          const scroller = container.querySelector('.static-map-scroller') as HTMLElement | null;
          if (scroller) scroller.scrollLeft = Math.max(0, Math.floor((cssW - bounds.width) / 2));
        } catch (e) {
          // ignore
        }
      });
    };

    // initial draw when topo is available
    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(resize);
    });
    ro.observe(container);

    // initial call
    resize();

    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [draw]);

  // Silence unused scrollerRef lint by reading it; scroller is used by CSS on mobile
  useEffect(() => {
    // Access current to avoid "declared but never read" warnings
    if (scrollerRef && scrollerRef.current) {
      // no-op
      void scrollerRef.current;
    }
  }, []);

  // Load topojson once
  useEffect(() => {
    const topoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
    if (topoRef.current) return;
    fetch(topoUrl)
      .then(r => r.json())
      .then((topo) => {
        topoRef.current = topo;
        try {
          countriesRef.current = feature(topo, topo.objects.countries) as any;
        } catch (e) {
          countriesRef.current = null;
        }
        // trigger a resize/draw by dispatching a manual ResizeObserver callback
        const container = containerRef.current;
        if (container) {
          const ev = new Event('resize');
          window.dispatchEvent(ev);
        }
      })
      .catch((e) => {
        console.error('StaticMap(canvas): failed to load topojson', e);
      });
  }, []);

  // redraw when visibleLocations change (simple approach)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = canvasRef.current;
    if (canvas && canvas.clientWidth && canvas.clientHeight) {
      draw(Math.floor(canvas.clientWidth), Math.floor(canvas.clientHeight));
      return;
    }
    const bounds = container.getBoundingClientRect();
    draw(bounds.width, bounds.height);
  }, [visibleLocations, draw]);

  // Interaction handlers: hover (cursor) and click (select country)
  useEffect(() => {
    const canvasEl = canvasRef.current;
    const scrollerEl = scrollerRef.current;
    if (!canvasEl) return;

    const getMousePos = (clientX: number, clientY: number) => {
      const rect = canvasEl.getBoundingClientRect();
      const scrollLeft = scrollerEl ? scrollerEl.scrollLeft : 0;
      const x = clientX - rect.left + scrollLeft;
      const y = clientY - rect.top;
      return [x, y];
    };

    const onMove = (e: MouseEvent) => {
      try {
        if (!countriesRef.current) { canvasEl.style.cursor = 'default'; return; }
        const [x, y] = getMousePos(e.clientX, e.clientY);
        const w = Math.max(1, Math.floor(canvasEl.clientWidth));
        const h = Math.max(1, Math.floor(canvasEl.clientHeight));
        const p = d3.geoEquirectangular();
        p.fitExtent([[0, 0], [w, h]], countriesRef.current as any);
  const coord = (p as any).invert([x, y]);
        if (!coord) { canvasEl.style.cursor = 'default'; return; }
        const found = (countriesRef.current.features || []).find((f: any) => d3.geoContains(f, coord));
        canvasEl.style.cursor = found ? 'pointer' : 'default';
      } catch (err) {
        canvasEl.style.cursor = 'default';
      }
    };

    const onClick = (e: MouseEvent) => {
      try {
        if (!countriesRef.current) return;
        const [x, y] = getMousePos(e.clientX, e.clientY);
        const w = Math.max(1, Math.floor(canvasEl.clientWidth));
        const h = Math.max(1, Math.floor(canvasEl.clientHeight));
        const p = d3.geoEquirectangular();
        p.fitExtent([[0, 0], [w, h]], countriesRef.current as any);
  const coord = (p as any).invert([x, y]);
        if (!coord) return;
        const found = (countriesRef.current.features || []).find((f: any) => d3.geoContains(f, coord));
        // On small/mobile viewports we avoid setting selection to prevent
        // highlight-draw work and reduce jank; keep selection only on
        // larger screens where hover/click is expected.
        const deviceWidth = typeof window !== 'undefined' ? window.innerWidth : w;
        if (deviceWidth > 640) {
          if (found) selectedCountryRef.current = found;
          else selectedCountryRef.current = null;
          draw(Math.floor(canvasEl.clientWidth), Math.floor(canvasEl.clientHeight));
        }
      } catch (err) {
        // ignore
      }
    };

    canvasEl.addEventListener('mousemove', onMove);
    canvasEl.addEventListener('click', onClick);
    // touch support (tap to select)
    const onTouch = (ev: TouchEvent) => {
      if (!ev.touches || ev.touches.length === 0) return;
      const t = ev.touches[0];
      onClick({ clientX: t.clientX, clientY: t.clientY } as unknown as MouseEvent);
    };
    canvasEl.addEventListener('touchstart', onTouch, { passive: true });

    return () => {
      canvasEl.removeEventListener('mousemove', onMove);
      canvasEl.removeEventListener('click', onClick);
      canvasEl.removeEventListener('touchstart', onTouch as any);
    };
  }, [draw]);

  return (
    <div ref={containerRef} className="static-map-container">
      <div ref={scrollerRef} className="static-map-scroller">
        <canvas ref={canvasRef} className="static-map-canvas" />
      </div>
    </div>
  );
}
