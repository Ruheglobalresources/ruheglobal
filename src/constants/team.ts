// src/constants/team.ts

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  location: string;
  image: string;
  quote: string;
};

// Swap these image paths once you've dropped the real photos into
// public/images/team/ — same convention as the cities and schools images.
export const TEAM: TeamMember[] = [
  {
    id: "mr-joseph",
    name: "Mr Joseph",
    role: "Founder & Lead Counselor",
    location: "Abuja, Nigeria",
    image: "/team/md.jpg",
    quote:
      "Every family that walks through our door has a different story. My job is to listen first, then build a plan around what actually matters to that student, not a template we reuse for everyone.",
  },
  {
    id: "tobenna-eze",
    name: "Tobenna Eze",
    role: "UK & Ireland Admissions Lead",
    location: "Lagos, Nigeria",
    image: "/team/aisha.png",
    quote:
      "I still remember my first offer letter. Watching a student open theirs never gets old, and it reminds me why I read every personal statement three times before it goes out.",
  },
  {
    id: "chiamaka-udoh",
    name: "Chiamaka Udoh",
    role: "Canada & Visa Documentation Specialist",
    location: "Port Harcourt, Nigeria",
    image: "/team/kemi.png",
    quote:
      "Visa paperwork is where most applications quietly fall apart. I built our checklist system so no family has to learn that lesson the hard way.",
  },
  {
    id: "emeka-okafor",
    name: "Emeka Okafor",
    role: "Scholarships & Funding Advisor",
    location: "Enugu, Nigeria",
    image: "/team/emeka.png",
    quote:
      "Tuition shouldn't be the reason a bright student stays home. I spend most of my week hunting down scholarships and payment plans that make the number actually work.",
  },
];