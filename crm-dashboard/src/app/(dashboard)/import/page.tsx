"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { toast } from "sonner";
import { decodeBuffer } from "@/lib/csv";
import { importDeals } from "@/actions/import";

export default function ImportPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  async function processFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      toast.error("Fichier invalide. Seuls les fichiers .csv sont acceptés.");
      return;
    }
    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const text = decodeBuffer(buffer);
      const { data } = Papa.parse<Record<string, string>>(text, { header: true, delimiter: ";", skipEmptyLines: true });
      const result = await importDeals(data);
      if (result.success) {
        toast.success(`Import réussi : ${result.count} deals chargés.`);
        router.push("/");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la lecture du fichier.");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
          Données
        </p>
        <h1 className="font-syne font-bold text-2xl tracking-tight" style={{ color: "var(--text-primary)" }}>
          Importer un fichier CSV
        </h1>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Zone de dépôt CSV"
        className={`relative rounded-xl transition-all duration-200 cursor-pointer select-none ${loading ? "pointer-events-none opacity-60" : ""}`}
        style={{
          border: `2px dashed ${dragging ? "#E05C1A" : "var(--border-card)"}`,
          background: dragging ? "rgba(224,92,26,0.06)" : "var(--bg-card)",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />

        <div className="px-8 py-14 flex flex-col items-center gap-4">
          {loading ? (
            <>
              <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "#E05C1A", borderTopColor: "transparent" }} />
              <p className="font-syne text-[13px]" style={{ color: "var(--text-muted)" }}>Import en cours…</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: dragging ? "#E05C1A" : "var(--bg-section)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={dragging ? "white" : "#55557A"} strokeWidth="1.5" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <p className="font-syne font-semibold text-[15px]" style={{ color: "var(--text-primary)" }}>
                  {dragging ? "Déposez le fichier ici" : "Glissez votre fichier CSV"}
                </p>
                <p className="font-syne text-[13px]" style={{ color: "var(--text-muted)" }}>
                  ou <span style={{ color: "#E05C1A" }} className="font-medium">cliquez pour sélectionner</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[{ label: "Format", value: "CSV" }, { label: "Encodage", value: "UTF-8 · Latin-1" }, { label: "Délimiteur", value: "Point-virgule ;" }].map((item) => (
          <div key={item.label} className="rounded-lg px-4 py-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)" }}>
            <p className="font-syne text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>{item.label}</p>
            <p className="font-mono text-[13px]" style={{ color: "var(--text-primary)" }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="rounded-lg px-4 py-3 flex items-start gap-3" style={{ background: "rgba(224,92,26,0.06)", border: "1px solid rgba(224,92,26,0.2)" }}>
        <svg viewBox="0 0 20 20" fill="#E05C1A" className="w-4 h-4 mt-0.5 shrink-0">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="font-syne text-[12px]" style={{ color: "#F59E60" }}>
          Chaque import efface et remplace toutes les données existantes.
        </p>
      </div>
    </div>
  );
}
