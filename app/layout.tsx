import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const DESCRIPTION =
  "Hey I'm Isaac, an engineer, specialising in UX and Design. I help manage the creative teams at SSW – I would love to help out with whatever you're building.";

export const metadata: Metadata = {
  metadataBase: new URL("https://isaac-portfolio-rouge.vercel.app"),
  title: "Isaac W. R. Lombard | Software and AI Consulting",
  description: DESCRIPTION,
  openGraph: {
    title: "Isaac W. R. Lombard | Software and AI Consulting",
    description: DESCRIPTION,
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Isaac W. R. Lombard | Software and AI Consulting",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
