export function normalizeWhatsApp(input: string, defaultCountry = "91"): string | null {
  const digits = input.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) return defaultCountry + digits;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return null;
}

export function whatsappUrl(phone: string, message = ""): string | null {
  const n = normalizeWhatsApp(phone);
  if (!n) return null;
  return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function formatPhone(n: string): string {
  const d = n.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return d ? `+${d}` : "";
}
