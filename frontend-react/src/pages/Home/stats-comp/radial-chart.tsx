"use client"

import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

export const description = "A radial chart with text"


interface RadialChartData {
  [key: string]: any;
}

interface RadialChartProps {
  data: RadialChartData[];
  valueKey: string;
  totalKey?: string;
  isPercentage?: boolean;
  label?: string;
  description?: string;
  startAngle?: number;
  endAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  unit?: string;
  footerPrimary?: React.ReactNode;
  footerSecondary?: React.ReactNode;
  barColor?: string;
  barCornerRadius?: number;
  className?: string; // extra class for Card
  containerStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  descClassName?: string;
  containerClassName?: string; // tailwind class for Card
  contentClassName?: string;   // tailwind class for CardContent
  labelClassName?: string;     // tailwind class for center label
}

export function RadialChart({
  data,
  valueKey,
  totalKey,
  isPercentage = false,
  label = "Value",
  description = "",
  startAngle,
  endAngle,
  innerRadius = 80,
  outerRadius = 110,
  unit = "",
  footerPrimary,
  footerSecondary,
  barColor,
  barCornerRadius = 10,
  className = "",
  containerStyle = {},
  contentStyle = {},
  labelStyle = {},
  containerClassName = "",
  contentClassName = "",
  labelClassName = "",
  descClassName = "",
}: RadialChartProps) {
  const value = data[0]?.[valueKey] ?? 0;
  const total = isPercentage ? 100 : (totalKey ? (data[0]?.[totalKey] ?? value) : value);
  const arcStart = isPercentage ? 90 : (startAngle ?? 0);
  const arcEnd = arcStart + (value / total) * 360;
  // Compose chart data for single-bar approach
  const chartData = [ { value } ];
  return (
    <Card className={`flex flex-col !gap-1 ${className} ${containerClassName}`} style={containerStyle}>
      <CardContent className={`flex-1 pb-0 ${contentClassName}`} style={contentStyle}>
        <ChartContainer config={{}} className="flex items-center justify-center w-full h-full aspect-square">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
            <RadialBarChart
              data={chartData}
              startAngle={arcStart}
              endAngle={arcEnd}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              width={220}
              height={180}
              style={{ display: 'block', margin: '0 auto' }}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                fill="bg-white"
                className="first:fill-background last:fill-background" // alternating bg colors of radial
                polarRadius={[Math.max(innerRadius + 6, 0), Math.max(innerRadius - 6, 0)]}
              />
              <RadialBar
                dataKey="value"
                background={{fill: "var(--section-children)"}}
                fill={barColor || "var(--chart-1)"}
                cornerRadius={barCornerRadius}
              />
              <PolarRadiusAxis
                domain={[0, total]}
                tick={false}
                tickLine={false}
                axisLine={false}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{...labelStyle, display: 'inline', whiteSpace: 'pre-wrap'}}
                          className={labelClassName}
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className=" fill-foreground text-4xl font-bold"
                            style={{dominantBaseline: 'middle',}}
                          >
                            {value.toLocaleString()}{unit && ` ${unit}`}
                          </tspan>
                          <tspan
                            className="fill-muted-foreground font-normal"
                            style={{fontWeight: 400, fontSize: '1.5rem', dominantBaseline: 'middle'}}
                            dx={10}
                          >
                            {label}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </div>
        </ChartContainer>
      </CardContent>
      {(footerPrimary || footerSecondary) && (
        <CardFooter className="flex-col ">
          {footerPrimary && (
            <div className={`flex items-center text-sm text-muted-foreground text-center w-full leading-none font-semibold  ${descClassName}  `}>
              {footerPrimary}
            </div>
          )}
          {footerSecondary && (
            <div className="text-muted-foreground leading-none">
              {footerSecondary}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

// ---
// Usage Guide:
//
// import { useState } from "react";
// import { RadialChart } from "@/components/ui/radial-chart";
// import { TrendingUp } from "lucide-react";
//
// // Example: update chart value from parent state
// const [percent, setPercent] = useState(75);
// const data = [{ value: percent, total: 100 }];
//
// <RadialChart
//   data={data}
//   valueKey="value"
//   totalKey="total"
//   isPercentage={true}
//   label="%"
//   footerPrimary={<>
//     Dynamic Value Example <TrendingUp className="h-4 w-4" />
//   </>}
//   barColor="#3b82f6"
//   // Tailwind responsive classes for Card container
//   containerClassName="bg-gray-900 rounded-2xl shadow-lg p-4 md:p-8 w-full max-w-xs md:max-w-sm"
//   // Tailwind for CardContent (chart area)
//   contentClassName="p-0 aspect-square flex items-center justify-center"
//   // Tailwind for center label
//   labelClassName="font-mono tracking-wide text-3xl md:text-4xl"
// />
//
// // To update the chart, just call setPercent(newValue) in your parent.
//
// Props:
// - data: Array of objects (required)
// - valueKey: string, key in data for the value (required)
// - label: string, chart title (optional)
// - description: string, chart description (optional)
// - startAngle, endAngle, innerRadius, outerRadius: numbers for chart shape (optional)
// - unit: string, unit to display after value (optional)
// - totalKey: string, key in data for the total value (optional, for progress/percentage)
// - isPercentage: boolean, set true if your value is a percentage (0-100)
// - footerPrimary: ReactNode, main footer content (optional)
// - footerSecondary: ReactNode, secondary footer content (optional)
// - barColor: string, color for the bar (optional)
// - barCornerRadius: number, bar corner radius (optional)
// - className: string, extra class for Card (optional)
// - containerClassName: string, Tailwind class for Card (optional)
// - contentClassName: string, Tailwind class for CardContent (optional)
// - labelClassName: string, Tailwind class for center label (optional)
