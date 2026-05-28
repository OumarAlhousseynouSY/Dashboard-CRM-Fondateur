"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export type CreateDealState = {
  errors?: Partial<Record<"name" | "assignee" | "amount" | "status", string>>;
  globalError?: string;
} | null;

export async function createDeal(
  _prevState: CreateDealState,
  formData: FormData
): Promise<CreateDealState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const status = formData.get("status")?.toString().trim() ?? "";
  const assignee = formData.get("assignee")?.toString().trim() ?? "";
  const amountRaw = formData.get("amount")?.toString().trim() ?? "";
  const priority = formData.get("priority")?.toString().trim() || "medium";
  const tagsRaw = formData.get("tags")?.toString().trim() ?? "";
  const content = formData.get("content")?.toString().trim() || null;
  const dateCreatedRaw = formData.get("dateCreated")?.toString() ?? "";
  const dueDateRaw = formData.get("dueDate")?.toString() ?? "";
  const startDateRaw = formData.get("startDate")?.toString() ?? "";

  const errors: NonNullable<CreateDealState>["errors"] = {};
  if (!name) errors.name = "Le nom est requis.";
  if (!status) errors.status = "Le statut est requis.";
  if (!assignee) errors.assignee = "Le commercial est requis.";
  const amount = parseFloat(amountRaw.replace(",", "."));
  if (!amountRaw || isNaN(amount) || amount < 0) errors.amount = "Montant invalide.";
  if (Object.keys(errors).length > 0) return { errors };

  const parseDate = (s: string) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const tags = tagsRaw
    .split(/[,|]/)
    .map((t) => t.trim())
    .filter(Boolean);

  let dealId: string;
  try {
    const deal = await prisma.$transaction(async (tx) => {
      const d = await tx.deal.create({
        data: {
          name,
          status,
          assignee,
          amount,
          priority,
          tagsRaw,
          content,
          dateCreated: parseDate(dateCreatedRaw),
          dueDate: parseDate(dueDateRaw),
          startDate: parseDate(startDateRaw),
        },
      });
      if (tags.length > 0) {
        await tx.dealTag.createMany({
          data: tags.map((tag) => ({ dealId: d.id, tag })),
        });
      }
      return d;
    });
    dealId = deal.id;
  } catch {
    return { globalError: "Erreur lors de la création. Réessayez." };
  }

  redirect(`/deals/${dealId}`);
}
