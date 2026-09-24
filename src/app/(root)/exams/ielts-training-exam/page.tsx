// src/app/(root)/ielts-training-exam/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";
import { FaqAccordion, type FaqItem } from "@/components/Faq-accordion";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "IELTS Training & Exam - RUHE Global Resources",
  description:
    "For higher education and global migration, the International English Language Testing System (IELTS) is the world's most popular English language proficiency test.",
};

const WHY_IELTS = [
  "Widely accepted.",
  "It will help you get into international universities.",
  "It's great for your career.",
  "It covers American and British English.",
];

const PREP_FAQ_ITEMS: FaqItem[] = [
  {
    id: "improve-english",
    question: "Improve your English language skills",
    answer: (
      <div className="space-y-3">
        <p>
          Focusing solely on the IELTS is among the biggest mistakes that
          students make. They take multiple IELTS practice tests but fail
          to work on their English.
        </p>
        <p>
          A lot of IELTS test takers have no idea what level of English
          they currently speak, which is often Intermediate or less, and
          they usually neglect or forget that the IELTS is an English
          competence test. As a result, we expect that you speak excellent
          English.
        </p>
        <p>
          Understand that when preparing for the IELTS exam you need to be
          patient. It usually takes 12 weeks to advance one scoring band.
        </p>
      </div>
    ),
  },
  {
    id: "reading-skills",
    question: "Perfect a variety of your reading skills",
    answer: (
      <div className="space-y-3">
        <p>
          The reading module&apos;s sole function is to evaluate a variety
          of your reading abilities. Reading strategies include getting
          the gist, reading for primary concepts, reading for specifics,
          skimming, comprehending a logical argument, and identifying the
          viewpoints, attitudes, and goals of the author.
        </p>
        <p>
          Short answers, information matching, whole phrases, heading
          matching, and comprehensive diagram labeling are all required of
          test takers.
        </p>
        <p>
          Make sure you practice with a variety of questions so that you
          get used to them all.
        </p>
      </div>
    ),
  },
  {
    id: "speak-face-to-face",
    question:
      "Speak clearly and fluently when speaking to someone face to face",
    answer: (
      <div className="space-y-3">
        <p>
          You have to develop the habit of putting to use what you learnt
          during your IELTS tutorials when speaking to your family and
          friends because it will help you in improving your IELTS
          speaking skill.
        </p>
        <p>
          The IELTS speaking test consists of three sections and lasts
          less than 15 minutes. Introductions and general conversation
          between the test taker and the examiner are allowed to take up
          the first five minutes. The capacity to speak about a seemingly
          random topic that is presented on a task card is evaluated in
          the second section. The last section only makes the second half
          more complicated. At this point, the examiner will also focus
          on fluency, lexical resource, and pronunciation during the
          IELTS exam.
        </p>
      </div>
    ),
  },
  {
    id: "test-format",
    question: "Understand the test format",
    answer: (
      <div className="space-y-3">
        <p>
          It is extremely crucial that you are aware of the test format
          before you start to prepare. Review the test&apos;s subject
          matter and the question and task formats for each section to
          become familiar with it.
        </p>
        <p>
          Remember that familiarity with the test format and pattern is
          essential for success in any exam, not just the IELTS.
        </p>
      </div>
    ),
  },
  {
    id: "practice-test",
    question: "Sign up for an IELTS practice test",
    answer: (
      <p>
        At Ruhe Global Resources we will take you for a practice test or
        IELTS mock test to know how good you are. With this, we will know
        if you are ready to write the exam or not.
      </p>
    ),
  },
];

const SOLO_PRICING = [
  { weeks: "One Week", cost: "15,000" },
  { weeks: "Two Weeks", cost: "25,000" },
  { weeks: "Three Weeks", cost: "40,000" },
];

const PAIR_PRICING = [
  { weeks: "One Week", cost: "25,000" },
  { weeks: "Two Weeks", cost: "40,000" },
  { weeks: "Three Weeks", cost: "60,000" },
];

function PricingTable({ rows }: { rows: { weeks: string; cost: string }[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10">
      <table className="w-full text-left text-[0.95rem] sm:text-base">
        <thead>
          <tr className="bg-ink text-white">
            <th className="px-6 py-3 font-semibold">Number of Weeks</th>
            <th className="px-6 py-3 font-semibold">Cost (₦)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.weeks}
              className={i % 2 === 0 ? "bg-white" : "bg-ink/[0.02]"}
            >
              <td className="px-6 py-3 text-ink/75">{row.weeks}</td>
              <td className="px-6 py-3 text-ink/75">{row.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const page = () => {
  return (
    <>
      <InnerHero
        heading="IELTS Training & Exam"
        eyebrow="RGR IELTS Training & Exam"
        image={{
          src: "/pages/exams/ielt-banner.jpg",
          alt: "IELTS training with Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* Definition */}
        <div className="container mx-auto px-8 py-10 md:px-10 lg:px-12">
          <div className="max-w-3xl space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Definition Of IELTS
            </h2>
            <p>
              For higher education and{" "}
              <a href="/" className="font-medium text-ruby-600 hover:underline">
                global migration
              </a>
              , the International English Language Testing System (IELTS) is
              the world&apos;s most popular English language proficiency
              test.
            </p>
          </div>
        </div>

        {/* Why take IELTS */}
        <div className="py-10">
          <div className="container mx-auto grid px-8 md:px-10 lg:px-12 lg:grid-cols-2 lg:items-center">
            {/* Overlapping image pair */}
            <div className="relative w-full">
              <div className="relative aspect-[3/4] w-[80%] overflow-hidden">
                <Image
                  src="/pages/exams/ielt1.jpg"
                  alt="Student preparing for the IELTS exam"
                  fill
                  className="object-cover"
                />
              </div>
              
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                Why Take IELTS?
              </h2>

              <div className="mt-6 space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                <p>
                  <a
                    href="https://www.ielts.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ruby-600 hover:underline"
                  >
                    IELTS
                  </a>{" "}
                  is trusted by more than 11,000 organizations worldwide, so
                  you may take the test knowing that it will be accepted by
                  universities, employers, governments, and professional
                  organizations all across the world.
                </p>
                <p>
                  IELTS, which helped establish the four skill English
                  language testing format 30 years ago, is still the gold
                  standard for English language exams today. IELTS is used by
                  the governments of Australia, Canada, New Zealand, and the{" "}
                  <a
                    href="/study-in-united-kingdom"
                    className="font-medium text-ruby-600 hover:underline"
                  >
                    United Kingdom
                  </a>{" "}
                  to process immigration requests.
                </p>
                <p>Other reasons for writing the exam are:</p>
              </div>

              <ul className="mt-4 space-y-2">
                {WHY_IELTS.map((reason) => (
                  <li
                    key={reason}
                    className="flex items-start gap-2 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base"
                  >
                    <Check className="mt-1 h-4 w-4 shrink-0 text-ruby-600" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* How to prepare */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
            How To Prepare For Your IELTS Exam
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            After you have attended our IELTS tutorials, you have to
            practise some of the things that you were taught by our tutors
            to develop yourself.
          </p>

          <div className="mx-auto mt-10 max-w-3xl">
            <FaqAccordion items={PREP_FAQ_ITEMS} />
          </div>
        </div>

        {/* Register / pricing */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
              Register for IELTS Tutorials
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              The training fees of Ruhe Global Resources vary as a result of
              various criteria. Each week of training has three days of
              lessons, which are Monday, Wednesday and Thursday.
            </p>

            <div className="mx-auto mt-8 max-w-xl">
              <PricingTable rows={SOLO_PRICING} />
            </div>

            <p className="mx-auto mt-8 max-w-3xl text-center text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              However, Ruhe Global Resources provides discounts for
              candidates who come in pairs. For a pair of two people the
              fees include:
            </p>

            <div className="mx-auto mt-8 max-w-xl">
              <PricingTable rows={PAIR_PRICING} />
            </div>

            <p className="mx-auto mt-8 max-w-3xl text-center text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              Online classes and extra time classes cost an extra fee of
              ₦10,000 (ten thousand naira).
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Have Any Question For Us?
            </h2>
            <a
              href="/contact"
              className="mt-2 inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
            >
              Register For Our Tutorial Today
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default page;