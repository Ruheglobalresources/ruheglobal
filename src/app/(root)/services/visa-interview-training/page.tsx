// src/app/(root)/services/visa-interview-services/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import { Target, Users, Clock } from "lucide-react";
import InnerHero from "@/components/Inner-hero";

export const metadata: Metadata = {
  title: "Visa Interview Training - RGR Visa Interview Services",
  description:
    "Visa interview training pairs you with a consultant for realistic mock interviews, so you walk into your real interview prepared and confident.",
};

const PROCESS_CARDS = [
  {
    icon: Target,
    title: "Why Preparation Matters",
    copy: "Walking in prepared keeps you focused on your actual plans and helps you avoid the vague or inconsistent answers that raise questions during the interview.",
  },
  {
    icon: Users,
    title: "Who Guides You",
    copy: "A dedicated interview consultant sits down with you for a detailed discussion of what the officer wants to hear and how to structure your answers around it.",
    cta: true,
  },
  {
    icon: Clock,
    title: "How Long It Takes",
    copy: "The number of sessions depends on how quickly your communication and your story come together. Some candidates need only a few rounds, others prefer more practice.",
    cta: true,
  },
];

const page = () => {
  return (
    <>
      <InnerHero
        heading="Visa Interview Training"
        eyebrow="Visa Interview Services"
        image={{
          src: "/pages/visa-interview-banner.jpg",
          alt: "Visa interview training session with Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* What is visa interview training — text + image, side by side */}
        <div className="container mx-auto grid gap-8 px-8 py-14 md:px-10 lg:px-12 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              What Is Visa Interview Training?
            </h2>
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <p>
                Visa interview training pairs you with one of our
                consultants for realistic mock interviews, so the questions
                you will face on the day feel familiar rather than
                intimidating. We walk through the kind of questions an
                officer is likely to ask for your specific relocation,
                whether that is for study, work or another purpose, and
                help you shape clear, confident answers.
              </p>
              <p>
                Sessions run as often as you need them. Most candidates need
                a handful of rounds before their communication and their
                story come together, but we keep going until you are ready
                to walk into the real interview with confidence.
              </p>
            </div>
            <a
              href="/contact"
              className="inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
            >
              Send Us A Message
            </a>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.5rem]">
            <Image
              src="/pages/visa-interview1.jpg"
              alt="Candidate rehearsing for a visa interview"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Standalone image */}
        <div className="container mx-auto px-8 pb-14 md:px-10 lg:px-12">
          <div className="relative mx-auto aspect-[1024/420] w-full overflow-hidden rounded-[1.5rem]">
            <Image
              src="/pages/visa-interview2.jpg"
              alt="Visa interview coaching session with a Ruhe consultant"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* How it works — three cards */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              How Visa Interview Training Works
            </h2>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              Preparation is what separates a candidate who hesitates from
              one who answers with clarity. Here is what goes into getting
              you ready.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {PROCESS_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ruby-600/10 text-ruby-600">
                    <card.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="text-lg font-bold text-ink">{card.title}</h3>
                  <p className="text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                    {card.copy}
                  </p>
                  {card.cta && (
                    <a
                      href="/contact"
                      className="mt-auto text-sm font-semibold text-ruby-600 hover:underline"
                    >
                      Contact Us To Know More
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How RGR can assist — full-width text, matches Benefits layout */}
        <div className="py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <div className="max-w-3xl space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                How Can Ruhe Global Resources Assist You?
              </h2>
              <p>
                Our consultants have years of experience guiding candidates
                from every background through their visa interviews. We
                give you the guidance and the practice you need to answer
                with confidence, whatever your destination or purpose of
                travel.
              </p>
              <a
                href="/contact"
                className="inline-block font-semibold text-ruby-600 hover:underline"
              >
                Contact Us To Know More
              </a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="container mx-auto px-8 pb-16 pt-2 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Ready To Prepare For Your Visa Interview?
            </h2>
            <p className="max-w-xl text-white/70">
              Talk to our consultants and we will build a training plan
              around your interview, from your first mock session to the
              real thing.
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