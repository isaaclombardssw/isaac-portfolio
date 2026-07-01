"use client";

/**
 * SECTION 3 — DEV SHOWCASE
 * Component: https://21st.dev/@prebuiltui/components/cards/marquee-cards-with-hover-effect
 *
 * The real PrebuiltUI marquee-cards-with-hover-effect (see components/ui/
 * marquee-cards.tsx), fed Isaac's services + placeholder projects.
 */
import { FaChartDiagram, FaHighlighter, FaJs, FaPeopleLine, FaShapes } from "react-icons/fa6";
import { type MarqueeCard, MarqueeCards } from "@/components/ui/marquee-cards";

// Services scroll up to the contact form; the two "worked on" cards link out.
const CARDS: MarqueeCard[] = [
  { kind: "Worked on", title: "TinaCMS", description: "UI, UX & development", image: "/work/tinacms.jpg", href: "https://tina.io" },
  {
    kind: "Service",
    title: "Design Systems",
    description: "Reign in AI designs with a bespoke, minimal design system.",
    icon: FaShapes,
    href: "#contact",
  },
  {
    kind: "Service",
    title: "UI and UX Testing",
    description: "Audit existing system UIs and UX flows.",
    icon: FaHighlighter,
    href: "#contact",
  },
  { kind: "Worked on", title: "SSW", description: "Enterprise software solutions", image: "/work/ssw.jpg", href: "https://www.ssw.com.au" },
  {
    kind: "Service",
    title: "Frontend Development",
    description: "Pixel-perfect frontend implementation.",
    icon: FaJs,
    href: "#contact",
  },
  {
    kind: "Service",
    title: "Scrum Master",
    description: "Bring the most out of your teams with formal scrum practices.",
    icon: FaPeopleLine,
    href: "#contact",
  },
  {
    kind: "Service",
    title: "Full-Stack Development",
    description: "Development, testing and refactor of e2e software solutions.",
    icon: FaChartDiagram,
    href: "#contact",
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
