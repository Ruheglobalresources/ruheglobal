// MessageBox.tsx
"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { MergedBlob, RIBBON } from "@/lib/Mergedblob";

interface MessageBoxProps {
  email?: string;
  label?: string;
  mobile?: boolean;
}

export function MessageBox({
  email = "info@ruheglobalresources.com",
  label = "",
  mobile = false,
}: MessageBoxProps) {
  return (
    <Link
      href={`mailto:${email}`}
      aria-label={`Email ${email}`}
      className={`group flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ember ${
        mobile
          ? "gap-1.5"
          : "gap-2.5"
      }`}
    >
      {/* Label */}
      <span
        className={`font-medium text-cloud/80 transition-colors group-hover:text-cloud ${
          mobile
            ? "hidden"
            : "hidden xl:block text-sm"
        }`}
      >
        {label}
      </span>

      {/* Message button */}
      <span className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
        <MergedBlob
          size={mobile ? 48 : 50}
          topColor={RIBBON.red}
          topHighlight="#5a0aab"
          backColors={[RIBBON.yellow, RIBBON.cyan, RIBBON.red]}
        >
          <Mail
            size={mobile ? 18 : 20}
            strokeWidth={1.8}
            className="text-white"
          />
        </MergedBlob>
      </span>
    </Link>
  );
}

export default MessageBox;