"use client";

import { type MotionValue, motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

// Palettes from the original cosmos-spectrum component.
const THEMES = {
  original: ["#340B05", "#0358F7", "#5092C7", "#E1ECFE", "#FFD400", "#FA3D1D", "#FD02F5", "#FFC0FD"],
  purple: ["#F3E8FF", "#E9D5FF", "#D8B4FE", "#C084FC", "#A855F7", "#9333EA", "#7C3AED", "#6B21B6"],
  // Dark spread around the brand violet, woven with blues and cool greys —
  // darkest at the bottom, fading up.
  violet: ["#0E1016", "#1B2138", "#243C82", "#3B2E9E", "#5B21B6", "#6D28D9", "#7C3AED", "#B79CFF"],
} as const;

const PATHS = [
  "M1219 584H1393V184H1219V584Z",
  "M1045 584H1219V104H1045V584Z",
  "M348 584H174L174 184H348L348 584Z",
  "M522 584H348L348 104H522L522 584Z",
  "M697 584H522L522 54H697L697 584Z",
  "M870 584H1045V54H870V584Z",
  "M870 584H697L697 0H870L870 584Z",
  "M174 585H0.000183105L-3.75875e-06 295H174L174 585Z",
  "M1393 584H1567V294H1393V584Z",
];

/**
 * The cosmos-spectrum's signature blurred gradient bars, pinned to the bottom
 * and popping up as you scroll. Pass `progress` (a 0→1 scroll MotionValue from a
 * pinned/sticky parent) to drive the rise; otherwise it animates on its own as
 * it scrolls into view. Uses the component's real SVG, gradients and blur.
 */
export function CosmicSpectrum({
  color = "original",
  blur = true,
  progress,
}: {
  color?: keyof typeof THEMES;
  blur?: boolean;
  progress?: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const own = useScroll({ target: ref, offset: ["start end", "start start"] });
  const p = progress ?? own.scrollYProgress;

  // Sit as a sliver with resistance, then shoot up with momentum near the end.
  const scaleY = useTransform(p, [0, 0.5, 0.82, 1], [0.15, 0.22, 0.92, 1]);
  const colors = THEMES[color];

  return (
    <div ref={ref} className="pointer-events-none absolute -inset-x-[6%] -bottom-[4%] h-[94%]">
      <motion.svg
        style={{ scaleY, transformOrigin: "bottom" }}
        className="h-full w-full"
        viewBox="0 0 1567 584"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <g clipPath="url(#spectrum-clip)" filter={blur ? "url(#spectrum-blur)" : undefined}>
          {PATHS.map((d, i) => (
            <path key={i} d={d} fill={`url(#spectrum-grad${i})`} />
          ))}
        </g>
        <defs>
          <filter
            id="spectrum-blur"
            x="-30"
            y="-30"
            width="1627"
            height="644"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="15" />
          </filter>
          {Array.from({ length: 9 }, (_, i) => (
            <linearGradient
              key={i}
              id={`spectrum-grad${i}`}
              x1="50%"
              y1="100%"
              x2="50%"
              y2="0%"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={colors[0]} />
              <stop offset="0.182709" stopColor={colors[1]} />
              <stop offset="0.283673" stopColor={colors[2]} />
              <stop offset="0.413484" stopColor={colors[3]} />
              <stop offset="0.586565" stopColor={colors[4]} />
              <stop offset="0.682722" stopColor={colors[5]} />
              <stop offset="0.802892" stopColor={colors[6]} />
              <stop offset="1" stopColor={colors[7]} stopOpacity="0" />
            </linearGradient>
          ))}
          <clipPath id="spectrum-clip">
            <rect width="1567" height="584" fill="white" />
          </clipPath>
        </defs>
      </motion.svg>
    </div>
  );
}
