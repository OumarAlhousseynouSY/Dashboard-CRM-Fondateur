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
  "gagné - en cours": "#10B981",
  prospect:           "#3B82F6",
  qualifié:           "#8B5CF6",
  négociation:        "#6366F1",
  "à relancer":       "#E05C1A",
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
      select: { id: true, name: true, status: true, amount: true, assignee: true, dueDate: true },
    }),
  ]);

  if (groups.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-syne" style={{ color: "var(--text-muted)" }}>
          Aucun deal en base. Importez un fichier CSV pour commencer.
        </p>
      </div>
    );
  }

  const maxAmount = Math.max(...groups.map((g) => g._sum.amount ?? 0));
  const totalAmount = groups.reduce((sum, g) => sum + (g._sum.amount ?? 0), 0);

  const dealsByAssignee = deals.reduce<Record<string, typeof deals>>((acc, deal) => {
    const key = deal.assignee || "—";
    (acc[key] ??= []).push(deal);
    return acc;
  }, {});

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
          Équipe commerciale
        </p>
        <h1 className="font-syne font-bold text-2xl tracking-tight" style={{ color: "var(--text-primary)" }}>
          Performance
        </h1>
      </div>

      {/* Summary table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)" }}>
        <div
          className="grid gap-4 px-6 py-3"
          style={{ gridTemplateColumns: "1fr 80px 130px", borderBottom: "1px solid var(--border-subtle)" }}
        >
          {["Nom", "Deals", "Valeur brute"].map((h, i) => (
            <span key={h} className={`font-syne text-[10px] font-semibold tracking-[0.12em] uppercase ${i >= 1 ? "text-right" : ""}`} style={{ color: "var(--text-muted)" }}>
              {h}
            </span>
          ))}
        </div>

        {groups.map((row, i) => {
          const amount = row._sum.amount ?? 0;
          const barWidth = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
          const share = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
          return (
            <div key={row.assignee} className="data-row" style={{ borderBottom: i < groups.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
              <div className="grid gap-4 px-6 py-4 items-center" style={{ gridTemplateColumns: "1fr 80px 130px" }}>
                <div className="space-y-1.5">
                  <span className="font-syne font-medium text-[14px]" style={{ color: "var(--text-primary)" }}>
                    {row.assignee || "—"}
                  </span>
                  <div className="h-1 rounded-full w-full max-w-xs overflow-hidden" style={{ background: "var(--border-subtle)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, background: "#E05C1A" }} />
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[13px]" style={{ color: "var(--text-secondary)" }}>{row._count.id}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>{formatEur(amount)}</p>
                  <p className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{share.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          );
        })}

        <div
          className="grid gap-4 px-6 py-3"
          style={{ gridTemplateColumns: "1fr 80px 130px", background: "var(--bg-section)", borderTop: "1px solid var(--border-subtle)" }}
        >
          <span className="font-syne text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>Total</span>
          <span className="font-mono text-[12px] font-medium text-right" style={{ color: "var(--text-secondary)" }}>
            {groups.reduce((s, g) => s + g._count.id, 0)}
          </span>
          <span className="font-mono text-[13px] font-semibold text-right" style={{ color: "var(--text-primary)" }}>
            {formatEur(totalAmount)}
          </span>
        </div>
      </div>

      {/* Individual deals per commercial */}
      <div className="space-y-6">
        <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: "var(--text-muted)" }}>
          Deals par commercial
        </p>

        {groups.map((group) => {
          const assignee = group.assignee || "—";
          const assigneeDeals = dealsByAssignee[assignee] ?? [];
          return (
            <div key={assignee} className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)" }}>
              <div className="px-6 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-section)" }}>
                <span className="font-syne text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{assignee}</span>
                <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {assigneeDeals.length} deal{assigneeDeals.length > 1 ? "s" : ""}
                </span>
              </div>

              {assigneeDeals.map((deal, i) => {
                const label = STATUS_LABELS[deal.status] ?? deal.status;
                const color = STATUS_COLORS[deal.status] ?? "#55557A";
                return (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="flex items-center justify-between px-6 py-3.5 transition-colors group data-row"
                    style={{ borderBottom: i < assigneeDeals.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[13px] truncate transition-colors group-hover:text-[#E05C1A]" style={{ color: "var(--text-primary)" }}>
                        {deal.name}
                      </span>
                      <span className="font-syne text-[10px] font-semibold tracking-wide uppercase shrink-0" style={{ color }}>
                        {label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-[13px]" style={{ color: "var(--text-secondary)" }}>{formatEur(deal.amount)}</span>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-colors group-hover:text-[#E05C1A]" style={{ color: "var(--text-muted)" }}>
                        <path d="M5.25 3.5L8.75 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
