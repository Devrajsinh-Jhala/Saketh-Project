import "./globals.css";
import Link from "next/link";
import { AuthStatus } from "@/components/AuthStatus";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Blog (Mini)",
  description: "Minimal blog with comments, likes, and AI draft",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
          <div className="container mx-auto max-w-[880px] px-4 flex h-14 items-center gap-6">
            <Link href="/" className="font-semibold">AIBlog</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/new" className="hover:underline">New Post</Link>
              <Link href="/login" className="hover:underline">Login</Link>
            </nav>
            <div className="ml-auto">
              <AuthStatus />
            </div>
          </div>
        </header>

        {/* Centered page content with real padding */}
        <main className="container mx-auto max-w-[880px] px-4 py-10">
          {children}
        </main>

        <footer className="border-t">
          <div className="container mx-auto max-w-[880px] px-4 py-6 text-center text-xs text-gray-500">
            Built with Next.js, Supabase & Tailwind
          </div>
        </footer>
      </body>
    </html>
  );
}
