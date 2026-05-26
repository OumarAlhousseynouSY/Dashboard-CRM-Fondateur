import { prisma } from "@/lib/db";
import { formatEur } from "@/lib/pipeline";

export default async function CommerciauxPage() {
  const groups = await prisma.deal.groupBy({
    by: ["assignee"],
    _count: { id: true },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  if (groups.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-syne text-[#9B9085]">
          Aucun deal en base. Importez un fichier CSV pour commencer.
        </p>
      </div>
    );
  }

  const maxAmount = Math.max(...groups.map((g) => g._sum.amount ?? 0));
  const totalAmount = groups.reduce((sum, g) => sum + (g._sum.amount ?? 0), 0);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase text-[#9B9085] mb-1.5">
          Équipe commerciale
        </p>
        <h1 className="font-syne font-bold text-2xl text-[#1C1917] tracking-tight">
          Performance
        </h1>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{ border: "1px solid hsl(36 18% 88%)" }}
      >
        {/* Table header */}
        <div
          className="grid gap-4 px-6 py-3"
          style={{
            gridTemplateColumns: "1fr 80px 130px",
            borderBottom: "1px solid hsl(36 18% 88%)",
          }}
        >
          <span className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9B9085]">
            Nom
          </span>
          <span className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9B9085] text-right">
            Deals
          </span>
          <span className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9B9085] text-right">
            Valeur brute
          </span>
        </div>

        {/* Rows */}
        {groups.map((row, i) => {
          const amount = row._sum.amount ?? 0;
          const barWidth = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
          const share = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

          return (
            <div
              key={row.assignee}
              className="data-row"
              style={{ borderBottom: i < groups.length - 1 ? "1px solid hsl(44 15% 93%)" : "none" }}
            >
              <div
                className="grid gap-4 px-6 py-4 items-center"
                style={{ gridTemplateColumns: "1fr 80px 130px" }}
              >
                {/* Name + bar */}
                <div className="space-y-1.5">
                  <span className="font-syne font-medium text-[14px] text-[#1C1917]">
                    {row.assignee || "—"}
                  </span>
                  <div className="h-1 rounded-full bg-[#F0EDE6] w-full max-w-xs overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${barWidth}%`, background: "#C8541A" }}
                    />
                  </div>
                </div>

                {/* Count */}
                <div className="text-right">
                  <span className="font-mono text-[13px] text-[#6B7280]">
                    {row._count.id}
                  </span>
                </div>

                {/* Amount + share */}
                <div className="text-right">
                  <p className="font-mono text-[14px] font-medium text-[#1C1917]">
                    {formatEur(amount)}
                  </p>
                  <p className="font-mono text-[10px] text-[#B0A89E]">
                    {share.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Total row */}
        <div
          className="grid gap-4 px-6 py-3"
          style={{
            gridTemplateColumns: "1fr 80px 130px",
            background: "hsl(44 15% 96%)",
            borderTop: "1px solid hsl(36 18% 88%)",
          }}
        >
          <span className="font-syne text-[11px] font-semibold text-[#6B6560]">
            Total
          </span>
          <span className="font-mono text-[12px] font-medium text-[#6B6560] text-right">
            {groups.reduce((s, g) => s + g._count.id, 0)}
          </span>
          <span className="font-mono text-[13px] font-semibold text-[#1C1917] text-right">
            {formatEur(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
