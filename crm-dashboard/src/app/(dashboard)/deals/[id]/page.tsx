import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatEur } from "@/lib/pipeline";

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  "gagné - en cours": { bg: "rgba(16,185,129,0.1)",  text: "#10B981", border: "rgba(16,185,129,0.25)",  label: "Gagné" },
  "prospect":         { bg: "rgba(59,130,246,0.1)",   text: "#3B82F6", border: "rgba(59,130,246,0.25)",   label: "Prospect" },
  "qualifié":         { bg: "rgba(139,92,246,0.1)",   text: "#8B5CF6", border: "rgba(139,92,246,0.25)",   label: "Qualifié" },
  "négociation":      { bg: "rgba(99,102,241,0.1)",   text: "#6366F1", border: "rgba(99,102,241,0.25)",   label: "Négociation" },
  "à relancer":       { bg: "rgba(224,92,26,0.1)",    text: "#E05C1A", border: "rgba(224,92,26,0.25)",    label: "À Relancer" },
};

const PRIORITY_STYLES: Record<string, { text: string; label: string }> = {
  high:   { text: "#EF4444", label: "Haute" },
  medium: { text: "#F59E0B", label: "Moyenne" },
  low:    { text: "#55557A", label: "Basse" },
};

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function MetaItem({ label, value, mono = false, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div>
      <p className="font-syne text-[10px] font-semibold tracking-[0.1em] uppercase mb-0.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p
        className={`${mono ? "font-mono text-[13px]" : "text-[14px]"}`}
        style={{ color: color ?? "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({ where: { id }, include: { tags: true } });
  if (!deal) notFound();

  const statusStyle = STATUS_STYLES[deal.status] ?? { bg: "var(--bg-section)", text: "var(--text-muted)", border: "var(--border-card)", label: deal.status };
  const priorityStyle = PRIORITY_STYLES[deal.priority] ?? { text: "var(--text-muted)", label: deal.priority };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back link */}
      <Link
        href="/commerciaux"
        className="inline-flex items-center gap-1.5 font-syne text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={() => {}} /* hover handled via CSS */
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M8.75 10.5L5.25 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Commerciaux
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
            Détail du deal
          </p>
          <h1 className="font-syne font-bold text-2xl tracking-tight leading-snug" style={{ color: "var(--text-primary)" }}>
            {deal.name}
          </h1>
          <p className="font-mono text-[11px] mt-1" style={{ color: "var(--text-dim)" }}>
            #{deal.id.slice(0, 8)}
          </p>
        </div>
        <span
          className="shrink-0 font-syne text-[11px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full mt-7"
          style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Amount */}
      <div className="rounded-xl p-5 kpi-border-orange" style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", boxShadow: "0 4px 24px rgba(224,92,26,0.08)" }}>
        <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: "var(--text-muted)" }}>
          Montant
        </p>
        <p className="font-mono text-[32px] font-medium leading-none" style={{ color: "#E05C1A" }}>
          {formatEur(deal.amount)}
        </p>
      </div>

      {/* Metadata grid */}
      <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)" }}>
        <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: "var(--text-muted)" }}>
          Informations
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <MetaItem label="Commercial" value={deal.assignee || "—"} />
          <MetaItem label="Priorité" value={priorityStyle.label} color={priorityStyle.text} />
          <MetaItem label="Date de création" value={formatDate(deal.dateCreated)} mono />
          <MetaItem label="Échéance" value={formatDate(deal.dueDate)} mono />
          <MetaItem label="Date de démarrage" value={formatDate(deal.startDate)} mono />
          <MetaItem label="Importé le" value={formatDate(deal.importedAt)} mono />
        </div>
      </div>

      {/* Tags */}
      {deal.tags.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)" }}>
          <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            Secteurs
          </p>
          <div className="flex flex-wrap gap-2">
            {deal.tags.map((t) => (
              <span
                key={t.id}
                className="font-syne text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-md"
                style={{ background: "var(--bg-section)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
              >
                {t.tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content / Notes */}
      {deal.content && (
        <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)" }}>
          <p className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            Notes
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{deal.content}</p>
        </div>
      )}
    </div>
  );
}
