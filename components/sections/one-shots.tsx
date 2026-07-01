"use client";

import { ChevronDown, ChevronUp, CircleQuestionMark, Eye } from "lucide-react";
import { AnimatePresence, motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * SECTION 4 — ONE-SHOTS (rolling-window billboard)
 *
 * The billboard photo sits pinned behind the white background; as you scroll,
 * the window rolls up and reveals it from the bottom (clip-path inset). The demo
 * site is perspective-mapped (matrix3d homography) onto the billboard's angled
 * poster panel so it lines up exactly, with the clipped reflection texture
 * blended over it (record-style screen blend, per the rozsa repo). Static — no
 * live 3D — so it doesn't bend as you scroll. Left controls cycle demos.
 */

type Demo = { name: string; url: string; accent: string; bg: string };

// Placeholder demo sites. `bg` is a solid dark fill (testing the roll motion —
// swap back to real screenshots later).
const DEMOS: Demo[] = [
  { name: "Aperture Studio", url: "#", accent: "bg-rose-500", bg: "bg-rose-900" },
  { name: "Northwind Coffee", url: "#", accent: "bg-amber-500", bg: "bg-amber-900" },
  { name: "Halcyon Yoga", url: "#", accent: "bg-emerald-500", bg: "bg-emerald-900" },
  { name: "Monolith Type", url: "#", accent: "bg-indigo-600", bg: "bg-indigo-900" },
];

// Poster-panel corners as fractions of billboard-base.png — TL, TR, BR, BL.
// The panel is a trapezoid (recedes to the right). TODO(tune) in-browser.
const CORNERS: [number, number][] = [
  [0.450, 0.318], // top-left
  [0.671, 0.326], // top-right
  [0.671, 0.868], // bottom-right
  [0.451, 0.898], // bottom-left
];

// Reference (frontal) size the demo/reflection fill before being warped. Aspect
// matches the reflection image (536×885).
const REF_W = 600;
const REF_H = 990;

// Poster roll — a mechanical scrolling billboard. "next" rolls the strip up
// (new poster in from the bottom, old out the top); "prev" reverses it. The
// spring gives the poster inertia so it pulls, then settles rather than snapping.
// Travel past 100% so the dark backing shows between the outgoing and incoming
// posters — the black-ish seam of a mechanical scrolling billboard.
const GAP = "115%";
const NGAP = "-115%";
const posterVariants = {
  enter: (dir: number) => ({ y: dir >= 0 ? GAP : NGAP }),
  center: { y: "0%" },
  exit: (dir: number) => ({ y: dir >= 0 ? NGAP : GAP }),
};
// Slow, mechanical roll so the seam is visible as it travels through the window.
const ROLL_TRANSITION = { type: "tween", duration: 1.1, ease: [0.65, 0, 0.35, 1] } as const;

// Homography mapping the REF_W×REF_H rectangle onto the four dst corners (px).
function quadMatrix3d(dst: [number, number][]): string {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = dst; // TL, TR, BR, BL
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;
  let a: number, b: number, c: number, d: number, e: number, f: number, g: number, i: number;
  if (Math.abs(dx3) < 1e-6 && Math.abs(dy3) < 1e-6) {
    a = x1 - x0; b = x2 - x1; c = x0; d = y1 - y0; e = y2 - y1; f = y0; g = 0; i = 0;
  } else {
    const den = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / den;
    i = (dx1 * dy3 - dx3 * dy1) / den;
    a = x1 - x0 + g * x1; b = x3 - x0 + i * x3; c = x0;
    d = y1 - y0 + g * y1; e = y3 - y0 + i * y3; f = y0;
  }
  // Scale the source rectangle (REF_W×REF_H) into the unit square used above.
  const m = [a / REF_W, d / REF_W, 0, g / REF_W, b / REF_H, e / REF_H, 0, i / REF_H, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((n) => n.toFixed(6)).join(",")})`;
}

export function OneShotsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);
  const demo = DEMOS[index];

  // Measure the billboard so the homography maps to real pixels (and on resize).
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const matrix = useMemo(() => {
    if (!size.w || !size.h) return undefined;
    return quadMatrix3d(CORNERS.map(([fx, fy]) => [fx * size.w, fy * size.h]));
  }, [size]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // Rolling window: reveal the pinned image from the bottom up.
  const clipTop = useTransform(scrollYProgress, [0.02, 0.8], ["100%", "0%"]);
  const clipPath = useMotionTemplate`inset(${clipTop} 0% 0% 0%)`;

  const paginate = (dir: 1 | -1) => setPage(([i]) => [(i + dir + DEMOS.length) % DEMOS.length, dir]);

  return (
    <section ref={sectionRef} id="one-shots" className="relative h-[220vh] bg-background text-foreground">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Pinned billboard, revealed bottom-up */}
        <motion.div
          ref={sceneRef}
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

          {/* Demo + reflection, perspective-mapped onto the poster panel */}
          {matrix && (
            <div
              className="absolute left-0 top-0 overflow-hidden bg-black"
              style={{ width: REF_W, height: REF_H, transform: matrix, transformOrigin: "0 0" }}
            >
              {/* The poster roll: the active demo scrolls into place. White
                  backing hides any seam if the spring over-travels a hair. */}
              <AnimatePresence custom={direction} initial={false}>
                <motion.div
                  key={index}
                  custom={direction}
                  variants={posterVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={ROLL_TRANSITION}
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-6 ${demo.bg} px-10 text-center`}
                >
                  <div className={`size-12 rounded-2xl ${demo.accent}`} />
                  <span className="text-4xl font-bold tracking-tight text-white">{demo.name}</span>
                  <div className="h-2.5 w-2/3 rounded-full bg-white/20" />
                  <div className="h-2.5 w-1/2 rounded-full bg-white/20" />
                </motion.div>
              </AnimatePresence>
              {/* Reflection — record-style screen-blend texture (rozsa), static
                  over the glass while the poster rolls beneath it. */}
              <Image
                src="/billboard/billboard-reflection.png"
                alt=""
                aria-hidden
                fill
                sizes="30vw"
                style={{ transform: "translateY(1.5%) scale(1.08)", transformOrigin: "left center" }}
                className="pointer-events-none object-cover opacity-80 mix-blend-screen"
              />

              {/* Seam: the black-ish gap between poster sheets, riding above the
                  glass (so screen-blend can't wash it out) and tracking the top
                  edge of the incoming poster. */}
              <AnimatePresence custom={direction} initial={false}>
                <motion.div
                  key={`seam-${index}`}
                  custom={direction}
                  variants={posterVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={ROLL_TRANSITION}
                  className="pointer-events-none absolute inset-0"
                >
                  <div
                    className="absolute inset-x-0 bottom-full h-[15%]"
                    style={{
                      background:
                        "linear-gradient(180deg,#a9a294 0%,#cfc8b8 20%,#ddd6c6 50%,#cfc8b8 80%,#a9a294 100%)",
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Section label */}
        <div className="pointer-events-none absolute left-8 top-10 z-20 max-w-sm">
          <h2 className="flex items-center gap-2 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            One-Shot Websites
            <span className="group pointer-events-auto relative inline-flex">
              <button
                type="button"
                aria-label="What's a one-shot website?"
                className="text-foreground/40 transition hover:text-foreground/70 focus-visible:text-foreground/70 focus-visible:outline-none"
              >
                <CircleQuestionMark className="size-5" />
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-60 -translate-x-1/2 rounded-lg bg-neutral-900 px-3 py-2 text-center text-xs font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
              >
                Websites built with AI in only 1 or very few prompts
              </span>
            </span>
          </h2>
        </div>

        {/* Left controls */}
        <div className="absolute left-8 top-1/2 z-20 -translate-y-1/2">
          <div className="flex flex-col items-center gap-3 rounded-full border border-black/10 bg-white/70 p-3 shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={() => paginate(-1)}
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
              onClick={() => paginate(1)}
              aria-label="Next site"
              className="grid size-11 place-items-center rounded-full text-foreground/70 transition hover:bg-black/5 hover:text-foreground"
            >
              <ChevronDown className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
