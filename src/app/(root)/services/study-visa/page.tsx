// src/app/(root)/study-visa/page.tsx
import type { Metadata } from "next";
import PageHero from "@/components/pageHero";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Study Visa - Know The Best Way To Apply For A Study Visa",
  description:
    "Study Visas are visas given to applicants whose main purpose of travelling to a country is the pursuit of education. Learn the steps, documents and categories involved.",
};

const ADMISSION_STEPS = [
  "Decide on the course and institution you want to apply to.",
  "Fill and submit the application form to your chosen institution online.",
  "Receive your letter of acceptance from the education provider.",
  "Get your Electronic Confirmation of Enrolment (eCOE).",
  "Apply for your study visa.",
];

const DOCUMENTS_TO_BEGIN = [
  "International passport valid for at least 6 months.",
  "Completed student visa application form from the embassy.",
  "Previous academic records and transcripts.",
  "Proof of admission from your institution.",
  "Evidence of funds to support yourself during your studies.",
  "Supporting documents such as birth certificate, marriage certificate and CV.",
  "International student health insurance, where required.",
];

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
      <PageHero
        title="Study Abroad Visa Services"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Study Abroad" }]}
      />

      <section className="bg-white flex flex-col">
        {/* Intro */}
        <div className="container mx-auto grid gap-8 px-8 md:px-10 lg:px-12 md:py-10 lg:grid-cols-[2.5fr_1.5fr] lg:items-center">
          <div className="space-y-6 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            <p>
              Study Visas, are visas given to applicants whose main purpose of
              travelling to the country is the pursuit of education.
              Obviously, while getting admission into the university is
              immensely important, these legal documents are what makes your
              pursuits achievable.
            </p>
            <p>
              <span className="font-semibold text-ruby-600">
                Studying abroad
              </span>{" "}
              requires accurate planning to say the least. Most students are
              always requested to plan their admission/application process
              having in mind university deadlines and documents required.
            </p>
            <p>
              It is mandatory to seat for the English eligibility tests
              depending on the university policy and also have required
              documents ready for steady and smooth processing of their
              application. Hence, students are always told to apply 3-4
              months in advance to avoid any last-minute rush.
            </p>
            <p>
              Applicants that want financial assistance, scholarships and
              education loans should add another couple of extra months to
              the process as these applications could be longer than
              expected.
            </p>
            <p>
              International students who need a student visa need to get an
              admission before pursuing one.
            </p>
          </div>

          <div className="relative aspect-[3/4] w-full max-w-xs mx-auto overflow-hidden rounded-[2rem] lg:max-w-sm">
            <Image
              src="/pages/graduate.jpg"
              alt="Graduate in a cap and gown holding a diploma"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="mx-auto mt-10 mb-10 w-full max-w-7xl px-4 md:px-10 lg:px-12">
          <Image
            src="/pages/study-countries.jpg"
            alt="Study destinations: Australia, USA, New Zealand, UK, Canada, Europe, Singapore"
            width={1024}
            height={281}
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="h-auto w-full"
          />
        </div>

        {/* Steps before applying */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
              Steps To Follow Before Applying For A Study Visa
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              International students need to secure admission before pursuing
              a study visa. Here&apos;s the process most western institutions
              follow:
            </p>

            <div className="mx-auto mt-10 max-w-2xl">
              <OrderedList items={ADMISSION_STEPS} />
            </div>

            <p className="mx-auto mt-10 max-w-3xl text-center text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              There are also a few documents you&apos;ll need to begin your
              visa application:
            </p>

            <div className="mx-auto mt-6 max-w-2xl">
              <OrderedList items={DOCUMENTS_TO_BEGIN} />
            </div>
          </div>
        </div>

        {/* Country-specific note */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <div className="mx-auto max-w-4xl rounded-2xl border-l-4 border-ruby-600 bg-ruby-50 px-6 py-5 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            <p>
              The complete list of requirements depends on the country
              you&apos;re applying to. While some countries require medical
              proof, others might require a blocked account or a Statement of
              Purpose (SOP). We&apos;ll walk you through the specific visa
              requirements, fees and documents for your chosen destination.
            </p>
          </div>
        </div>

        {/* Categories of study visa */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto grid gap-10 px-8 md:px-10 lg:px-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                By Program &amp; Student Type
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                Some countries classify study visas by the type of student —
                undergraduate, graduate, doctoral, exchange student, or
                vocational/diploma applicant — rather than by how long the
                program runs. An exchange undergraduate on a 3-month program,
                for example, is still grouped by student type, not duration.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                By Program Duration
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                Many countries also split study visas into short-term and
                long-term categories. Short-term visas usually cover language
                courses or diploma programs of up to 90 days, while long-term
                visas apply to full degree programs and internships beyond
                that. This is a common classification across European Union
                countries.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Ready To Apply For Your Study Visa?
            </h2>
            <p className="max-w-xl text-white/70">
              Talk to our counsellors and we&apos;ll guide you through
              admission, documents and the visa process — start to finish.
            </p>
            <a
              href="/auth/register"
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