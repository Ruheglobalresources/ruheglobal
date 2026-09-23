// src/app/(root)/services/flight-processing/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Flight Processing - RUHE Global Resources",
  description:
    "In terms of precedence, processing your flights and getting your visa should be number 1 on the list. Ruhe Global Resources helps clients book and manage their flights to and from their university abroad.",
};


const HERO_IMAGE = {
  src: "/pages/flight2.jpg",
  alt: "Flight Processing",
};

const BOOKING_ASSIST_IMAGE = {
  src: "/pages/flight1.jpg",
  alt: "Booking a flight ticket with Ruhe Global Resources",
};

const page = () => {
  return (
    <>
      <InnerHero
        heading="Booking & Reservation Services"
        eyebrow="Flight Processing Services"
        image={HERO_IMAGE}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Flight Processing" }]}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* Intro — text + the same hero photo used inline, matching the
            source page's own reuse of this image in both places. */}
        <div className="container mx-auto px-8 py-6 md:px-10 lg:px-12">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Flight Processing
            </h2>
          </Reveal>

          <div className="mt-6 grid gap-8 lg:grid-cols-[2.5fr_1.5fr] lg:items-center">
            <Reveal delay={0.05} className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <p>
                In terms of precedence, processing your flights and getting
                your visa should be number one on the list. At its
                simplest, the process is pretty much what it sounds like —
                and when you're booking flights for your travels abroad,
                there isn't much more you have to consider.
              </p>
              <p>
                Most airlines will allow you to check two suitcases with no
                charge on an international flight. For some people, you may
                have to check a third bag, and that can be costly. There
                isn't really a way around this — just be aware of what the
                costs are, and compare airlines, as there's a chance some
                might charge you even for a second bag.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
              <Image
                src="/pages/flight3.jpg"
                alt="Student booking a flight ticket with Ruhe Global Resources"
                fill
                className="object-cover"
              />
            </Reveal>
          </div>

          <Reveal delay={0.05} className="mt-8 max-w-4xl space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            <p>
              The start date of the semester is usually set in stone, so
              there's no question when you'll need to be there. The end of
              the semester is a different story. When you first book your
              flight, coordinate your return flight with the last day of
              exams. Exam periods can last up to two weeks at most
              universities, so unfortunately, you may not know your finals
              schedule until mid-semester at the earliest. While it's
              usually best to stay as long as possible, if you're done at
              the beginning of the first week, you may not want to. Some
              airlines will charge you more to change your return date,
              others might do it free of charge. You never know what might
              pop up during your semester or year that would require you to
              change your flight home — you can also consider not booking a
              return flight until once you've started your semester and can
              get a feel for what the rest of your schedule will be like.
            </p>
          </Reveal>
        </div>

        {/* How RGR helps + supporting image */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1.5fr_2.5fr] lg:items-center">
              <Reveal className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
                <Image
                  src={BOOKING_ASSIST_IMAGE.src}
                  alt={BOOKING_ASSIST_IMAGE.alt}
                  fill
                  className="object-cover"
                />
              </Reveal>

              <Reveal delay={0.05}>
                <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                  How Ruhe Global Resources Helps
                </h2>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                  At Ruhe Global Resources, we assist our clients in
                  processing their flight tickets to and from their
                  university abroad. We specialize in choosing a great and
                  safe airline, backed by years of experience.
                </p>
              </Reveal>
            </div>
          </div>
        </div>

        {/* CTA banner */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <Reveal className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Do You Want To Get A Flight Ticket To Travel To Any Country?
            </h2>
            <a
              href="/contact"
              className="mt-2 inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
            >
              Contact Us Today
            </a>
          </Reveal>
        </div>

       
      </section>
    </>
  );
};

export default page;