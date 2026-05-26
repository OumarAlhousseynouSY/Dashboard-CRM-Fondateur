import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatEur } from "@/lib/pipeline";

const STATUS_LABELS: Record<string, string> = {
  "gagné - en cours": "Gagné",
  prospect:           "Prospect",
  qualifié:           "Qualifié",
  négociation:        "Négociation",
  "à relancer":       "À Relancer",
};

const STATUS_COLORS: Record<string, string> = {
  "gagné - en cours": "#166534",
  prospect:           "#1D40AF",
  qualifié:           "#5B21B6",
  négociation:        "#9A3412",
  "à relancer":       "#C8541A",
};

export default async function CommerciauxPage() {
  const [groups, deals] = await Promise.all([
    prisma.deal.groupBy({
      by: ["assignee"],
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.deal.findMany({
      orderBy: [{ assignee: "asc" }, { amount: "desc" }],
      select: {
        id: true,
        name: true,
        status: true,
        amount: true,
        assignee: true,
        dueDate: true,
      },
    }),
  ]);

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

  const dealsByAssignee = deals.reduce<Record<string, typeof deals>>(
    (acc, deal) => {
      const key = deal.assignee || "—";
      (acc[key] ??= []).push(deal);
      return acc;
    },
    {}
  );

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

      {/* Summary table */}
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{ border: "1px solid hsl(36 18% 88%)" }}
      >
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

        {groups.map((row, i) => {
          const amount = row._sum.amount ?? 0;
          const barWidth = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
          const share = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

          return (
            <div
              key={row.assignee}
              className="data-row"
              style={{
                borderBottom:
                  i < groups.length - 1 ? "1px solid hsl(44 15% 93%)" : "none",
              }}
            >
              <div
                className="grid gap-4 px-6 py-4 items-center"
                style={{ gridTemplateColumns: "1fr 80px 130px" }}
              >
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
                <div className="text-right">
                  <span className="font-mono text-[13px] text-[#6B7280]">
                    {row._count.id}
                  </span>
                </div>
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

      {/* Individual deals per commercial */}
      <div className="space-y-6">
        <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase text-[#9B9085]">
          Deals par commercial
        </p>

        {groups.map((group) => {
          const assignee = group.assignee || "—";
          const assigneeDeals = dealsByAssignee[assignee] ?? [];

          return (
            <div
              key={assignee}
              className="bg-white rounded-lg overflow-hidden"
              style={{ border: "1px solid hsl(36 18% 88%)" }}
            >
              {/* Section header */}
              <div
                className="px-6 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid hsl(44 15% 93%)", background: "hsl(44 15% 97%)" }}
              >
                <span className="font-syne text-[12px] font-semibold text-[#1C1917]">
                  {assignee}
                </span>
                <span className="font-mono text-[11px] text-[#B0A89E]">
                  {assigneeDeals.length} deal{assigneeDeals.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Deal rows */}
              {assigneeDeals.map((deal, i) => {
                const label = STATUS_LABELS[deal.status] ?? deal.status;
                const color = STATUS_COLORS[deal.status] ?? "#6B7280";

                return (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-[hsl(44_15%_96%)] transition-colors group"
                    style={{
                      borderBottom:
                        i < assigneeDeals.length - 1
                          ? "1px solid hsl(44 15% 93%)"
                          : "none",
                    }}
                  >
                    {/* Name + status */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[13px] text-[#1C1917] truncate group-hover:text-[#C8541A] transition-colors">
                        {deal.name}
                      </span>
                      <span
                        className="font-syne text-[10px] font-semibold tracking-wide uppercase shrink-0"
                        style={{ color }}
                      >
                        {label}
                      </span>
                    </div>

                    {/* Amount + chevron */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-[13px] text-[#6B6560]">
                        {formatEur(deal.amount)}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="text-[#B0A89E] group-hover:text-[#C8541A] transition-colors"
                      >
                        <path
                          d="M5.25 3.5L8.75 7l-3.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
