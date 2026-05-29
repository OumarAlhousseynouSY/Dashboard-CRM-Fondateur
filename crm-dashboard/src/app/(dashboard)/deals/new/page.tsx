import { NewDealForm } from "@/components/NewDealForm";

export default function NewDealPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
          Deals
        </p>
        <h1 className="font-syne font-bold text-2xl tracking-tight" style={{ color: "var(--text-primary)" }}>
          Nouveau deal
        </h1>
      </div>

      <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)" }}>
        <NewDealForm />
      </div>
    </div>
  );
}
