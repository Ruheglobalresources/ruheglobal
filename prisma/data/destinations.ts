// prisma/data/destinations.ts
// The countries people move to and the major cities they settle in. This file only fills the
// database the first time (prisma/seed-destinations.ts); after that rows are edited in the database,
// and a re-run never overwrites those edits.
//
// A destination `name` must match the choices of the "Destination country" question
// (DESTINATIONS in prisma/data/eligibility-questions.ts), because the city list is found by that name.
// Cities are listed in the order most people choose them: the position in the list becomes `order`.
// Each city is [name, region]. English names are used so a search for "Cologne" or "Munich" works.

export type DestinationSeed = {
  name: string;
  code: string; // ISO alpha-2
  cities: [name: string, region: string][];
};

// The position in this list becomes the destination `order`, the same order as the eligibility question.
export const DESTINATIONS: DestinationSeed[] = [
  {
    name: "United Kingdom",
    code: "GB",
    cities: [
      ["London", "England"],
      ["Manchester", "England"],
      ["Birmingham", "England"],
      ["Leeds", "England"],
      ["Liverpool", "England"],
      ["Sheffield", "England"],
      ["Nottingham", "England"],
      ["Coventry", "England"],
      ["Bristol", "England"],
      ["Leicester", "England"],
      ["Newcastle upon Tyne", "England"],
      ["Glasgow", "Scotland"],
      ["Edinburgh", "Scotland"],
      ["Cardiff", "Wales"],
    ],
  },
  {
    name: "Canada",
    code: "CA",
    cities: [
      ["Toronto", "Ontario"],
      ["Vancouver", "British Columbia"],
      ["Montreal", "Quebec"],
      ["Calgary", "Alberta"],
      ["Edmonton", "Alberta"],
      ["Ottawa", "Ontario"],
      ["Mississauga", "Ontario"],
      ["Brampton", "Ontario"],
      ["Winnipeg", "Manitoba"],
      ["Halifax", "Nova Scotia"],
      ["Hamilton", "Ontario"],
      ["Waterloo", "Ontario"],
      ["Saskatoon", "Saskatchewan"],
      ["Regina", "Saskatchewan"],
    ],
  },
  {
    name: "United States",
    code: "US",
    cities: [
      ["New York", "New York"],
      ["Houston", "Texas"],
      ["Dallas", "Texas"],
      ["Atlanta", "Georgia"],
      ["Chicago", "Illinois"],
      ["Los Angeles", "California"],
      ["Washington, D.C.", "District of Columbia"],
      ["Baltimore", "Maryland"],
      ["Boston", "Massachusetts"],
      ["Philadelphia", "Pennsylvania"],
      ["Miami", "Florida"],
      ["San Francisco", "California"],
      ["Seattle", "Washington"],
      ["Minneapolis", "Minnesota"],
      ["Columbus", "Ohio"],
    ],
  },
  {
    name: "Australia",
    code: "AU",
    cities: [
      ["Sydney", "New South Wales"],
      ["Melbourne", "Victoria"],
      ["Brisbane", "Queensland"],
      ["Perth", "Western Australia"],
      ["Adelaide", "South Australia"],
      ["Canberra", "Australian Capital Territory"],
      ["Gold Coast", "Queensland"],
      ["Newcastle", "New South Wales"],
      ["Hobart", "Tasmania"],
    ],
  },
  {
    name: "Germany",
    code: "DE",
    cities: [
      ["Berlin", "Berlin"],
      ["Munich", "Bavaria"],
      ["Hamburg", "Hamburg"],
      ["Frankfurt", "Hesse"],
      ["Cologne", "North Rhine-Westphalia"],
      ["Stuttgart", "Baden-Wurttemberg"],
      ["Dusseldorf", "North Rhine-Westphalia"],
      ["Leipzig", "Saxony"],
      ["Dresden", "Saxony"],
      ["Aachen", "North Rhine-Westphalia"],
    ],
  },
  {
    name: "Ireland",
    code: "IE",
    cities: [
      ["Dublin", "Leinster"],
      ["Cork", "Munster"],
      ["Galway", "Connacht"],
      ["Limerick", "Munster"],
      ["Waterford", "Munster"],
      ["Maynooth", "Leinster"],
    ],
  },
  {
    name: "France",
    code: "FR",
    cities: [
      ["Paris", "Ile-de-France"],
      ["Lyon", "Auvergne-Rhone-Alpes"],
      ["Marseille", "Provence-Alpes-Cote d'Azur"],
      ["Toulouse", "Occitanie"],
      ["Lille", "Hauts-de-France"],
      ["Bordeaux", "Nouvelle-Aquitaine"],
      ["Nice", "Provence-Alpes-Cote d'Azur"],
      ["Nantes", "Pays de la Loire"],
      ["Strasbourg", "Grand Est"],
      ["Montpellier", "Occitanie"],
    ],
  },
  {
    name: "Netherlands",
    code: "NL",
    cities: [
      ["Amsterdam", "North Holland"],
      ["Rotterdam", "South Holland"],
      ["The Hague", "South Holland"],
      ["Utrecht", "Utrecht"],
      ["Eindhoven", "North Brabant"],
      ["Groningen", "Groningen"],
      ["Delft", "South Holland"],
      ["Leiden", "South Holland"],
      ["Maastricht", "Limburg"],
    ],
  },
  {
    name: "New Zealand",
    code: "NZ",
    cities: [
      ["Auckland", "Auckland"],
      ["Wellington", "Wellington"],
      ["Christchurch", "Canterbury"],
      ["Hamilton", "Waikato"],
      ["Dunedin", "Otago"],
      ["Tauranga", "Bay of Plenty"],
      ["Palmerston North", "Manawatu-Whanganui"],
    ],
  },
  {
    name: "Italy",
    code: "IT",
    cities: [
      ["Rome", "Lazio"],
      ["Milan", "Lombardy"],
      ["Turin", "Piedmont"],
      ["Bologna", "Emilia-Romagna"],
      ["Florence", "Tuscany"],
      ["Naples", "Campania"],
      ["Padua", "Veneto"],
      ["Pisa", "Tuscany"],
      ["Venice", "Veneto"],
      ["Genoa", "Liguria"],
    ],
  },
  {
    name: "Poland",
    code: "PL",
    cities: [
      ["Warsaw", "Masovia"],
      ["Krakow", "Lesser Poland"],
      ["Wroclaw", "Lower Silesia"],
      ["Gdansk", "Pomerania"],
      ["Poznan", "Greater Poland"],
      ["Lodz", "Lodz"],
      ["Lublin", "Lublin"],
      ["Katowice", "Silesia"],
    ],
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    cities: [
      ["Dubai", "Dubai"],
      ["Abu Dhabi", "Abu Dhabi"],
      ["Sharjah", "Sharjah"],
      ["Ajman", "Ajman"],
      ["Al Ain", "Abu Dhabi"],
      ["Ras Al Khaimah", "Ras Al Khaimah"],
    ],
  },
  {
    name: "South Africa",
    code: "ZA",
    cities: [
      ["Johannesburg", "Gauteng"],
      ["Cape Town", "Western Cape"],
      ["Pretoria", "Gauteng"],
      ["Durban", "KwaZulu-Natal"],
      ["Stellenbosch", "Western Cape"],
      ["Gqeberha", "Eastern Cape"],
      ["Bloemfontein", "Free State"],
    ],
  },
];