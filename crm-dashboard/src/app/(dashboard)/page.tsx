import { prisma } from "@/lib/db";
import { computeKpis, formatEur } from "@/lib/pipeline";
import { DashboardCharts } from "@/components/DashboardCharts";

const KPI_CONFIG = [
  {
    key: "caSecurise" as const,
    title: "CA Sécurisé",
    subtitle: "Deals gagnés · en cours",
    borderClass: "kpi-border-emerald",
    valueColor: "#059669",
  },
  {
    key: "pipelineBrut" as const,
    title: "Pipeline Brut",
    subtitle: "Prospect · Qualifié · Négociation",
    borderClass: "kpi-border-blue",
    valueColor: "#1D4ED8",
  },
  {
    key: "pipelinePondere" as const,
    title: "Pipeline Pondéré",
    subtitle: "10 % · 35 % · 70 %",
    borderClass: "kpi-border-violet",
    valueColor: "#7C3AED",
  },
  {
    key: "volumeActifs" as const,
    title: "Deals Actifs",
    subtitle: "En cours de conversion",
    borderClass: "kpi-border-sky",
    valueColor: "#0284C7",
    isCount: true,
  },
  {
    key: "panierMoyen" as const,
    title: "Panier Moyen",
    subtitle: "Tous statuts confondus",
    borderClass: "kpi-border-orange",
    valueColor: "#C8541A",
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
          <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase text-[#9B9085] mb-1.5">
            Vue d'ensemble
          </p>
          <h1 className="font-syne font-bold text-2xl text-[#1C1917] tracking-tight">
            Indicateurs clés
          </h1>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs text-[#9B9085]">
            {deals.length} deal{deals.length !== 1 ? "s" : ""} en base
          </span>
        </div>
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
              className={`bg-white rounded-lg p-5 ${cfg.borderClass}`}
              style={{ border: "1px solid hsl(36 18% 88%)" }}
            >
              <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9B9085] mb-3">
                {cfg.title}
              </p>
              <p
                className="font-mono text-[28px] font-medium leading-none mb-2"
                style={{ color: cfg.valueColor }}
              >
                {displayValue}
              </p>
              <p className="text-[11px] text-[#B0A89E]">{cfg.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline breakdown bar */}
      {pipelineTotal > 0 && (
        <div
          className="bg-white rounded-lg p-5"
          style={{ border: "1px solid hsl(36 18% 88%)" }}
        >
          <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9B9085] mb-4">
            Répartition du chiffre d'affaires
          </p>
          <div className="flex gap-4 mb-3">
            <div>
              <span className="font-mono text-xs text-[#059669]">
                {caRatio.toFixed(0)}%
              </span>
              <span className="text-xs text-[#9B9085] ml-1">sécurisé</span>
            </div>
            <div>
              <span className="font-mono text-xs text-[#1D4ED8]">
                {(100 - caRatio).toFixed(0)}%
              </span>
              <span className="text-xs text-[#9B9085] ml-1">pipeline actif</span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-[#F0EDE6] flex">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${caRatio}%`, background: "#059669" }}
            />
            <div
              className="h-full flex-1 rounded-r-full"
              style={{ background: "#DBEAFE" }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-mono text-[11px] text-[#9B9085]">
              {formatEur(kpis.caSecurise)}
            </span>
            <span className="font-mono text-[11px] text-[#9B9085]">
              {formatEur(pipelineTotal)}
            </span>
          </div>
        </div>
      )}

      {/* Charts */}
      <DashboardCharts dealsByStatus={dealsByStatus} dealsBySector={dealsBySector} />

      {/* À relancer */}
      <div
        className="rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-6"
        style={{
          background: "#FFF8F2",
          border: "1px solid #FDDCBF",
          borderLeft: "3px solid #C8541A",
        }}
      >
        <div className="flex-1">
          <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#C8541A]/70 mb-1">
            À Relancer
          </p>
          <p className="text-sm text-[#92400E]">
            {kpis.aRelancerCount === 0
              ? "Aucun deal en attente de relance."
              : `${kpis.aRelancerCount} deal${kpis.aRelancerCount > 1 ? "s" : ""} nécessitent une relance.`}
          </p>
        </div>
        <div className="flex gap-8 shrink-0">
          <div>
            <p className="font-syne text-[10px] font-semibold tracking-widest uppercase text-[#C8541A]/60 mb-1">
              Deals
            </p>
            <p className="font-mono text-2xl font-medium text-[#C8541A]">
              {kpis.aRelancerCount}
            </p>
          </div>
          <div>
            <p className="font-syne text-[10px] font-semibold tracking-widest uppercase text-[#C8541A]/60 mb-1">
              Montant
            </p>
            <p className="font-mono text-2xl font-medium text-[#C8541A]">
              {formatEur(kpis.aRelancerAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
