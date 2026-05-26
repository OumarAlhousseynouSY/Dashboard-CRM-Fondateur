"use server";

import { prisma } from "@/lib/db";
import { normaliseStatus, fixDoubleEncoding } from "@/lib/csv";

type CsvRow = Record<string, string>;

export type ImportResult =
  | { success: true; count: number }
  | { success: false; error: string };

export async function importDeals(rows: CsvRow[]): Promise<ImportResult> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.dealTag.deleteMany();
      await tx.deal.deleteMany();

      for (const row of rows) {
        const rawAmount = row["Montant Deal"] ?? row["montant deal"] ?? "0";
        const amount = parseFloat(rawAmount.replace(",", ".")) || 0;

        const rawName    = fixDoubleEncoding(row["Task Name"] ?? "");
        const rawTagsRaw = fixDoubleEncoding(row["Tags"] ?? "");
        const rawContent = row["Task Content"] ? fixDoubleEncoding(row["Task Content"]) : null;

        const deal = await tx.deal.create({
          data: {
            name: rawName,
            status: normaliseStatus(row["Status"] ?? ""),
            dateCreated: parseDate(row["Date Created"]),
            dueDate: parseDate(row["Due Date"]),
            startDate: parseDate(row["Start Date"]),
            assignee: row["Assignees"] ?? "",
            priority: (row["Priority"] ?? "").trim().toLowerCase(),
            tagsRaw: rawTagsRaw,
            content: rawContent,
            amount,
          },
        });

        const tags = rawTagsRaw
          .split("|")
          .map((t) => t.trim())
          .filter(Boolean);

        if (tags.length > 0) {
          await tx.dealTag.createMany({
            data: tags.map((tag) => ({ dealId: deal.id, tag })),
          });
        }
      }
    });

    return { success: true, count: rows.length };
  } catch (err) {
    console.error("Import failed:", err);
    return { success: false, error: "Erreur lors de l'import. Réessayez." };
  }
}

function parseDate(value: string | undefined): Date | null {
  if (!value?.trim()) return null;
  const dmyMatch = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const d = new Date(`${year}-${month}-${day}`);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value.trim());
  return isNaN(d.getTime()) ? null : d;
}
