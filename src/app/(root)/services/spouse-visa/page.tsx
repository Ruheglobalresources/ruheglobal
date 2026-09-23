// src/app/(root)/spouse-visa/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";

export const metadata: Metadata = {
  title: "Spouse Visa - Best info about spouse visa",
  description:
    "Spouse visa is a kind of visa that provides an opportunity for married partners to live and work in any country of your choice. Learn about eligibility, required documents and the interview process.",
};

const SPOUSE_REQUIREMENTS = [
  "You and your partner both need to be 18 or over.",
  "Your partner must either be a citizen of that country.",
  "You are in a civil partnership or marriage that's recognised in that country or you've been living together in a relationship for at least 2 years when you apply or you are a fiancé, fiancée or proposed civil partner and will marry or enter into a civil partnership in that country within 6 months of arriving.",
  "If you are a fiancé(e) or proposed civil partner, you must be seeking entry to the said country to enable your marriage or civil partnership to take place in the said country.",
  "The relationship between you and your sponsor must be genuine and subsisting.",
  "You intend to live permanently with your sponsor in the said country and have adequate accommodation without recourse to public funds.",
  "Your sponsor meets the financial requirement. This would normally mean having an income of at least between $20,000 and $30,600 per year (this increases if you have children) and/or having sufficient savings depending on the country.",
  "You meet the English language requirement.",
];

const SUPPORTING_DOCUMENTS = [
  "Your current passport or other travel documents.",
  "Your marriage or civil partnership certificate.",
  "Divorce certificate for any previous marriages, if applicable.",
  "Details of any criminal convictions, if applicable.",
  "Your National Insurance number (if you have one).",
  "Details of your accommodation in the said country.",
  "Bank statements.",
  "Evidence of employment income, if applicable.",
  "Your sponsor's British passport or Indefinite Leave to remain document.",
  "Details of any children who are also coming to the said country.",
];

const FAQ_QUESTIONS = [
  "When and how did you and your spouse meet?",
  "Have you met your in laws?",
  "What amount of income does your spouse earn?",
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
      <InnerHero
        heading="Spouse Visa"
        eyebrow="Spouse Visa Services"
        image={{
          src: "/pages/visa-banner.jpg",
          alt: "Spouse visa services with Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* What is a spouse visa */}
        <div className="container mx-auto grid gap-8 px-8 py-14 md:px-10 lg:px-12 lg:grid-cols-[2.5fr_1.5fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              What Is A Spouse Visa
            </h2>
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <p>
                Spouse visa is a kind of visa that provides an opportunity
                for married partners to live and work in any country of your
                choice. You can apply for this family visa if you are the
                husband, wife, civil partner, unmarried partner (living
                together in a relationship for at least 2 years), fiancé,
                fiancée or proposed civil partner (will marry or enter into a
                civil partnership in a certain country within 6 months of
                arriving) of a specified partner (see below). Some demands
                are terribly restrictive, for example, applicants must meet
                a crucial minimum income or finance amount, which has been
                subject to fierce legal battles and criticism from family
                groups.
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
            <Image
              src="/pages/spouse1.jpg"
              alt="Married couple applying for a spouse visa"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto grid gap-8 px-8 md:px-10 lg:px-12 lg:grid-cols-[1.5fr_2.5fr] lg:items-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
              <Image
                src="/pages/spouse2.jpg"
                alt="Spouse visa services requirements"
                fill
                className="object-cover"
              />
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                What Are the Requirements for a Spouse Visa
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                To obtain a family visa as a partner or spouse, you must meet
                the following requirements:
              </p>
              <div className="mt-6">
                <OrderedList items={SPOUSE_REQUIREMENTS} />
              </div>
            </div>
          </div>
        </div>

        {/* How to apply */}
        <div className="container mx-auto grid gap-8 px-8 py-14 md:px-10 lg:px-12 lg:grid-cols-[2.5fr_1.5fr] lg:items-center">
          <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              How Do I Apply for a Spouse Visa
            </h2>
            <p>
              You can apply online. You would also need to attend an
              appointment at a visa application centre to enrol biometric
              data (photographs and fingerprints) as part of the process.
            </p>
            <p>
              Not only will you need to fill in the application form
              correctly, you will also need to upload copies of the required
              supporting documents, which can be extensive.
            </p>
            <p>
              If the caseworker examining your application has doubts about
              the genuineness of your relationship, you may be asked to
              attend a Spouse Visa Interview. You will be asked questions
              about your relationship and each other to see if your marriage
              is authentic.
            </p>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
            <Image
              src="/pages/spouse3.jpg"
              alt="Ruhe Global Resources visa services"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Supporting documents */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
              What Supporting Documents Will I Need for Spouse Visa
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              Most officials of the country of choice will want to see the
              following documents (it is not an exhaustive list) included
              with your application:
            </p>
            <div className="mx-auto mt-10 max-w-2xl">
              <OrderedList items={SUPPORTING_DOCUMENTS} />
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <div className="relative mx-auto mb-10 aspect-[16/7] w-full max-w-4xl overflow-hidden rounded-[2rem]">
            <Image
              src="/pages/spouse4.jpg"
              alt="Spouse visa"
              fill
              className="object-cover"
            />
          </div>

          <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
            FAQ
          </h2>

          <div className="mx-auto mt-8 max-w-3xl space-y-6 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            <p className="font-semibold text-ink">
              What are the questions that will be asked at a spouse visa
              interview?
            </p>
            <p>
              Answer: What you may be asked at a spouse visa interview will
              depend on the individual caseworker. However, examples may
              include:
            </p>
            <OrderedList items={FAQ_QUESTIONS} />
            <p>
              You can contact us so that our team can conduct a mock
              interview with you both to help you prepare for the interview.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="container mx-auto px-8 pb-16 pt-2 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Ready To Apply For Your Spouse Visa?
            </h2>
            <p className="max-w-xl text-white/70">
              Talk to our consultants and we'll guide you through
              eligibility, documents and the interview process, start to
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