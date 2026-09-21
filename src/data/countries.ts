export type Country = {
  id: string;
  name: string;
  /** Path inside /public. Assumed convention: /flags/<iso-3166-1-alpha-2>.svg
   *  (gb, au, us, ca, ch, ae) — rename to match whatever you actually saved. */
  flagSrc: string;
};

export const COUNTRIES: Country[] = [
  { id: "gb", name: "United Kingdom", flagSrc: "/flags/uk.png" },
  { id: "au", name: "Australia", flagSrc: "/flags/au.png" },
  { id: "us", name: "United States", flagSrc: "/flags/us.png" },
  { id: "ca", name: "Canada", flagSrc: "/flags/ca.png" },
  { id: "ch", name: "Switzerland", flagSrc: "/flags/switz.png" },
  { id: "ae", name: "UAE", flagSrc: "/flags/ae.png" },
];