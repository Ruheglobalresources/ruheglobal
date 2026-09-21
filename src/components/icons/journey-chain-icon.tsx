import type { SVGProps } from "react";

/**
 * Four-link chain mark matching the logo's ring colors
 * (yellow → red → black → silver), stretched both
 * horizontally and vertically to match the logo's chain proportions.
 */
export function JourneyChainIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="6" cy="16" rx="4" ry="7.5" transform="rotate(-15 6 16)" stroke="#FAEA07" strokeWidth="1.8" />
      <ellipse cx="13" cy="16" rx="4" ry="7.5" transform="rotate(15 13 16)" stroke="#C62828" strokeWidth="1.8" />
      <ellipse cx="20" cy="16" rx="4" ry="7.5" transform="rotate(-15 20 16)" stroke="#101B2D" strokeWidth="1.8" />
      <ellipse cx="27" cy="16" rx="4" ry="7.5" transform="rotate(15 27 16)" stroke="#A9A9A9" strokeWidth="1.8" />
    </svg>
  );
}