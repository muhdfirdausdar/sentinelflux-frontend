import React, { useEffect, useRef, useMemo, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { type Location } from "./LocationData";
import { createGlobeFilters } from "./GlobeSvgDefs";

// NOTE: We disable labels for now

interface GlobeProps {
  locations: Location[];
}

const Globe: React.FC<GlobeProps> = ({ locations }) => {


  // Memoize locations to prevent unnecessary recalculations
  const memoizedLocations = useMemo(() => locations, [locations]);
  const ref = useRef<SVGSVGElement | null>(null);
  const svgInitialized = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const isLoadingMap = useRef<boolean>(false); // Track if map is being loaded
  const projectionRef = useRef<d3.GeoProjection | null>(null); // Store projection for updates
  const renderFnRef = useRef<(() => void) | null>(null); // Store render function for updates
  const [globeReady, setGlobeReady] = useState(false); // Track when globe is fully initialized
  const autoRotateTimerRef = useRef<number | null>(null); // Store animation timer
  const isUserInteractingRef = useRef<boolean>(false); // Track user interaction to pause auto-rotate

  useEffect(() => {
    // If already initialized, don't do anything
    if (svgInitialized.current || !ref.current) return;
    
    // Double-check: if SVG already has groups, skip initialization
    const existingGroups = ref.current.querySelectorAll('g');
    if (existingGroups.length > 0) {
      console.log('Globe already initialized, skipping...');
      return;
    }

    console.log('Initializing Globe...');

    const width = 1200;
    const height = 1000;
  const initialScale = 280;

    // Store the svg selection
    const svg = d3.select(ref.current);
    svgInitialized.current = svg;

    svg
      .attr("width", width)
      .attr("height", height)
      .style("cursor", "grab");

    // IMPORTANT: Remove all children before creating new ones
    svg.selectAll("*").remove();

    // Create SVG filters (glow effects for points)
    createGlobeFilters(svg);

    const projection = d3.geoOrthographic()
      .scale(initialScale)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .rotate([0, -20, 0]); // Initial rotation to show a good view of the world

    // Store projection in ref for later updates
    projectionRef.current = projection;

    const path = d3.geoPath(projection);

    const graticule = d3.geoGraticule10();

    // Background sphere (ocean)
    console.log('Creating background sphere...');
    svg.append("path")
      .datum({ type: "Sphere" })
      .attr("fill", "#04061D")
      .attr("stroke", "#0f172a")
      .attr("d", (d: any) => path(d));

    // Graticule lines (latitude/longitude grid)
    console.log('Creating graticule...');
    svg.append("path")
      .datum(graticule)
      .attr("fill", "none")
      .attr("stroke", "#334155")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.5)
      .attr("d", (d: any) => path(d));

    // Load world map (GeoJSON)
    console.log('Loading world map...');
    
    // Prevent duplicate async callbacks
    if (isLoadingMap.current) {
      console.log('Map already loading, skipping...');
      return;
    }
    isLoadingMap.current = true;
    
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((data: any) => {
      // Double-check: if groups already exist when callback runs, abort
      if (svg.selectAll('g').size() > 0) {
        console.log('Groups already created by another callback, aborting...');
        return;
      }
      
      console.log('World map loaded, creating countries...');
      const countries = topojson.feature(data, data.objects.countries) as any;

      // Check how many groups exist BEFORE creating countries
      console.log('Groups before countries:', svg.selectAll('g').size());

      // Create countries group
      const countriesGroup = svg.append("g").attr("class", "countries-group");
      console.log('Created countries-group');
      countriesGroup
        .selectAll("path")
        .data(countries.features)
        .join("path") // Use join instead of enter().append()
        .attr("fill", "#1e293b")
        .attr("stroke", "#475569")
        .attr("stroke-width", 0.3)
        .attr("d", (d: any) => path(d));

      // Check how many groups exist AFTER creating countries
      console.log('Groups after countries:', svg.selectAll('g').size());

      // Points (locations) - Create group and bind data properly
      console.log('Creating points-group...');
      const pointsGroup = svg.append("g").attr("class", "points-group");
      
      // Initial empty points (will be updated by separate effect)
      pointsGroup.selectAll("circle").remove();
      
      console.log('Groups after points:', svg.selectAll('g').size());

      // // Label (optional) - Create group and bind data properly
      // console.log('Creating labels-group...');
      // const labelsGroup = svg.append("g").attr("class", "labels-group");
      // const labels = labelsGroup
      //   .selectAll("text")
      //   .data(locations)
      //   .join("text") // Use join instead of enter() to avoid duplicates
      //   .text((d: Location) => d.name)
      //   .attr("font-size", "10px")
      //   .attr("fill", "#f8fafc")
      //   .attr("visibility", "hidden"); // Start hidden until render() positions them
      
      console.log('Groups after labels:', svg.selectAll('g').size());
      console.log('Total groups created:', svg.selectAll('g.countries-group, g.points-group, g.labels-group').size());

      const render = () => {
        svg.selectAll("path").attr("d", (d: any) => path(d));
        
        // Update points with visibility check
        const pointsGroup = svg.select(".points-group");
        pointsGroup.selectAll("circle").each(function(d: any) {
          const location = d as Location;
          const coords = projection(location.coords);
          if (coords) {
            const [x, y] = coords;
            
            // Use D3's distance method for accurate visibility check
            const centerCoords = projection.invert!([width / 2, height / 2]);
            if (centerCoords) {
              const distance = d3.geoDistance(location.coords, centerCoords);
              const isVisible = distance < Math.PI / 2; // Less than 90 degrees from center
              
              d3.select(this)
                .attr("cx", x)
                .attr("cy", y)
                .style("opacity", isVisible ? 1 : 0)
                .attr("visibility", isVisible ? "visible" : "hidden");
            } else {
              d3.select(this)
                .style("opacity", 0)
                .attr("visibility", "hidden");
            }
          } else {
            d3.select(this)
              .style("opacity", 0)
              .attr("visibility", "hidden");
          }
        });
      };

      // Store render function in ref for later use
      renderFnRef.current = render;

      // Auto-rotation function
      const startAutoRotate = () => {
        if (autoRotateTimerRef.current) {
          cancelAnimationFrame(autoRotateTimerRef.current);
        }

        const rotateGlobe = () => {
          if (!isUserInteractingRef.current) {
            const rotate = projection.rotate();
            const newRotate: [number, number, number] = [
              rotate[0] + 0.5, // Rotation speed (degrees per frame) - positive = right/clockwise
              rotate[1],
              rotate[2] || 0
            ];
            projection.rotate(newRotate);
            render();
          }
          autoRotateTimerRef.current = requestAnimationFrame(rotateGlobe);
        };

        autoRotateTimerRef.current = requestAnimationFrame(rotateGlobe);
      };

      // Enable drag-to-rotate
      // (svg as any).call(d3.drag()
      //   .on("start", () => {
      //     svg.style("cursor", "grabbing");
      //     isUserInteractingRef.current = true; // Pause auto-rotation
      //   })
      //   .on("drag", (event: any) => {
      //     const rotate = projection.rotate();
      //     const newRotate: [number, number] = [
      //       rotate[0] + event.dx * sens,
      //       rotate[1] - event.dy * sens,
      //     ];
      //     projection.rotate(newRotate);
      //     render();
      //   })
      //   .on("end", () => {
      //     svg.style("cursor", "grab");
      //     isUserInteractingRef.current = false; // Resume auto-rotation
      //   })
      // );

      // Enable zoom support (mouse wheel only, doesn't interfere with drag)
      svg.on("wheel", (event: any) => {
        event.preventDefault();
        const delta = -event.deltaY * 0.001; // Adjust zoom sensitivity
        const currentScale = projection.scale();
        const newScale = Math.max(initialScale * 0.5, Math.min(initialScale * 5, currentScale * (1 + delta)));
        projection.scale(newScale);
        render();
      });

      render();
      
      // Start auto-rotation
      startAutoRotate();
      
      // Mark globe as ready for point updates
      setGlobeReady(true);
      console.log('Globe initialization complete and ready for updates');
    });

    // Cleanup function
    return () => {
      // Stop auto-rotation
      if (autoRotateTimerRef.current) {
        cancelAnimationFrame(autoRotateTimerRef.current);
        autoRotateTimerRef.current = null;
      }
      
      if (svgInitialized.current) {
        svgInitialized.current.selectAll("*").remove();
        svgInitialized.current = null;
      }
      isLoadingMap.current = false;
      setGlobeReady(false);
    };
  }, []);

  // Separate effect to update only points when locations change
  useEffect(() => {
    if (!globeReady || !svgInitialized.current || !projectionRef.current || !renderFnRef.current) {
      console.log('Globe not ready yet, skipping point update');
      return;
    }

    console.log('Updating points with new location data...');
    const svg = svgInitialized.current;

    // Update points group with new data
    const pointsGroup = svg.select(".points-group");
    pointsGroup
      .selectAll("circle")
      .data(memoizedLocations, (d: any) => d.id) // Use unique ID as key for enter/update/exit
      .join(
        // Enter: new points (only NEW circles are created)
        (enter) => {
          console.log(`  Adding ${enter.size()} new circles`);
          return enter
            .append("circle")
            .attr("r", (d: Location) => d.circle_radius)
            .attr("fill", (d: Location) => d.color)
            // .attr("filter", (d: Location) => `url(#${d.glow_intensity})`)
            .attr("visibility", "hidden");
        },
        // Update: existing points (only CHANGED circles are updated)
        (update) => {
          console.log(`  Updating ${update.size()} existing circles`);
          return update
            .attr("r", (d: Location) => d.circle_radius)
            .attr("fill", (d: Location) => d.color)
            // .attr("filter", (d: Location) => `url(#${d.glow_intensity})`);
        },
        // Exit: removed points (only REMOVED circles are deleted)
        (exit) => {
          console.log(`  Removing ${exit.size()} circles`);
          return exit.remove();
        }
      );

    // Call the render function to properly position all points with current projection state
    const render = renderFnRef.current;
    if (render) {
      render();
      console.log(`Points updated and rendered: ${pointsGroup.selectAll("circle").size()} total`);
    }
  }, [memoizedLocations, globeReady]);

  return (
    <div className="flex justify-center items-center">
      <svg ref={ref} style={{ position: 'relative', zIndex: 0 }}></svg>
    </div>
  );
};

export default Globe;
