"use client";

import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";

/**
 * SECTION 4 — ONE-SHOTS (rolling-window billboard)
 *
 * The billboard photo sits pinned behind the white background; as you scroll,
 * the "window" rolls up and reveals it from the bottom (clip-path inset) — as if
 * the image had always been sitting there. The demo site sits statically inside
 * the billboard's poster panel, with the clipped reflection texture blended over
 * it (record-style screen blend, per the rozsa repo). Left controls cycle demos.
 */

type Demo = { name: string; url: string; className: string };

// Placeholder demo sites — Isaac will replace with real screenshots + URLs.
const DEMOS: Demo[] = [
  { name: "Aperture Studio", url: "#", className: "from-rose-400 via-fuchsia-500 to-indigo-600" },
  { name: "Northwind Coffee", url: "#", className: "from-amber-300 via-orange-500 to-rose-500" },
  { name: "Halcyon Yoga", url: "#", className: "from-emerald-300 via-teal-500 to-cyan-600" },
  { name: "Monolith Type", url: "#", className: "from-zinc-200 via-zinc-400 to-zinc-700" },
];

// Poster-panel geometry over billboard-base.png (2447×1531): fits the demo +
// reflection onto the billboard's blank panel. Static. TODO(tune) in-browser.
const POSTER = {
  left: 44.2,
  top: 25,
  width: 24,
  height: 60,
  rotateY: -12.5,
  rotateZ: 0.4,
  perspective: 1400,
};

export function OneShotsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const demo = DEMOS[index];

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // Rolling window: reveal the pinned image from the bottom up.
  const clipTop = useTransform(scrollYProgress, [0.02, 0.8], ["100%", "0%"]);
  const clipPath = useMotionTemplate`inset(${clipTop} 0% 0% 0%)`;

  const cycle = (dir: 1 | -1) => setIndex((i) => (i + dir + DEMOS.length) % DEMOS.length);

  return (
    <section ref={sectionRef} id="one-shots" className="relative h-[220vh] bg-background text-foreground">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Pinned billboard, revealed bottom-up */}
        <motion.div
          style={{ clipPath, WebkitClipPath: clipPath }}
          className="relative aspect-[2447/1531] w-full max-w-[1700px]"
        >
          <Image
            src="/billboard/billboard-base.png"
            alt="Bus-stop billboard advertising one-shot websites"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          {/* Poster panel: static demo + clipped reflection */}
          <div
            className="absolute"
            style={{
              left: `${POSTER.left}%`,
              top: `${POSTER.top}%`,
              width: `${POSTER.width}%`,
              height: `${POSTER.height}%`,
              perspective: `${POSTER.perspective}px`,
            }}
          >
            <div
              className="relative h-full w-full overflow-hidden"
              style={{
                transform: `rotateY(${POSTER.rotateY}deg) rotateZ(${POSTER.rotateZ}deg)`,
                transformOrigin: "left center",
              }}
            >
              <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${demo.className}`}>
                <span className="text-lg font-semibold text-white/90 drop-shadow">{demo.name}</span>
              </div>
              {/* Reflection — record-style screen-blend texture (rozsa) */}
              <Image
                src="/billboard/billboard-reflection.png"
                alt=""
                aria-hidden
                fill
                sizes="30vw"
                className="pointer-events-none object-cover opacity-80 mix-blend-screen"
              />
            </div>
          </div>
        </motion.div>

        {/* Section label */}
        <div className="pointer-events-none absolute left-8 top-10 z-20 max-w-xs">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-foreground/50">One-shots</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Sites built in a single shot
          </h2>
        </div>

        {/* Left controls */}
        <div className="absolute left-8 top-1/2 z-20 -translate-y-1/2">
          <div className="flex flex-col items-center gap-3 rounded-full border border-black/10 bg-white/70 p-3 shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={() => cycle(-1)}
              aria-label="Previous site"
              className="grid size-11 place-items-center rounded-full text-foreground/70 transition hover:bg-black/5 hover:text-foreground"
            >
              <ChevronUp className="size-5" />
            </button>

            <a
              href={demo.url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Take a geez at ${demo.name}`}
              className="grid size-16 place-items-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/30 transition hover:brightness-110"
            >
              <span className="flex flex-col items-center leading-none">
                <Eye className="size-5" />
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide">geez</span>
              </span>
            </a>

            <button
              type="button"
              onClick={() => cycle(1)}
              aria-label="Next site"
              className="grid size-11 place-items-center rounded-full text-foreground/70 transition hover:bg-black/5 hover:text-foreground"
            >
              <ChevronDown className="size-5" />
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-foreground/50">{demo.name}</p>
        </div>
      </div>
    </section>
  );
}
