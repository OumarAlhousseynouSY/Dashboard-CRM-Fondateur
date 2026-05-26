import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatEur } from "@/lib/pipeline";

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  "gagné - en cours": { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0", label: "Gagné" },
  "prospect":         { bg: "#EFF6FF", text: "#1D40AF", border: "#BFDBFE", label: "Prospect" },
  "qualifié":         { bg: "#F5F3FF", text: "#5B21B6", border: "#DDD6FE", label: "Qualifié" },
  "négociation":      { bg: "#FFF7ED", text: "#9A3412", border: "#FED7AA", label: "Négociation" },
  "à relancer":       { bg: "#FFF8F2", text: "#C8541A", border: "#FDDCBF", label: "À Relancer" },
};

const PRIORITY_STYLES: Record<string, { text: string; label: string }> = {
  high:   { text: "#DC2626", label: "Haute" },
  medium: { text: "#D97706", label: "Moyenne" },
  low:    { text: "#6B7280", label: "Basse" },
};

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function MetaItem({
  label,
  value,
  mono = false,
  color,
}: {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
}) {
  return (
    <div>
      <p className="font-syne text-[10px] font-semibold tracking-[0.1em] uppercase text-[#B0A89E] mb-0.5">
        {label}
      </p>
      <p
        className={`${mono ? "font-mono text-[13px]" : "text-[14px]"} text-[#1C1917]`}
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!deal) notFound();

  const statusStyle =
    STATUS_STYLES[deal.status] ?? {
      bg: "#F9FAFB",
      text: "#6B7280",
      border: "#E5E7EB",
      label: deal.status,
    };
  const priorityStyle =
    PRIORITY_STYLES[deal.priority] ?? { text: "#6B7280", label: deal.priority };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back link */}
      <Link
        href="/commerciaux"
        className="inline-flex items-center gap-1.5 font-syne text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9B9085] hover:text-[#C8541A] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M8.75 10.5L5.25 7l3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Commerciaux
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase text-[#9B9085] mb-1.5">
            Détail du deal
          </p>
          <h1 className="font-syne font-bold text-2xl text-[#1C1917] tracking-tight leading-snug">
            {deal.name}
          </h1>
          <p className="font-mono text-[11px] text-[#B0A89E] mt-1">
            #{deal.id.slice(0, 8)}
          </p>
        </div>
        <span
          className="shrink-0 font-syne text-[11px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full mt-7"
          style={{
            background: statusStyle.bg,
            color: statusStyle.text,
            border: `1px solid ${statusStyle.border}`,
          }}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Amount */}
      <div
        className="bg-white rounded-lg p-5 kpi-border-orange"
        style={{ border: "1px solid hsl(36 18% 88%)" }}
      >
        <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9B9085] mb-2">
          Montant
        </p>
        <p className="font-mono text-[32px] font-medium text-[#C8541A] leading-none">
          {formatEur(deal.amount)}
        </p>
      </div>

      {/* Metadata grid */}
      <div
        className="bg-white rounded-lg p-5"
        style={{ border: "1px solid hsl(36 18% 88%)" }}
      >
        <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9B9085] mb-4">
          Informations
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <MetaItem label="Commercial" value={deal.assignee || "—"} />
          <MetaItem
            label="Priorité"
            value={priorityStyle.label}
            color={priorityStyle.text}
          />
          <MetaItem label="Date de création" value={formatDate(deal.dateCreated)} mono />
          <MetaItem label="Échéance" value={formatDate(deal.dueDate)} mono />
          <MetaItem label="Date de démarrage" value={formatDate(deal.startDate)} mono />
          <MetaItem label="Importé le" value={formatDate(deal.importedAt)} mono />
        </div>
      </div>

      {/* Tags */}
      {deal.tags.length > 0 && (
        <div
          className="bg-white rounded-lg p-5"
          style={{ border: "1px solid hsl(36 18% 88%)" }}
        >
          <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9B9085] mb-3">
            Secteurs
          </p>
          <div className="flex flex-wrap gap-2">
            {deal.tags.map((t) => (
              <span
                key={t.id}
                className="font-syne text-[11px] font-medium tracking-wide px-2.5 py-1 rounded"
                style={{
                  background: "hsl(44 15% 93%)",
                  color: "#6B6560",
                  border: "1px solid hsl(36 18% 88%)",
                }}
              >
                {t.tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content / Notes */}
      {deal.content && (
        <div
          className="bg-white rounded-lg p-5"
          style={{ border: "1px solid hsl(36 18% 88%)" }}
        >
          <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9B9085] mb-3">
            Notes
          </p>
          <p className="text-sm text-[#44403C] leading-relaxed">{deal.content}</p>
        </div>
      )}
    </div>
  );
}
