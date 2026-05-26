export function decodeBuffer(buffer: ArrayBuffer): string {
  try {
    // iconv-lite is a Node.js module; in browser use native TextDecoder
    const decoder = new TextDecoder("iso-8859-1");
    return decoder.decode(buffer);
  } catch {
    return new TextDecoder("utf-8").decode(buffer);
  }
}

export const STATUS_MAP: Record<string, string> = {
  prospect: "prospect",
  "qualifié": "qualifié",
  "négociation": "négociation",
  "gagné - en cours": "gagné - en cours",
  "à relancer": "à relancer",
};

export function normaliseStatus(raw: string): string {
  const key = raw.trim().toLowerCase();
  return STATUS_MAP[key] ?? key;
}
