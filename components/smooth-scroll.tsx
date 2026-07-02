"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Subtle global smooth scroll (Lenis). Eases wheel scrolling and in-page anchor
 * jumps for a weightier, more "expensive" feel — and the scroll-driven one-shots
 * reveal rides the eased scroll for free. Native touch scrolling on mobile;
 * fully disabled under prefers-reduced-motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // lerp 0.12 = a gentle weight, not a floaty long glide. Tune here for feel.
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1 });

    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Ease in-page anchor jumps (nav links) so clicking into a section glides too.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      const href = anchor?.getAttribute("href");
      if (anchor && href && href.length > 1) {
        e.preventDefault();
        lenis.scrollTo(href);
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
