// src/app/(root)/services/institution-selection/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InnerHero from "@/components/Inner-hero";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Institution Selection - RUHE Global Resources",
  description:
    "Browse the universities and colleges we partner with across Canada, the United Kingdom and the United States, then use our AI-powered school search to find the right fit for you.",
};

type CountryGroup = {
  id: string;
  country: string;
  image: { src: string; alt: string };
  institutions: string[];
};

const COUNTRY_GROUPS: CountryGroup[] = [
  {
    id: "canada",
    country: "Canada",
    image: {
      src: "/pages/canada1.jpg",
      alt: "University campus in Canada",
    },
    institutions: [
      "Arbutus College",
      "Acsender School of Management",
      "Bishop's University",
      "Brock University",
      "Cape Breton University",
      "Capilano University",
      "Carleton University",
      "Centennial College",
      "Dublin International Foundation College",
      "Durham College",
      "Fanshawe College",
      "Fraser International College",
      "Georgian College",
      "Griffith College",
      "International College of Manitoba",
      "International Language Institute",
      "Kwantlen Polytechnic University",
      "Lakehead University",
      "LaSalle College - Montreal",
      "Laurentian University",
      "Lethbridge College",
      "Mohawk College",
      "New York Institute of Technology - Vancouver",
      "Ontario Tech University",
      "Red Academy",
      "Richard Bland College",
      "Royal Roads University",
      "Sheridan College",
      "Simon Fraser University",
      "Trent University",
      "Trinity Western University",
      "University Canada West",
      "University College Cork",
      "University of Manitoba",
      "University of New Brunswick",
      "University of Prince Edward Island",
      "University of Saskatchewan",
    ],
  },
  {
    id: "united-kingdom",
    country: "United Kingdom",
    image: {
      src: "/pages/uk1.jpg",
      alt: "University campus in the United Kingdom",
    },
    institutions: [
      "Arts University Bournemouth",
      "Bangor University",
      "Bolton University",
      "Bournemouth University",
      "Bradford University",
      "Brighton University",
      "Bristol University",
      "British & Irish Modern Music Institute",
      "City University London",
      "Coventry University",
      "Coventry University London Campus",
      "Cranfield School of Management",
      "Cranfield University",
      "Cumbria University",
      "De Montfort University",
      "DMU Leicester",
      "East Anglia University",
      "East London University",
      "Edge Hill University",
      "Edgware Academy",
      "Edinburgh International College",
      "Edinburgh Napier University",
      "ESCP Europe - London",
      "Essex University",
      "Falmouth University",
      "Falmouth University of Arts",
      "Foyle International",
      "Glasgow Caledonian University",
      "Glasgow International College",
      "Glasgow School of Art",
      "Hull University",
      "INTO Manchester",
      "Istituto Marangoni",
      "Kaplan International College - London",
      "Leeds University",
      "Liverpool International College",
      "Liverpool Hope University",
      "Liverpool John Moores University",
      "London Metropolitan University",
      "London South Bank University",
      "Navitas UK Holdings Ltd",
      "Navitas/BCUIC Birmingham City",
      "Navitas/CRIC Anglia Ruskin University",
      "Navitas/EIC Edinburgh Napier",
      "Navitas/HIC Hertfordshire",
      "Navitas/ICRGU Robert Gordon",
      "Navitas/ICWS Swansea",
      "Navitas/LBIC Brunel",
      "Navitas/PUIC Plymouth Uni. Int. College",
      "Norwich University of the Arts",
      "Newton A-Level",
      "Newcastle University",
      "Newcastle University London",
      "Northumbria University",
      "Nottingham Trent University",
      "Queen's University Belfast",
      "Sheffield Hallam University",
      "South Bank University",
      "St George's, University of London",
      "St Mary's University London",
      "Swansea University",
      "The University of Manchester",
      "The University of Sheffield",
      "The University Dundee",
      "UCLan University",
      "Ulster University",
      "Hertfordshire University College Dublin",
      "University of Bedfordshire",
      "University of Birmingham",
      "University of Bolton",
      "University of Bradford",
      "University of Brighton",
      "University of Buckingham",
      "University of Central Lancashire",
      "University of Chester",
      "University of Chichester",
      "University of Dundee",
      "University of East Anglia",
      "University of East London",
      "University of Essex",
      "University of Exeter",
      "University of Glasgow",
      "University of Gloucestershire",
      "University of Hull",
      "University of Leeds",
      "University of Leicester",
      "University of Lincoln",
      "University of Liverpool",
      "University of New Hampshire",
      "University of Northampton",
      "University of Portsmouth",
      "University of Sunderland",
      "University of Surrey",
      "University of Sussex",
      "University of the West of England, Bristol",
      "University of the West of Scotland",
      "University of West London",
      "University of Wolverhampton",
    ],
  },
  {
    id: "united-states",
    country: "United States of America",
    image: {
      src: "/pages/usa1.jpg",
      alt: "University campus in the United States",
    },
    institutions: [
      "Abilene Christian University",
      "Arizona State University - W. P. Carey School of Business",
      "Arkansas State University",
      "Ashland University",
      "Binghamton University",
      "Butte College",
      "Brandeis International Business School",
      "California Baptist University",
      "California State College",
      "California State Polytechnic University - Pomona",
      "California State University - Fresno",
      "California State University - Long Beach",
      "California State University - San Bernardino",
      "Chemeketa Community College",
      "Christopher Newport University",
      "City College of New York",
      "Cleveland State University",
      "College of Charleston",
      "Colorado Mesa University",
      "Colorado State University",
      "Community Colleges of Spokane",
      "Concordia College - New York",
      "Concordia University - Nebraska",
      "Concordia University Chicago",
      "Concordia University Wisconsin",
      "Contra Costa College",
      "CUNY - City College",
      "Dakota State University",
      "Dean College",
      "DePaul University",
      "DePauw University",
      "DeVry University - Addison",
      "DeVry University - Chicago Loop",
      "DeVry University - Decatur",
      "DeVry University - Henderson",
      "DeVry University - Orlando",
      "Eastern Michigan University",
      "Edmonds Community College",
      "El Camino College",
      "Elgin Community College",
      "Emporia State University",
      "Evergreen Valley College",
      "Fairfield University",
      "Ferris State University",
      "Fisher College",
      "Flathead Valley Community College",
      "Florida Agricultural and Mechanical University",
      "Florida Atlantic University",
      "Florida Institute of Technology",
      "Gonzaga University",
      "Goodwin College",
      "Grand Valley State University",
      "Green River College",
      "Greenville University",
      "Herzing University - Atlanta",
      "Hillsborough Community College",
      "Hofstra University",
      "Hult International Business School - Boston",
      "Hult International Business School - New York",
      "Hult International Business School - San Francisco",
      "Humboldt State University",
      "Husson University",
      "Illinois College",
      "Illinois State University",
      "James Madison University",
      "Kendall College",
      "Keuka College",
      "King's College",
      "King's Boston",
      "Kings Los Angeles Mary Mount",
      "King's New Jersey",
      "King's New York",
      "King's New York State",
      "Lake Washington Institute of Technology",
      "Lane Community College",
      "Lawrence University",
      "LeTourneau University",
      "Marist College",
      "Marshall University",
      "McKendree University",
      "MCPHS University",
      "Mercer University",
      "Mercyhurst University",
      "Merrimack College",
      "Metropolitan College of New York",
      "Metropolitan State University of Denver",
      "Mills College",
      "Milwaukee School of Engineering",
      "Mississippi College",
      "Mississippi State University",
      "Missouri Southern State University",
      "Missouri Western State University",
      "Monmouth College",
      "Monroe College",
      "Montana State University - Billings",
      "Moravian College",
    ],
  },
];

const page = () => {
  return (
    <>
      <InnerHero
        heading="Institution Selection"
        eyebrow="Institution Selection"
        image={{
          src: "/hero.jpg",
          alt: "Institution selection services with Ruhe Global Resources",
        }}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Institution Selection" }]}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* Intro */}
        <div className="container mx-auto px-8 py-6 md:px-10 lg:px-12">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              These are the list of Universities we partner with across the world
            </h2>
            <p className="mt-4 max-w-3xl text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              Choosing the right institution is one of the biggest decisions in your
              study abroad journey. Below is a list of the partner universities and
              colleges we work with, grouped by destination country.
            </p>
          </Reveal>
        </div>

        {/* Country groups */}
        <div className="container mx-auto px-8 pb-6 md:px-10 lg:px-12">
          <div className="divide-y divide-ink/10">
            {COUNTRY_GROUPS.map((group, index) => (
              <Reveal key={group.id} delay={0.05 * index} className="py-10 first:pt-0 sm:py-12">
                <div className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:items-start lg:gap-10">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] lg:sticky lg:top-24">
                    <Image
                      src={group.image.src}
                      alt={group.image.alt}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
                      {group.country}
                    </h3>
                    <ul className="mt-4 grid list-disc grid-cols-1 gap-x-8 gap-y-2 pl-5 text-[0.9rem] leading-relaxed text-ink/75 sm:grid-cols-2">
                      {group.institutions.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA — links to the AI-powered institution search */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-ember">
                Find a School
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                Can't find your dream school on this list?
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                Search our full network of partner institutions instantly with our
                AI-powered school search — filter by country, level and field, and see
                the IELTS score and tuition fee for each one.
              </p>
              <Link
                href="/search"
                className="mt-6 inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
              >
                Search Schools With AI
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
};

export default page;