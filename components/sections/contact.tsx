"use client";

/**
 * SECTION 2 — CTA / LEAD CAPTURE
 * Component: https://21st.dev/@kokonutd/components/animated-ai-input
 *
 * The kokonut animated-ai-input, used as-is, reworked into a lead-capture form:
 * persona "models" instead of provider logos, submit wired to /api/contact with
 * an optional email follow-up when the message carried no address.
 */

import { LeadCaptureChat } from "@/components/ui/animated-ai-input";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-foreground"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">Human Chat</p>
      <LeadCaptureChat />
    </section>
  );
}
