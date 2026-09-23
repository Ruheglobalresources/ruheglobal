// src/app/(root)/services/admission-processing/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import InnerHero from "@/components/Inner-hero";

export const metadata: Metadata = {
  title: "Admission Processing - RGR Admission Processing Services",
  description:
    "Know how to pass through the admission processing stage if you want to study in any country abroad.",
};

// NOTE: these point at the live WordPress media URLs for now so the page
// renders immediately. Download these into /public/pages and swap the
// src values to local paths, then add ruhegr.com to
// images.remotePatterns in next.config if you keep any external ones.
const STEPS = [
  {
    number: "1",
    title: "Pick Your Program",
    copy: "Make up your mind on where you want to study abroad, and in which level and area of study you have the most interest and the academic background to qualify. Consider your career prospects and then decide on a specialization. Choose a program that goes in line with your goals and try to pick a university that is highly ranked, has a great reputation for your subject of choice, or meets other criteria that are important to you.",
    image:"/pages/admission/admission1.jpg",
    alt: "Student choosing a program to apply to abroad",
  },
  {
    number: "2",
    title: "Read The Requirements And Deadlines Carefully",
    copy: "The first step for applying to a school abroad is to check the requirements. If the information on the website is confusing to you or is lacking good information, request more information from the schools. If you are unsure if your nationality is accepted for student visas in the country, you can also try browsing through official government websites and study councils. It is important to pay attention to the deadlines to make sure that you don't miss the admission or entrance exam deadlines.",
    image:
      "/pages/admission/admission2.jpg",
    alt: "Reviewing university admission requirements",
  },
  {
    number: "3",
    title: "Get Prepared For The TOEFL Or IELTS Test",
    copy: "If your first language is not English and you'd like to study abroad, you will probably need to take an English language test. When planning your study abroad timeline and booking your test, take the preparation time for the test into account. Depending on your English language proficiency and your ability to use the English language, as well as the score that the university requires, you'll need time to study and get prepared for the test.",
    image:
      "/pages/admission/admission3.jpg",
    alt: "Preparing for the TOEFL or IELTS test",
  },
  {
    number: "3",
    title: "Translate And Authenticate Your Documents",
    copy: "If you're applying to study a program taught in English abroad, you will need to translate your documents (including your diploma and grades) to English. Be aware that the translations should be authenticated by a competent authority. If you aren't sure what authorities are accepted by your prospective university, check their website or inquire about it with an admissions official.",
    image:
      "/pages/admission/admission4.jpg",
    alt: "Translating and authenticating academic documents",
  },
  {
    number: "4",
    title: "Register For The Entrance Exam",
    copy: "Most countries like India and certain schools, for example medical schools, have entrance exams that will assess your knowledge of natural science and skills relating to subjects like language or mathematics. Research the date and place of the exam, as the test usually takes place one or two months before the school's opening day. You'll need to register for the test in advance and, if required, make a plan for your travel abroad. Also make sure that you know what to expect on test day. If possible, prepare by taking a look at a sample test.",
    image:
      "/pages/admission/admission5.jpg",
    alt: "Registering for a university entrance exam",
  },
  {
    number: "5",
    title: "Be Confident For The Interview",
    copy: "The final stage of the application processing stage might be an admission interview. Some universities, like the University of Oxford, and certain elite programs set up interviews to find which candidates are more qualified to get into the school. The interview usually begins with why you want to study in this school or program, your background and your plans for the future. Prepare well for the interview, be confident and don't let the formal setting wear you out. Remain calm and don't speak too quickly or slowly.",
    image:
      "/pages/admission/admission6.jpg",
    alt: "Preparing for the admission interview",
  },
  {
    number: "6",
    title: "Schedule Your Visa Appointment",
    copy: "To be eligible for a student visa, your school and program should be accredited by the government of the country they are located in. In most cases, after you receive a letter of acceptance and get admitted to the school, it's time to apply for the student visa. Depending on the country's regulations and number of applicants, applying for the student visa can be a long and complicated process. The documents needed for the student visa application are usually a bank statement, the application form, the receipt of payment for your application and university tuition fee, your passport, and medical and background information.",
    image:
      "/pages/admission/admission7.jpg",
    alt: "Scheduling a student visa appointment",
  },
  {
    number: "7",
    title: "Plan For The Costs",
    copy: "You'll need to consider that applying to schools abroad will have costs relating to the school's entrance exam, translating documents, booking the English language test, tuition fees, and visa application fees. Don't let this discourage you, as many students study internationally on a budget, but do make a plan for your likely costs so that you can budget appropriately for the admission processing stage.",
    image:
      "/pages/admission/admission8.jpg",
    alt: "Planning the costs of studying abroad",
  },
];

function StepRow({
  number,
  title,
  copy,
  image,
  alt,
  reverse,
}: {
  number: string;
  title: string;
  copy: string;
  image: string;
  alt: string;
  reverse: boolean;
}) {
  return (
    <div className="grid gap-8 py-8 md:grid-cols-2 md:items-center md:gap-12">
      <div className={reverse ? "md:order-2" : "md:order-1"}>
        <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
          {number}) {title}
        </h3>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
          {copy}
        </p>
      </div>
      <div
        className={
          (reverse ? "md:order-1" : "md:order-2") +
          " relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem]"
        }
      >
        <Image src={image} alt={alt} fill className="object-cover" />
      </div>
    </div>
  );
}

const page = () => {
  return (
    <>
      <InnerHero
        heading="Int'l Admission Processing"
        eyebrow="Admission Processing Services"
        image={{
          src: "/pages/admission/admission-process.jpg",
          alt: "Student preparing university admission documents with Ruhe Global Resources",
        }}
        bottomColor="#ffffff"
      />

      <section className="flex flex-col bg-white">
        {/* Intro — single column: text, text, full-width image, text */}
        <div className="container mx-auto px-8 py-14 md:px-10 lg:px-12">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Admission Processing
          </h2>
          <div className="mt-6 max-w-6xl md:mb-10 space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
            <p>
              International students often underrate the amount of time
              required for admission processing to a college or university
              abroad. You can avoid this mistake by making a schedule for
              yourself that begins well before the time you plan to begin
              your studies.
            </p>
            <p>
              When setting your timetable, always keep in mind that starting
              the process early is an advantage. You will need to give
              yourself enough time to research the institutions and
              programs that meet your academic and professional goals, then
              meet the application deadlines of the universities you apply
              to, which may be up to ten months before the beginning of the
              school term.
            </p>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-start md:gap-12">
            <div className="relative aspect-[1010/618] w-full overflow-hidden rounded-[1.5rem]">
              <Image
                src="/pages/admission/admission9.jpg"
                alt="Admission processing"
                fill
                className="object-cover"
              />
            </div>
            <div className="text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <p>
                Especially for schools with lots of admissions intake, the
                application process takes a significant amount of time and
                effort. You will need to develop a personal statement and
                request recommendations from teachers or others who know you
                well. Even applying online by the Common Application, you
                will want to start as soon as possible. University websites
                and other academic internet sites may provide quick and
                convenient access to the required application forms, but
                you still need time to have more knowledge about your
                options, contact teachers and institutions to provide
                recommendations and transcripts, and sign up for required
                entrance exams in time to meet application deadlines.
              </p>
            </div>
          </div>
        </div>

        {/* Mid-page CTA banner */}
        <div className="container mx-auto px-8 pb-2 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Take Your Future Into Your Hands And Apply To Study Abroad
              Today
            </h2>
            <a
              href="/auth/register"
              className="mt-2 inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
            >
              Apply Today
            </a>
          </div>
        </div>

        {/* Steps — zigzag, one row per numbered step (note: the live
            site labels both the TOEFL/IELTS step and the Translate step
            "3)" — kept as-is for fidelity; say the word if you want that
            renumbered to 3 and 4). */}
        <div className="bg-ink/[0.02] py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              How To Process Your Admission To Foreign Universities
            </h2>

            <div className="mt-6 divide-y divide-ink/10">
              {STEPS.map((step, i) => (
                <StepRow
                  key={step.title}
                  number={step.number}
                  title={step.title}
                  copy={step.copy}
                  image={step.image}
                  alt={step.alt}
                  reverse={i % 2 === 1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* How RGR helps */}
        <div className="py-14">
          <div className="container mx-auto px-8 md:px-10 lg:px-12">
            <div className="max-w-3xl space-y-4 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                Ruhe Global Resources Helps With Admission Processing
              </h2>
              <p>
                Through us you can be sure to have a smooth and successful
                admission processing stage. We will guide you through the
                admission process with our counsellors, who are trained and
                experienced when it comes to admission processing. With us,
                you would never be disappointed.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="container mx-auto px-8 pb-16 pt-2 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-ink px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Ready To Start Your Admission Processing?
            </h2>
            <p className="max-w-xl text-white/70">
              Take your future into your hands and apply to study abroad
              today. We will guide you through every step, start to finish.
            </p>
            <a
              href="/auth/register"
              className="mt-2 inline-flex items-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700"
            >
              Apply Today
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default page;