import { Link } from 'react-router-dom'
import { Logo } from './Logo'

const contactEmail = 'puneetk49081@gmail.com'

export const Footer = () => (
  <footer id="about" className="border-t border-border px-5 py-14 sm:px-8">
    <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {/* Brand Column */}
      <div className="sm:col-span-2 lg:col-span-1">
        <Link to="/" className="inline-flex items-center gap-3">
          <Logo />
          <span className="font-syne text-[15px] font-semibold text-text-1">LabelLens</span>
        </Link>
        <p className="mt-4 max-w-sm font-syne text-sm leading-6 text-text-2">
          AI-powered packaged food label scanner. Decode ingredients, additives, and hidden sugars with a plain-English health score.
        </p>
        <p className="mt-6 font-mono text-[11px] text-text-3">© 2026 LabelLens. All rights reserved.</p>
      </div>

      {/* Tools Column */}
      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Features &amp; Tools</h3>
        <ul className="mt-4 space-y-2.5 font-syne text-sm text-text-2">
          <li>
            <Link to="/scan" className="hover:text-text-1 transition-colors">
              Scan Food Label
            </Link>
          </li>
          <li>
            <Link to="/compare" className="hover:text-text-1 transition-colors">
              Compare Two Products
            </Link>
          </li>
          <li>
            <a href="/#process" className="hover:text-text-1 transition-colors">
              How It Works
            </a>
          </li>
          <li>
            <a href="/#features" className="hover:text-text-1 transition-colors">
              Key Features
            </a>
          </li>
        </ul>
      </div>

      {/* Knowledge & Community */}
      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Resources</h3>
        <ul className="mt-4 space-y-2.5 font-syne text-sm text-text-2">
          <li>
            <a href="/#faq" className="hover:text-text-1 transition-colors">
              Frequently Asked Questions
            </a>
          </li>
          <li>
            <a
              href="https://www.producthunt.com/products/labellens"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-1 transition-colors"
            >
              Product Hunt (#10) ↗
            </a>
          </li>
          <li>
            <a href={`mailto:${contactEmail}`} className="hover:text-text-1 transition-colors">
              Support: {contactEmail}
            </a>
          </li>
        </ul>
      </div>

      {/* Legal Column */}
      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Legal &amp; Trust</h3>
        <ul className="mt-4 space-y-2.5 font-syne text-sm text-text-2">
          <li>
            <Link to="/privacy" className="hover:text-text-1 transition-colors">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link to="/terms" className="hover:text-text-1 transition-colors">
              Terms of Service
            </Link>
          </li>
          <li className="font-mono text-xs text-text-3 pt-2">
            Built for health-conscious consumers.
          </li>
        </ul>
      </div>
    </div>

    <div className="mx-auto mt-12 max-w-7xl border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-text-3">
      <span>Built by Puneet</span>
      <span>See Beyond the Label.</span>
    </div>
  </footer>
)

