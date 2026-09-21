// src/components/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { FaFacebookF, FaXTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa6";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

const SERVICE_LINKS = [
  { label: "Study Abroad", href: "/services#study-abroad" },
  { label: "Tutorials (IELTS/TOEFL)", href: "/services#tutorials" },
  { label: "Visa Processing", href: "/services#visa-processing" },
  { label: "Accommodation", href: "/services#accommodation" },
  { label: "Money Transfer", href: "/services#money-transfer" },
  { label: "Permanent Residency", href: "/services#permanent-residency" },
];

const OFFICES = [
  {
    city: "Abuja (HQ)",
    address:
      "2nd Floor, No. 16 Gwani Street, Off IBB Way, Near Kings Care Hospital, Wuse Zone 4, Abuja, Nigeria",
    mobile: "+234 707 918 8996",
    telephone: "+234 814 832 6990",
  },
  {
    city: "Lagos",
    address: "12 Omotayo Ojo Street, Off Majekodunmi Street, Allen Avenue, Ikeja, Nigeria",
    mobile: "+234 707 918 8996",
    telephone: "+234 814 832 6990",
  },
  {
    city: "United Kingdom",
    address: "No. 7 Rosebay Road, Desborough, NN14 2JS",
    mobile: "+44 7448 387659",
    telephone: "+44 7448 967703",
    complaints: "+44 7448 387659 or +234 705 235 4312",
  },
];

const SOCIALS = [
  { Icon: FaFacebookF, href: "https://www.facebook.com/RuheGlobalResources/", label: "Facebook" },
  { Icon: FaXTwitter, href: "https://twitter.com/RuheGlobal", label: "Twitter" },
  { Icon: FaInstagram, href: "https://www.instagram.com/ruheglobalresources/", label: "Instagram" },
  { Icon: FaLinkedinIn, href: "https://www.linkedin.com/company/ruhe-global-resources", label: "LinkedIn" },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-base text-white/70 transition-colors hover:text-teal">
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-3">
              <span className="font-display text-3xl font-bold tracking-tight">RUHE</span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">
                Global Resources
              </p>
            </div>

            <p className="mb-2 text-base italic text-white/60">
              Connecting the Dots to Endless Educational Possibility in Diversity
            </p>

            <p className="mb-6 max-w-sm text-base leading-relaxed text-white/70">
              A fully registered educational advisory company helping Nigerian
              students, professionals and institutions access global
              education — bridging the distance between you and the
              university of your choice.
            </p>

            <div className="mb-6 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-base text-white/70">
                <MapPin size={18} className="shrink-0 text-teal" />
                Wuse Zone 4, Abuja, Nigeria (HQ)
              </div>
              <div className="flex items-center gap-2.5 text-base text-white/70">
                <Phone size={18} className="shrink-0 text-teal" />
                +234 707 918 8996
              </div>
              <div className="flex items-center gap-2.5 text-base text-white/70">
                <Mail size={18} className="shrink-0 text-teal" />
                admissions@ruheglobalresources.com
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Image
                src="/icef.png"
                alt="ICEF Accredited Agency badge, number 3667"
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 object-contain"
              />
              <p className="text-sm leading-relaxed text-white/50">
                ICEF Accredited Agency
                <br />
                Trusted Agency #3667
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-base font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <FooterLink href={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-base font-bold uppercase tracking-wider text-white">
              Our Services
            </h4>
            <ul className="flex flex-col gap-2.5">
              {SERVICE_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <FooterLink href={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Offices */}
        <div className="mt-12 border-t border-white/10 pt-10">
          <h4 className="mb-6 text-base font-bold uppercase tracking-wider text-white">
            Our Offices
          </h4>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {OFFICES.map((office) => (
              <div key={office.city}>
                <p className="mb-2 text-base font-semibold text-teal">{office.city}</p>
                <p className="mb-3 text-sm leading-relaxed text-white/60">{office.address}</p>
                <p className="text-sm text-white/70">
                  Mobile: {office.mobile}
                  <br />
                  Tel: {office.telephone}
                </p>
                {office.complaints && (
                  <p className="mt-2 text-sm text-white/50">Complaints: {office.complaints}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row md:px-12">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} Ruhe Global Resources. All rights reserved.
          </p>

          <div className="flex items-center gap-1.5 text-sm text-white/50">
            <Clock size={16} />
            Mon – Fri, 9am – 5pm · Sat by appointment
          </div>

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ Icon, href, label }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-teal"
              >
                <Icon size={16} />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy-policy" className="text-white/60 transition-colors hover:text-teal">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-white/60 transition-colors hover:text-teal">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}