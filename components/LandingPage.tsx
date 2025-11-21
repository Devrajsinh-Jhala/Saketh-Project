'use client';

import Link from 'next/link';
import { useState } from 'react';

export function LandingPage() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thanks for subscribing with ${email}!`);
    setEmail('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Elements */}
      <div className="floating-element floating-element-1" />
      <div className="floating-element floating-element-2" />
      <div className="floating-element floating-element-3" />

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="stagger-children text-center">
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight mb-6">
              Welcome to{' '}
              <span className="gradient-text">AI Blog</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl md:text-3xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Experience the future of distributed blogging with AI-powered content,
              seamless synchronization, and beautiful design.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <span className="px-5 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold border border-purple-200">
                🤖 AI-Powered
              </span>
              <span className="px-5 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold border border-pink-200">
                ☁️ Cloud Sync
              </span>
              <span className="px-5 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold border border-indigo-200">
                💾 Local Backup
              </span>
              <span className="px-5 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold border border-purple-200">
                🚀 Lightning Fast
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                View All Posts
              </Link>
              <Link href="/new" className="btn-outline text-lg px-8 py-4">
                Create New Post
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Why Choose <span className="gradient-text">AI Blog?</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-8 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4 animate-float">🎨</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Beautiful Design</h3>
              <p className="text-slate-600">
                Stunning glassmorphic UI with smooth animations and modern aesthetics
                that make every interaction delightful.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4 animate-float" style={{ animationDelay: '1s' }}>🤖</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">AI-Powered Drafts</h3>
              <p className="text-slate-600">
                Generate high-quality blog post drafts instantly with our advanced
                AI assistant powered by Google Gemini.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4 animate-float" style={{ animationDelay: '2s' }}>☁️</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Distributed Storage</h3>
              <p className="text-slate-600">
                Your content is automatically synced to Supabase cloud, stored locally,
                and backed up to multiple devices.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card p-8 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4 animate-float" style={{ animationDelay: '0.5s' }}>💬</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Interactive Comments</h3>
              <p className="text-slate-600">
                Engage with your readers through real-time comments and likes,
                fostering a vibrant community.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card p-8 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4 animate-float" style={{ animationDelay: '1.5s' }}>📝</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Markdown Support</h3>
              <p className="text-slate-600">
                Write with ease using Markdown formatting with real-time preview
                and syntax highlighting.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card p-8 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4 animate-float" style={{ animationDelay: '2.5s' }}>🔒</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Secure & Private</h3>
              <p className="text-slate-600">
                Your data is encrypted and secure with authentication powered by
                Supabase's robust security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Showcase */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="card-gradient text-white p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Distributed Architecture
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Built on a cutting-edge distributed system that ensures your content
              is always available, no matter what.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                <h3 className="text-2xl font-bold mb-2">☁️ Supabase Cloud</h3>
                <p className="text-white/80">Primary storage and real-time sync</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                <h3 className="text-2xl font-bold mb-2">💻 Local Storage</h3>
                <p className="text-white/80">Offline access and redundancy</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                <h3 className="text-2xl font-bold mb-2">🔄 Auto Backup</h3>
                <p className="text-white/80">Multi-device synchronization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter/CTA Section */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="card p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Blogging?
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Join our platform and experience the future of content creation.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input flex-1"
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Get Started
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Stats */}
      <section className="relative px-4 py-16 border-t border-white/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">Fast</div>
              <div className="text-slate-600">Lightning Performance</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">Secure</div>
              <div className="text-slate-600">End-to-End Encryption</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">Smart</div>
              <div className="text-slate-600">AI-Powered Features</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">Reliable</div>
              <div className="text-slate-600">99.9% Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
