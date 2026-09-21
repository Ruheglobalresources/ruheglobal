export type Country = {
  name: string;
  flag: string;
};

export type School = {
  id: string;
  name: string;
  city: string;
  country: string; // must match a Country["name"] exactly
  image: string;
  founded?: number;
  ranking?: string;
  tuitionFrom?: number;
  acceptanceRate?: string;
  programs: string[];
  description: string;
};

// Ordered by how often Nigerian students currently choose these destinations
// (UK, Canada, USA, Germany, Australia lead; Ireland close behind).
export const COUNTRIES: Country[] = [
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "United States", flag: "🇺🇸" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Ireland", flag: "🇮🇪" },
];

const wiki = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=900`;

export const SCHOOLS: School[] = [
  // ---------------- United Kingdom ----------------
  {
    id: "coventry-university",
    name: "Coventry University",
    city: "Coventry",
    country: "United Kingdom",
    image: wiki("Coventry University Lanchester Library 6933825422.jpg"),
    founded: 1992,
    ranking: "Top 5 UK Modern University",
    tuitionFrom: 18500,
    programs: ["Business Management", "Data Science", "Public Health"],
    description:
      "A fast-growing modern university known for automotive design, engineering and business, minutes from London by train.",
  },
  {
    id: "university-of-hertfordshire",
    name: "University of Hertfordshire",
    city: "Hatfield",
    country: "United Kingdom",
    image: wiki("University of Hertfordshire de Havilland Campus, Hatfield 11.jpg"),
    founded: 1992,
    ranking: "Strong Postgraduate Route",
    tuitionFrom: 16200,
    programs: ["MBA", "Engineering", "Computer Science"],
    description:
      "A practical, industry-linked university just north of London with one of the UK's largest international communities.",
  },
  {
    id: "ulster-university",
    name: "Ulster University",
    city: "Belfast",
    country: "United Kingdom",
    image: wiki("Ulster University - Belfast Campus - BC (March 2023).jpg"),
    founded: 1984,
    ranking: "Popular Post-Study Work Route",
    tuitionFrom: 17000,
    programs: ["Law", "Business Analytics", "Nursing"],
    description:
      "A research university spread across Belfast and Derry, well known for its post-study work pathway into the UK.",
  },

  // ---------------- Canada ----------------
  {
    id: "u-of-toronto",
    name: "University of Toronto",
    city: "Toronto",
    country: "Canada",
    image: wiki("University of Toronto St. George.jpg"),
    founded: 1827,
    ranking: "QS #21 Global",
    tuitionFrom: 45000,
    programs: ["Business", "Computer Science", "Engineering"],
    description:
      "Canada's top-ranked university, anchored by a historic downtown campus and deep research strength.",
  },
  {
    id: "university-of-alberta",
    name: "University of Alberta",
    city: "Edmonton",
    country: "Canada",
    image: wiki("University of Alberta Campus, Edmonton.jpg"),
    founded: 1908,
    ranking: "QS #111 Global",
    tuitionFrom: 29000,
    programs: ["Engineering", "Health Sciences", "Business"],
    description:
      "A major research university in Edmonton known for engineering, energy and health sciences.",
  },
  {
    id: "cape-breton-university",
    name: "Cape Breton University",
    city: "Sydney",
    country: "Canada",
    image: wiki("Campus Centre 2.JPG"),
    founded: 1951,
    ranking: "60%+ Acceptance Rate",
    tuitionFrom: 17500,
    acceptanceRate: "60%+",
    programs: ["Business Administration", "Public Policy", "Engineering Technology"],
    description:
      "A welcoming Nova Scotia university known for its high acceptance rate and hands-on business programs.",
  },

  // ---------------- United States ----------------
  {
    id: "arizona-state-university",
    name: "Arizona State University",
    city: "Tempe, AZ",
    country: "United States",
    image: wiki("2021 Arizona State University, Tempe Campus, Old Main.jpg"),
    founded: 1885,
    ranking: "#1 in the US for Innovation (US News)",
    tuitionFrom: 32000,
    programs: ["Computer Science", "Business", "Journalism"],
    description:
      "One of the largest public universities in the US, recognised for innovation and flexible programs.",
  },
  {
    id: "university-of-houston",
    name: "University of Houston",
    city: "Houston, TX",
    country: "United States",
    image: wiki("Ezekiel W. Cullen Building, University of Houston in 2012.JPG"),
    founded: 1927,
    ranking: "#132 US News National Universities",
    tuitionFrom: 27000,
    acceptanceRate: "75%",
    programs: ["Business", "Engineering", "Computer Science"],
    description:
      "A Tier One research university in one of America's biggest business hubs, with strong energy and engineering ties.",
  },
  {
    id: "purdue-university",
    name: "Purdue University",
    city: "West Lafayette, IN",
    country: "United States",
    image: wiki("Engineering Fountain Purdue University 2016 02.jpg"),
    founded: 1869,
    ranking: "QS #100 Global",
    tuitionFrom: 34000,
    programs: ["Engineering", "Computer Science", "Agriculture"],
    description:
      "A leading US engineering and technology university with one of the country's largest international communities.",
  },

  // ---------------- Australia ----------------
  {
    id: "deakin-university",
    name: "Deakin University",
    city: "Melbourne",
    country: "Australia",
    image: wiki("Deakin University Burwood Campus.jpg"),
    founded: 1974,
    ranking: "Top 1% World Ranking",
    tuitionFrom: 24500,
    programs: ["IT", "Nursing", "Commerce"],
    description:
      "A forward-thinking Melbourne university known for flexible study and strong graduate employability.",
  },
  {
    id: "monash-university",
    name: "Monash University",
    city: "Melbourne",
    country: "Australia",
    image: wiki("Monash University Clayton Campus.jpg"),
    founded: 1958,
    ranking: "QS #36 Global",
    tuitionFrom: 38000,
    programs: ["Medicine", "Business", "Engineering"],
    description:
      "Australia's largest university and a Group of Eight member, ranked among the world's top 40.",
  },
  {
    id: "adelaide-university",
    name: "Adelaide University",
    city: "Adelaide",
    country: "Australia",
    image: wiki("The Braggs Building in Adelaide, May 2026 (DSCF7143).jpg"),
    founded: 1874,
    ranking: "Group of Eight University",
    tuitionFrom: 27000,
    programs: ["Business", "Engineering", "Health Sciences"],
    description:
      "A newly merged Group of Eight university combining two of South Australia's leading institutions.",
  },

  // ---------------- Ireland ----------------
  {
    id: "trinity-college-dublin",
    name: "Trinity College Dublin",
    city: "Dublin",
    country: "Ireland",
    image: wiki("Long Room Interior, Trinity College Dublin, Ireland - Diliff.jpg"),
    founded: 1592,
    ranking: "QS #75 Global",
    tuitionFrom: 27000,
    programs: ["Law", "Business", "Data Science"],
    description:
      "Ireland's oldest and most prestigious university, home to the historic Long Room library.",
  },
  {
    id: "university-college-dublin",
    name: "University College Dublin",
    city: "Dublin",
    country: "Ireland",
    image: wiki("University College Dublin Campus Photo1.jpg"),
    founded: 1854,
    ranking: "QS #100 Global",
    tuitionFrom: 22600,
    programs: ["Business", "Engineering", "Veterinary Science"],
    description:
      "Ireland's largest university, ranked in the world's top 100 with strong employability outcomes.",
  },
  {
    id: "dublin-city-university",
    name: "Dublin City University",
    city: "Dublin",
    country: "Ireland",
    image: wiki("Central Mall DCU.JPG"),
    founded: 1975,
    ranking: "#1 Ireland for Employability",
    tuitionFrom: 15900,
    programs: ["Business", "Engineering", "Computing"],
    description:
      "A modern Dublin university known for its paid work-placement programme and strong tech industry ties.",
  },

  // ---------------- Germany ----------------
  {
    id: "tu-munich",
    name: "Technical University of Munich",
    city: "Munich",
    country: "Germany",
    image: wiki("Technische Universität München.jpg"),
    founded: 1868,
    ranking: "QS #25 Global",
    tuitionFrom: 300,
    programs: ["Engineering", "Computer Science", "Natural Sciences"],
    description:
      "One of Europe's top technical universities, offering elite engineering and computing degrees at little to no tuition.",
  },
  {
    id: "rwth-aachen",
    name: "RWTH Aachen University",
    city: "Aachen",
    country: "Germany",
    image: wiki("RWTH Aachen Hauptgebäude.jpg"),
    founded: 1870,
    ranking: "QS #104 Global",
    tuitionFrom: 600,
    programs: ["Engineering", "Computer Science", "Natural Sciences"],
    description:
      "Germany's largest technical university, renowned for engineering and close ties to firms like BMW and Siemens.",
  },
  {
    id: "university-of-freiburg",
    name: "University of Freiburg",
    city: "Freiburg",
    country: "Germany",
    image: wiki("Freiburg im Breisgau, Universität, Kollegiengebäude I -- 2025 -- 8065.jpg"),
    founded: 1457,
    ranking: "Germany's 5th-Oldest University",
    tuitionFrom: 3000,
    programs: ["Medicine", "Life Sciences", "Humanities"],
    description:
      "One of Germany's oldest universities, known for research strength in medicine, life sciences and sustainability.",
  },
];