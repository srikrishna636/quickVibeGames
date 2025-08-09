import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { Plus_Jakarta_Sans, Space_Mono } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400","700"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "QuickVibe Games",
  description: "Fast, fun, zero-friction web games — play solo or with friends.",
};
export const viewport: Viewport = { themeColor: "#0B0F14", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${mono.variable} font-sans bg-bg text-offwhite min-h-screen`}>
        <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-black/30">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              QuickVibe<span className="text-mint">.games</span>
            </Link>
            <nav className="hidden sm:flex gap-6 text-sm">
              <Link href="/games" className="hover:text-aqua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric rounded-md px-1">Games</Link>
              <Link href="/leaderboards" className="hover:text-aqua focus-visible:ring-2 focus-visible:ring-electric rounded-md px-1">Leaderboards</Link>
              <Link href="/about" className="hover:text-aqua focus-visible:ring-2 focus-visible:ring-electric rounded-md px-1">About</Link>
            </nav>
            <Link href="/play" className="inline-flex items-center rounded-2xl px-4 py-2 bg-gradient-to-r from-mint to-aqua text-ink font-semibold shadow-[var(--shadow-neon)] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-electric">
              Play now
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

        <footer className="mt-16 border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-white/60 flex flex-wrap gap-4 justify-between">
            <p>© {new Date().getFullYear()} QuickVibe Games</p>
            <div className="space-x-4">
              <Link href="/privacy" className="hover:text-aqua">Privacy</Link>
              <Link href="/terms" className="hover:text-aqua">Terms</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
