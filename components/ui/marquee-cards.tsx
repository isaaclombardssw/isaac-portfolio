"use client";

import type { LucideIcon } from "lucide-react";
import { useState } from "react";

export type MarqueeCard = {
  title: string;
  kind: string;
  description?: string;
  image?: string;
  icon?: LucideIcon;
};

/**
 * PrebuiltUI marquee-cards-with-hover-effect, as-is: a horizontal marquee that
 * pauses on hover, each card scales down and reveals its title under a
 * backdrop-blur, with gradient fade edges. Content-only adaptation.
 */
export function MarqueeCards({ cards, durationMs }: { cards: MarqueeCard[]; durationMs?: number }) {
  const [stopScroll, setStopScroll] = useState(false);

  return (
    <>
      <style>{`
        .marquee-inner { animation: marqueeScroll linear infinite; }
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div
        className="relative mx-auto w-full max-w-6xl overflow-hidden"
        onMouseEnter={() => setStopScroll(true)}
        onMouseLeave={() => setStopScroll(false)}
      >
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent md:w-40" />

        <div
          className="marquee-inner flex w-fit"
          style={{
            animationPlayState: stopScroll ? "paused" : "running",
            animationDuration: `${durationMs ?? cards.length * 2500}ms`,
          }}
        >
          <div className="flex">
            {[...cards, ...cards].map((card, index) => (
              <Card key={index} card={card} />
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent md:w-40" />
      </div>
    </>
  );
}

function Card({ card }: { card: MarqueeCard }) {
  const Icon = card.icon;
  return (
    <div className="group relative mx-4 h-[20rem] w-56 overflow-hidden transition-all duration-300 hover:scale-90">
      {card.image ? (
        // biome-ignore lint/performance/noImgElement: marquee card art, swapped by Isaac
        <img src={card.image} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-brand">
          {Icon && <Icon className="size-10 text-brand-foreground/80" />}
        </div>
      )}

      <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center gap-2 bg-black/40 px-5 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">{card.kind}</span>
        <p className="text-center text-lg font-semibold text-white">{card.title}</p>
        {card.description && <p className="text-center text-sm leading-snug text-white/80">{card.description}</p>}
      </div>
    </div>
  );
}
