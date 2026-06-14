import { LOCATIONS, type GsaLocation } from "./gsa";

// Full US state list (50 + DC) for the per-state hub pages. CONUS states carry
// GSA non-standard locations; Alaska and Hawaii are OCONUS (their rates come
// from the Department of Defense, not GSA CONUS) and are flagged as such.

export interface UsState {
  code: string;
  name: string;
  slug: string;
  oconus?: boolean;
}

export const US_STATES: UsState[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska", oconus: true },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii", oconus: true },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
].map((s) => ({ ...s, slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));

const BY_SLUG = new Map(US_STATES.map((s) => [s.slug, s]));
const BY_CODE = new Map(US_STATES.map((s) => [s.code, s]));

export function getState(slug: string): UsState | null {
  return BY_SLUG.get(slug) ?? null;
}

export function stateName(code: string): string {
  return BY_CODE.get(code)?.name ?? code;
}

export function stateSlug(code: string): string {
  return BY_CODE.get(code)?.slug ?? code.toLowerCase();
}

export function locationsInState(code: string): GsaLocation[] {
  return LOCATIONS.filter((l) => l.state === code).sort((a, b) => a.city.localeCompare(b.city));
}
