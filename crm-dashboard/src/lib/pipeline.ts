import type { Deal } from "@prisma/client";

export const PIPELINE_WEIGHTS: Record<string, number> = {
  "prospect": 0.10,
  "qualifié": 0.35,
  "négociation": 0.70,
  "gagné - en cours": 1.00,
};

export const ACTIVE_STATUSES = ["prospect", "qualifié", "négociation"] as const;
export const SECURED_STATUS = "gagné - en cours";
export const RELANCER_STATUS = "à relancer";

export interface KpiData {
  caSecurise: number;
  pipelineBrut: number;
  pipelinePondere: number;
  volumeActifs: number;
  panierMoyen: number;
  aRelancerAmount: number;
  aRelancerCount: number;
}

export function computeKpis(deals: Deal[]): KpiData {
  let caSecurise = 0;
  let pipelineBrut = 0;
  let pipelinePondere = 0;
  let volumeActifs = 0;
  let aRelancerAmount = 0;
  let aRelancerCount = 0;
  let totalAmount = 0;

  for (const deal of deals) {
    totalAmount += deal.amount;

    if (deal.status === SECURED_STATUS) {
      caSecurise += deal.amount;
    } else if ((ACTIVE_STATUSES as readonly string[]).includes(deal.status)) {
      pipelineBrut += deal.amount;
      pipelinePondere += deal.amount * (PIPELINE_WEIGHTS[deal.status] ?? 0);
      volumeActifs += 1;
    } else if (deal.status === RELANCER_STATUS) {
      aRelancerAmount += deal.amount;
      aRelancerCount += 1;
    }
  }

  const panierMoyen = deals.length > 0 ? totalAmount / deals.length : 0;

  return {
    caSecurise,
    pipelineBrut,
    pipelinePondere,
    volumeActifs,
    panierMoyen,
    aRelancerAmount,
    aRelancerCount,
  };
}

export function formatEur(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
