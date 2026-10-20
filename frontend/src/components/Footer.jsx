import { Link } from '../router/Link.jsx'

export default function Footer({ project }) {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-stone-500 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-stone-700">{project.footerTitle}</p>
          <p className="mt-2 max-w-3xl leading-relaxed">{project.footerCredits}</p>
          <p className="mt-2 max-w-3xl leading-relaxed">{project.footerSource}</p>
          <p className="mt-4 text-xs text-stone-400">
            Educational demo — not a substitute for professional agronomic advice. MIT
            License.
          </p>
        </div>

        <nav className="flex shrink-0 flex-wrap gap-x-5 gap-y-2 font-medium text-stone-600 sm:flex-col">
          <Link to="/" className="transition hover:text-emerald-700">
            Home
          </Link>
          <Link to="/detect" className="transition hover:text-emerald-700">
            Detector
          </Link>
          <Link to="/about" className="transition hover:text-emerald-700">
            How it works
          </Link>
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-emerald-700"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
