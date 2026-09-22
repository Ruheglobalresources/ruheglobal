// src/app/(root)/school-search/page.tsx
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { SchoolSearch } from "@/components/school-search/SchoolSearch";

export const metadata: Metadata = {
  title: "Find a School",
  description:
    "Search schools abroad by country, level and field. See the IELTS score and tuition fee for each one.",
};


export default function SchoolSearchPage() {
  return (
    <>
      <main>
        {/* dark band also keeps the translucent navbar readable */}
        <section className="bg-ink px-4 pb-10 pt-28 text-cloud sm:px-6 sm:pt-32 lg:px-10 lg:pb-12 lg:pt-40">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-semibold sm:text-4xl">Find a school</h1>
            <p className="mt-2 max-w-xl text-cloud/75">
              See the IELTS score and tuition fee for schools in your chosen country.
            </p>
          </div>
        </section>

        <SchoolSearch />
      </main>
      <Footer />
    </>
  );
}
