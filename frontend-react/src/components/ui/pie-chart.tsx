import { cn } from "@/lib/utils"
import React from "react"
import { LabelList, Pie, PieChart } from "recharts"
import { twj } from "tw-to-css";

import { P } from "node_modules/framer-motion/dist/types.d-Cjd591yU"
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

import { cn } from "@/lib/utils"
import React from "react"
import { LabelList, Pie, PieChart } from "recharts"
import { twj } from "tw-to-css";

import { P } from "node_modules/framer-motion/dist/types.d-Cjd591yU"
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
        className={cn("md:w-80 md:h-80 w-50 h-50 min-w-[200px] min-h-[200px] aspect-square flex items-center justify-center", chartContClassName)}
      >
        <PieChart width={220} height={220} className=" flex items-center justify-center">
          <ChartTooltip
            content={<ChartTooltipContent nameKey={dataKey} hideLabel className="text-base" />}
          />
          <Pie data={PieChartData} dataKey={dataKey} className="text-base">
            <LabelList
                dataKey="name"
                className={cn("fill-foreground ", PieChartClassName)}
                position="inside"
                stroke="none"
                formatter={(name: string) => name}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    );
  }
  return (
    <div className={cn("relative w-full h-full", className)} {...props}>
      <PieChartContainer PieChartConfig={PieChartConfig} PieChartData={PieChartData} />
      {children}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const PieChartComponent = React.memo(PieChartComponentInner) as typeof PieChartComponentInner;


