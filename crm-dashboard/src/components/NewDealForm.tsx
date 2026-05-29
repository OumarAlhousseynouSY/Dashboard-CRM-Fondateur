"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createDeal, type CreateDealState } from "@/actions/createDeal";

const STATUSES = [
  { value: "prospect", label: "Prospect" },
  { value: "qualifié", label: "Qualifié" },
  { value: "négociation", label: "Négociation" },
  { value: "gagné - en cours", label: "Gagné · En cours" },
  { value: "à relancer", label: "À Relancer" },
];

const PRIORITIES = [
  { value: "high", label: "Haute" },
  { value: "medium", label: "Moyenne" },
  { value: "low", label: "Basse" },
];

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--text-muted)" }}>
        {label}{required && <span style={{ color: "#E05C1A" }} className="ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] font-syne" style={{ color: "#EF4444" }}>{error}</p>}
    </div>
  );
}

const inputClass = "w-full rounded-lg px-3 py-2 text-[13px] font-mono outline-none transition-colors focus:ring-1 focus:ring-[#E05C1A]/40";
const inputStyle = { background: "var(--bg-section)", border: "1px solid var(--border-card)", color: "var(--text-primary)" };
const selectClass = "w-full rounded-lg px-3 py-2 text-[13px] font-syne outline-none transition-colors focus:ring-1 focus:ring-[#E05C1A]/40 appearance-none cursor-pointer";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2.5 rounded-lg font-syne text-[12px] font-semibold tracking-[0.08em] uppercase text-white transition-opacity disabled:opacity-60"
      style={{ background: "#E05C1A" }}
    >
      {pending ? "Enregistrement…" : "Créer le deal"}
    </button>
  );
}

export function NewDealForm() {
  const [state, action] = useFormState<CreateDealState, FormData>(createDeal, null);

  return (
    <form action={action} className="space-y-6">
      {state?.globalError && (
        <div className="rounded-lg px-4 py-3 text-[13px] font-syne" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}>
          {state.globalError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nom du deal" required error={state?.errors?.name}>
          <input name="name" type="text" placeholder="Ex : Contrat Acme Corp" className={inputClass} style={{ ...inputStyle, caretColor: "#E05C1A" }} />
        </Field>
        <Field label="Statut" required error={state?.errors?.status}>
          <select name="status" className={selectClass} style={inputStyle} defaultValue="">
            <option value="" disabled style={{ background: "var(--bg-card)" }}>Choisir un statut</option>
            {STATUSES.map((s) => <option key={s.value} value={s.value} style={{ background: "var(--bg-card)" }}>{s.label}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Commercial" required error={state?.errors?.assignee}>
          <input name="assignee" type="text" placeholder="Prénom Nom" className={inputClass} style={{ ...inputStyle, caretColor: "#E05C1A" }} />
        </Field>
        <Field label="Montant (€)" required error={state?.errors?.amount}>
          <input name="amount" type="number" min="0" step="0.01" placeholder="0" className={inputClass} style={{ ...inputStyle, caretColor: "#E05C1A" }} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Priorité">
          <select name="priority" className={selectClass} style={inputStyle} defaultValue="medium">
            {PRIORITIES.map((p) => <option key={p.value} value={p.value} style={{ background: "var(--bg-card)" }}>{p.label}</option>)}
          </select>
        </Field>
        <Field label="Secteurs">
          <input name="tags" type="text" placeholder="Ex : SaaS, B2B, Tech" className={inputClass} style={{ ...inputStyle, caretColor: "#E05C1A" }} />
          <p className="text-[10px] font-syne mt-1" style={{ color: "var(--text-dim)" }}>Séparés par des virgules</p>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Date de création">
          <input name="dateCreated" type="date" className={inputClass} style={{ ...inputStyle, colorScheme: "dark" }} />
        </Field>
        <Field label="Date de démarrage">
          <input name="startDate" type="date" className={inputClass} style={{ ...inputStyle, colorScheme: "dark" }} />
        </Field>
        <Field label="Échéance">
          <input name="dueDate" type="date" className={inputClass} style={{ ...inputStyle, colorScheme: "dark" }} />
        </Field>
      </div>

      <Field label="Notes">
        <textarea name="content" rows={3} placeholder="Informations complémentaires…" className={inputClass + " resize-none"} style={{ ...inputStyle, caretColor: "#E05C1A" }} />
      </Field>

      <div className="flex items-center gap-4 pt-2">
        <SubmitButton />
        <a href="/" className="font-syne text-[12px] tracking-wide transition-colors" style={{ color: "var(--text-muted)" }}>
          Annuler
        </a>
      </div>
    </form>
  );
}
