import "./globals.css";
import Link from "next/link";
import { AuthStatus } from "@/components/AuthStatus";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Blog - Distributed Blogging Platform",
  description: "AI-powered blogging with distributed storage, seamless sync, and beautiful design",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="glass-header sticky top-0 z-50">
          <div className="container mx-auto max-w-7xl px-4 flex h-16 items-center gap-6">
            <Link href="/" className="text-xl font-bold gradient-text hover:opacity-80 transition-opacity">
              AI Blog
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="link">
                Home
              </Link>
              <Link href="/dashboard" className="link">
                Dashboard
              </Link>
              <Link href="/analytics" className="link">
                Analytics
              </Link>
              <Link href="/new" className="link">
                New Post
              </Link>
            </nav>
            <div className="ml-auto">
              <AuthStatus />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="min-h-[calc(100vh-4rem-5rem)]">
          {children}
        </main>

        <footer className="border-t border-white/30 bg-white/50 backdrop-blur-lg">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* About */}
              <div>
                <h3 className="font-bold text-lg mb-3 gradient-text">AI Blog</h3>
                <p className="text-sm text-slate-600">
                  The future of distributed blogging with AI-powered content creation
                  and seamless cloud synchronization.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-bold text-lg mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="link">Home</Link></li>
                  <li><Link href="/dashboard" className="link">Dashboard</Link></li>
                  <li><Link href="/new" className="link">Create Post</Link></li>
                  <li><Link href="/login" className="link">Login</Link></li>
                </ul>
              </div>

              {/* Tech Stack */}
              <div>
                <h3 className="font-bold text-lg mb-3">Built With</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                    Next.js
                  </span>
                  <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold">
                    Supabase
                  </span>
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    TailwindCSS
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                    Google AI
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/30 text-center text-sm text-slate-600">
              © {new Date().getFullYear()} AI Blog. Built with ❤️ using cutting-edge technology.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
