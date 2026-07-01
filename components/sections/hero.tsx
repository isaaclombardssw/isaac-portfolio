"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import TextCursorProximity from "@/components/ui/text-cursor-proximity";
import { NAV_SECTIONS } from "@/lib/sections";

/**
 * SECTION 1 — HERO
 * Component: https://21st.dev/@danielpetho/components/text-cursor-proximity
 *
 * Layout mirrors the component's own demo: square-cornered card, big cursor-
 * reactive headline top-left (left-aligned), role top-right (where the demo's
 * date sits), nav marks along the bottom.
 *
 * Nav interaction: each icon's label is always rendered in brand blue — the
 * same colour as the card, so it's invisible — and a single WHITE pill slides
 * horizontally to sit behind the hovered icon's label, REVEALING it (blue on
 * white). The pill rests on the last-hovered icon rather than resetting.
 */

type PillRect = { left: number; top: number; width: number; height: number };

export function HeroSection() {
  const cardRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [pill, setPill] = useState<PillRect | null>(null);

  const measure = useCallback((index: number): PillRect | null => {
    const el = labelRefs.current[index];
    const nav = navRef.current;
    if (!el || !nav) return null;
    const navRect = nav.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const padX = 16;
    const padY = 7;
    return {
      left: r.left - navRect.left - padX,
      top: r.top - navRect.top - padY,
      width: r.width + padX * 2,
      height: r.height + padY * 2,
    };
  }, []);

  // Park the pill at the left edge so the first reveal slides in from the side.
  useEffect(() => {
    const el = labelRefs.current[0];
    const nav = navRef.current;
    if (!el || !nav) return;
    const r = el.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    setPill({ left: 0, top: r.top - navRect.top - 7, width: 0, height: r.height + 14 });
  }, []);

  const onEnter = (index: number) => {
    const next = measure(index);
    if (next) setPill(next);
    setActive(index);
  };

  useEffect(() => {
    if (active === null) return;
    const onResize = () => {
      const next = measure(active);
      if (next) setPill(next);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, measure]);

  return (
    <section id="hero" className="flex min-h-screen items-center justify-center bg-background p-6 md:p-10">
      <div
        ref={cardRef}
        className="relative flex min-h-[78dvh] w-full max-w-6xl flex-col justify-between overflow-hidden bg-brand p-8 text-brand-foreground md:min-h-0 md:aspect-[16/10] md:p-14"
      >
        {/* Top: big left-aligned headline + role (top-right on desktop, stacked on mobile) */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
          <h1 className="pointer-events-none max-w-[9ch] select-none font-heading text-6xl font-semibold uppercase leading-[0.9] tracking-tight md:text-8xl">
            {/* Mobile: short name, no cursor effect. */}
            <span className="md:hidden">Isaac Lombard</span>
            {/* Desktop: full name with cursor-proximity. */}
            <span className="hidden md:block">
              <TextCursorProximity
                label="Isaac W. R. Lombard"
                containerRef={cardRef}
                radius={140}
                falloff="gaussian"
                className="text-brand-foreground"
                styles={{
                  fontWeight: { from: 400, to: 800 },
                  letterSpacing: { from: "0em", to: "0.04em" },
                  scale: { from: 1, to: 1.12 },
                }}
              />
            </span>
          </h1>
          <p className="text-sm font-medium tracking-wide text-brand-foreground/85 md:max-w-[14ch] md:shrink-0 md:text-right md:text-base">
            UX, AI and software project consulting
          </p>
        </div>

        {/* Bottom: nav icons with sliding-pill reveal */}
        <nav ref={navRef} className="relative hidden items-end justify-center gap-16 md:flex">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-background"
            initial={false}
            animate={
              pill
                ? {
                    left: pill.left,
                    top: pill.top,
                    width: pill.width,
                    height: pill.height,
                    opacity: active === null ? 0 : 1,
                  }
                : { opacity: 0 }
            }
            transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.7 }}
          />
          {NAV_SECTIONS.map((section, i) => {
            const Icon = section.icon;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-label={section.label}
                onMouseEnter={() => onEnter(i)}
                onFocus={() => onEnter(i)}
                className="relative flex flex-col items-center gap-3 focus-visible:outline-none"
              >
                <span
                  ref={(el) => {
                    labelRefs.current[i] = el;
                  }}
                  className="relative z-10 whitespace-nowrap text-sm font-medium text-brand"
                >
                  {section.label}
                </span>
                <Icon className="size-6 text-brand-foreground/85 md:size-7" />
              </a>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
