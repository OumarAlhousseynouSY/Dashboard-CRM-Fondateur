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
  "prospect":        "#3B82F6",
  "qualifié":        "#8B5CF6",
  "négociation":     "#6366F1",
  "gagné - en cours":"#10B981",
  "à relancer":      "#E05C1A",
  "perdu":           "#55557A",
};

export interface ChartItem {
  label: string;
  count: number;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)" }}
    >
      <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: "var(--text-muted)" }}>
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
      <p className="text-[12px] py-8 text-center font-syne" style={{ color: "var(--text-muted)" }}>
        Aucune donnée disponible.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 4 }} barCategoryGap="30%">
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#55557A" }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#55557A" }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          contentStyle={{
            background: "#13131D",
            border: "1px solid #22223A",
            borderRadius: 8,
            fontSize: 12,
            color: "#E2E2F0",
          }}
          formatter={(value) => [value, "deals"]}
          labelStyle={{ color: "#8080A0", fontWeight: 600, marginBottom: 2 }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={useStatusColors ? (STATUS_COLORS[entry.label] ?? "#55557A") : (color ?? "#3B82F6")}
              fillOpacity={0.9}
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
        <SimpleBarChart data={dealsBySector} color="#3B82F6" />
      </ChartCard>
    </div>
  );
}
