import { Leaf } from 'lucide-react'

const REPO_URL = 'https://github.com/SinhaDhruv17/Potato-Leaf-Disease-Detection-DWM'

export default function Header({ modelName }) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Leaf size={18} />
          </span>
          <span>
            <span className="block text-sm font-bold leading-tight text-stone-900">
              Potato Leaf Disease Detector
            </span>
            <span className="block text-xs leading-tight text-stone-500">
              EfficientNetB3 + Grad-CAM
            </span>
          </span>
        </a>
        <div className="flex items-center gap-4">
          {modelName && (
            <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:inline">
              {modelName.replaceAll('_', ' ')}
            </span>
          )}
          <a
            href="#about"
            className="text-sm font-medium text-stone-600 transition hover:text-emerald-700"
          >
            How it works
          </a>
          <a
            href={REPO_URL}
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
