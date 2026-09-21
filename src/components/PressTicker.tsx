"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { partnerLogos } from "./PartnerLogos";

export type PressTickerProps = {
  logos?: string[];
  size?: "default" | "large";
};

const LOGO_SIZE_CLASSES: Record<NonNullable<PressTickerProps["size"]>, string> = {
  default: "h-12 w-36 sm:h-14 sm:w-44",
  large: "h-16 w-52 sm:h-20 sm:w-64",
};

const GAP_CLASSES: Record<NonNullable<PressTickerProps["size"]>, string> = {
  default: "gap-16 pr-16",
  large: "gap-20 pr-20",
};

export function PressTicker({
  logos = partnerLogos,
  size = "default",
}: PressTickerProps) {
  if (!logos?.length) return null;
  const loop = [...logos, ...logos];

  return (
    <section className="bg-cloud py-6 md:py-8" aria-hidden="true">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <motion.div
            className={`flex flex-none items-center ${GAP_CLASSES[size]}`}
            animate={{ translateX: "-50%" }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          >
            {loop.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className={`relative shrink-0 ${LOGO_SIZE_CLASSES[size]}  mix-blend-multiply transition-all duration-300 `}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 256px, 208px"
                  loading="eager"
                  unoptimized={src.endsWith(".svg")}
                  className="object-contain"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}