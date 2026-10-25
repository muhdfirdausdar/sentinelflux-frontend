import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { useIPHoppingVisualizationData } from '../../data/ipHoppingVisualizationData';
import type { IPLocation } from '@/types/graphql';
import './IPHoppingMap.css';

interface LocationWithIndex extends IPLocation {
  index: number;
  timestamp: string;
}

export function IPHoppingMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [locations, setLocations] = useState<LocationWithIndex[]>([]);
  const [currentTimestamp, setCurrentTimestamp] = useState<string>('');
  const [timeGroups, setTimeGroups] = useState<Array<{ timestamp: string; startIndex: number; endIndex: number }>>([]);
  const { getIPHopping, isLoading, getError } = useIPHoppingVisualizationData();

  // Fetch IP hopping data
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const data = await getIPHopping();
      
      if (isMounted && data) {
        // Flatten the time groups into a single array with timestamps
        const allLocations: LocationWithIndex[] = [];
        const groups: Array<{ timestamp: string; startIndex: number; endIndex: number }> = [];
        
        data.timeGroups.forEach((group) => {
          const startIndex = allLocations.length;
          group.ips.forEach((ip) => {
            allLocations.push({
              ...ip,
              index: allLocations.length,
              timestamp: group.timestamp,
            });
          });
          const endIndex = allLocations.length - 1;
          groups.push({
            timestamp: group.timestamp,
            startIndex,
            endIndex
          });
        });
        
        setLocations(allLocations);
        setTimeGroups(groups);
        
        // Set initial timestamp to the first group
        if (groups.length > 0) {
          setCurrentTimestamp(groups[0].timestamp);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [getIPHopping]);

  // Create the map visualization
  useEffect(() => {
    if (!svgRef.current || locations.length === 0) return;

    const width = svgRef.current.clientWidth || 1000;
    const height = svgRef.current.clientHeight || 500;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create a group for zoom/pan transformations
    const g = svg.append('g').attr('class', 'map-group');

    // Create projection
    const projection = d3.geoMercator()
      .scale(width / 6.5)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8]) // Min and max zoom levels
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Create gradient definitions (add to svg, not g, since defs are global)
    const defs = svg.append('defs');
    
    // Helper function to get color based on index
    const getColorForIndex = (index: number) => {
      if (index === 0) return '#ef4444'; // Origin - red
      if (index === locations.length - 2) return '#fbbf24'; // Current (last connection) - yellow
      return '#3b82f6'; // Intermediate - blue
    };
    
    // Create arrow markers for each color type
    ['#ef4444', '#3b82f6', '#fbbf24'].forEach((color, idx) => {
      defs.append('marker')
        .attr('id', `arrowhead-${idx}`)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 8)
        .attr('refY', 5)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', color);
    });

    // Gradient for connection lines
    defs.append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#ef4444' },
        { offset: '100%', color: '#fbbf24' }
      ])
      .enter()
      .append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    // Create tooltip for countries
    const countryTooltip = d3.select('body')
      .append('div')
      .attr('class', 'country-tooltip')
      .style('position', 'absolute')
      .style('padding', '8px 12px')
      .style('background', 'rgba(15, 23, 42, 0.95)')
      .style('color', '#ffffff')
      .style('border', '1px solid #3b82f6')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000)
      .style('transition', 'opacity 0.2s ease');

    // Load and draw world map
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then((topology: any) => {
        const countries: any = feature(topology, topology.objects.countries);

        // Draw countries
        g.append('g')
          .selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('class', 'country')
          .attr('fill', '#1e293b')
          .attr('stroke', '#0ea5e9')
          .attr('stroke-width', 0.5)
          .attr('opacity', 0.8)
          .style('cursor', 'pointer')
          .on('mouseenter', function(event, d: any) {
            // Highlight the country
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#334155')
              .attr('opacity', 1);
            
            // Show tooltip with country name
            const countryName = d.properties?.name || 'Unknown';
            countryTooltip
              .html(`<strong>${countryName}</strong>`)
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 28}px`)
              .style('opacity', 1);
          })
          .on('mousemove', function(event) {
            // Update tooltip position as mouse moves
            countryTooltip
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 28}px`);
          })
          .on('mouseleave', function() {
            // Remove highlight
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#1e293b')
              .attr('opacity', 0.8);
            
            // Hide tooltip
            countryTooltip
              .style('opacity', 0);
          });

        // Draw grid
        const graticule = d3.geoGraticule();
        g.append('path')
          .datum(graticule)
          .attr('class', 'graticule')
          .attr('d', path as any)
          .attr('fill', 'none')
          .attr('stroke', '#0ea5e9')
          .attr('stroke-width', 0.3)
          .attr('opacity', 0.2);

        // Draw connection lines with continuous animation (one arrow at a time)
        if (locations.length > 1) {
          const lines = g.append('g').attr('class', 'connections');
          
          // Create all paths but keep them hidden initially
          const paths: Array<{
            element: d3.Selection<SVGPathElement, unknown, null, undefined>, 
            length: number,
            pathNode: SVGPathElement
          }> = [];
          
          for (let i = 0; i < locations.length - 1; i++) {
            const start = projection([locations[i].longitude, locations[i].latitude]);
            const end = projection([locations[i + 1].longitude, locations[i + 1].latitude]);

            if (start && end) {
              // Check if start and end are the same location (or very close)
              const distance = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
              const isSameLocation = distance < 5; // Threshold of 5 pixels
              
              let pathData: string;
              
              if (isSameLocation) {
                // Create a loop arrow for same location
                const loopRadius = 30; // Radius of the loop
                const loopOffsetX = 0;
                const loopOffsetY = -loopRadius;
                
                // Create a circular loop using arc
                pathData = `
                  M ${start[0]} ${start[1]}
                  m ${loopOffsetX} ${loopOffsetY}
                  a ${loopRadius} ${loopRadius} 0 1 1 0.1 0
                `;
              } else {
                // Draw curved path for different locations
                const midX = (start[0] + end[0]) / 2;
                const midY = (start[1] + end[1]) / 2;
                const curveOffset = distance * 0.2;

                pathData = `M ${start[0]} ${start[1]} Q ${midX} ${midY - curveOffset} ${end[0]} ${end[1]}`;
              }
              
              const lineColor = getColorForIndex(i);
              const line = lines.append('path')
                .attr('d', pathData)
                .attr('fill', 'none')
                .attr('stroke', lineColor)
                .attr('stroke-width', 2)
                .attr('opacity', 0)
                .attr('class', 'connection-line');

              const pathNode = line.node() as SVGPathElement;
              const pathLength = pathNode.getTotalLength();
              
              line
                .attr('stroke-dasharray', `${pathLength} ${pathLength}`)
                .attr('stroke-dashoffset', pathLength);
              
              paths.push({ element: line, length: pathLength, pathNode });
            }
          }

          // Create a moving arrowhead group
          const movingArrow = g.append('g').attr('class', 'moving-arrow').style('opacity', 0);
          
            const movingArrowPath = movingArrow.append('path')
            .attr('d', 'M -8 -4 L 0 0 L -8 4 Z')
            .attr('fill', '#fbbf24')
            .attr('stroke', '#fbbf24')
            .attr('stroke-width', 1);          // Function to animate one arrow at a time
          const animatePath = (index: number) => {
            if (index >= paths.length) {
              // Loop back to the beginning - reset to first timestamp
              if (timeGroups.length > 0) {
                setCurrentTimestamp(timeGroups[0].timestamp);
              }
              setTimeout(() => animatePath(0), 500);
              return;
            }

            const currentPath = paths[index];
            const animationDuration = 1500; // 1.5 seconds per arrow

            // Find which time group this connection belongs to
            // The connection from location[index] to location[index+1]
            const destinationIndex = index + 1;
            const currentGroup = timeGroups.find(
              group => destinationIndex >= group.startIndex && destinationIndex <= group.endIndex
            );
            
            // Update the timestamp display for the current time group
            if (currentGroup) {
              setCurrentTimestamp(currentGroup.timestamp);
            }

            // Determine arrow color based on position
            const arrowColor = getColorForIndex(index);
            
            // Update moving arrow color
            movingArrowPath
              .attr('fill', arrowColor)
              .attr('stroke', arrowColor);

            // Show current path and moving arrow
            currentPath.element.attr('opacity', 0.7);
            movingArrow.style('opacity', 1);

            // Animate the line and arrow together
            const startTime = Date.now();
            
            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / animationDuration, 1);
              
              // Update line drawing
              const drawLength = currentPath.length * progress;
              currentPath.element.attr('stroke-dashoffset', currentPath.length - drawLength);
              
              // Update arrow position and rotation
              const point = currentPath.pathNode.getPointAtLength(drawLength);
              const angle = (() => {
                const delta = 1;
                const prevLength = Math.max(0, drawLength - delta);
                const prevPoint = currentPath.pathNode.getPointAtLength(prevLength);
                return Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * 180 / Math.PI;
              })();
              
              movingArrow.attr('transform', `translate(${point.x},${point.y}) rotate(${angle})`);
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                // Animation complete, hide and move to next
                movingArrow.style('opacity', 0);
                currentPath.element
                  .transition()
                  .duration(200)
                  .attr('opacity', 0)
                  .on('end', () => {
                    // Reset for next loop
                    currentPath.element.attr('stroke-dashoffset', currentPath.length);
                    // Animate next path
                    animatePath(index + 1);
                  });
              }
            };
            
            animate();
          };

          // Start the animation loop
          animatePath(0);
        }

        // Draw location points (all visible from the start)
        const points = g.append('g').attr('class', 'points');

        locations.forEach((loc, index) => {
          const coords = projection([loc.longitude, loc.latitude]);
          if (!coords) return;

          const group = points.append('g')
            .attr('class', 'location-point')
            .attr('transform', `translate(${coords[0]},${coords[1]})`);

          // Outer glow circle
          group.append('circle')
            .attr('r', 12)
            .attr('fill', index === 0 ? '#ef4444' : (index === locations.length - 1 ? '#fbbf24' : '#3b82f6'))
            .attr('opacity', 0.3)
            .attr('class', 'glow-circle');

          // Main circle
          group.append('circle')
            .attr('r', 6)
            .attr('fill', index === 0 ? '#ef4444' : (index === locations.length - 1 ? '#fbbf24' : '#3b82f6'))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('class', 'location-circle');

          // Pulse animation for current location
          if (index === locations.length - 1) {
            group.append('circle')
              .attr('r', 6)
              .attr('fill', 'none')
              .attr('stroke', '#fbbf24')
              .attr('stroke-width', 2)
              .attr('opacity', 1)
              .attr('class', 'pulse-circle');
          }

          // Add tooltip
          const tooltipColor = index === 0 ? '#ef4444' : (index === locations.length - 1 ? '#fbbf24' : '#3b82f6');
          const tooltip = group.append('g')
            .attr('class', 'tooltip-group')
            .style('opacity', 0);

          tooltip.append('rect')
            .attr('x', 10)
            .attr('y', -40)
            .attr('width', 180)
            .attr('height', 60)
            .attr('fill', 'rgba(15, 23, 42, 0.95)')
            .attr('stroke', tooltipColor)
            .attr('stroke-width', 1)
            .attr('rx', 4);

          tooltip.append('text')
            .attr('x', 20)
            .attr('y', -20)
            .attr('fill', '#ffffff')
            .attr('font-size', '12px')
            .text(`IP: ${loc.ipAddress}`);

          tooltip.append('text')
            .attr('x', 20)
            .attr('y', -5)
            .attr('fill', '#94a3b8')
            .attr('font-size', '10px')
            .text(`Lat: ${loc.latitude.toFixed(2)}, Lon: ${loc.longitude.toFixed(2)}`);

          tooltip.append('text')
            .attr('x', 20)
            .attr('y', 10)
            .attr('fill', '#94a3b8')
            .attr('font-size', '10px')
            .text(`Time: ${new Date(loc.timestamp).toLocaleString()}`);

          // Hover events
          group
            .on('mouseenter', function() {
              d3.select(this).select('.location-circle')
                .transition()
                .duration(200)
                .attr('r', 8);
              
              d3.select(this).select('.tooltip-group')
                .transition()
                .duration(200)
                .style('opacity', 1);
            })
            .on('mouseleave', function() {
              d3.select(this).select('.location-circle')
                .transition()
                .duration(200)
                .attr('r', 6);
              
              d3.select(this).select('.tooltip-group')
                .transition()
                .duration(200)
                .style('opacity', 0);
            });
        });
      })
      .catch(error => {
        console.error('Error loading world map:', error);
      });

    // Cleanup
    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
      // Remove the country tooltip from DOM
      d3.select('body').selectAll('.country-tooltip').remove();
    };
  }, [locations, timeGroups]);

  if (isLoading()) {
    return (
      <div className="ip-hopping-map-loading">
        <div className="loading-spinner"></div>
        <p>Loading IP hopping visualization...</p>
      </div>
    );
  }

  if (getError()) {
    return (
      <div className="ip-hopping-map-error">
        <p>Error loading data: {getError()}</p>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="ip-hopping-map-no-data">
        <p>No IP hopping data available</p>
      </div>
    );
  }

  return (
    <div className="ip-hopping-map-container">
      <svg ref={svgRef} className="ip-hopping-map-svg"></svg>
      
      {/* Timeline Display */}
      {currentTimestamp && (
        <div className="ip-hopping-timeline">
          <div className="timeline-label">Current Hop Time:</div>
          <div className="timeline-datetime">
            {new Date(currentTimestamp).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })}
          </div>
        </div>
      )}
      
      {/* Interaction hint */}
      <div className="map-controls-hint">
        <span>💡 Drag to pan • Scroll to zoom</span>
      </div>
      
      <div className="ip-hopping-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Origin</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></div>
          <span>Intermediate</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#fbbf24' }}></div>
          <span>Current</span>
        </div>
      </div>

      {/* Logo overlay */}
      <div className="ip-hopping-logo">
        <svg className="ip-hopping-logo-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="ip-hopping-logo-text">SentinelFlux</span>
      </div>
    </div>
  );
}
