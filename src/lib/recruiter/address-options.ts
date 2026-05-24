import { Country, State } from "country-state-city";

export type RecruiterAddress = {
  companyCountry?: string | null;
  companyStateOrRegion?: string | null;
  companyCity?: string | null;
  companyStreetAddress?: string | null;
  companyPostalCode?: string | null;
};

const countryRecords = Country.getAllCountries()
  .map((country) => ({
    label: country.name,
    code: country.isoCode,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const countryCodeByName = new Map(countryRecords.map((country) => [country.label.toLowerCase(), country.code]));

export const countryOptions = countryRecords.map((country) => country.label);

export function getCountryCode(countryName: string) {
  return countryCodeByName.get(countryName.trim().toLowerCase()) || null;
}

export function getStateRegionOptions(countryName: string) {
  const countryCode = getCountryCode(countryName);
  if (!countryCode) return [];

  return State.getStatesOfCountry(countryCode)
    .map((state) => state.name)
    .sort((a, b) => a.localeCompare(b));
}

export function formatCompanyLocation(address: RecruiterAddress) {
  return [
    address.companyStreetAddress,
    address.companyCity,
    address.companyStateOrRegion,
    address.companyPostalCode,
    address.companyCountry,
  ]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
}

export function hasCompleteAddress(address: RecruiterAddress) {
  return Boolean(
    address.companyCountry?.trim() &&
      address.companyStateOrRegion?.trim() &&
      address.companyCity?.trim() &&
      address.companyStreetAddress?.trim() &&
      address.companyPostalCode?.trim()
  );
}
