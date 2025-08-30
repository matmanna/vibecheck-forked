"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  points: {
    label: "Points",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export default function PointsChart({
  eventualityNames,
  results,
}: {
  eventualityNames: string[];
  results: number[];
}) {
  const chartData = results.map((item, idx) => {
    return { eventuality: eventualityNames[idx], points: results[idx] };
  });
  const centeredDomain = [-Math.max(...chartData.map((item) => Math.abs(item.points))), Math.max(...chartData.map((item) => Math.abs(item.points)))];
  // centeredDomain = [-Math.min(...chartData.map((item) => item.points)), Math.max(...chartData.map((item) => item.points))];
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <BarChart width={600} height={300} data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey="points" domain={centeredDomain} />
        <YAxis type="category" dataKey="eventuality" />
        <Tooltip />
        <Legend />
        <Bar dataKey="points" />
        <ReferenceLine x={0} stroke="black" strokeWidth="2" /> 
      </BarChart>
    </ChartContainer>
  );
}
