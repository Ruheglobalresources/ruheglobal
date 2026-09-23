// src/app/(root)/study-visa/page.tsx
import PageHero from "@/components/pageHero";
import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <>
      <PageHero
        title="Study Abroad Visa Services"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Study Abroad" }]}
      />

      <section className="bg-white flex flex-col">
       <div className="container mx-auto grid gap-8 px-8 md:px-10 lg:px-12 md:py-10 lg:grid-cols-[2.5fr_1.5fr] lg:items-center">
  <div className="space-y-6 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
    <p>
      Study Visas, are visas given to applicants whose main purpose of
      travelling to the country is the pursuit of education.
      Obviously, while getting admission into the university is
      immensely important, these legal documents are what makes your
      pursuits achievable.
    </p>
    <p>
      <span className="font-semibold text-ruby-600">
        Studying abroad
      </span>{" "}
      requires accurate planning to say the least. Most students are
      always requested to plan their admission/application process
      having in mind university deadlines and documents required.
    </p>
    <p>
      It is mandatory to seat for the English eligibility tests
      depending on the university policy and also have required
      documents ready for steady and smooth processing of their
      application. Hence, students are always told to apply 3-4
      months in advance to avoid any last-minute rush.
    </p>
    <p>
      Applicants that want financial assistance, scholarships and
      education loans should add another couple of extra months to
      the process as these applications could be longer than
      expected.
    </p>
    <p>
      International students who need a student visa need to get an
      admission before pursuing one.
    </p>
  </div>

  <div className="relative aspect-[3/4] w-full max-w-xs mx-auto overflow-hidden rounded-[2rem] lg:max-w-sm">
    <Image
      src="/pages/graduate.jpg"
      alt="Graduate in a cap and gown holding a diploma"
      fill
      className="object-cover"
    />
  </div>
</div>

        <div className="mx-auto mt-10 mb-10 w-full max-w-7xl px-4 md:px-10 lg:px-12">
          <Image
            src="/pages/study-countries.jpg"
            alt="Study destinations: Australia, USA, New Zealand, UK, Canada, Europe, Singapore"
            width={1024}
            height={281}
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="h-auto w-full "
          />
        </div>




        <div className="container mx-auto grid gap-8 px-8 md:px-10 lg:px-12 md:py-10 lg:grid-cols-[2.5fr_1.5fr] lg:items-center">
  <div className="space-y-6 text-[0.95rem] leading-relaxed text-ink/75 sm:text-base">
    <p>
      Study Visas, are visas given to applicants whose main purpose of
      travelling to the country is the pursuit of education.
      Obviously, while getting admission into the university is
      immensely important, these legal documents are what makes your
      pursuits achievable.
    </p>
    <p>
      <span className="font-semibold text-ruby-600">
        Studying abroad
      </span>{" "}
      requires accurate planning to say the least. Most students are
      always requested to plan their admission/application process
      having in mind university deadlines and documents required.
    </p>
    <p>
      It is mandatory to seat for the English eligibility tests
      depending on the university policy and also have required
      documents ready for steady and smooth processing of their
      application. Hence, students are always told to apply 3-4
      months in advance to avoid any last-minute rush.
    </p>
    <p>
      Applicants that want financial assistance, scholarships and
      education loans should add another couple of extra months to
      the process as these applications could be longer than
      expected.
    </p>
    <p>
      International students who need a student visa need to get an
      admission before pursuing one.
    </p>
  </div>

  <div className="relative aspect-[3/4] w-full max-w-xs mx-auto overflow-hidden rounded-[2rem] lg:max-w-sm">
    <Image
      src="/pages/graduate.jpg"
      alt="Graduate in a cap and gown holding a diploma"
      fill
      className="object-cover"
    />
  </div>
</div>

      </section>
    </>
  );
};

export default page;