"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const STATUSES = [
  { value: "", label: "Tous les statuts" },
  { value: "prospect", label: "Prospect" },
  { value: "qualifié", label: "Qualifié" },
  { value: "négociation", label: "Négociation" },
  { value: "gagné - en cours", label: "Gagné · En cours" },
  { value: "à relancer", label: "À Relancer" },
];

const PRIORITIES = [
  { value: "", label: "Toutes priorités" },
  { value: "high", label: "Haute" },
  { value: "medium", label: "Moyenne" },
  { value: "low", label: "Basse" },
];

interface Props {
  assignees: string[];
  years: number[];
}

const selClass =
  "rounded-lg px-3 py-2 text-[12px] font-syne outline-none transition-colors focus:ring-1 focus:ring-[#E05C1A]/40 appearance-none cursor-pointer";
const selBase = {
  background: "var(--bg-section)",
  border: "1px solid var(--border-card)",
  colorScheme: "dark" as const,
};

export function DashboardFilters({ assignees, years }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const set = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (value) p.set(key, value);
      else p.delete(key);
      router.push(`${pathname}?${p.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const st = searchParams.get("status") ?? "";
  const as = searchParams.get("assignee") ?? "";
  const pr = searchParams.get("priority") ?? "";
  const yr = searchParams.get("year") ?? "";
  const active = !!(st || as || pr || yr);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Statut */}
      <select
        value={st}
        onChange={(e) => set("status", e.target.value)}
        className={selClass}
        style={{ ...selBase, color: st ? "var(--text-primary)" : "var(--text-muted)" }}
      >
        {STATUSES.map((x) => (
          <option key={x.value} value={x.value} style={{ background: "#13131D" }}>
            {x.label}
          </option>
        ))}
      </select>

      {/* Commercial */}
      <select
        value={as}
        onChange={(e) => set("assignee", e.target.value)}
        className={selClass}
        style={{ ...selBase, color: as ? "var(--text-primary)" : "var(--text-muted)" }}
      >
        <option value="" style={{ background: "#13131D" }}>Tous les commerciaux</option>
        {assignees.map((x) => (
          <option key={x} value={x} style={{ background: "#13131D" }}>
            {x}
          </option>
        ))}
      </select>

      {/* Priorité */}
      <select
        value={pr}
        onChange={(e) => set("priority", e.target.value)}
        className={selClass}
        style={{ ...selBase, color: pr ? "var(--text-primary)" : "var(--text-muted)" }}
      >
        {PRIORITIES.map((x) => (
          <option key={x.value} value={x.value} style={{ background: "#13131D" }}>
            {x.label}
          </option>
        ))}
      </select>

      {/* Année */}
      {years.length > 1 && (
        <select
          value={yr}
          onChange={(e) => set("year", e.target.value)}
          className={selClass}
          style={{ ...selBase, color: yr ? "var(--text-primary)" : "var(--text-muted)" }}
        >
          <option value="" style={{ background: "#13131D" }}>Toutes les années</option>
          {years.map((x) => (
            <option key={x} value={String(x)} style={{ background: "#13131D" }}>
              {x}
            </option>
          ))}
        </select>
      )}

      {/* Reset */}
      {active && (
        <button
          onClick={() => router.push(pathname)}
          className="px-3 py-2 rounded-lg font-syne text-[12px] transition-opacity opacity-60 hover:opacity-100 flex items-center gap-1.5"
          style={{ color: "var(--text-muted)", border: "1px solid var(--border-card)" }}
        >
          <svg viewBox="0 0 14 14" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
          Réinitialiser
        </button>
      )}
    </div>
  );
}
