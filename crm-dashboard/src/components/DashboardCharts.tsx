"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  "prospect": "#0284C7",
  "qualifié": "#7C3AED",
  "négociation": "#1D4ED8",
  "gagné - en cours": "#059669",
  "à relancer": "#C8541A",
  "perdu": "#78716C",
};

export interface ChartItem {
  label: string;
  count: number;
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-lg p-5"
      style={{ border: "1px solid hsl(36 18% 88%)" }}
    >
      <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9B9085] mb-4">
        {title}
      </p>
      {children}
    </div>
  );
}

function SimpleBarChart({
  data,
  color,
  useStatusColors = false,
}: {
  data: ChartItem[];
  color?: string;
  useStatusColors?: boolean;
}) {
  if (data.length === 0) {
    return (
      <p className="text-[12px] text-[#9B9085] py-8 text-center">
        Aucune donnée disponible.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: -20, bottom: 4 }}
        barCategoryGap="30%"
      >
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9B9085" }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#9B9085" }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          cursor={{ fill: "hsl(44 15% 93%)" }}
          contentStyle={{
            background: "#fff",
            border: "1px solid hsl(36 18% 88%)",
            borderRadius: 6,
            fontSize: 12,
            color: "#1C1917",
          }}
          formatter={(value) => [value, "deals"]}
          labelStyle={{ color: "#6B6560", fontWeight: 600, marginBottom: 2 }}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                useStatusColors
                  ? (STATUS_COLORS[entry.label] ?? "#9B9085")
                  : (color ?? "#1D4ED8")
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DashboardCharts({
  dealsByStatus,
  dealsBySector,
}: {
  dealsByStatus: ChartItem[];
  dealsBySector: ChartItem[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Deals par statut">
        <SimpleBarChart data={dealsByStatus} useStatusColors />
      </ChartCard>

      <ChartCard title="Deals par secteur">
        <SimpleBarChart data={dealsBySector} color="#1D4ED8" />
      </ChartCard>
    </div>
  );
}
