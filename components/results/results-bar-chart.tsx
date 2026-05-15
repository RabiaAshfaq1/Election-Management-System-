"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import type { ResultsCandidate } from "@/lib/elections/results";

interface ResultsBarChartProps {
  candidates: ResultsCandidate[];
}

export function ResultsBarChart({ candidates }: ResultsBarChartProps) {
  const chartData = [...candidates]
    .sort((a, b) => a.vote_count - b.vote_count)
    .map((c) => ({
      name: c.name,
      votes: c.vote_count,
      percentage: c.percentage,
      fill: c.bar_color,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-border bg-white text-sm text-muted">
        No votes cast yet
      </div>
    );
  }

  return (
    <div className="h-[420px] w-full rounded-2xl border border-border bg-white p-6">
      <h2 className="font-heading text-xl font-bold text-ink">Vote distribution</h2>
      <ResponsiveContainer width="100%" height="90%" className="mt-4">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 48, left: 8, bottom: 8 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fill: "#0a0a0f", fontSize: 13, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Bar
            dataKey="votes"
            radius={[0, 8, 8, 0]}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="votes"
              position="right"
              content={({ x, y, width, height, value, index }) => {
                const item = chartData[index ?? 0];
                if (x == null || y == null || width == null || height == null) {
                  return null;
                }
                const label = `${value} (${item?.percentage ?? 0}%)`;
                return (
                  <text
                    x={Number(x) + Number(width) + 8}
                    y={Number(y) + Number(height) / 2}
                    fill="#6b6b7a"
                    fontSize={12}
                    fontWeight={600}
                    dominantBaseline="middle"
                  >
                    {label}
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
