"use client";

import { CalendarClock, ChevronDown, ChevronUp, CircleQuestionMark, ExternalLink, Palette, Sparkles, Workflow } from "lucide-react";
import { AnimatePresence, motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { BouncyAccordion } from "@/components/ui/be-ui-bouncy-accordion";

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

// A demo is either a real site (screenshot `image` + `caption`) or a placeholder
// mock (solid `bg` + `accent`) still awaiting its real screenshot. `object` sets
// the image framing (object-position) — default top-aligned.
type Demo = {
  name: string;
  url: string;
  accent?: string;
  bg?: string;
  image?: string;
  caption?: string;
  object?: string;
};

const DEMOS: Demo[] = [
  {
    name: "Magdalen Rozsa",
    url: "https://www.magdalenrozsa.com/",
    image: "/one-shots/magdalen-rozsa.jpg",
    caption: "Artist Portfolio with Integrated CMS",
  },
  {
    name: "Chevro",
    url: "https://chevro.iwrl.net/",
    image: "/one-shots/chevro.jpg",
    caption: "Real-time puzzle game",
    object: "center",
  },
];

// FAQ shown behind the billboard as a lead-in — visible while the window is blank,
// then covered as the rolling window reveals. Copy is placeholder-ish for now.
const FAQ_ITEMS = [
  {
    id: "what",
    title: "What is a one-shot?",
    icon: <Sparkles className="h-4 w-4" />,
    description:
      "A website built with AI in a single prompt — or very few. Layout, copy and styling all at once. Perfect for landing pages and concepts; the craft is in making them not look one-shot.",
  },
  {
    id: "process",
    title: "What's different about your dev process?",
    icon: <Workflow className="h-4 w-4" />,
    description:
      "AI is the fast first draft, not the final answer. Everything gets a design-system pass, real UX thinking, and hand-tuned craft on top — so it holds up like it was built deliberately, not generated.",
  },
  {
    id: "tips",
    title: "Tips to improve the look & feel of my project?",
    icon: <Palette className="h-4 w-4" />,
    description: (
      <>
        Three things move the needle fast: adopt a small design system, give your AI proper design context, and lean on reusable skills.{" "}
        <a
          href="https://iwrl.net"
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-brand underline-offset-2 hover:underline"
        >
          Full write-up →
        </a>
      </>
    ),
  },
  {
    id: "timeline",
    title: "Timeline?",
    icon: <CalendarClock className="h-4 w-4" />,
    description: (
      <>
        Most one-shot-style sites land in days; a polished marketing site or small product UI is usually 1–3 weeks.{" "}
        <a href="#contact" className="font-medium text-brand underline-offset-2 hover:underline">
          Start a chat →
        </a>
      </>
    ),
  },
];

// The poster content — a real site screenshot with a caption band, or a
// placeholder mock. `large` sizes it for the desktop (600px REF) vs mobile poster.
function PosterFace({ demo, large }: { demo: Demo; large?: boolean }) {
  if (demo.image) {
    return (
      <div className="absolute inset-0 flex flex-col bg-white">
        {/* biome-ignore lint/performance/noImgElement: warped poster art */}
        <img
          src={demo.image}
          alt={demo.name}
          className="min-h-0 w-full flex-1 object-cover"
          style={{ objectPosition: demo.object ?? "top" }}
        />
        <div className={large ? "shrink-0 px-8 py-6" : "shrink-0 px-5 py-4"}>
          <p
            className={`text-center font-semibold leading-tight tracking-tight text-neutral-800 ${large ? "text-2xl" : "text-sm"}`}
          >
            {demo.caption}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 text-center ${demo.bg} ${large ? "gap-6" : "gap-5"}`}>
      <div className={`rounded-2xl ${demo.accent} ${large ? "size-12" : "size-10"}`} />
      <span className={`font-bold tracking-tight text-white ${large ? "text-4xl" : "text-2xl"}`}>{demo.name}</span>
      <div className={`w-2/3 rounded-full bg-white/20 ${large ? "h-2.5" : "h-2"}`} />
      <div className={`w-1/2 rounded-full bg-white/20 ${large ? "h-2.5" : "h-2"}`} />
    </div>
  );
}

// Glass reflection over the poster: multiply carries the reflected structure
// (deviation from white, so the screenshot keeps its true colours) and a light
// screen adds just the bright sheen that reads as glass.
function PosterReflection() {
  // The reflection is pre-baked to mid-grey (brightness 0.68 + contrast 1.25 in
  // the PNG) so no live CSS filter is needed — a filter inside the matrix3d warp
  // rasterises low-res and looks pixelated. Hard-light then keeps the poster
  // colour (grey = neutral), adds glassy glare on brights, structure on darks.
  return (
    <Image
      src="/billboard/billboard-reflection-hl.png"
      alt=""
      aria-hidden
      fill
      sizes="40vw"
      style={{ transform: "translateY(1.5%) scale(1.08)", transformOrigin: "left center" }}
      className="pointer-events-none object-cover mix-blend-hard-light"
    />
  );
}

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
  const clipTop = useTransform(scrollYProgress, [0.05, 0.95], ["100%", "0%"]);
  const clipPath = useMotionTemplate`inset(${clipTop} 0% 0% 0%)`;

  const paginate = (dir: 1 | -1) => setPage(([i]) => [(i + dir + DEMOS.length) % DEMOS.length, dir]);

  return (
    <section ref={sectionRef} className="relative bg-background text-foreground md:my-[10vh] md:h-[220vh]">
      {/* Nav target: top on mobile, but deep into the pin on desktop so the link
          lands with the billboard already revealing rather than at the empty start. */}
      <span id="one-shots" aria-hidden className="pointer-events-none absolute inset-x-0 top-0 md:top-[80vh]" />
      {/* Desktop: pinned billboard with rolling-window reveal + matrix3d poster */}
      <div className="hidden h-screen flex-col justify-start overflow-hidden pt-6 md:sticky md:top-0 md:flex">
        {/* Title — sits just above the billboard */}
        <div className="mx-auto w-full max-w-[1700px] shrink-0 px-6 pb-3">
          <h2 className="flex items-center gap-2 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            One-Shot Websites
            <span className="group relative inline-flex">
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

        {/* Billboard stage — full width (flush); frosted edges + controls relative to it */}
        <div className="relative mx-auto w-full max-w-[1700px] shrink-0">
          {/* FAQ lead-in: sits behind the billboard (z-0). Visible while the window
              is blank; the rolling window (z-10) rolls up and covers it as it reveals. */}
          <div className="absolute inset-0 z-0 flex items-center justify-center px-6">
            <div className="w-full max-w-xl">
              <BouncyAccordion
                items={FAQ_ITEMS}
                defaultValue="what"
                classNames={{ item: "bg-black/[0.04]", trigger: "hover:bg-black/[0.02]" }}
              />
            </div>
          </div>
          {/* Pinned billboard, revealed bottom-up */}
          <motion.div
            ref={sceneRef}
            style={{ clipPath, WebkitClipPath: clipPath }}
            className="relative z-10 aspect-[2447/1531] w-full"
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
                  className="absolute inset-0"
                >
                  <PosterFace demo={demo} large />
                </motion.div>
              </AnimatePresence>
              {/* Reflection — static glass over the rolling poster. */}
              <PosterReflection />

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
                        "linear-gradient(180deg,#080706 0%,#231f19 22%,#2c281f 50%,#231f19 78%,#080706 100%)",
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Frosted edges + controls live INSIDE the clipped billboard, so the
              rolling window reveals them with the very same edge (no separate
              clip, nothing to keep in sync). */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[14%] bg-gradient-to-r from-white/25 to-transparent backdrop-blur-md"
            style={{
              maskImage: "linear-gradient(to right, black, transparent)",
              WebkitMaskImage: "linear-gradient(to right, black, transparent)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[14%] bg-gradient-to-l from-white/25 to-transparent backdrop-blur-md"
            style={{
              maskImage: "linear-gradient(to left, black, transparent)",
              WebkitMaskImage: "linear-gradient(to left, black, transparent)",
            }}
          />
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
                aria-label={`Open ${demo.name}`}
                className="grid size-16 place-items-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/30 transition hover:brightness-90"
              >
                <span className="flex flex-col items-center leading-none">
                  <ExternalLink className="size-5" />
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide">open</span>
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
        </motion.div>
        </div>
      </div>

      {/* Mobile: feature the poster itself, portrait — keeps the roll + seam + reflection */}
      <div className="flex flex-col items-center gap-10 px-6 py-28 md:hidden">
        <div className="w-full max-w-[340px]">
          <h2 className="flex items-center gap-2 font-heading text-3xl font-semibold tracking-tight text-foreground">
            One-Shot Websites
            <span className="group relative inline-flex">
              <button
                type="button"
                aria-label="What's a one-shot website?"
                className="text-foreground/40 transition focus-visible:text-foreground/70 focus-visible:outline-none"
              >
                <CircleQuestionMark className="size-5" />
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-56 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity duration-200 group-focus-within:opacity-100"
              >
                Websites built with AI in only 1 or very few prompts
              </span>
            </span>
          </h2>
        </div>

        <div className="relative aspect-[600/990] w-full max-w-[280px] overflow-hidden rounded-xl bg-black shadow-2xl">
          <AnimatePresence custom={direction} initial={false}>
            <motion.div
              key={index}
              custom={direction}
              variants={posterVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={ROLL_TRANSITION}
              className="absolute inset-0"
            >
              <PosterFace demo={demo} />
            </motion.div>
          </AnimatePresence>

          <PosterReflection />

          <AnimatePresence custom={direction} initial={false}>
            <motion.div
              key={`m-seam-${index}`}
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
                  background: "linear-gradient(180deg,#080706 0%,#231f19 22%,#2c281f 50%,#231f19 78%,#080706 100%)",
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => paginate(-1)}
            aria-label="Previous site"
            className="grid size-12 place-items-center rounded-full border border-black/10 bg-white text-foreground/70 shadow-md transition active:scale-95"
          >
            <ChevronUp className="size-5" />
          </button>
          <a
            href={demo.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Open ${demo.name}`}
            className="grid size-16 place-items-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/30 transition active:scale-95"
          >
            <span className="flex flex-col items-center leading-none">
              <ExternalLink className="size-5" />
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide">open</span>
            </span>
          </a>
          <button
            type="button"
            onClick={() => paginate(1)}
            aria-label="Next site"
            className="grid size-12 place-items-center rounded-full border border-black/10 bg-white text-foreground/70 shadow-md transition active:scale-95"
          >
            <ChevronDown className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
