import { cn } from "@/lib/utils"
import React from "react"
import { Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type PieChartDataType<K extends string = string> = Array<
  { name: string; fill: string } & { [key in K]: number }
>;

interface PieChartComponentProps<K extends string = string> extends React.HTMLAttributes<HTMLDivElement> {
  PieChartConfig: ChartConfig;
  dataKey: K;
  PieChartData: PieChartDataType<K>;
  className?: string;
  chartContClassName?: string;
  PieChartClassName?: string;
  children?: React.ReactNode;
}

// Example usage:
// const PieChartConfig = {
//   metric: { label: "Metric" },
//   chrome: { label: "Chrome", color: "var(--chart-1)" },
//   safari: { label: "Safari", color: "var(--chart-2)" },
// }
// const PieChartData = [
//   { name: "Chrome", metric: 400, fill: "var(--chart-1)" },
//   { name: "Safari", metric: 300, fill: "var(--chart-2)" },
// ]
// <PieChartComponent PieChartConfig={PieChartConfig} dataKey="metric" PieChartData={PieChartData} />

const PieChartComponentInner = <K extends string = string>({
  PieChartConfig,
  dataKey,
  PieChartData,
  className,
  chartContClassName,
  PieChartClassName,
  children,
  ...props
}: PieChartComponentProps<K>) => {
  // Debug logging to track re-renders
//   console.log('PieChartComponent re-rendering with:', {
//     dataKey,
//     dataLength: PieChartData?.length,
//     hasChildren: !!children,
//     className
//   });

  // Grab config for the main dataKey
  const mainConfig = PieChartConfig[dataKey]

  if (!mainConfig) {
    console.warn(`⚠️ Missing config for key: "${dataKey}"`)
    return null
  }

  function PieChartContainer({ PieChartConfig, PieChartData }: { PieChartConfig: ChartConfig; PieChartData: PieChartDataType<K> }) {
    return (
      <ChartContainer
        config={PieChartConfig}
        className={cn("md:w-64 md:h-64 w-44 h-44 min-w-[160px] min-h-[160px] aspect-square flex items-center justify-center mb-3 md:mb-4", chartContClassName)}
      >
        <PieChart width={180} height={180} className=" flex items-center justify-center">
          <ChartTooltip
            content={<ChartTooltipContent nameKey={dataKey} hideLabel className="text-base" />}
          />
          <Pie data={PieChartData} dataKey={dataKey} className="text-base" />
        </PieChart>
      </ChartContainer>
    );
  }

  // Legend component
  function PieChartLegend({ data }: { data: PieChartDataType<K> }) {
    return (
      <div className="flex flex-wrap gap-2 md:gap-3 items-center justify-center mb-3 md:mb-4 mt-3 md:mt-4 px-3 md:px-4">
        {data.map((item, index) => (
          <div 
            key={`legend-${item.name}-${index}`}
            className="flex items-center gap-1.5 md:gap-2"
          >
            <div 
              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-xs md:text-sm text-[var(--muted-foreground)] font-medium whitespace-nowrap">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full flex flex-col", className)} {...props}>
      <PieChartLegend data={PieChartData} />
      <PieChartContainer PieChartConfig={PieChartConfig} PieChartData={PieChartData} />
      {children}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const PieChartComponent = React.memo(PieChartComponentInner) as typeof PieChartComponentInner;
