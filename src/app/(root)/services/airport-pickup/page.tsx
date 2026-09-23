// src/app/(root)/services/airport-pickup/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";
import { Reveal } from "@/components/motion/Reveal";
import { FaqAccordion, type FaqItem } from "@/components/Faq-accordion";

export const metadata: Metadata = {
  title: "Airport Pickup - RUHE Global Resources",
  description:
    "With our Airport pickup you don't get stuck having to wait in line at the arrivals for a taxi with your suitcase when you can easily book a cab with us in advance.",
};

const HERO_IMAGE = {
  src: "/pages/airport1.jpg",
  alt: "Airport pickup",
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "pre-arrange",
    question: "When should I pre-arrange my airport pickup?",
    answer: "It is wise to book your airport pickup 24 hours prior to your travel time.",
  },
  {
    id: "fixed-prices",
    question: "Are your prices fixed?",
    answer:
      "Yes, the prices are fixed for pre-booked transfers. In case of a flight delay, the first 30 minutes of waiting time are included in the price for drop-offs. Please note that any additional waiting time will be charged plus additional parking charges.",
  },
  {
    id: "driver-contact",
    question: "How will the cab or taxi driver contact me?",
    answer: (
      <>
        We will provide a contact number for our rider on confirmation of booking and
        you can call them whenever you want. If you require support on your previous
        bookings or need any additional support, you can drop an email at{" "}
        <a
          href="mailto:admissions@ruheglobalresources.com"
          className="font-medium text-ember hover:underline"
        >
          admissions@ruheglobalresources.com
        </a>
        .
      </>
    ),
  },
  {
    id: "refunds",
    question: "Will I be refunded for any cancellations?",
    answer: (
      <>
        <p>Refunds will not be issued in certain instances, including:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>No refund is made if the passenger does not show up for pre-paid journeys.</li>
          <li>
            No refund is made for cancellation of a booking with less than 24 hours'
            notice provided or afterwards.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "booking-details",
    question: "What are the details that I need to provide to book airport pickup?",
    answer:
      "To book your airport pickup, we would need your travel details such as pickup date, time, location, and ride type.",
  },
];

const page = () => {
  return (
    <>
      <InnerHero
        heading="Airport Pickup Services"
        eyebrow="Airport Pickup"
        image={{
          src: "/pages/pickup.jpg",
          alt: "Airport pickup services with Ruhe Global Resources",
        }}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Airport Pickup" }]}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* Intro — text + the same photo the source page uses (it only has
            the one image, referenced as both the OG image and the inline
            body photo), so it's reused here the same way. */}
        <div className="container mx-auto px-8 py-6 md:px-10 lg:px-12">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Airport Pickup
            </h2>
          </Reveal>

          <div className="mt-6 grid gap-8 lg:grid-cols-[2.5fr_1.5fr] lg:items-center">
            <Reveal delay={0.05} className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <p>
                Don't get stuck having to wait in line at the arrivals for a taxi with
                your suitcase when you can easily book a cab with us in advance. With
                the help of our pick-up services we have your airport pickup covered.
              </p>
              <p>
                Even if you're getting picked up from the airport to go to your{" "}
                <a
                  href="http://accomodationfinders.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ember hover:underline"
                >
                  accommodation
                </a>{" "}
                or anywhere you want, we have a range of exclusive luxury airport
                taxis to suit your needs, as well as for all your luggage.
              </p>
              <p>
                We also have in mind that this is a time when health and safety are of
                the utmost importance which is why we have introduced precautionary
                measures on all our rides.
              </p>
              <p>
                Your airport pickup can be booked from anywhere at the click of a
                button and we'll make sure we drop you off at your destination in no
                time. So, go on and book a safe beginning for your journey ahead.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
              <Image
                src={HERO_IMAGE.src}
                alt={HERO_IMAGE.alt}
                fill
                className="object-cover"
              />
            </Reveal>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-ember">
                FAQ
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                Most frequent questions and answers about our Airport Pickup service
              </h2>
            </Reveal>

            <Reveal delay={0.05} className="mx-auto mt-10 max-w-3xl">
              <FaqAccordion items={FAQ_ITEMS} />
            </Reveal>
          </div>
        </div>

        {/* CTA — the source page has no banner heading here, just the button,
            so this stays a plain centered CTA rather than the boxed banner
            used on flight-processing. */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <Reveal className="flex justify-center">
            <a
              href="/contact"
              className="inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
            >
              Order a Pickup
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default page;