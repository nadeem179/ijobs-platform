export function normalizeExternalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return "";
}

export function isSafeHttpUrl(value: string) {
  const normalized = normalizeExternalUrl(value);
  return normalized ? /^https?:\/\//i.test(normalized) : false;
}
