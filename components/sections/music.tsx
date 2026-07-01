/**
 * SECTION 5 — MUSIC
 * Component: https://21st.dev/community/components/makviesainte/team-showcase/default
 *
 * The team-showcase layout (staggered tile grid + hover-linked name list),
 * reworked into Isaac Rozsa's music. Data + accent colours sourced from the
 * ROZSA repo (favicons in /public/music).
 */
import MusicShowcase, { type MusicItem } from "@/components/ui/team-showcase";

const ITEMS: MusicItem[] = [
  { id: "home", name: "I. Rozsa", role: "isaacrozsa.com", href: "https://isaacrozsa.com", accent: "#7f1d1d", icon: "/music/rozsa.svg" },
  { id: "good-talk", name: "Good Talk", role: "Album", href: "https://isaacrozsa.com/good-talk", accent: "#8a8d93", icon: "/music/good-talk.svg" },
  { id: "arrhythmia", name: "Arrhythmia", role: "Album", href: "https://isaacrozsa.com/arrhythmia", accent: "#2563eb", icon: "/music/arrhythmia.svg" },
  { id: "prologue", name: "Prologue", role: "Single", href: "https://isaacrozsa.com", accent: "#15a29d" },
  { id: "dude-like-dust", name: "Dude Like Dust", role: "Single", href: "https://isaacrozsa.com", accent: "#5c654c" },
  { id: "spotify", name: "Spotify", role: "Listen", href: "https://open.spotify.com/artist/1qxcbh1uWREvJm0Xl4rTn4", accent: "#1db954", platform: "spotify" },
  { id: "tidal", name: "Tidal", role: "Listen", href: "https://tidal.com/artist/81760229", accent: "#0a0a0a", platform: "tidal" },
];

export function MusicSection() {
  return (
    <section
      id="music"
      className="flex flex-col items-center justify-center gap-12 bg-background px-6 py-24 text-foreground md:min-h-screen"
    >
      <h2 className="font-heading text-4xl font-semibold tracking-tight md:text-6xl">Music Production</h2>

      <MusicShowcase
        items={ITEMS}
        note="I love AI but don't feel the need to use it for my music — this is all me and a few synths."
      />
    </section>
  );
}
