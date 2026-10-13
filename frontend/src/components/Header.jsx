import { Leaf } from 'lucide-react'

export default function Header({ project, modelName, children }) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <a href="#top" className="flex items-center gap-2.5">
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
        </a>
        <div className="flex items-center gap-4">
          {modelName && (
            <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 lg:inline">
              {modelName.replaceAll('_', ' ')}
            </span>
          )}
          {children}
          <a
            href="#about"
            className="text-sm font-medium text-stone-600 transition hover:text-emerald-700"
          >
            How it works
          </a>
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
