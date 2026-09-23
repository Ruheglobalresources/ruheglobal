// src/app/(root)/work-visa/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";

export const metadata: Metadata = {
  title: "Work Visa - Best information about work visa",
  description:
    "It is a type of work permit that allows you to enter a foreign country and work there for a specific time. Without having a work visa, you cannot work in an international country.",
};

const TOP_COUNTRIES = [
  {
    name: "The Netherlands",
    image: {
      src: "/pages/netherland.jpeg",
      alt: "Travel and work at Netherlands with Ruhe Global Resources",
    },
    copy: "If you have a great idea for a new business or product, this may be the easiest country to get a work visa. The Netherlands offers a one-year residency for foreigners to start a business. After 12 months, entrepreneurs apply for the self-employed work permit. All you need to get started is a dream! This visa is specific to those who wish to start a business and be self-employed (scientists, innovators, inventors, and designers).",
  },
  {
    name: "Australia & New Zealand",
    image: {
      src: "/pages/australia.jpg",
      alt: "Travel and work in Australia & New Zealand",
    },
    copy: "When thinking about the easiest countries to get a work visa, the South Pacific immediately comes to mind. Australia and New Zealand offer working holiday visas to Americans aged 18-30 years old for a period up to 12 months. Usually these are available for a fee and a ticket home (or proof that you'll be able to purchase one). You'll find that Australia and New Zealand are packed with Americans and others on work visas — no surprise, given the stunning landscapes and natural wonders to explore.",
  },
  {
    name: "Cambodia",
    image: {
      src: "/pages/cambodia.png",
      alt: "Study, relocate and work abroad with Ruhe Global Resources",
    },
    copy: "This country is not only the easiest country to get a work visa, it's also one of the best! The popular business visa is fast to renew, living and working in a paradise, surrounded by fascinating history and culture. While the business visa is easy to get, technically you'll also need to apply for a work permit to legally work in the country. Freelancing and remote work are popular in Cambodia, but it's also easy to find other types of jobs in tourism or teaching.",
  },
  {
    name: "Germany",
    image: {
      src: "/pages/germany.jpeg",
      alt: "Study and work in Germany",
    },
    copy: "Germany offers work visas for graduate students. If you're thinking about studying and working abroad, Germany would be the perfect country of choice for you! There is also a visa available for artists, which you could apply for if you would like to be self-employed and can show a thought-out business plan. Skilled workers in the technology and health sectors are needed, but there are also many other types of work available in this economically strong country.",
  },
  {
    name: "Canada",
    image: {
      src: "/pages/canada.jpg",
      alt: "Study, relocate and work in Canada with Ruhe Global Resources",
    },
    copy: "A temporary work visa is quite easy to get in Canada, and there are few requirements. Visas are also comparatively quite affordable. From nursing to the STEM fields, Canada is a great choice if you're looking to further your current career or even start a new one!",
  },
];

const APPLICATION_STEPS = [
  "Decide whether you are applying online or offline.",
  "Get all necessary documents from your current and previous employers.",
  "Complete the visa application form by entering all required information.",
  "Pay the fees required for visa processing.",
  "Send the filled application to the concerned embassy.",
];

const AFTER_APPROVAL = [
  "You should not do any other work except the kind of job for which you have received a permit.",
  "You must carry the work permit with you during your office hours.",
  "You should apply for an extension or work permit renewal, if needed, before the permit expires.",
  "If you lose your work permit, you need to inform your employer and apply for a fresh one.",
  "If you resign during your stay abroad, you must return to your country of residence within 7 days.",
];

const ELIGIBILITY = [
  "You need to prove that you will leave the country once your work is done and your duration of stay is over.",
  "You should have enough money to take care of yourself and your dependents.",
  "You should have no record of criminal activity.",
  "You should have no outstanding medical issues, and hold certificates of good health.",
  "You should not take up any other work, apart from the work allotted by your employer.",
];

const DOCUMENTS_REQUIRED = [
  "Copies of all academic qualifications.",
  "Copies of professional qualifications.",
  "Work experience certificates from previous employers.",
  "Employer's reference letter.",
];

const DENIAL_REASONS = [
  "Your employer's failure to meet the requirements set by the immigration authority of a particular country.",
  "The job does not require that specialized skill or knowledge.",
  "An important document or piece of information is missing.",
  "You have a history of violating immigration laws.",
  "The immigration authority believes you don't intend to return home.",
];

function OrderedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ruby-600/10 text-xs font-bold text-ruby-600">
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

const page = () => {
  return (
    <>
      <InnerHero
        heading="Work Visa"
        eyebrow="RGR Work Visa Services"
        image={{
          src: "/pages/work-banner.jpg",
          alt: "Work abroad with Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* What is a work visa */}
        <div className="container mx-auto grid gap-8 px-8 py-12 md:px-10 md:py-16 lg:px-12 lg:grid-cols-[2.5fr_1.5fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              What Is A Work Visa?
            </h2>
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <p>
                It is a type of work permit that allows you to enter a foreign
                country and work there for a specific time. Without having a
                work visa, you cannot work in an international country.
                Separate countries may have different procedures and criteria
                for issuing work permit visas. Work permit visas are given
                either on a temporary or permanent basis. A temporary work
                visa remains eligible for a particular period of time, after
                which the visa owner needs to renew it if their employer
                wants to extend their working period.
              </p>
              <p>
                The timespan of a work visa is based on the amount of work
                you have and labour market conditions. In countries like New
                Zealand, you have the facility to apply for a work-to-residence
                visa. To turn your work visa into a residence visa, you need
                to meet age, health and character requirements. Similarly, in
                the USA, a foreign citizen can acquire a work visa permit for
                a period of 6 months. All{" "}
                <a
                  href="https://travel.state.gov/content/travel/en/us-visas/employment/temporary-worker-visas.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ruby-600 underline-offset-2 hover:underline"
                >
                  work visas to the USA
                </a>{" "}
                need to be ratified by USCIS (United States Citizenship and
                Immigration Services).
              </p>
              <p>
                Nevertheless, it is the employer who applies for a work
                permit visa on your behalf. Work visas require an employer to
                liaise with the immigration authority of a particular country
                and get approval.
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
            <Image
              src="/pages/work-abroad.png"
              alt="Work abroad with Ruhe Global Resources"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Top 5 countries */}
        <div className="bg-ink/[0.02] py-12 md:py-16">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
              Top 5 Countries To Get A Work Visa Easily
            </h2>

            <div className="mt-10 space-y-10">
              {TOP_COUNTRIES.map((country) => (
                <div
                  key={country.name}
                  className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:items-center"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                    <Image
                      src={country.image.src}
                      alt={country.image.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink sm:text-xl">
                      {country.name}
                    </h3>
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                      {country.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How to apply */}
        <div className="container mx-auto grid gap-8 px-8 py-12 md:px-10 md:py-16 lg:px-12 lg:grid-cols-[1.5fr_2.5fr] lg:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] lg:order-1">
            <Image
              src="/pages/apply.jpg"
              alt="How to apply for a work visa"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-6 lg:order-2">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              How To Apply For A Work Visa
            </h2>
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <p>
                Different countries may have different procedures and
                criteria for issuing work permit visas to employees. You can
                get a work visa using either the online or offline mode of
                application.
              </p>
              <p>
                <span className="font-semibold text-ink">
                  Online application:
                </span>{" "}
                You can apply for a work visa online by going to the embassy
                website of your country of choice. You fill in all the
                necessary information online and pay the visa application
                fees, which can also be paid online.
              </p>
              <p>
                <span className="font-semibold text-ink">
                  Offline application:
                </span>{" "}
                For an offline application, you need to download the
                application form, fill in all required details and send it
                to the concerned embassy of your destination country. Not all
                countries accept online visa applications.
              </p>
              <p>
                All visa applications need to be submitted with proof of your
                education and work experience to support the fact that you
                meet the requirements for the job.
              </p>
            </div>
          </div>
        </div>

        {/* Steps to follow */}
        <div className="bg-ink/[0.02] py-12 md:py-16">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
              Steps To Follow While Applying For A Work Visa
            </h2>

            <div className="mx-auto mt-10 max-w-2xl">
              <OrderedList items={APPLICATION_STEPS} />
            </div>

            <p className="mx-auto mt-8 max-w-3xl text-center text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              Processing time for a work permit visa varies depending on the
              type of work you'll be doing. Once you receive a work permit,
              keep the following in mind:
            </p>

            <div className="mx-auto mt-6 max-w-2xl">
              <OrderedList items={AFTER_APPROVAL} />
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="container mx-auto grid gap-8 px-8 py-12 md:px-10 md:py-16 lg:px-12 lg:grid-cols-[1.5fr_2.5fr] lg:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
            <Image
              src="/pages/eligibility.jpg"
              alt="Work visa eligibility"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Work Visa Eligibility
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              The following common eligibility conditions apply when you
              apply for a work permit visa:
            </p>
            <div className="mt-6">
              <OrderedList items={ELIGIBILITY} />
            </div>

            <h3 className="mt-8 text-lg font-bold text-ink">
              Documents Required
            </h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              Your work permit visa application needs to be supported by the
              following documents:
            </p>
            <div className="mt-6">
              <OrderedList items={DOCUMENTS_REQUIRED} />
            </div>
          </div>
        </div>

        {/* Reasons for denial */}
        <div className="bg-ink/[0.02] pb-16 pt-12 md:pb-20 md:pt-16">
          <div className="container mx-auto grid gap-8 px-8 md:px-10 lg:px-12 lg:grid-cols-[1.5fr_2.5fr] lg:items-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] lg:order-1">
              <Image
                src="/pages/denial.jpg"
                alt="Reasons for work visa denial"
                fill
                className="object-cover"
              />
            </div>

            <div className="lg:order-2">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                Reasons For Work Visa Denial
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                Sometimes the immigration authority of your destination
                country rejects your work visa permit. A work visa permit may
                be rejected under the following circumstances:
              </p>
              <div className="mt-6">
                <OrderedList items={DENIAL_REASONS} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default page;