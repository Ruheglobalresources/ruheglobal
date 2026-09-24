// src/app/(root)/services/destination-selection/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";

export const metadata: Metadata = {
  title: "Destination Selection - RGR Destination Selection Services",
  description:
    "Understand the factors that matter most during destination selection, from student visas and study language to cost, work rights and culture shock.",
};

const QUESTIONS = [
  "What language do you want to study in?",
  "What form of education are you looking for?",
  "How tough will it be to get a visa?",
  "What are the university entry conditions?",
  "Which destinations are cheaper?",
  "Are there employment opportunities after your studies?",
  "Will culture shock be an issue?",
];

const FACTORS = [
  {
    title: "Student Visa",
    copy: "Once you have narrowed things down by language and the style of education you want, it is time to look at the factors you cannot control, starting with your student visa. You cannot travel without one, and the application itself changes depending on your destination, your citizenship and the course you plan to study.",
    image: "/pages/destination/destination3.jpg",
    alt: "Student visa application documents",
    imageFirst: true,
  },
  {
    title: "Study Language",
    copy: "The language you want to study in is usually the biggest factor in choosing where to study, and settling on it early narrows your destination selection considerably. If English works for you, the USA, the UK and Australia take in the largest numbers of international students, and their institutions dominate the top rankings. Germany, France, Malaysia, China and Singapore are also worth a look, all popular with international students and increasingly offering programmes taught in English.",
    image: "/pages/destination/destination4.jpg",
    alt: "Student comparing study destinations",
    imageFirst: false,
  },
  {
    title: "University Entry Demands",
    copy: "Admission to your chosen university is another factor outside your control, and competition for a spot can be considerable. If you are applying for an English language education, check the language requirements early, most schools will expect a test score from something like IELTS or TOEFL.",
    image: "/pages/destination/destination5.png",
    alt: "University campus and entry requirements",
    imageFirst: true,
  },
  {
    title: "Study Cost",
    copy: "For many students, cost decides where they study. Tuition alone can vary hugely between countries, and even between regions of the same country, and it is only one part of the bill. Factor in accommodation, travel, everyday living costs, health cover and insurance too. Destinations like the UK and Canada offer free health services, which is worth weighing into your calculations.",
    image: "/pages/destination/destination6.jpg",
    alt: "Student budgeting for study costs abroad",
    imageFirst: false,
  },
  {
    title: "Employment Opportunities",
    copy: "A degree from the US or the UK carries real weight with employers, but finding work in your destination after you graduate is not guaranteed. Some countries, the US among them, place tight restrictions on post study work visas, so check what is actually available to you in your chosen destination before you commit.",
    image: "/pages/destination/destination7.jpg",
    alt: "Graduate exploring employment opportunities abroad",
    imageFirst: true,
  },
  {
    title: "Culture Shock",
    copy: "Culture shock is the factor most students overlook when picking a destination. It should not put you off studying abroad, but it is worth preparing for, especially if your destination's culture is very different from home. Experiencing something new is one of the most rewarding parts of studying abroad, both personally and professionally.",
    image: "/pages/destination/destination8.jpg",
    alt: "Student experiencing a new culture abroad",
    imageFirst: false,
  },
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

const page = () => {
  return (
    <>
      <InnerHero
        heading="Destination Selection"
        eyebrow="Counselling Services"
        image={{
          src: "/pages/post-banner.jpg",
          alt: "Student weighing study destinations with Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* How to choose where to study — text + globe image */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                How To Choose Where To Study?
              </h2>
              <p>
                An experience abroad is seen as indispensable on a
                student&apos;s resume, and more students choose to study in
                a different country every year. Universities have long
                recognised the value of internationalisation, both for
                themselves and for their students. Choosing where to study
                abroad is probably the most important decision a student
                makes, though choosing a subject area is usually the easy
                part, go with what interests you, or what you already have
                experience in. There is a lot to weigh up during your{" "}
                <span className="font-medium text-ruby-600">
                  destination selection
                </span>
                .
              </p>
            </div>

            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[1.5rem]">
              <Image
                src="/pages/destination/destination1.jpg"
                alt="Globe showing possible study destinations"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Questions to think about — branded graphic + white card */}
        <div className="bg-ink/[0.03] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-[1.5rem]">
                <Image
                  src="/pages/destination/destination2.jpg"
                  alt="Choose a destination you would love to study in"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-ember/50 via-ember/30 to-ink/70" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-10 text-center text-white">
                  <span className="font-display text-3xl font-bold tracking-wide">
                    RGR
                  </span>
                  <div className="h-px w-16 bg-white/70" />
                  <p className="font-display text-lg font-bold uppercase leading-snug sm:text-xl">
                    Choose A Destination That You Would Love To Study In
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <p className="font-semibold text-ink">
                  You should think about the next set of questions during
                  your destination selection:
                </p>
                <div className="mt-4">
                  <BulletList items={QUESTIONS} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial + CTA */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <blockquote className="max-w-2xl border-l-4 border-ruby-600 pl-6 text-[0.95rem] italic leading-relaxed text-ink/75 sm:text-base">
            <p>
              &ldquo;Ruhe Global Resources came highly recommended, and they
              delivered efficiently. From the application process to my
              arrival in the UK, the whole team went above and beyond to
              make sure everything ran smoothly.&rdquo;
            </p>
            <footer className="mt-3 text-sm font-semibold not-italic text-ink">
              Kelechi Onuoha
            </footer>
          </blockquote>

          <a
            href="/contact"
            className="mt-8 inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
          >
            Get Help Choosing A Destination
          </a>
        </div>

        {/* Factors to consider */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Factors To Consider During Your Destination Selection Stage
            </h2>

            <div className="mt-10 space-y-14">
              {FACTORS.map((factor) => (
                <div
                  key={factor.title}
                  className="grid gap-8 lg:grid-cols-2 lg:items-center"
                >
                  {factor.imageFirst ? (
                    <>
                      <div className="relative aspect-[4/3] max-wd-sm w-full overflow-hidden rounded-[1.5rem]">
                        <Image
                          src={factor.image}
                          alt={factor.alt}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
                          {factor.title}
                        </h3>
                        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                          {factor.copy}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
                          {factor.title}
                        </h3>
                        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                          {factor.copy}
                        </p>
                      </div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem]">
                        <Image
                          src={factor.image}
                          alt={factor.alt}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-14 text-[0.95rem] font-semibold text-ink sm:text-base">
              Good luck with your destination selection.
            </p>
          </div>
        </div>


        {/* CTA */}
        <div className="container mx-auto px-8 pb-16 pt-2 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Have You Decided On Your Country And University?
            </h2>
            <p className="max-w-xl text-white/70">
              Let us get you admission and process your study visa from
              here.
            </p>
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