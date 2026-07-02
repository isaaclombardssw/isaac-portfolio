"use client";

import { type MotionValue, motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * The cosmos-spectrum's blurred gradient bars, BAKED to a static image
 * (public/finale/spectrum-blue.png — the exact bars + 16px blur, rendered once).
 *
 * Why baked and not a live filter: a live `filter: blur()` behind the finale
 * re-rasterises in tiles, and any repaint over it (icon hover, selecting the
 * heading text, the caret) exposes a tile seam as a thin white line. A plain
 * image is just a texture — repaints over it recomposite it, so it can never
 * seam. The rise still animates via `scaleY`.
 *
 * Pass `progress` (a 0→1 scroll MotionValue from a pinned/sticky parent) to drive
 * the rise; otherwise it animates on its own as it scrolls into view.
 */
export function CosmicSpectrum({ progress }: { progress?: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const own = useScroll({ target: ref, offset: ["start end", "start start"] });
  const p = progress ?? own.scrollYProgress;

  // Sit as a sliver with resistance, then shoot up with momentum near the end —
  // landing late so it resolves as you actually reach the section.
  const scaleY = useTransform(p, [0, 0.62, 0.95, 1], [0.15, 0.22, 0.95, 1]);

  return (
    <div ref={ref} className="pointer-events-none absolute -inset-x-[6%] -bottom-[4%] h-[94%]">
      {/* biome-ignore lint/performance/noImgElement: baked decorative backdrop, stretched to fill */}
      <motion.img
        src="/finale/spectrum-blue.png"
        alt=""
        aria-hidden
        style={{ scaleY, transformOrigin: "bottom" }}
        className="h-full w-full object-fill"
      />
    </div>
  );
}
