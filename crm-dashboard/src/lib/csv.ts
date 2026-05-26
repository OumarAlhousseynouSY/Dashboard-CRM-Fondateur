export function decodeBuffer(buffer: ArrayBuffer): string {
  // Try strict UTF-8 first (throws on invalid sequences); fall back to Latin-1
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("iso-8859-1").decode(buffer);
  }
}

export const STATUS_MAP: Record<string, string> = {
  // Formes canoniques
  "prospect": "prospect",
  "qualifié": "qualifié",
  "négociation": "négociation",
  "gagné - en cours": "gagné - en cours",
  "à relancer": "à relancer",
  // Formes avec encodage 0x8E→ž (é) et 0x88→ˆ (à) — spécifique à ce CSV
  "qualifiž": "qualifié",
  "nžgociation": "négociation",
  "gagnž - en cours": "gagné - en cours",
  "ˆ relancer": "à relancer",
};

export function normaliseStatus(raw: string): string {
  const key = raw.trim().toLowerCase();
  return STATUS_MAP[key] ?? key;
}
