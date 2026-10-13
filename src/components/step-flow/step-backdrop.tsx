// src/components/step-flow/step-backdrop.tsx
// The soft education doodles behind a step modal (rocket, graduation cap, books, target...),
// spread around the edges so the centre stays clear for the questions. Decoration only.
// Hidden on small screens, where there is no room beside the content.
import {
  Award,
  Backpack,
  BookOpen,
  GraduationCap,
  Landmark,
  Library,
  NotebookPen,
  Pencil,
  Plane,
  Rocket,
  Target,
  type LucideIcon,
} from "lucide-react";

const ITEMS: { Icon: LucideIcon; className: string }[] = [
  { Icon: Rocket, className: "left-[4%] top-[9%] size-14 -rotate-12" },
  { Icon: Pencil, className: "left-[13%] top-[24%] size-10 rotate-12" },
  { Icon: Target, className: "left-[8%] top-[42%] size-16" },
  { Icon: Award, className: "left-[3%] top-[72%] size-14 rotate-6" },
  { Icon: Landmark, className: "left-[15%] top-[84%] size-16 -rotate-6" },
  { Icon: GraduationCap, className: "right-[4%] top-[8%] size-16 rotate-12" },
  { Icon: Library, className: "right-[14%] top-[22%] size-12 -rotate-6" },
  { Icon: Backpack, className: "right-[8%] top-[45%] size-14 -rotate-6" },
  { Icon: Plane, className: "right-[3%] top-[68%] size-12 -rotate-12" },
  { Icon: BookOpen, className: "right-[15%] top-[82%] size-16 rotate-12" },
  { Icon: NotebookPen, className: "left-[2%] top-[58%] size-10 -rotate-12" },
];

export function StepBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
      {ITEMS.map(({ Icon, className }, i) => (
        <Icon key={i} strokeWidth={1.25} className={`absolute text-ruby-200/70 ${className}`} />
      ))}
    </div>
  );
}