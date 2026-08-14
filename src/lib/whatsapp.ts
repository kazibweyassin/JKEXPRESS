/** Normalize a phone / WhatsApp field into digits for wa.me links. */
export function normalizeWhatsAppNumber(raw?: string | null): string | null {
  if (!raw) return null;
  // Prefer first number if pipe-separated list
  const first = raw.split(/[|,;/]+/)[0]?.trim() ?? raw;
  let digits = first.replace(/\D/g, "");
  if (!digits) return null;
  // Uganda local numbers starting with 0 → 256…
  if (digits.startsWith("0") && digits.length >= 9) {
    digits = `256${digits.slice(1)}`;
  }
  return digits;
}

export function whatsappLink(
  raw?: string | null,
  message?: string,
): string | null {
  const digits = normalizeWhatsAppNumber(raw);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
