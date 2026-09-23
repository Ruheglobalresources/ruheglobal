// src/app/(root)/dependent-visa/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";

export const metadata: Metadata = {
  title: "Dependent Visa - RGR Dependent Visa Services",
  description:
    "A Dependent Visa is a type of visa that allows spouses and children to travel to an overseas country to join a family member with a corresponding visa.",
};

const DEPENDENT_VISA_TYPES = [
  {
    name: "Temporary Visas",
    copy: "For holders of the following visas: Work, Intra Company Transfer, Student, Fiancé.",
  },
  {
    name: "Permanent Visas",
    copy: "For spouses or children below the age of 18 to 21 years old, as immigration dependents.",
  },
];

const WHAT_IT_ALLOWS = [
  "Stay in the country they are applying to under the sponsorship of their relative.",
  "Work or study in some cases.",
  "Travel in that country.",
];

const ELIGIBILITY = [
  "Applicants must have a valid passport.",
  "The sponsor must have adequate financial resources to support the dependents.",
  "Work and income proof of the sponsor.",
  "Medical examination and evidence of adequate insurance for dependents.",
  "A filled application with the enclosed fee.",
];

const RGR_SUPPORT = [
  "Document checklist.",
  "Complete dependant visa application support.",
  "Assistance with collecting supporting documentation.",
  "Visa Interview Preparation, if required.",
  "Updates and follow up with the Consulate.",
  "Concierge services.",
  "Assistance with biometric services if required.",
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
        heading="Dependent Visa"
        eyebrow="RGR Dependent Visa Services"
        image={{
          src: "/pages/dependent-visa.png",
          alt: "Family travelling abroad together with Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* What is a dependent visa */}
        <div className="container mx-auto grid gap-8 px-8 py-14 md:px-10 lg:px-12 lg:grid-cols-[2.5fr_1.5fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              What Is A Dependent Visa?
            </h2>
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <p>
                A Dependent Visa is a type of visa that allows spouses and
                kids to travel to an overseas country for accompanying or
                joining the family member with a corresponding visa. With a
                dependent visa, the dependents of a lawful migrant to a
                nation, such as a spouse, dependent children or parents, can
                live in the country. Such dependents can request a visa to
                join the migrant in the country.
              </p>
              <p>
                To apply for the visa on behalf of the dependents, the person
                has to prove that he has enough funds to support the
                dependents and will not rely on state or public funds to
                support them. Dependents on their part will have to prove
                that they intend to live with the primary applicant during
                their time and their relationship is genuine. Children less
                than 18 will have to prove that they are not going to live an
                independent life and rely on the primary applicant for
                support.
              </p>
              <p>
                The applicants need to submit documents that prove the
                relationship, such as a marriage certificate in case of a
                spouse and a birth certificate in case of children.
              </p>
              <p>
                There are different documents needed for a Spouse Visa. The
                exact documents will depend on the nationality of the spouse
                and the nation of residence. Passport copy, birth
                certificate, proof of relationship, police reports, etc.
                will be needed.
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
            <Image
              src="/pages/dependent1.jpg"
              alt="Family reunited abroad on a dependent visa"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Two forms of dependent visa */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
              There Are Two Forms Of Dependent Visas (Temporary & Permanent)
            </h2>

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              {DEPENDENT_VISA_TYPES.map((type) => (
                <div
                  key={type.name}
                  className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"
                >
                  <h3 className="text-lg font-bold text-ink sm:text-xl">
                    {type.name}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                    {type.copy}
                  </p>
                </div>
              ))}
            </div>

            <p className="mx-auto mt-8 max-w-3xl text-center text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              Spouses or partners on temporary Dependent Visas are granted
              limited work rights based on their visa validity in most
              countries, except the US. Permanent Residence Visas granted to
              dependents have the right to live, study and work for as long
              as they live as permanent residents.
            </p>
          </div>
        </div>

        {/* What it allows */}
        <div className="container mx-auto grid gap-8 px-8 py-14 md:px-10 lg:px-12 lg:grid-cols-[1.5fr_2.5fr] lg:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
            <Image
              src="/pages/dependent2.jpg"
              alt="Visas and permits for dependents"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Usually Dependent Visas Allow Successful Applicants To
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              In order to bring families together, countries across the world
              offer dependent visas with various facilities. Typically, these
              visas allow you to bring your immediate family abroad through a
              short process which focuses mainly on your financial ability.
            </p>
            <div className="mt-6">
              <OrderedList items={WHAT_IT_ALLOWS} />
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
              Dependent Visa Eligibility
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              Countries all over the world have different criteria when it
              comes to dependent visa solutions and as such, there is no
              homogeneous eligibility criteria. However, the following
              criteria are usually common:
            </p>
            <div className="mx-auto mt-10 max-w-2xl">
              <OrderedList items={ELIGIBILITY} />
            </div>
          </div>
        </div>

        {/* RGR support */}
        <div className="container mx-auto grid gap-8 px-8 py-14 md:px-10 lg:px-12 lg:grid-cols-[1.5fr_2.5fr] lg:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] lg:order-1">
            <Image
              src="/pages/dependent3.jpg"
              alt="RGR consultant supporting a dependent visa application"
              fill
              className="object-cover"
            />
          </div>

          <div className="lg:order-2">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Why Apply With RGR
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              Ruhe Global Resources is one of Nigeria&apos;s leading names in
              visa and immigration solutions. Our expertise covers various
              countries and regions and we are the consultant for serious
              applicants. When you decide to go with us, a dedicated visa
              consultant will assist you with your case and be with you
              throughout the process. Our support includes:
            </p>
            <div className="mt-6">
              <OrderedList items={RGR_SUPPORT} />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="container mx-auto px-8 pb-16 pt-2 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Ready To Bring Your Family Together?
            </h2>
            <p className="max-w-xl text-white/70">
              Talk to our consultants and we&apos;ll guide you through
              eligibility, documents and the dependent visa process, start to
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