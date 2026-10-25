// Globe animation logic adapted from Ben Sterling's CodePen:
// https://codepen.io/ben_sterling/pen/xEKmEB
// Refactored for React, TypeScript, and responsive design.

import React, { useEffect, useRef } from "react";
import { TweenLite, Circ } from "gsap";

export interface GeoGlobeProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}



export const GeoGlobe: React.FC<GeoGlobeProps> = ({
  width = 470,
  height = 490,
  className = '',
  style = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Track actual rendered size
  const [canvasSize, setCanvasSize] = React.useState({ width, height });

  // ResizeObserver to sync canvas size with container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setCanvasSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
    };
    updateSize();
    const ro = new window.ResizeObserver(updateSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [width, height]);

  useEffect(() => {
    let ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Helper to get current theme colors
    function getThemeColors() {
      const styles = getComputedStyle(document.documentElement);
      return {
        dark: styles.getPropertyValue('--color-globe-dark').trim(),
        light: styles.getPropertyValue('--color-globe-light').trim(),
        gold: styles.getPropertyValue('--color-globe-gold').trim(),
      };
    }

    let { dark, light, gold } = getThemeColors();
    let points: any[] = [];
    let animationFrameId: number;
    let observer: MutationObserver | null = null;

    function getRandomInt(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    class Circle {
      pos: any;
      rad: number;
      color: string;
      constructor(pos: any, rad: number, color: string) {
        this.pos = pos;
        this.rad = rad;
        this.color = color;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.rad, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    function drawLines(p: any, ctx: CanvasRenderingContext2D) {
      for (let i in p.jointo) {
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.jointo[i].x, p.jointo[i].y);
        ctx.strokeStyle = p.color;
        ctx.stroke();
      }
    }

    function drawTransit(p: any, ctx: CanvasRenderingContext2D) {
      for (let j = 0; j < p.jointo.length; j++) {
        if (p.offset != null) {
          ctx.save();
          ctx.setLineDash([p.length, p.seperation]);
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.jointo[0].x, p.jointo[0].y);
          ctx.strokeStyle = (p.color === light ? light : gold) as string;
          ctx.lineDashOffset = p.offset;
          ctx.stroke();
          ctx.restore();
          p.offset = p.offset + 0.2 + 0.4 * Math.random();
        }
      }
    }

    function render() {
      const safeCtx = ctx as CanvasRenderingContext2D;
      safeCtx.clearRect(0, 0, width, height);
      for (let i = 0; i < points.length; i++) {
        if (points[i].color === light) {
          drawLines(points[i], safeCtx);
          drawTransit(points[i], safeCtx);
          points[i].circle.draw(safeCtx);
        }
      }
      for (let i = 0; i < points.length; i++) {
        if (points[i].color === dark) {
          drawLines(points[i], safeCtx);
          drawTransit(points[i], safeCtx);
          points[i].circle.draw(safeCtx);
        }
      }
      animationFrameId = requestAnimationFrame(render);
    }

    function shiftPoint(p: any) {
      TweenLite.to(p, 1 + 2 * Math.random(), {
        x: getRandomInt(p.originX - 8, p.originX + 8),
        y: getRandomInt(p.originY - 8, p.originY + 8),
        ease: Circ.easeOut,
        onComplete: function () {
          shiftPoint(p);
        },
      });
    }

    function setupPoints() {
      ({ dark, light, gold } = getThemeColors());
      // Use relative coordinates (percentages) for all points, then scale to canvas size
      const relPoints = [
        { x: 0.46, y: 0.10, rad: 0.008, color: dark },
        { x: 0.25, y: 0.19, rad: 0.008, color: dark },
        { x: 0.53, y: 0.20, rad: 0.02, color: dark },
        { x: 0.74, y: 0.16, rad: 0.008, color: dark },
        { x: 0.11, y: 0.37, rad: 0.008, color: dark },
        { x: 0.25, y: 0.42, rad: 0.012, color: dark },
        { x: 0.77, y: 0.34, rad: 0.008, color: dark },
        { x: 0.85, y: 0.39, rad: 0.012, color: dark },
        { x: 0.11, y: 0.55, rad: 0.006, color: dark },
        { x: 0.62, y: 0.53, rad: 0.024, color: dark },
        { x: 0.14, y: 0.65, rad: 0.006, color: dark },
        { x: 0.36, y: 0.71, rad: 0.018, color: dark },
        { x: 0.85, y: 0.61, rad: 0.008, color: dark },
        { x: 0.21, y: 0.75, rad: 0.008, color: dark },
        { x: 0.62, y: 0.78, rad: 0.012, color: dark },
        { x: 0.79, y: 0.76, rad: 0.006, color: dark },
        { x: 0.37, y: 0.82, rad: 0.008, color: dark },
        { x: 0.57, y: 0.85, rad: 0.008, color: dark },
        { x: 0.67, y: 0.37, rad: 0.008, color: light },
        { x: 0.47, y: 0.55, rad: 0.012, color: light },
        { x: 0.22, y: 0.64, rad: 0.01, color: light },
        { x: 0.30, y: 0.30, rad: 0.008, color: light },
      ];
      // Scale to canvas size
      points = relPoints.map((p) => {
        const px = Math.round(p.x * canvasSize.width);
        const py = Math.round(p.y * canvasSize.height);
        const rad = Math.max(2, Math.round(p.rad * Math.min(canvasSize.width, canvasSize.height)));
        return {
          x: px,
          originX: px,
          y: py,
          originY: py,
          rad,
          color: p.color,
        };
      });
      for (let i = 0; i < points.length; i++) {
        points[i].jointo = [];
        points[i].length = getRandomInt(16, 35);
        points[i].seperation = getRandomInt(500, 1300);
        points[i].offset = getRandomInt(100, 1000);
      }
      // Connections (same as original)
      points[0].jointo.push(points[1], points[2], points[3]);
      points[1].jointo.push(points[4], points[2], points[5]);
      points[2].jointo.push(points[3], points[5], points[6], points[9]);
      points[3].jointo.push(points[6], points[7]);
      points[4].jointo.push(points[5], points[8], points[10]);
      points[5].jointo.push(points[9], points[10], points[11]);
      points[6].jointo.push(points[7], points[9], points[12]);
      points[7].jointo[0] = points[12];
      points[8].jointo[0] = points[10];
      points[9].jointo.push(points[11], points[12], points[14]);
      points[10].jointo.push(points[11], points[13], points[16]);
      points[11].jointo.push(points[14], points[16]);
      points[12].jointo.push(points[14], points[15]);
      points[13].jointo[0] = points[16];
      points[14].jointo.push(points[15], points[16], points[17]);
      points[15].jointo[0] = points[17];
      points[16].jointo[0] = points[17];
      points[18].jointo.push(points[2], points[7], points[19]);
      points[19].jointo.push(points[12], points[17], points[4], points[20]);
      points[20].jointo.push(points[8], points[16]);
      points[21].jointo.push(points[18], points[4], points[0]);
      // Circles
      for (let i in points) {
        const c = new Circle(points[i], points[i].rad, points[i].color);
        points[i].circle = c;
      }
    }

    setupPoints();
    render();
    for (let i in points) {
      shiftPoint(points[i]);
    }

    // Watch for theme changes (dark/light mode)
    observer = new MutationObserver(() => {
      // Re-read theme colors and re-setup points
      setupPoints();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (observer) observer.disconnect();
    };
    // eslint-disable-next-line
  }, [canvasSize.width, canvasSize.height]);

  return (
    <div ref={containerRef} style={{ width, height, ...style }} className={className}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: 'transparent',
        }}
      />
    </div>
  );
};

export default GeoGlobe;
