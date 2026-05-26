import { prisma } from "@/lib/db";
import { formatEur, SECURED_STATUS, ACTIVE_STATUSES } from "@/lib/pipeline";

export default async function SecteursPage() {
  const tagRows = await prisma.dealTag.findMany({
    include: { deal: { select: { amount: true, status: true } } },
  });

  if (tagRows.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-syne text-[#9B9085]">
          Aucun secteur disponible. Importez un fichier CSV pour commencer.
        </p>
      </div>
    );
  }

  const sectorMap = new Map<string, { caSecurise: number; pipeline: number }>();

  for (const row of tagRows) {
    const entry = sectorMap.get(row.tag) ?? { caSecurise: 0, pipeline: 0 };
    const { amount, status } = row.deal;
    if (status === SECURED_STATUS) {
      entry.caSecurise += amount;
    } else if ((ACTIVE_STATUSES as readonly string[]).includes(status)) {
      entry.pipeline += amount;
    }
    sectorMap.set(row.tag, entry);
  }

  const sectors = Array.from(sectorMap.entries())
    .map(([tag, data]) => ({ tag, ...data, total: data.caSecurise + data.pipeline }))
    .sort((a, b) => b.total - a.total);

  const maxTotal = sectors[0]?.total ?? 1;
  const activeCount = sectors.filter((s) => s.total > 0).length;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase text-[#9B9085] mb-1.5">
            Analyse
          </p>
          <h1 className="font-syne font-bold text-2xl text-[#1C1917] tracking-tight">
            Secteurs clients
          </h1>
        </div>
        <span className="font-mono text-xs text-[#9B9085]">
          {activeCount} secteur{activeCount !== 1 ? "s" : ""} actif{activeCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: "#059669" }} />
          <span className="font-syne text-[11px] text-[#6B6560]">CA Sécurisé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: "#BFDBFE" }} />
          <span className="font-syne text-[11px] text-[#6B6560]">Pipeline actif</span>
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{ border: "1px solid hsl(36 18% 88%)" }}
      >
        {/* Header */}
        <div
          className="grid px-6 py-3 gap-4"
          style={{
            gridTemplateColumns: "180px 1fr 110px 110px 110px",
            borderBottom: "1px solid hsl(36 18% 88%)",
          }}
        >
          {["Secteur", "", "CA Sécurisé", "Pipeline", "Total"].map((h, i) => (
            <span
              key={i}
              className={`font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9B9085] ${
                i >= 2 ? "text-right" : ""
              }`}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {sectors.map((row, i) => {
          const barWidthTotal = maxTotal > 0 ? (row.total / maxTotal) * 100 : 0;
          const caFraction = row.total > 0 ? row.caSecurise / row.total : 0;
          const isActive = row.total > 0;

          return (
            <div
              key={row.tag}
              className={`data-row ${!isActive ? "opacity-40" : ""}`}
              style={{
                borderBottom: i < sectors.length - 1 ? "1px solid hsl(44 15% 93%)" : "none",
              }}
            >
              <div
                className="grid px-6 py-3 gap-4 items-center"
                style={{ gridTemplateColumns: "180px 1fr 110px 110px 110px" }}
              >
                {/* Tag */}
                <span className="font-syne font-medium text-[13px] text-[#1C1917] truncate">
                  {row.tag}
                </span>

                {/* Mini stacked bar */}
                <div className="h-1.5 rounded-full overflow-hidden bg-[#F0EDE6] flex">
                  <div
                    className="h-full rounded-l-full transition-all"
                    style={{
                      width: `${barWidthTotal * caFraction}%`,
                      background: "#059669",
                    }}
                  />
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${barWidthTotal * (1 - caFraction)}%`,
                      background: "#BFDBFE",
                    }}
                  />
                </div>

                {/* CA */}
                <span className="font-mono text-[12px] text-[#059669] text-right">
                  {formatEur(row.caSecurise)}
                </span>

                {/* Pipeline */}
                <span className="font-mono text-[12px] text-[#1D4ED8] text-right">
                  {formatEur(row.pipeline)}
                </span>

                {/* Total */}
                <span
                  className="font-mono text-[13px] font-semibold text-right"
                  style={{ color: isActive ? "#1C1917" : "#9B9085" }}
                >
                  {formatEur(row.total)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
