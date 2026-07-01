"use client";

/**
 * SECTION 6 — SOCIALS / END
 * Component: https://21st.dev/@aliimam/components/cosmos-spectrum
 *
 * White finale on a tall, pinned stage: the real cosmos-spectrum gradient bars
 * sit as a sliver at the bottom and pop up with scroll momentum behind a
 * sign-off and the two socials (dark, blue glow on hover).
 */

import { motion, useScroll } from "motion/react";
import type { SVGProps } from "react";
import { useRef } from "react";
import { CosmicSpectrum } from "@/components/ui/cosmos-spectrum";

// Brand marks inlined: this lucide-react version no longer ships Github/Linkedin.
function Github(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.53.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  );
}

function Linkedin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

// Blog mark — a solid RSS glyph, weighted to match the brand marks above.
function Blog(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M2 3.5a.5.5 0 0 1 .5-.5c5.523 0 10 4.477 10 10a.5.5 0 0 1-1 0 9 9 0 0 0-9-9 .5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5 6 6 0 0 1 6 6 .5.5 0 0 1-1 0 5 5 0 0 0-5-5 .5.5 0 0 1-.5-.5m0 5.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" />
    </svg>
  );
}

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/isaaclombardssw", Icon: Github },
  // TODO(isaac): replace with your real LinkedIn profile URL.
  { label: "LinkedIn", href: "https://www.linkedin.com/in/", Icon: Linkedin },
  { label: "Blog", href: "https://iwrl.net", Icon: Blog },
] as const;

export function ConnectSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section ref={ref} id="connect" className="relative h-[180vh] bg-background text-foreground">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden p-8">
        <CosmicSpectrum color="blue" blur progress={scrollYProgress} />

        <div className="relative z-10 flex flex-col items-center gap-10 text-center">
          <h2 className="font-heading text-4xl font-semibold tracking-tight text-background md:text-6xl">
            Let&apos;s connect
          </h2>

          <ul className="flex items-center gap-8">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="group relative grid size-16 place-items-center rounded-full text-background transition-transform duration-300 ease-out hover:scale-110 focus-visible:scale-110 focus-visible:outline-none md:size-20"
                >
                  {/* White glow halo, revealed on hover/focus. */}
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{ background: "color-mix(in oklab, var(--background) 55%, transparent)" }}
                  />
                  <Icon className="relative size-8 text-background transition-[filter] duration-300 md:size-9 group-hover:[filter:drop-shadow(0_0_12px_rgba(255,255,255,0.95))] group-focus-visible:[filter:drop-shadow(0_0_12px_rgba(255,255,255,0.95))]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
