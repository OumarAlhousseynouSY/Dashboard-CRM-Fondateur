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
      const { data } = Papa.parse<Record<string, string>>(text, {
        header: true,
        delimiter: ";",
        skipEmptyLines: true,
      });
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
        <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase text-[#9B9085] mb-1.5">
          Données
        </p>
        <h1 className="font-syne font-bold text-2xl text-[#1C1917] tracking-tight">
          Importer un fichier CSV
        </h1>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Zone de dépôt CSV"
        className={`relative rounded-lg transition-all duration-200 cursor-pointer select-none ${
          loading ? "pointer-events-none opacity-60" : ""
        }`}
        style={{
          border: `2px dashed ${dragging ? "#C8541A" : "hsl(36 18% 80%)"}`,
          background: dragging ? "#FFF8F2" : "white",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />

        <div className="px-8 py-14 flex flex-col items-center gap-4">
          {loading ? (
            <>
              <div
                className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#C8541A", borderTopColor: "transparent" }}
              />
              <p className="font-syne text-[13px] text-[#9B9085]">Import en cours…</p>
            </>
          ) : (
            <>
              {/* Upload icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: dragging ? "#C8541A" : "hsl(44 15% 93%)" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={dragging ? "white" : "#9B9085"}
                  strokeWidth="1.5"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>

              <div className="text-center space-y-1">
                <p className="font-syne font-semibold text-[15px] text-[#1C1917]">
                  {dragging ? "Déposez le fichier ici" : "Glissez votre fichier CSV"}
                </p>
                <p className="font-syne text-[13px] text-[#9B9085]">
                  ou{" "}
                  <span style={{ color: "#C8541A" }} className="font-medium">
                    cliquez pour sélectionner
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Format", value: "CSV" },
          { label: "Encodage", value: "UTF-8 · Latin-1" },
          { label: "Délimiteur", value: "Point-virgule ;" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-md px-4 py-3"
            style={{ background: "white", border: "1px solid hsl(36 18% 88%)" }}
          >
            <p className="font-syne text-[10px] font-semibold tracking-widest uppercase text-[#9B9085] mb-1">
              {item.label}
            </p>
            <p className="font-mono text-[13px] text-[#1C1917]">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div
        className="rounded-md px-4 py-3 flex items-start gap-3"
        style={{ background: "#FFF8F2", border: "1px solid #FDDCBF" }}
      >
        <svg viewBox="0 0 20 20" fill="#C8541A" className="w-4 h-4 mt-0.5 shrink-0">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="font-syne text-[12px] text-[#92400E]">
          Chaque import efface et remplace toutes les données existantes.
        </p>
      </div>
    </div>
  );
}
