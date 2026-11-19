import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { profile } from "@/content/site";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const description =
  "Shreyash Chandra is a full stack engineer focused on backend and DevOps: scalable, data-intensive systems, microservices, CI/CD on AWS and GenAI services.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.site),
  title: "Shreyash Chandra · Backend & DevOps Engineer",
  description,
  authors: [{ name: profile.name, url: profile.site }],
  openGraph: {
    type: "website",
    url: profile.site,
    title: "Shreyash Chandra · Backend & DevOps Engineer",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyash Chandra · Backend & DevOps Engineer",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eeece8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0a" },
  ],
};

// Runs before paint: applies the saved theme, marks JS as available and
// skips the intro loader on repeat visits in the same session.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')d.dataset.theme=t;}catch(e){}try{if(sessionStorage.getItem('intro-seen'))d.classList.add('loaded','intro-skip');}catch(e){}if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('loaded','intro-skip');})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
