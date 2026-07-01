"use client";

import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
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

type Demo = { name: string; url: string; accent: string };

// Placeholder demo sites — light site mocks (Isaac replaces with real screenshots).
const DEMOS: Demo[] = [
  { name: "Aperture Studio", url: "#", accent: "bg-rose-500" },
  { name: "Northwind Coffee", url: "#", accent: "bg-amber-500" },
  { name: "Halcyon Yoga", url: "#", accent: "bg-emerald-500" },
  { name: "Monolith Type", url: "#", accent: "bg-indigo-600" },
];

// Poster-panel corners as fractions of billboard-base.png — TL, TR, BR, BL.
// The panel is a trapezoid (recedes to the right). TODO(tune) in-browser.
const CORNERS: [number, number][] = [
  [0.450, 0.318], // top-left
  [0.671, 0.326], // top-right
  [0.671, 0.868], // bottom-right
  [0.453, 0.894], // bottom-left
];

// Reference (frontal) size the demo/reflection fill before being warped. Aspect
// matches the reflection image (536×885).
const REF_W = 600;
const REF_H = 990;

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
  const [index, setIndex] = useState(0);
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

  const cycle = (dir: 1 | -1) => setIndex((i) => (i + dir + DEMOS.length) % DEMOS.length);

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
              className="absolute left-0 top-0 overflow-hidden"
              style={{ width: REF_W, height: REF_H, transform: matrix, transformOrigin: "0 0" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-white px-10 text-center">
                <div className={`size-12 rounded-2xl ${demo.accent}`} />
                <span className="text-4xl font-bold tracking-tight text-neutral-800">{demo.name}</span>
                <div className="h-2.5 w-2/3 rounded-full bg-neutral-200" />
                <div className="h-2.5 w-1/2 rounded-full bg-neutral-200" />
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
          )}
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
