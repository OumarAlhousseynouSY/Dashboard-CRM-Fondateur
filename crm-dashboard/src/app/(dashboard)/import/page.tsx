"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { toast } from "sonner";
import { decodeBuffer } from "@/lib/csv";
import { importDeals } from "@/actions/import";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Importer un fichier CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            role="button"
            tabIndex={0}
            aria-label="Zone de dépôt CSV"
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            } ${loading ? "pointer-events-none opacity-50" : ""}`}
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
              onChange={handleFileChange}
            />
            {loading ? (
              <div className="space-y-2">
                <div className="text-gray-500 text-sm">Import en cours…</div>
                <div className="animate-spin mx-auto w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">
                  Déposez votre fichier CSV ici
                </p>
                <p className="text-sm text-gray-500">
                  ou cliquez pour sélectionner un fichier
                </p>
                <p className="text-xs text-gray-400">
                  Format : CSV UTF-8 ou Latin-1, délimiteur «&nbsp;;&nbsp;»
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
