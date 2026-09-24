// src/app/(root)/services/summer-school/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";

export const metadata: Metadata = {
  title: "Summer School Services - RGR Summer School Services",
  description:
    "Summer school guidance from Ruhe Global Resources, helping students find a short programme abroad that fits their goals, budget and timeline.",
};

const REASONS = [
  {
    title: "Learn Something New",
    copy: "Many students use summer school to pick up a skill or subject that either complements their main course or has nothing to do with it at all. Most programmes lean non academic, so you can broaden your experience without waiting for a break in your actual degree.",
  },
  {
    title: "Settle Into A New Environment",
    copy: "A few weeks abroad ahead of the main term gives you a low pressure way to adjust to a new country, its food, weather, people and pace of life, before your full university workload begins.",
  },
  {
    title: "Sharpen Your Academics",
    copy: "Whether it is English language, the sciences, computer science or a commercial subject, classes taught by a different set of teachers with a different teaching style can genuinely move the needle for a student.",
  },
  {
    title: "Build Teamwork And Leadership Skills",
    copy: "Strong summer school curricula put students into activities they have not tried before, building skills they did not know they had and giving them real practice working and studying as part of a group.",
  },
  {
    title: "Meet Students From Everywhere",
    copy: "International summer schools bring together students from different countries, races, religions and cultures. We make a point of placing students where they will meet people from as many different backgrounds as possible.",
  },
];

function ReasonList({ items }: { items: { title: string; copy: string }[] }) {
  return (
    <ol className="space-y-8">
      {items.map((item, i) => (
        <li key={item.title} className="flex gap-4">
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ruby-600 text-sm font-bold text-white">
            {i + 1}
          </span>
          <div>
            <h3 className="text-lg font-bold text-ink">{item.title}</h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              {item.copy}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

const page = () => {
  return (
    <>
      <InnerHero
        heading="Summer School Services"
        eyebrow="RGR Summer School Services"
        image={{
          src: "/pages/summer-banner.jpg",
          alt: "Students attending a summer school programme abroad",
        }}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* What is summer school — full width text */}
        <div className="py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <div className="max-w-3xl space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                What Is Summer School?
              </h2>
              <p>
                A summer school is a short programme run over the summer
                break, when most universities and colleges are between
                terms. It gives students a way to get ahead on credits,
                make up ground after an absence or a tough term, or round
                out their education with something beyond their usual
                coursework. Programmes typically run for four to eight
                weeks between June and September, and students stay on
                site for the duration.
              </p>
              <p>
                None of this is compulsory. Nobody is under any pressure to
                attend, summer school is simply an option worth
                considering.
              </p>
            </div>
          </div>
        </div>

        {/* Reasons to attend */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Reasons To Attend Summer School
            </h2>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              There are real benefits to summer school, especially for
              students coming from abroad.
            </p>

            <div className="mt-10 max-w-3xl">
              <ReasonList items={REASONS} />
            </div>
          </div>
        </div>

        {/* How do I apply — text + single image */}
        <div className="py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12 md:grid md:grid-cols-[1fr_1.2fr] md:items-center md:gap-x-10">
            <div className="max-w-3xl flex flex-col items-center justify-center space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                How Do I Apply For Summer School?
              </h2>
              <p>
                Countries like the UK and the United States run some of the
                best regarded summer schools for international students.
                Talk to us about what you are looking for and we will
                research and recommend a programme that actually fits,
                rather than the first one that turns up in a search.
              </p>
            </div>

            <div className="relative mx-auto mt-8 aspect-[1024/683] w-full max-w-3xl overflow-hidden rounded-[1.5rem]">
              <Image
                src="/pages/summer.jpg"
                alt="Students in a summer school classroom abroad"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="container mx-auto px-8 pb-16 pt-2 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Do You Want Your Child To Go For A Summer School Abroad?
            </h2>
            <a
              href="/contact"
              className="mt-2 inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
            >
              Register Them Today
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default page;