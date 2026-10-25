import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './TTLComparisonChart.css';

interface TTLData {
  ipId: number;
  ipAddress: string;
  ttl: number;
  lowestTtl: number;
  highestTtl: number;
}

interface TTLComparisonChartProps {
  data: TTLData[];
}

export function TTLComparisonChart({ data }: TTLComparisonChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) return;

    const container = containerRef.current;
    const minBarWidth = 80; // Minimum width per IP address group
    const calculatedWidth = Math.max(container.clientWidth, data.length * minBarWidth);
    const width = calculatedWidth;
    const height = 500;
    const margin = { top: 80, right: 40, bottom: 120, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create chart group
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data for grouped bar chart
    const chartData = data.map(d => ({
      ipAddress: d.ipAddress,
      lowestTtl: d.lowestTtl,
      highestTtl: d.highestTtl,
    }));

    // Create scales
    const x0 = d3.scaleBand()
      .domain(chartData.map(d => d.ipAddress))
      .range([0, chartWidth])
      .padding(0.3);

    const x1 = d3.scaleBand()
      .domain(['lowestTtl', 'highestTtl'])
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const maxValue = d3.max(chartData, d => Math.max(d.lowestTtl, d.highestTtl)) || 4000;
    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .nice()
      .range([chartHeight, 0]);

    // Colors
    const colors = {
      lowestTtl: '#a78bfa', // Purple
      highestTtl: '#22d3ee', // Cyan
    };

    // Draw grid lines
    chart.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke-width', 1);

    // Draw bars
    const ipGroups = chart.selectAll('.ip-group')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'ip-group')
      .attr('transform', d => `translate(${x0(d.ipAddress)},0)`);

    // Lowest TTL bars
    ipGroups.append('rect')
      .attr('class', 'bar lowest-ttl-bar')
      .attr('x', x1('lowestTtl')!)
      .attr('width', x1.bandwidth())
      .attr('y', chartHeight)
      .attr('height', 0)
      .attr('fill', colors.lowestTtl)
      .attr('rx', 4)
      .transition()
      .duration(800)
      .delay((_d, i) => i * 100)
      .attr('y', d => y(d.lowestTtl))
      .attr('height', d => chartHeight - y(d.lowestTtl));

    // Highest TTL bars
    ipGroups.append('rect')
      .attr('class', 'bar highest-ttl-bar')
      .attr('x', x1('highestTtl')!)
      .attr('width', x1.bandwidth())
      .attr('y', chartHeight)
      .attr('height', 0)
      .attr('fill', colors.highestTtl)
      .attr('rx', 4)
      .transition()
      .duration(800)
      .delay((_d, i) => i * 100 + 100)
      .attr('y', d => y(d.highestTtl))
      .attr('height', d => chartHeight - y(d.highestTtl));

    // X-axis
    chart.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Y-axis
    chart.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px');

    // Style axes
    chart.selectAll('.x-axis path, .x-axis line, .y-axis path, .y-axis line')
      .attr('stroke', 'rgba(255, 255, 255, 0.2)');

    // Add Y-axis label
    chart.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .text('TTL Value');

    // Cleanup
    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
    };
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="ttl-chart-no-data">No TTL data available</div>;
  }

  const showScrollHint = data.length > 10;

  return (
    <div className="ttl-comparison-chart-container" ref={containerRef}>
      <div className="ttl-chart-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#a78bfa' }}></div>
          <span>Lowest TTL</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#22d3ee' }}></div>
          <span>Highest TTL</span>
        </div>
      </div>
      {showScrollHint && (
        <div className="ttl-chart-scroll-hint">
          ← Scroll horizontally to view all IP addresses →
        </div>
      )}
      <div className="ttl-chart-scroll-wrapper">
        <svg ref={svgRef} className="ttl-comparison-chart-svg"></svg>
      </div>
    </div>
  );
}
