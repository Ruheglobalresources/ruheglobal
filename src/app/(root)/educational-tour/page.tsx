// src/app/(root)/educational-tour/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";

export const metadata: Metadata = {
  title: "Educational Tour And Its 5 Best Benefits",
  description:
    "At Ruhe Global Resources we introduce your students to educational tours to world renowned schools in different cities around the world. Discover the benefits and what RGR can do for you.",
};

const BENEFITS = [
  {
    title: "Instilling the love of travelling",
    copy: "The learning becomes more delightful through travels and the students have a wider understanding of the world. Some students might even acknowledge their passion for knowing more about countries and different ways of life and turn it into a successful career in life.",
  },
  {
    title: "Interrelating with locals",
    copy: "When students go on an educational tour, they will interact with people from different cultures. Not only will they learn about different values and perspectives, but they will also learn about different aspects of social relations, like local dishes or quality topics of discussion.",
  },
  {
    title: "Cultural study",
    copy: "During our educational tour, students experience the variation of different cultures. During the educational tour, we participate in volunteering or mixing with people from socioeconomic backgrounds. These experiences help students develop a conception of how the economy of a country is run, what improvement is needed and what scope there is for development.",
  },
  {
    title: "Student improvement",
    copy: "An educational tour far from your residence and place of learning promotes independence, authority skills and communication skills. Most students will understand how to surpass the hurdles of language and understand how to talk to people across boundaries. The educational tour experience will also make the student become self reliant and build up values and priorities that will help them in life in the future. Travel also makes most students build up strong personalities.",
  },
  {
    title: "Exchanging ideas",
    copy: "Going on an educational tour brings about the best informal arrangement for interactive discussion. The most productive tools for education are group discussions. A student's interest in his or her studies can be reactivated during group studies. Real life experiences, like going to the science museum, museum of history, or factory visits, are extremely amusing during an educational tour.",
  },
];

const RGR_CAN_DO = [
  "We will exceed your expectations. Customer experience is the most major part of everything we do. Every move we make is based on making sure our client is satisfied. We also make sure it is as perfect as possible.",
  "We always travel responsibly. We collaborate with local partners to make sure where we are going is safe and free from all problems. We carefully research each destination we are going to avoid any problems during the educational tour.",
  "We strive to be innovative and aim to be perfect. At Ruhe Global Resources, we value innovation and perfection in all areas we work. We aim to find the perfect way to do new things.",
  "We are with you throughout the journey. We pay attention to every detail of our tour before you book to make sure that there are no complications. We look at every smallest detail so that your tour will be worthwhile for you and you will end your tour with an experience you will never forget.",
];

function OrderedList({ items }: { items: string[] }) {
  return (
    <ol className="mt-4 space-y-2 list-inside list-decimal">
      {items.map((item, i) => (
        <li key={i} className="text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
          {item}
        </li>
      ))}
    </ol>
  );
}

const page = () => {
  return (
    <>
      <InnerHero
        heading="Educational Tour"
        eyebrow="RGR Educational Tour Services"
        image={{
          src: "/pages/tour/tour-banner.jpeg",
          alt: "Educational tour with Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="bg-white">
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <div className="grid gap-x-10 gap-y-10 lg:grid-cols-2 lg:items-start">
            {/* Row 1 */}
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base lg:pr-4">
              <p>
                At Ruhe Global Resources, we introduce your students to
                educational tours to world renowned schools in different
                cities around the world. Whatever course the student wishes
                to study, or is studying, from science to humanities, RGR
                will create an amazing educational tour experience that will
                not only leave the student with a sense of achievement but
                also give them a good start to think outside of the box to
                achieve great things in their field of study.
              </p>
              <p>
                We will arrange exceptional educational school tours from
                initial concept to departure day. At the end of the tour, we
                will prepare a debrief to ensure our educational travel
                tours continue to meet the high standards expected.
              </p>
            </div>

            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src="/pages/tour/tour1.jpg"
                alt="Students on an educational tour"
                fill
                className="object-cover"
              />
            </div>

            {/* Row 2 */}
            <div className="text-[0.95rem] leading-relaxed text-ink/75 sm:text-base lg:pr-4">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                Benefits Of An Educational Tour
              </h2>
              <p className="mt-4">
                Let&apos;s look at the different benefits that educational
                tours have to offer:
              </p>

              <div className="mt-6 space-y-5">
                {BENEFITS.map((benefit) => (
                  <div key={benefit.title}>
                    <h3 className="text-base font-bold text-ink sm:text-lg">
                      {benefit.title}
                    </h3>
                    <p className="mt-1">{benefit.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative aspect-[3/2] w-full overflow-hidden">
                <Image
                  src="/pages/tour/tour2.jpg"
                  alt="Educational tour destination"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/2] w-full overflow-hidden">
                <Image
                  src="/pages/tour/tour3.jpg"
                  alt="Educational tour"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="text-[0.95rem] leading-relaxed text-ink/75 sm:text-base lg:pr-4">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                What Ruhe Global Resources Can Do For You
              </h2>
              <OrderedList items={RGR_CAN_DO} />
            </div>

            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src="/pages/tour/tour4.png"
                alt="Ruhe Global Resources educational tour support"
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
              We Can Register You Or Your Children For An Educational Tour
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