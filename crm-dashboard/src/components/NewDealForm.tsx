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

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-syne text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9B9085]">
        {label}
        {required && <span className="text-[#C8541A] ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 font-syne">{error}</p>
      )}
    </div>
  );
}

const inputClass =
  "w-full bg-white rounded-md px-3 py-2 text-[13px] text-[#1C1917] placeholder-[#C4BAB3] font-mono outline-none transition-colors focus:ring-1 focus:ring-[#C8541A]/40";
const inputStyle = { border: "1px solid hsl(36 18% 88%)" };

const selectClass =
  "w-full bg-white rounded-md px-3 py-2 text-[13px] text-[#1C1917] font-syne outline-none transition-colors focus:ring-1 focus:ring-[#C8541A]/40 appearance-none cursor-pointer";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2.5 rounded-md font-syne text-[12px] font-semibold tracking-[0.08em] uppercase text-white transition-opacity disabled:opacity-60"
      style={{ background: "#C8541A" }}
    >
      {pending ? "Enregistrement…" : "Créer le deal"}
    </button>
  );
}

export function NewDealForm() {
  const [state, action] = useFormState<CreateDealState, FormData>(
    createDeal,
    null
  );

  return (
    <form action={action} className="space-y-6">
      {state?.globalError && (
        <div
          className="rounded-md px-4 py-3 text-[13px] font-syne text-red-700"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
        >
          {state.globalError}
        </div>
      )}

      {/* Nom + Statut */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nom du deal" required error={state?.errors?.name}>
          <input
            name="name"
            type="text"
            placeholder="Ex : Contrat Acme Corp"
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Statut" required error={state?.errors?.status}>
          <select name="status" className={selectClass} style={inputStyle} defaultValue="">
            <option value="" disabled>Choisir un statut</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Commercial + Montant */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Commercial" required error={state?.errors?.assignee}>
          <input
            name="assignee"
            type="text"
            placeholder="Prénom Nom"
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Montant (€)" required error={state?.errors?.amount}>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            className={inputClass}
            style={inputStyle}
          />
        </Field>
      </div>

      {/* Priorité + Secteurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Priorité">
          <select name="priority" className={selectClass} style={inputStyle} defaultValue="medium">
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Secteurs" >
          <input
            name="tags"
            type="text"
            placeholder="Ex : SaaS, B2B, Tech"
            className={inputClass}
            style={inputStyle}
          />
          <p className="text-[10px] text-[#B0A89E] font-syne mt-1">
            Séparés par des virgules
          </p>
        </Field>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Date de création">
          <input name="dateCreated" type="date" className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Date de démarrage">
          <input name="startDate" type="date" className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Échéance">
          <input name="dueDate" type="date" className={inputClass} style={inputStyle} />
        </Field>
      </div>

      {/* Notes */}
      <Field label="Notes">
        <textarea
          name="content"
          rows={3}
          placeholder="Informations complémentaires…"
          className={inputClass + " resize-none"}
          style={inputStyle}
        />
      </Field>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <SubmitButton />
        <a
          href="/"
          className="font-syne text-[12px] tracking-wide text-[#9B9085] hover:text-[#1C1917] transition-colors"
        >
          Annuler
        </a>
      </div>
    </form>
  );
}
