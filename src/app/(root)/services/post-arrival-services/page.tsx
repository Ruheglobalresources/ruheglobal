// src/app/(root)/services/post-arrival-services/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";

export const metadata: Metadata = {
  title: "Post Arrival Services - RGR Post Arrival Services",
  description:
    "Post arrival support from Ruhe Global Resources, covering accommodation, airport pickup, transport, part time work and settling into life abroad.",
};

const SUPPORT_ITEMS = [
  { text: "Accommodation arrangement" },
  { text: "Airport pickup services" },
  { text: "Local transportation and travel" },
  { text: "Part time job assistance" },
  { text: "Assessing part time job offers" },
  { text: "Advice on lifestyle and culture" },
  { text: "Practical advice on living" },
  {
    text: "Immigration, PR and work permits",
    href: "https://www.canada.ca/en/services/immigration-citizenship.html",
    external: true,
  },
  { text: "Do's and don'ts in a foreign country" },
];

const page = () => {
  return (
    <>
      <InnerHero
        heading="Post Arrival Services"
        eyebrow="RGR Post Arrival Services"
        image={{
          src: "/pages/post-banner.jpg",
          alt: "Student settling into life abroad with Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="bg-white">
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <div className="grid gap-x-10 gap-y-10 lg:grid-cols-2 lg:items-start">
            {/* Row 1 */}
            <div className="space-y-6 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base lg:pr-4">
              <p>
                We provide assistance even after you reach your dream
                country. It is crucial to feel comfortable in a completely
                unfamiliar destination, so our auxiliary services for
                studying abroad cover travel assistance, accommodation
                assistance and foreign exchange. We make sure you feel
                welcomed the moment you arrive at your dream university, and
                you can lean on past students already studying there to
                help you understand the lifestyle and culture and settle
                into life overseas.
              </p>
              <p>
                Our experienced counsellors will help you choose the best
                option out of our services with regards to{" "}
                <a
                  href="/services/airport-pickup"
                  className="font-medium text-ruby-600 hover:underline"
                >
                  airport pick-ups
                </a>
                , accommodation, insurance, foreign exchange, medical
                provisions, part time jobs and more.
              </p>
            </div>

            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src="/pages/post1.jpg"
                alt="Traveller heading to the airport with a passport and boarding pass"
                fill
                className="object-cover"
              />
            </div>

            {/* Row 2 */}
            <div className="space-y-6 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base lg:pr-4">
              <p>
                Seminars and events are also organized from time to time for
                the same purpose. They include an explanation of the
                immigration process, information about student life in
                foreign countries, a chance to talk to our experienced
                counsellors, and an introduction to services useful to
                overseas students, all to make sure you are well settled at
                the{" "}
                <a
                  href="/services/admission-processing"
                  className="font-medium text-ruby-600 hover:underline"
                >
                  University
                </a>
                .
              </p>
              <p>
                Our relationship does not end once you fly away. It just
                starts all over again. Our counsellor remains available
                around the clock to make sure you have no difficulty at all
                during your entire stay, helping you choose the best option
                out of our tried and tested resources for airport pick-ups,
                accommodation, insurance, foreign exchange, medical
                provisions, part time jobs and more.
              </p>
            </div>

            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src="/pages/post2.jpg"
                alt="Student checking the departures board at the airport"
                fill
                className="object-cover"
              />
            </div>

            {/* Row 3 */}
            <div className="text-[0.95rem] leading-relaxed text-ink/75 sm:text-base lg:pr-4">
              <p>
                Our doors are always open for your parents too, in case they
                face any difficulty while you are away.
              </p>
              <ol className="mt-4 list-inside list-decimal space-y-2">
                {SUPPORT_ITEMS.map((item) =>
                  item.href ? (
                    <li key={item.text}>
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className="font-medium text-ruby-600 hover:underline"
                      >
                        {item.text}
                      </a>
                    </li>
                  ) : (
                    <li key={item.text}>{item.text}</li>
                  )
                )}
              </ol>
            </div>

            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src="/pages/post3.jpg"
                alt="Counsellor guiding a group of students at their laptops"
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
              Ruhe Global Resources Helps With Post Arrival Services
            </h2>
            <p className="max-w-xl text-white/70">
              We can make life easier the moment you land in a new country,
              from your first day through to fully settling in.
            </p>
            <a
              href="/contact"
              className="mt-2 inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
            >
              Contact Us Now
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default page;