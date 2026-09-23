// src/app/(root)/business-visa/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";

export const metadata: Metadata = {
  title: "Business Visa - Get the accurate info about Business Visa",
  description:
    "Business visas are short-term visitor visas given to people traveling for business on behalf of their employers. Learn about qualifications, required documents and the process.",
};

const VISA_ACTIVITIES = [
  "Visiting overseas offices of your own company",
  "Business meetings and negotiations with a foreign company",
  "Site visits",
  "Presenting at a trade show or conference",
  "Dealing with business-related legal matters, including going to court",
];

const VISA_BENEFITS = [
  "Stay temporary in the country you are applying to",
  "Conduct business and financial transactions",
  "Setup a temporary office",
  "Travel in that country",
];

const QUALIFICATIONS = [
  "A valid passport",
  "Travel itinerary including accommodation and flight details",
  "Business and professional credentials",
  "Academic credentials",
  "Evidence supporting that you plan to return to your base country after conducting your business",
  "Evidence of adequate financial resources",
  "Medical examination and evidence of adequate insurance",
  "Filled application with enclosed fee",
];

const OUR_SUPPORT = [
  "Document checklist",
  "Complete application support",
  "Assistance with collecting supporting documentation",
  "Visa Interview Preparation – if required",
  "Updates & Follow-up with the Consulate",
];

const COVERED_ACTIVITIES = [
  "Consulting with business relations or colleagues",
  "Going for a meeting or education convention",
  "Contract negotiations or settlement of estates",
  "Engaging in business or industrial operations",
  "Attending corporate meetings",
  "Making acquisitions or purchases for the company",
  "Interviewing and hiring workers",
];

const TOURIST_ACTIVITIES = [
  "Sightseeing and Tourism",
  "Holidays",
  "Visiting with friends or relatives",
  "Attending social gatherings or non-paid participation in sporting or entertainment events organized by different organizations",
  "Medical treatment",
  "Attending short-term, recreational activities",
];

const DOCUMENTS_REQUIRED = [
  "Business Visa application form stamped at the VAC",
  "Fee receipt for Visa application",
  "Appointment letter for Business Visa interview",
  "Passport valid for overseas travel with validity minimum 6 months beyond the period of intended stay",
  "All expired passports",
];

const BUSINESS_OWNER_DOCS = [
  "Evidence of funds that show your ability to support yourself financially during the tour",
  "Business card, if any",
  "All documents regarding the financial and market position of the company with financial records, tax papers, sources of funds, press/newspaper coverage regarding the company",
];

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-3 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ruby-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function OrderedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-3 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base"
        >
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
        heading="Business Visa"
        eyebrow="Business Visa Services"
        image={{
          src: "/pages/business-banner.jpg",
          alt: "Business visa services with Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* What is a business visa — text + application image, side by side */}
        <div className="container mx-auto grid gap-8 px-8 py-14 md:px-10 lg:px-12 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              What Is A Business Visa
            </h2>
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <p>
                Business visas are short-term visitor visas that are given
                to people traveling for business in place of their
                employers. A majority of countries do not ask US citizens
                to have a visa to visit for a brief business trip, but some
                nations do require visas for US business travellers.
              </p>
              <p>
                If you are travelling for a job-related visit to a country
                that requires visas for US citizens, you&apos;ll be given a
                business visa.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">
                Here is the list of normal activities that would require a
                business visa include:
              </p>
              <div className="mt-4">
                <OrderedList items={VISA_ACTIVITIES} />
              </div>
            </div>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.5rem]">
            <Image
              src="/pages/business1.jpg"
              alt="Business visa application form"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Two banner images, side by side, no accompanying text */}
        <div className="container mx-auto grid gap-6 px-8 pb-14 md:px-10 lg:px-12 sm:grid-cols-2">
          <div className="relative aspect-[1024/340] w-full overflow-hidden rounded-[1.5rem]">
            <Image
              src="/pages/business2.jpg"
              alt="Business visa — a whole world of opportunities awaits you"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[1024/340] w-full overflow-hidden rounded-[1.5rem]">
            <Image
              src="/pages/business3.jpg"
              alt="Get closer to your citizenship with a business visa"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Benefits — full-width text, no paired image (matches source layout) */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <div className="max-w-3xl space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <p>
                Almost every country in the world offers flexible business
                visa options to enable trade between countries. Whether you
                are conducting client meetings, attending conferences, going
                on-site or conducing sales meetings, the business visa is
                typically your best visa option.
              </p>
              <p className="font-semibold text-ink">
                Having this kind of visa enables you to:
              </p>
            </div>
            <div className="mt-6 max-w-3xl">
              <OrderedList items={VISA_BENEFITS} />
            </div>
          </div>
        </div>

        {/* Standalone image before Qualifications */}
        <div className="container mx-auto px-8 pt-14 md:px-10 lg:px-12">
          <div className="relative mx-auto aspect-[16/7] w-full max-w-3xl overflow-hidden rounded-[1.5rem]">
            <Image
              src="/pages/business4.png"
              alt="Business visa"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Qualifications */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Qualifications For Applying For A Business Visa
          </h2>
          <p className="mt-4 max-w-3xl text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            While various countries have different requirements, there are
            documents which most of them ask for. These include:
          </p>
          <div className="mt-6 max-w-3xl">
            <BulletList items={QUALIFICATIONS} />
          </div>
        </div>

        {/* Our support */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <div className="max-w-3xl space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <p>
                As one of Nigeria&apos;s leading business visa & migration
                consultancies, Ruhe Global Resources can assist you to
                design a business visa application with high chances of
                approval. A dedicated visa consultant will be appointed to
                your case and will assist you throughout the process.
              </p>
              <p className="font-semibold text-ink">Our support includes:</p>
            </div>
            <div className="mt-6 max-w-3xl">
              <BulletList items={OUR_SUPPORT} />
            </div>
          </div>
        </div>

        {/* Standalone image before FAQ */}
        <div className="container mx-auto px-8 pt-14 md:px-10 lg:px-12">
          <div className="relative mx-auto aspect-[768/384] w-full max-w-3xl overflow-hidden rounded-[1.5rem]">
            <Image
              src="/pages/business5.jpg"
              alt="Visa assistance"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* FAQ */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
            FAQ
          </h2>

          <div className="mx-auto mt-10 max-w-3xl space-y-10 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            {/* Q1 */}
            <div className="space-y-4">
              <p className="font-semibold text-ink">
                A) Is it possible to travel as a tourist on a Business Visa?
              </p>
              <p>Business visas, cover work-related activities that can include:</p>
              <BulletList items={COVERED_ACTIVITIES} />
              <p>
                A wide majority of things that have no relationship with
                work or industry are protected by tourist visas. This may
                include:
              </p>
              <BulletList items={TOURIST_ACTIVITIES} />
            </div>

            {/* Q2 */}
            <div className="space-y-4">
              <p className="font-semibold text-ink">
                B) What are the documents required?
              </p>
              <p>The documents required for Business Visa are:</p>
              <BulletList items={DOCUMENTS_REQUIRED} />
              <p>
                If you are employed and your company/employer is sponsoring
                your Business Visa application: a letter from the employer
                that requests the Visa for the applicant addressed to the
                Embassy/Consulate that indicates the length and purpose of
                the trip and the intent of the firm to bear the entire trip
                cost.
              </p>
              <p>If you are the owner of a business:</p>
              <BulletList items={BUSINESS_OWNER_DOCS} />
            </div>

            {/* Q3 */}
            <div className="space-y-4">
              <p className="font-semibold text-ink">
                C) How much time does it take to receive a Business Visa?
              </p>
              <p>
                The time taken for processing the Business Visa depends on
                the nation offering it and the applicant&apos;s independent
                situation. For instance, it takes around 1 to 6 weeks for
                the processing of a Canada Business Visa.
              </p>
              <p>
                For a US visa application to be approved, it requires from
                3 to 5 weeks. After processing, the individual will receive
                a positive reply to their application and the document will
                be submitted by the consulate. The visa may require up to
                two additional working days to be delivered.
              </p>
              <p>
                As for the Canada business visa, it will take up to 1 to 6
                weeks for the Business Visa to be approved, depending on the
                work flow of the Canadian Embassy you are applying to.
              </p>
              <p>
                As for Australia, the time for processing business visas
                can be between 15–22 weeks — so you will need to plan well
                ahead of time.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="container mx-auto px-8 pb-16 pt-2 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Ready To Apply For Your Business Visa?
            </h2>
            <p className="max-w-xl text-white/70">
              Talk to our consultants and we&apos;ll guide you through
              qualifications, documents and the interview process, start to
              finish.
            </p>
            <a
              href="/contact"
              className="mt-2 inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
            >
              Get Started
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default page;