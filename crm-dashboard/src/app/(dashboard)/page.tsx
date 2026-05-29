import { prisma } from "@/lib/db";
import { computeKpis, formatEur } from "@/lib/pipeline";
import { DashboardCharts } from "@/components/DashboardCharts";

export const dynamic = "force-dynamic";

const KPI_CONFIG = [
  {
    key: "caSecurise" as const,
    title: "CA Sécurisé",
    subtitle: "Deals gagnés · en cours",
    borderClass: "kpi-border-emerald",
    valueColor: "#10B981",
    glow: "rgba(16,185,129,0.08)",
  },
  {
    key: "pipelineBrut" as const,
    title: "Pipeline Brut",
    subtitle: "Prospect · Qualifié · Négociation",
    borderClass: "kpi-border-blue",
    valueColor: "#3B82F6",
    glow: "rgba(59,130,246,0.08)",
  },
  {
    key: "pipelinePondere" as const,
    title: "Pipeline Pondéré",
    subtitle: "10 % · 35 % · 70 %",
    borderClass: "kpi-border-violet",
    valueColor: "#8B5CF6",
    glow: "rgba(139,92,246,0.08)",
  },
  {
    key: "volumeActifs" as const,
    title: "Deals Actifs",
    subtitle: "En cours de conversion",
    borderClass: "kpi-border-sky",
    valueColor: "#38BDF8",
    glow: "rgba(56,189,248,0.08)",
    isCount: true,
  },
  {
    key: "panierMoyen" as const,
    title: "Panier Moyen",
    subtitle: "Tous statuts confondus",
    borderClass: "kpi-border-orange",
    valueColor: "#E05C1A",
    glow: "rgba(224,92,26,0.08)",
  },
];

const STATUS_ORDER = [
  "prospect",
  "qualifié",
  "négociation",
  "gagné - en cours",
  "à relancer",
  "perdu",
];

export default async function DashboardPage() {
  const [deals, statusGroups, sectorGroups] = await Promise.all([
    prisma.deal.findMany(),
    prisma.deal.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.dealTag.groupBy({ by: ["tag"], _count: { dealId: true }, orderBy: { _count: { dealId: "desc" } }, take: 10 }),
  ]);

  const kpis = computeKpis(deals);

  const dealsByStatus = STATUS_ORDER
    .map((s) => {
      const found = statusGroups.find((g) => g.status === s);
      return found ? { label: s, count: found._count.id } : null;
    })
    .filter((x): x is { label: string; count: number } => x !== null);

  const dealsBySector = sectorGroups.map((g) => ({
    label: g.tag.length > 14 ? g.tag.slice(0, 13) + "…" : g.tag,
    count: g._count.dealId,
  }));

  const pipelineTotal = kpis.caSecurise + kpis.pipelineBrut;
  const caRatio = pipelineTotal > 0 ? (kpis.caSecurise / pipelineTotal) * 100 : 0;

  return (
    <div className="space-y-8 max-w-6xl">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
            Vue d'ensemble
          </p>
          <h1 className="font-syne font-bold text-2xl tracking-tight" style={{ color: "var(--text-primary)" }}>
            Indicateurs clés
          </h1>
        </div>
        <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          {deals.length} deal{deals.length !== 1 ? "s" : ""} en base
        </span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KPI_CONFIG.map((cfg) => {
          const rawValue = kpis[cfg.key];
          const displayValue = cfg.isCount
            ? String(rawValue)
            : formatEur(rawValue as number);

          return (
            <div
              key={cfg.key}
              className={`rounded-xl p-5 ${cfg.borderClass}`}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-card)",
                boxShadow: `0 4px 24px ${cfg.glow}`,
              }}
            >
              <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                {cfg.title}
              </p>
              <p
                className="font-mono text-[28px] font-medium leading-none mb-2"
                style={{ color: cfg.valueColor }}
              >
                {displayValue}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-dim)" }}>{cfg.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline breakdown bar */}
      {pipelineTotal > 0 && (
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)" }}
        >
          <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: "var(--text-muted)" }}>
            Répartition du chiffre d'affaires
          </p>
          <div className="flex gap-4 mb-3">
            <div>
              <span className="font-mono text-xs" style={{ color: "#10B981" }}>
                {caRatio.toFixed(0)}%
              </span>
              <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>sécurisé</span>
            </div>
            <div>
              <span className="font-mono text-xs" style={{ color: "#3B82F6" }}>
                {(100 - caRatio).toFixed(0)}%
              </span>
              <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>pipeline actif</span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "var(--border-subtle)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${caRatio}%`, background: "#10B981" }}
            />
            <div
              className="h-full flex-1 rounded-r-full"
              style={{ background: "rgba(59,130,246,0.25)" }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
              {formatEur(kpis.caSecurise)}
            </span>
            <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
              {formatEur(pipelineTotal)}
            </span>
          </div>
        </div>
      )}

      {/* Charts */}
      <DashboardCharts dealsByStatus={dealsByStatus} dealsBySector={dealsBySector} />

      {/* À relancer */}
      <div
        className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-6"
        style={{
          background: "rgba(224,92,26,0.06)",
          border: "1px solid rgba(224,92,26,0.2)",
          borderLeft: "3px solid #E05C1A",
        }}
      >
        <div className="flex-1">
          <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: "rgba(224,92,26,0.7)" }}>
            À Relancer
          </p>
          <p className="text-sm" style={{ color: "#F59E60" }}>
            {kpis.aRelancerCount === 0
              ? "Aucun deal en attente de relance."
              : `${kpis.aRelancerCount} deal${kpis.aRelancerCount > 1 ? "s" : ""} nécessitent une relance.`}
          </p>
        </div>
        <div className="flex gap-8 shrink-0">
          <div>
            <p className="font-syne text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(224,92,26,0.6)" }}>
              Deals
            </p>
            <p className="font-mono text-2xl font-medium" style={{ color: "#E05C1A" }}>
              {kpis.aRelancerCount}
            </p>
          </div>
          <div>
            <p className="font-syne text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(224,92,26,0.6)" }}>
              Montant
            </p>
            <p className="font-mono text-2xl font-medium" style={{ color: "#E05C1A" }}>
              {formatEur(kpis.aRelancerAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
