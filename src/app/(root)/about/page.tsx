// src/app/(root)/about/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";

export const metadata: Metadata = {
  title: "About RGR - RUHE Global Resources",
  description:
    "Ruhe Global Resources is a fully registered company with its head office in Abuja, Nigeria. It was established to meet the growing demand from Nigerian students, professionals and institutions seeking international education.",
};

const RGR_SERVICES = [
  "Guidance for scholarships, financial aids and assistantships.",
  "On campus and part time jobs.",
  "Guidance for visa documentation, student loans and mock interviews.",
  "Assistance to purchase air tickets.",
  "Free international examination tutorial services.",
  "Currency exchange.",
  "Guidance for before and after your departure.",
  "Tuition fee payment guidance.",
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
        heading="About RUHE Global Resources"
        eyebrow="About RGR"
        image={{
          src: "/pages/about-banner.jpg",
          alt: "About Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* Intro */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <div className="mx-auto max-w-4xl space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            <p>
              Ruhe Global Resources is a fully registered company with its
              head office in Abuja, Nigeria. It was established to meet the
              growing demand from Nigerian students, professionals and
              institutions seeking international educational experience. As
              an educational advisory centre, our focal objective is to
              serve as a bridge that closes the gap of distance and creates
              access to global education for our customers. We make endless
              efforts to reach various institutions so that students can
              pursue the education of their interests, which would qualify
              them for successful careers.
            </p>
            <p>
              Therefore, we provide digital solutions in the form of online
              degrees and pathways through our esteemed partners,
              satisfying the middle class and the very busy professionals
              and students who cannot travel to get international degrees.
            </p>
          </div>
        </div>

        {/* Image pair */}
        <div className="container mx-auto grid gap-6 px-8 pb-14 md:grid-cols-2 md:px-10 lg:px-12">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
            <Image
              src="/pages/about1.jpg"
              alt="Ruhe Global Resources team and office"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
            <Image
              src="/pages/about2.jpg"
              alt="Ruhe Global Resources website and services"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Core activities */}
        <div className="bg-ink py-4">
          <div className="container mx-auto grid gap-8 px-8 md:px-10 lg:px-12 lg:grid-cols-[2.5fr_1.5fr] lg:items-center">
            <div className="space-y-1 text-[0.95rem] leading-relaxed text-cloud sm:text-base">
              <p>
                Ruhe Global Resources also provides marketing and
                recruitment services for international education providers
                through its core activities: Client Services, Student
                Services, Educational Tours and Teacher Recruitments. We are
                professionals in explaining educational systems of the
                respective countries and educating all possible routes to
                get the best and quality education for the prospective
                students.
              </p>
            </div>

            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem]">
              <Image
                src="/pages/about3.png"
                alt="Ruhe Global Resources core activities"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Services list */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
            What We Offer
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            We also provide:
          </p>
          <div className="mx-auto mt-10 max-w-2xl">
            <OrderedList items={RGR_SERVICES} />
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            This makes us the most reliable and efficient advisory centre in
            Nigeria and the top agent for international education bargains.
          </p>
        </div>

        {/* CTA */}
        <div className="container mx-auto px-8 pb-16 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Do You Have Any Question About Our Services?
            </h2>
            <a
              href="/contact"
              className="mt-2 inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
            >
              Contact Us Today
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default page;