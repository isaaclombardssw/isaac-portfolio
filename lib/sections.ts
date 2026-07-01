import type { IconType } from "react-icons";
import {
  FaPersonBurst,
  FaPersonChalkboard,
  FaPersonCircleQuestion,
  FaPersonHarassing,
  FaPersonWalkingLuggage,
} from "react-icons/fa6";

export type NavSection = {
  /** Anchor id on the target <section>. */
  id: string;
  /** Label shown in the hero hover-pill. */
  label: string;
  icon: IconType;
};

/**
 * The sections the hero nav links to — everything after the hero itself.
 * Order matches the page scroll order.
 */
export const NAV_SECTIONS: NavSection[] = [
  { id: "contact", label: "Let's talk", icon: FaPersonCircleQuestion },
  { id: "work", label: "Work", icon: FaPersonChalkboard },
  { id: "one-shots", label: "One-shots", icon: FaPersonBurst },
  { id: "music", label: "Music", icon: FaPersonHarassing },
  { id: "connect", label: "Connect", icon: FaPersonWalkingLuggage },
];
