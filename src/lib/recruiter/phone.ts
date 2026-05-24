import { Country } from "country-state-city";

export type RecruiterPhoneValue = {
  phoneCountry: string;
  phoneCountryCode: string;
  phoneNumber: string;
};

export const DEFAULT_RECRUITER_PHONE_COUNTRY = "United States";
export const DEFAULT_RECRUITER_PHONE_COUNTRY_CODE = "+1";

export type RecruiterPhoneCountryOption = {
  label: string;
  searchText: string;
  phoneCountry: string;
  phoneCountryCode: string;
  flag: string;
  isoCode: string;
};

const countryOptions = Country.getAllCountries()
  .map((country) => {
    const phoneCountryCode = `+${country.phonecode}`;
    const flag = country.flag || isoCodeToFlagEmoji(country.isoCode);
    return {
      label: `${country.name} (${phoneCountryCode})`,
      searchText: `${country.name} ${country.isoCode} ${country.phonecode} ${phoneCountryCode}`.toLowerCase(),
      phoneCountry: country.name,
      phoneCountryCode,
      flag,
      isoCode: country.isoCode,
    } satisfies RecruiterPhoneCountryOption;
  })
  .sort((a, b) => a.label.localeCompare(b.label));

function isoCodeToFlagEmoji(isoCode: string) {
  const chars = isoCode.toUpperCase();
  if (chars.length !== 2) return "🌐";
  const first = chars.codePointAt(0);
  const second = chars.codePointAt(1);
  if (first === undefined || second === undefined) return "🌐";
  return String.fromCodePoint(0x1f1e6 + (first - 65), 0x1f1e6 + (second - 65));
}

const optionByLabel = new Map(countryOptions.map((option) => [option.label, option]));
const countryByCode = new Map<string, RecruiterPhoneCountryOption[]>();

for (const option of countryOptions) {
  const normalizedCode = normalizePhoneCountryCode(option.phoneCountryCode);
  const items = countryByCode.get(normalizedCode) || [];
  items.push(option);
  countryByCode.set(normalizedCode, items);
}

export const recruiterPhoneCountryOptions = countryOptions.map((option) => option.label);

export function getRecruiterPhoneCountries(query = "") {
  const search = query.trim().toLowerCase();
  if (!search) return countryOptions.slice(0, 12);
  return countryOptions.filter((option) => option.searchText.includes(search)).slice(0, 12);
}

export function findRecruiterPhoneCountry(value: string) {
  const search = value.trim().toLowerCase();
  if (!search) return null;
  return countryOptions.find((option) => option.searchText.includes(search) || option.label.toLowerCase() === search) || null;
}

export function normalizePhoneCountryCode(code: string) {
  const trimmed = code.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/^\+/, "")}`;
}

export function formatRecruiterPhoneCountryLabel(phoneCountry: string, phoneCountryCode: string) {
  const country = phoneCountry.trim();
  const code = normalizePhoneCountryCode(phoneCountryCode);
  if (!country && !code) return "";
  if (!country) return code;
  if (!code) return country;
  return `${country} (${code})`;
}

export function getRecruiterPhoneSelectionLabel(value: RecruiterPhoneValue) {
  return formatRecruiterPhoneCountryLabel(value.phoneCountry, value.phoneCountryCode);
}

export function parseRecruiterPhoneCountryLabel(label: string): RecruiterPhoneValue | null {
  const option = optionByLabel.get(label);
  if (!option) return null;
  return {
    phoneCountry: option.phoneCountry,
    phoneCountryCode: option.phoneCountryCode,
    phoneNumber: "",
  };
}

export function getRecruiterPhoneCountryDisplay(phoneCountry?: string | null, phoneCountryCode?: string | null) {
  return formatRecruiterPhoneCountryLabel(phoneCountry || "", phoneCountryCode || "");
}

export function getRecruiterPhoneDialingCode(phoneCountryCode?: string | null) {
  return normalizePhoneCountryCode(phoneCountryCode || "");
}

export function buildRecruiterPhoneValue(
  phoneCountry?: string | null,
  phoneCountryCode?: string | null,
  phoneNumber?: string | null
): RecruiterPhoneValue {
  return {
    phoneCountry: phoneCountry || "",
    phoneCountryCode: normalizePhoneCountryCode(phoneCountryCode || ""),
    phoneNumber: sanitizeRecruiterPhoneNumber(phoneNumber || ""),
  };
}

export function buildDefaultRecruiterPhoneValue(phoneNumber?: string | null): RecruiterPhoneValue {
  return {
    phoneCountry: DEFAULT_RECRUITER_PHONE_COUNTRY,
    phoneCountryCode: DEFAULT_RECRUITER_PHONE_COUNTRY_CODE,
    phoneNumber: sanitizeRecruiterPhoneNumber(phoneNumber || ""),
  };
}

export function formatRecruiterPhone(phoneCountryCode?: string | null, phoneNumber?: string | null) {
  const code = normalizePhoneCountryCode(phoneCountryCode || "");
  const number = phoneNumber?.trim() || "";
  if (!code || !number) return "";
  return `${code} ${number}`.trim();
}

export function buildRecruiterPhoneUpdate(value: RecruiterPhoneValue) {
  const phoneCountry = value.phoneCountry.trim();
  const phoneCountryCode = normalizePhoneCountryCode(value.phoneCountryCode);
  const phoneNumber = value.phoneNumber.trim();
  const hasStructuredPhone = Boolean(phoneCountry && phoneCountryCode && phoneNumber);

  return {
    phoneCountry: hasStructuredPhone ? phoneCountry : "",
    phoneCountryCode: hasStructuredPhone ? phoneCountryCode : "",
    phoneNumber: hasStructuredPhone ? phoneNumber : "",
    phone: hasStructuredPhone ? formatRecruiterPhone(phoneCountryCode, phoneNumber) : phoneNumber,
    hasStructuredPhone,
  };
}

export function looksLikePhoneNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (!/^[0-9+\-().\s]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15;
}

export function sanitizeRecruiterPhoneNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 15);
}

export function validateRecruiterPhoneNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!/^[0-9+\-().\s]+$/.test(trimmed)) return "Enter a valid phone number.";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 15) {
    return "Enter a valid phone number.";
  }
  return "";
}

export function resolveRecruiterPhoneFromLegacyPhone(phone: string): RecruiterPhoneValue {
  const trimmed = phone.trim();
  if (!trimmed) return { phoneCountry: "", phoneCountryCode: "", phoneNumber: "" };

  const digits = trimmed.replace(/[^\d+]/g, "");
  const codeMatches = Array.from(countryByCode.keys())
    .sort((a, b) => b.length - a.length)
    .filter((code) => digits.startsWith(code.replace("+", "")) || digits.startsWith(code));

  for (const code of codeMatches) {
    const countries = countryByCode.get(code) || [];
    if (countries.length === 1) {
      return {
        phoneCountry: countries[0].phoneCountry,
        phoneCountryCode: countries[0].phoneCountryCode,
        phoneNumber: sanitizeRecruiterPhoneNumber(trimmed),
      };
    }
  }

  return {
    phoneCountry: "",
    phoneCountryCode: "",
    phoneNumber: sanitizeRecruiterPhoneNumber(trimmed),
  };
}
