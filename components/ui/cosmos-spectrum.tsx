"use client";

import { type MotionValue, motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

// Dark spread around the brand blue #0000FF — darkest at the bottom, fading up.
const COLORS = ["#0A0D16", "#101836", "#142668", "#1533B0", "#0A38F0", "#0000FF", "#4060FF", "#AEC0FF"];

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
 * The cosmos-spectrum's blurred gradient bars — live CSS `filter: blur()` (cheap,
 * and rich because the blur is constant in screen space regardless of the rise).
 * Animated to rise via `scaleY` from the bottom.
 *
 * KNOWN ISSUE (accepted for now): a live blur re-rasterises on repaints over it,
 * so a faint white seam can show under the social icons on hover / when selecting
 * the heading. Alternatives that trade it away live in git history:
 *   - baked static image (no seam, blur scales with the rise → slightly less rich)
 *   - clamped SVG filter + parent-cache (rich, but feMorphology made it laggy)
 * Pass `progress` (0→1 from a pinned parent) to drive the rise.
 */
export function CosmicSpectrum({ progress }: { progress?: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const own = useScroll({ target: ref, offset: ["start end", "start start"] });
  const p = progress ?? own.scrollYProgress;

  // Sit as a sliver with resistance, then shoot up with momentum near the end.
  const scaleY = useTransform(p, [0, 0.62, 0.95, 1], [0.15, 0.22, 0.95, 1]);

  return (
    <div ref={ref} className="pointer-events-none absolute -inset-x-[6%] -bottom-[4%] h-[94%]" style={{ filter: "blur(16px)" }}>
      <motion.svg
        style={{ scaleY, transformOrigin: "bottom" }}
        className="h-full w-full"
        viewBox="0 0 1567 584"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <g clipPath="url(#spectrum-clip)">
          {PATHS.map((d, i) => (
            <path key={i} d={d} fill={`url(#spectrum-grad${i})`} />
          ))}
        </g>
        <defs>
          {Array.from({ length: 9 }, (_, i) => (
            <linearGradient key={i} id={`spectrum-grad${i}`} x1="50%" y1="100%" x2="50%" y2="0%" gradientUnits="userSpaceOnUse">
              <stop stopColor={COLORS[0]} />
              <stop offset="0.182709" stopColor={COLORS[1]} />
              <stop offset="0.283673" stopColor={COLORS[2]} />
              <stop offset="0.413484" stopColor={COLORS[3]} />
              <stop offset="0.586565" stopColor={COLORS[4]} />
              <stop offset="0.682722" stopColor={COLORS[5]} />
              <stop offset="0.802892" stopColor={COLORS[6]} />
              <stop offset="1" stopColor={COLORS[7]} stopOpacity="0" />
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
