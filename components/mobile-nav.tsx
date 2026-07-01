"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NAV_SECTIONS } from "@/lib/sections";

/**
 * Mobile-only sticky hamburger. The hero's inline nav marks are desktop-only
 * (they rely on hover); on mobile the sections live behind this menu instead.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="fixed right-4 top-4 z-50 grid size-11 place-items-center rounded-full border border-black/10 bg-white text-foreground shadow-lg"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-1 bg-white"
          >
            {NAV_SECTIONS.map((section, i) => {
              const Icon = section.icon;
              return (
                <motion.a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i + 0.05 }}
                  className="flex items-center gap-4 px-8 py-4 font-heading text-3xl font-semibold tracking-tight text-foreground"
                >
                  <Icon className="size-6 text-brand" />
                  {section.label}
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
