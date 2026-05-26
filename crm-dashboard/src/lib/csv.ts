// WHATWG aliases "iso-8859-1" to windows-1252, which would mangle bytes 0x80-0x9F.
// Instead, use UTF-8 with fatal:false so invalid bytes become U+FFFD while
// valid UTF-8 sequences (including double-encoded content) are decoded correctly.
export function decodeBuffer(buffer: ArrayBuffer): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
}

export const STATUS_MAP: Record<string, string> = {
  // Canonical forms
  "prospect": "prospect",
  "qualifié": "qualifié",
  "négociation": "négociation",
  "gagné - en cours": "gagné - en cours",
  "à relancer": "à relancer",
  // Forms with invalid bytes decoded as U+FFFD (fatal:false) — specific to this CSV export
  "qualifi�": "qualifié",
  "n�gociation": "négociation",
  "gagn� - en cours": "gagné - en cours",
  "� relancer": "à relancer",
};

export function normaliseStatus(raw: string): string {
  const key = raw.trim().toLowerCase();
  return STATUS_MAP[key] ?? key;
}

// Fix double-encoded UTF-8: valid UTF-8 bytes were misread as Latin-1 chars
// (giving Ã© for é, etc.) and then re-encoded. We reverse by treating each
// char as a Latin-1 byte and re-decoding as UTF-8.
export function fixDoubleEncoding(str: string): string {
  try {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i) & 0xff;
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return str;
  }
}
