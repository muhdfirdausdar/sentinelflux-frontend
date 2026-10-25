import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface BreakpointConfig {
  minWidth: number;
  skeletonWidth: number;
  skeletonHeight: number;
  gap: number;
  minSkeletons: number;
  maxSkeletons: number;
}

interface ResponsiveSkeletonGridProps {
  // Single configuration (simpler approach)
  skeletonWidth?: number;
  skeletonHeight?: number;
  gap?: number;
  minSkeletons?: number;
  maxSkeletons?: number;
  
  // Advanced breakpoint-based configuration
  breakpoints?: BreakpointConfig[];
  
  className?: string;
  skeletonClassName?: string;
}

const defaultBreakpoints: BreakpointConfig[] = [
  // Mobile
  { minWidth: 0, skeletonWidth: 150, skeletonHeight: 150, gap: 8, minSkeletons: 1, maxSkeletons: 2 },
  // Tablet
  { minWidth: 640, skeletonWidth: 180, skeletonHeight: 180, gap: 12, minSkeletons: 2, maxSkeletons: 4 },
  // Desktop
  { minWidth: 1024, skeletonWidth: 220, skeletonHeight: 220, gap: 16, minSkeletons: 3, maxSkeletons: 6 },
  // Large Desktop
  { minWidth: 1280, skeletonWidth: 240, skeletonHeight: 240, gap: 20, minSkeletons: 4, maxSkeletons: 8 },
];

function ResponsiveSkeletonGrid({
  skeletonWidth = 240,
  skeletonHeight = 240,
  gap = 16,
  minSkeletons = 1,
  maxSkeletons = 10,
  breakpoints,
  className = "",
  skeletonClassName = ""
}: ResponsiveSkeletonGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [skeletonCount, setSkeletonCount] = useState(minSkeletons);
  const [currentConfig, setCurrentConfig] = useState({
    skeletonWidth,
    skeletonHeight,
    gap,
    minSkeletons,
    maxSkeletons
  });

  useEffect(() => {
    const calculateLayout = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const screenWidth = window.innerWidth;
      
      // Debug logging
      console.log('Container dimensions:', containerWidth, 'x', containerHeight);
      console.log('Screen width:', screenWidth);
      
      let config = {
        skeletonWidth,
        skeletonHeight,
        gap,
        minSkeletons,
        maxSkeletons
      };

      // Use breakpoint configuration if provided
      if (breakpoints && breakpoints.length > 0) {
        // Find the appropriate breakpoint
        const activeBreakpoint = breakpoints
          .filter(bp => screenWidth >= bp.minWidth)
          .pop(); // Get the last matching breakpoint (highest minWidth that applies)
        
        if (activeBreakpoint) {
          config = {
            skeletonWidth: activeBreakpoint.skeletonWidth,
            skeletonHeight: activeBreakpoint.skeletonHeight,
            gap: activeBreakpoint.gap,
            minSkeletons: activeBreakpoint.minSkeletons,
            maxSkeletons: activeBreakpoint.maxSkeletons
          };
        }
      }

      setCurrentConfig(config);
      
      // Calculate how many skeletons can fit horizontally
      const maxFitHorizontal = Math.floor((containerWidth + config.gap) / (config.skeletonWidth + config.gap));
      
      // Calculate how many rows can fit vertically  
      const maxFitVertical = Math.floor((containerHeight + config.gap) / (config.skeletonHeight + config.gap));
      
      // Total skeletons that can fit in the grid
      const totalFit = maxFitHorizontal * maxFitVertical;
      
      // Ensure count is within min/max bounds
      const newCount = Math.max(config.minSkeletons, Math.min(totalFit, config.maxSkeletons));
      
      console.log('Horizontal fit:', maxFitHorizontal);
      console.log('Vertical fit:', maxFitVertical);
      console.log('Total grid capacity:', totalFit);
      console.log('Final skeleton count:', newCount);
      console.log('Config:', config);
      
      setSkeletonCount(newCount);
    };

    // Initial calculation with delay to ensure container is rendered
    const timeoutId = setTimeout(calculateLayout, 100);

    // Recalculate on window resize
    const handleResize = () => {
      calculateLayout();
    };

    window.addEventListener('resize', handleResize);
    
    // Also listen for container resize using ResizeObserver if available
    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(calculateLayout);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [skeletonWidth, skeletonHeight, gap, minSkeletons, maxSkeletons, breakpoints]);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ 
        display: 'flex',
        flexWrap: 'wrap',
        gap: `${currentConfig.gap}px`,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center'
      }}
    >
      {Array.from({ length: skeletonCount }, (_, index) => (
        <Skeleton
          key={index}
          className={`flex-shrink-0 ${skeletonClassName}`}
          style={{
            width: `${currentConfig.skeletonWidth}px`,
            height: `${currentConfig.skeletonHeight}px`,
          }}
        />
      ))}
    </div>
  );
}

// Export the component and default breakpoints for reuse
export { ResponsiveSkeletonGrid, defaultBreakpoints };
export type { BreakpointConfig, ResponsiveSkeletonGridProps };
