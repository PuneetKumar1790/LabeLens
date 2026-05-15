import { Logo } from './Logo'

const contactEmail = 'puneetk49081@gmail.com'

export const Footer = () => (
  <footer id="about" className="border-t border-border px-5 py-12 sm:px-8">
    <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_auto]">
      <div>
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-syne text-[15px] font-semibold text-text-1">LabelLens</span>
        </div>
        <p className="mt-5 max-w-sm font-syne text-sm leading-6 text-text-2">See Beyond the Label.</p>
        <p className="mt-8 font-mono text-[11px] text-text-3">© 2026 LabelLens. All rights reserved.</p>
      </div>
      <div className="grid content-start gap-3 text-left md:text-right">
        <a href={`mailto:${contactEmail}`} className="font-syne text-sm text-text-2 hover:text-text-1">
          {contactEmail}
        </a>
      </div>
    </div>
    <div className="mx-auto mt-12 max-w-7xl border-t border-border pt-5 font-mono text-[11px] text-text-3">
      Built by Puneet
    </div>
  </footer>
)
