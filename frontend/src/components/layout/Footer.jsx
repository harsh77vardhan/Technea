export default function Footer() {
  return (
    <footer className="bg-white text-neutral-600 pt-16 pb-12 border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center border border-neutral-900 bg-neutral-950 text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path
                    d="M4 5.5C4 4.67157 4.67157 4 5.5 4H18.5C19.3284 4 20 4.67157 20 5.5V6.5C20 7.32843 19.3284 8 18.5 8H13.75V18.5C13.75 19.3284 13.0784 20 12.25 20H11.75C10.9216 20 10.25 19.3284 10.25 18.5V8H5.5C4.67157 8 4 7.32843 4 6.5V5.5Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-950 uppercase">
                Technea
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-neutral-500 leading-relaxed">
              An AI-powered learning platform designed for beginners to build foundational tech skills with guided roadmaps and personalized assistance.
            </p>
            <div className="mt-6 flex items-center gap-3 text-neutral-500">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="border border-neutral-200 p-2 text-neutral-500 hover:border-black hover:text-black transition-colors"
                aria-label="GitHub"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="border border-neutral-200 p-2 text-neutral-500 hover:border-black hover:text-black transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="border border-neutral-200 p-2 text-neutral-500 hover:border-black hover:text-black transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.761-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Roadmaps */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-neutral-950">
              Roadmaps
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="#hero-search" className="text-neutral-500 hover:text-black transition-colors">
                  Python Fundamentals
                </a>
              </li>
              <li>
                <a href="#hero-search" className="text-neutral-500 hover:text-black transition-colors">
                  Prompt Engineering & LLMs
                </a>
              </li>
              <li>
                <a href="#hero-search" className="text-neutral-500 hover:text-black transition-colors">
                  Modern React & Web UI
                </a>
              </li>
              <li>
                <a href="#hero-search" className="text-neutral-500 hover:text-black transition-colors">
                  Data Insights & Automation
                </a>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-neutral-950">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="#features" className="text-neutral-500 hover:text-black transition-colors">
                  Architecture
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-neutral-500 hover:text-black transition-colors">
                  Methodology
                </a>
              </li>
              <li>
                <a href="#curriculum" className="text-neutral-500 hover:text-black transition-colors">
                  Curriculum
                </a>
              </li>
              <li>
                <a href="#cta" className="text-neutral-500 hover:text-black transition-colors">
                  Get Started
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-8 sm:flex-row text-xs font-mono uppercase tracking-wider text-neutral-400">
          <p>© {new Date().getFullYear()} Technea Inc. All rights reserved.</p>
          <p>
            Designed for the next generation of builders.
          </p>
        </div>
      </div>
    </footer>
  )
}
