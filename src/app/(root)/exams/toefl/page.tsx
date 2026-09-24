// src/app/(root)/toefl/page.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import InnerHero from "@/components/Inner-hero";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

const TOEFL_BENEFITS = [
  "We have experienced tutors who have taught more than 200 students in the past 7 years.",
  "We can register for our online classes if you don't live close to our offices.",
  "Our students who registered for our tutorials have a 90% success rate.",
  "We have a very good and flexible payment plan for our students.",
];

const PBT_SECTIONS = [
  {
    title: "Writing Section",
    detail: "About 50 minutes to write two constructed responses.",
  },
  {
    title: "Listening Section",
    detail:
      "Two conversations, three lectures, and approximately 28 questions to answer in 41 minutes.",
  },
  {
    title: "Reading Section",
    detail:
      "Three passages, each with ten multiple-choice questions, to answer in 54 minutes.",
  },
];

const DOCUMENT_REQUIREMENTS = [
  "It should be a unique document. Photocopies, scanned documents, or electronic documents are not acceptable.",
  "It should be a document issued by the government.",
  "It must be current at the time of the test. It must include your full name, matching the name used to register, a recent recognizable photograph, and your signature.",
  "It should be written in English and readable by the test center administrator — otherwise you will not be permitted to take the exam and your test fee will not be refunded.",
];

// NOTE: the live WordPress page has this heading ("Tips On How To Pass Your
// TOEFL Exam") with nothing underneath it — most likely a Slider Revolution
// block that never made it into the static markup. There's no real copy to
// migrate here, so these five tips are original, written for this page
// rather than pulled from the source. Swap in the real content whenever
// you track it down in the WP editor.
const TOEFL_TIPS = [
  {
    title: "Start with a diagnostic test",
    detail:
      "Take a full practice test before you study anything else, so your prep time goes toward your weakest section instead of the one you're already comfortable with.",
  },
  {
    title: "Practice under real time pressure",
    detail:
      "Rehearse each section with a timer running from day one. Running out of time is one of the most common reasons for a lower score, not a lack of English ability.",
  },
  {
    title: "Build academic listening stamina",
    detail:
      "Get used to following lecture-length audio (10+ minutes) and taking short notes as you listen, since the Listening section mirrors a real classroom, not a conversation.",
  },
  {
    title: "Practice typed writing, not handwritten",
    detail:
      "If you're taking the iBT, write your practice essays on a keyboard under the actual time limit — typing speed and on-screen editing habits matter more than people expect.",
  },
  {
    title: "Review with official ETS materials last",
    detail:
      "Use general practice to build the underlying skill, then finish your prep with official TOEFL material so the question style feels familiar on test day.",
  },
];

export default function Page() {
  return (
    <>
      <InnerHero
        heading="TOEFL"
        eyebrow="TOEFL Training & Exams"
        image={{
          src: "/pages/exams/toefl-banner.jpg",
          alt: "TOEFL training with Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* Intro — full-width text, no image */}
        <Reveal className="container mx-auto px-8 pt-14 md:px-10 lg:px-12">
          <div className="max-w-4xl space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            <p>
              As a foreign student looking to enroll in a university in an
              English-speaking country, you may be required to take the
              TOEFL exam. TOEFL is an abbreviation for the official name of
              the test, Test of English as a Foreign Language. It evaluates
              your ability to communicate and understand English by
              assessing your reading, speaking, listening, and writing
              skills.
            </p>
            <p>
              These are all skills that will be required to complete your
              academic studies, and the test is employed by institutions to
              ensure students are capable of continuing and achieving
              results on their chosen course in a country where the
              syllabus is taught in English.
            </p>
          </div>
        </Reveal>

        {/* Why train with us — image left, copy + benefits right */}
        <div className="py-6">
          <div className="container mx-auto grid gap-10 px-8 md:px-10 lg:px-12 lg:grid-cols-2 lg:items-start">
            <Reveal className="relative aspect-square w-full overflow-hidden rounded-[1.5rem]">
              <Image
                src="/pages/exams/toefl1.jpg"
                alt="TOEFL exam preparation"
                fill
                className="object-cover"
              />
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                <p>
                  At Ruhe Global Resources, we train candidates not just to
                  attempt the{" "}
                  <strong className="font-semibold text-ink">
                    Test of English as a Foreign Language (TOEFL)
                  </strong>{" "}
                  examination but also to enter with a confidence of being
                  successful and attaining it. You can take TOEFL training
                  with us at Ruhe Global Resources and be assured of the
                  best possible result. There are numerous benefits why we
                  should be the top choice for your TOEFL training.
                </p>
                <p className="font-semibold text-ink">Some of the reasons are:</p>
              </div>
              <div className="mt-6">
                <ol className="space-y-3">
                  {TOEFL_BENEFITS.map((item, i) => (
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
              </div>
            </Reveal>
          </div>
        </div>

        {/* Register CTA */}
        <Reveal className="container mx-auto px-8 py-14 text-center md:px-10 lg:px-12">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Register For Our Tutorials
          </h2>
          <a
            href="/auth/register"
            className="mt-6 inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
          >
            Register Now
          </a>
        </Reveal>

        {/* Types of TOEFL exams */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                Types Of TOEFL Exams
              </h2>
              <p className="mt-4 max-w-3xl text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                The TOEFL exam is taken in two ways. These are:
              </p>
            </Reveal>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <Reveal
                delay={0.05}
                className="rounded-[1.5rem] bg-white p-8 shadow-sm"
              >
                <h3 className="font-display text-lg font-bold text-ink">
                  1. IBT (Internet Based Test)
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                  TOEFL Internet Based Test, as the name implies, is
                  administered online and is the most popular mode of
                  examination — approximately 97% of TOEFL test takers
                  choose iBT. It is given at various locations throughout
                  the year and divided into four sections: reading,
                  listening, speaking, and writing, all completed at a test
                  center with internet access. You&apos;ll read from the
                  screen, listen through a headset, record speech into a
                  microphone, and type written responses on a keyboard —
                  entirely computer-based, with no pen or paper.
                </p>
              </Reveal>

              <Reveal
                delay={0.15}
                className="rounded-[1.5rem] bg-white p-8 shadow-sm"
              >
                <h3 className="font-display text-lg font-bold text-ink">
                  2. PBT (Paper Based Test)
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                  TOEFL applicants very rarely take this type of test. It is
                  typically held in areas without internet access and is
                  offered four times per year. It differs from the iBT in
                  that it has only three sections and lasts about 2.5
                  hours, as opposed to the iBT&apos;s 3.5 to 4 hours. The
                  test&apos;s structure:
                </p>
                <div className="mt-4 space-y-3">
                  {PBT_SECTIONS.map((s) => (
                    <div key={s.title} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ruby-600" />
                      <p className="text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                        <span className="font-semibold text-ink">
                          {s.title}:
                        </span>{" "}
                        {s.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Secondary image */}
        <Reveal className="container mx-auto px-8 pt-14 md:px-10 lg:px-12">
          <div className="relative mx-auto aspect-[1024/791] w-full max-w-3xl overflow-hidden rounded-[1.5rem]">
            <Image
              src="/pages/exams/toefl2.jpg"
              alt="TOEFL test preparation"
              fill
              className="object-cover"
            />
          </div>
        </Reveal>

        {/* Eligibility */}
        <Reveal className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            TOEFL Eligibility Requirements
          </h2>
          <div className="mt-4 max-w-3xl space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            <p>
              The conducting body has not decided or declared any specific
              eligibility criteria. Furthermore, there is no set age limit
              for taking the exam. However, it is typically undertaken by
              students who have completed their 10+2 exams and are planning
              to study abroad.
            </p>
            <p>
              If the candidate is beneath the age of 15, he or she must be
              accompanied by a parent or guardian who must complete and
              sign a release form at the test center.
            </p>
          </div>
        </Reveal>

        {/* Documents required */}
        <div className="bg-ink/[0.02] py-14">
          <Reveal className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Documents Required For Registering For TOEFL
            </h2>
            <div className="mt-4 max-w-3xl space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <p>
                You must present your identification documents when you
                register for your TOEFL exam. The requirements differ
                depending on where you intend to take the test and your
                citizenship. As a result, it is recommended that you review
                your country&apos;s specific general ID document
                requirements on{" "}
                <a
                  href="https://www.ets.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ruby-600 underline underline-offset-2"
                >
                  ETS&apos;s official page
                </a>
                .
              </p>
              <p className="font-semibold text-ink">
                However, each document presented must meet the following
                requirements:
              </p>
            </div>
            <div className="mt-6 max-w-3xl">
              <ol className="space-y-3">
                {DOCUMENT_REQUIREMENTS.map((item, i) => (
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
            </div>
            <p className="mt-6 max-w-3xl text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              If you cannot meet the document requirements, you must notify
              the ETC Office at least 7 days before your registration.
            </p>
          </Reveal>
        </div>

        {/* Tips — original copy; see NOTE above TOEFL_TIPS */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Tips On How To Pass Your TOEFL Exam
            </h2>
          </Reveal>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {TOEFL_TIPS.map((tip, i) => (
              <Reveal
                key={tip.title}
                delay={i * 0.05}
                className="rounded-[1.5rem] bg-ink/[0.02] p-6"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-ruby-600/10 text-sm font-bold text-ruby-600">
                  {i + 1}
                </div>
                <h3 className="font-display text-base font-bold text-ink">
                  {tip.title}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
                  {tip.detail}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="container mx-auto px-8 pb-16 pt-2 md:px-10 lg:px-12">
          <Reveal className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Ready To Start Your TOEFL Preparation?
            </h2>
            <p className="max-w-xl text-white/70">
              Talk to our tutors and we&apos;ll get you a training plan
              built around your test date and target score.
            </p>
            <a
              href="/contact"
              className="mt-2 inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
            >
              Get Started
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}