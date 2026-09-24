// src/app/(root)/contact/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";
import ContactForm from "@/components/Contactform";

export const metadata: Metadata = {
  title: "Contact - RUHE Global Resources",
  description:
    "For any inquiries relating to Canada express entry, UK family migration, work and visit/tourism visas, get in touch with Ruhe Global Resources.",
};

type Office = {
  title: string;
  heading: string;
  numbers: { label: string; values: string[] };
  mapQuery: string;
};

const OFFICES: Office[] = [
  {
    title: "United Kingdom Office",
    heading: "Visit our United Kingdom Office",
    numbers: { label: "UK Contact Number", values: ["+447592100269"] },
    mapQuery: "Rosebay Road, Desborough, NN142JS",
  },
  {
    title: "Head Office",
    heading: "Visit our Head Office",
    numbers: {
      label: "Abuja Contact Numbers",
      values: ["+2347079188996", "+2348148326990"],
    },
    mapQuery: "2nd Floor . 16 Gwani Street, Wuse Zone 4 Abuja",
  },
//   {
//     title: "Lagos Branch Office",
//     heading: "Visit our Lagos branch office",
//     numbers: {
//       label: "Lagos Contact Numbers",
//       values: ["+2347079188996", "+2348148326990"],
//     },
//     mapQuery: "12 omotayo ojo street ikeja",
//   },
];

function mapEmbedSrc(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    query
  )}&t=m&z=10&output=embed&iwloc=near`;
}

const page = () => {
  return (
    <>
      <InnerHero
        heading="Contact Us"
        eyebrow="Get In Touch"
        image={{
          src: "/pages/contact-banner.jpg",
          alt: "Contact Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* Intro + form */}
        <div className="container mx-auto grid gap-10 px-8 py-14 md:px-10 lg:px-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
              <Image
                src="/pages/contact.jpg"
                alt="Contact Ruhe Global Resources"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              For any inquiries relating to Canada express entry, UK family
              migration, work and visit/tourism visas, reach out and a
              member of our team will get back to you.
            </p>
          </div>

          <ContactForm />
        </div>

        {/* Offices */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
              Our Offices
            </h2>

            <div className="mt-10 grid gap-10 lg:grid-cols-3">
              {OFFICES.map((office) => (
                <div
                  key={office.title}
                  className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]"
                >
                  <h3 className="font-display text-lg font-bold text-ink">
                    {office.heading}
                  </h3>

                  <p className="text-sm text-ink/75">
                    <span className="font-semibold text-ink">
                      {office.numbers.label}:
                    </span>{" "}
                    {office.numbers.values.join(", ")}
                  </p>

                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                    <iframe
                      src={mapEmbedSrc(office.mapQuery)}
                      title={office.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full border-0"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default page;