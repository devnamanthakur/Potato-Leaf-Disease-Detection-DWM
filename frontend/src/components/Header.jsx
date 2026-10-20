import { Leaf } from 'lucide-react'
import { Link } from '../router/Link.jsx'
import { useLocation } from '../router/router'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/detect', label: 'Detector' },
  { to: '/about', label: 'How it works' },
]

export default function Header({ project, modelName, children }) {
  const { path } = useLocation()

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Leaf size={18} />
          </span>
          <span>
            <span className="block text-sm font-bold leading-tight text-stone-900">
              {project.title}
            </span>
            <span className="block text-xs leading-tight text-stone-500">
              {project.subtitle}
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="order-3 -mx-1 flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto"
        >
          {NAV_ITEMS.map((item) => {
            const active =
              item.to === '/' ? path === '/' : path === item.to || path.startsWith(`${item.to}/`)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-stone-600 hover:text-emerald-700'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {modelName && (
            <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 xl:inline">
              {modelName.replaceAll('_', ' ')}
            </span>
          )}
          {children}
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm font-medium text-stone-600 transition hover:text-emerald-700 sm:inline"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  )
}
