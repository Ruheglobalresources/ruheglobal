import {
  Compass,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Briefcase,
  Building2,
  Users,
  Heart,
  MessagesSquare,
  Plane,
  Car,
  PackageCheck,
  Sun,
  MapPinned,
  BookOpenCheck,
  Languages,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  blurb: string;
  icon: LucideIcon;
};

export type ServiceColumn = {
  title: string;
  links: NavLink[];
};

export const EXAM_LINKS: NavLink[] = [
  {
    label: "IELTS training",
    href: "/exams/ielts-training-exam",
    blurb: "Prep classes & registration support",
    icon: BookOpenCheck,
  },
  {
    label: "TOEFL",
    href: "/exams/toefl",
    blurb: "Prep classes & registration support",
    icon: Languages,
  },
];

// Every "/services/*" link the client currently has live, grouped by where it
// sits in the applicant journey (counselling -> visa -> exams -> post-arrival)
// rather than alphabetically, so the mega menu reads like a timeline left to
// right. Exams & Prep used to be its own top-level nav item; it now lives
// here as the 4th column.
export const SERVICE_COLUMNS: ServiceColumn[] = [
  {
    title: "Counselling & planning",
    links: [
      {
        label: "Destination selection",
        href: "/services/counselling-services/destination-selection",
        blurb: "Match the right country to your goals",
        icon: Compass,
      },
      {
        label: "Institution selection",
        href: "/services/counselling-services/institution-selection",
        blurb: "Shortlist schools you'll actually get into",
        icon: GraduationCap,
      },
      {
        label: "Admission processing",
        href: "/services/admission-processing",
        blurb: "We handle the application end to end",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: "Visa services",
    links: [
      {
        label: "Study visa",
        href: "/services/study-visa",
        blurb: "Student visa filing & documentation",
        icon: FileText,
      },
      {
        label: "Work visa",
        href: "/services/work-visa",
        blurb: "For confirmed job offers abroad",
        icon: Briefcase,
      },
      {
        label: "Business visa",
        href: "/services/business-visa",
        blurb: "Short-stay trips for business travel",
        icon: Building2,
      },
      {
        label: "Dependent visa",
        href: "/services/dependent-visa",
        blurb: "Bring family along on your journey",
        icon: Users,
      },
      {
        label: "Spouse visa",
        href: "/services/spouse-visa",
        blurb: "Join a partner already abroad",
        icon: Heart,
      },
      {
        label: "Visa interview training",
        href: "/services/visa-interview-training",
        blurb: "Mock interviews so you walk in ready",
        icon: MessagesSquare,
      },
    ],
  },
  {
    title: "Exams & Prep",
    links: EXAM_LINKS,
  },
  {
    title: "Post-arrival & travel",
    links: [
      {
        label: "Flight processing",
        href: "/services/flight-processing",
        blurb: "Booking sorted once your visa lands",
        icon: Plane,
      },
      {
        label: "Airport pickup",
        href: "/services/airport-pickup",
        blurb: "Someone waiting on the other side",
        icon: Car,
      },
      {
        label: "Post-arrival services",
        href: "/services/post-arrival-services",
        blurb: "Settling in — accounts, housing, more",
        icon: PackageCheck,
      },
    ],
  },
];

export const PROGRAM_LINKS: NavLink[] = [
  {
    label: "Summer school",
    href: "/summer-school",
    blurb: "Short academic programmes abroad",
    icon: Sun,
  },
  {
    label: "Educational tour",
    href: "/educational-tour",
    blurb: "Guided campus & city tours",
    icon: MapPinned,
  },
];