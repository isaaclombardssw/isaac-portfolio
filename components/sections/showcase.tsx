"use client";

/**
 * SECTION 3 — DEV SHOWCASE
 * Component: https://21st.dev/@prebuiltui/components/cards/marquee-cards-with-hover-effect
 *
 * The real PrebuiltUI marquee-cards-with-hover-effect (see components/ui/
 * marquee-cards.tsx), fed Isaac's services + placeholder projects.
 */
import { AppWindow, Component, Layers, ScanEye, SquareKanban } from "lucide-react";
import { type MarqueeCard, MarqueeCards } from "@/components/ui/marquee-cards";

const CARDS: MarqueeCard[] = [
  { kind: "Worked on", title: "TinaCMS — UI, UX & development", image: "/work/tinacms.jpg" },
  {
    kind: "Service",
    title: "Design Systems",
    description: "Reign in AI designs with a bespoke, minimal design system.",
    icon: Component,
  },
  { kind: "Service", title: "UI and UX Testing", description: "Audit existing system UIs and UX flows.", icon: ScanEye },
  { kind: "Worked on", title: "Enterprise software solutions — SSW", image: "/work/ssw.jpg" },
  { kind: "Service", title: "Frontend Development", description: "Pixel-perfect frontend implementation.", icon: AppWindow },
  {
    kind: "Service",
    title: "Scrum Master",
    description: "Bring the most out of your teams with formal scrum practices.",
    icon: SquareKanban,
  },
  {
    kind: "Service",
    title: "Full-Stack Development",
    description: "Development, testing and refactor of e2e software solutions.",
    icon: Layers,
  },
];

export function ShowcaseSection() {
  return (
    <section
      id="work"
      className="flex min-h-screen flex-col items-center justify-center gap-12 overflow-hidden bg-background py-24 text-foreground"
    >
      <h2 className="font-heading text-4xl font-semibold tracking-tight md:text-6xl">
        Development, UX and MGMT
      </h2>

      <MarqueeCards cards={CARDS} />
    </section>
  );
}
