import { ArrowRight } from 'lucide-react'
import AboutSection from '../components/AboutSection'
import { Link } from '../router/Link.jsx'

export default function AboutPage({ project, modelName }) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-stone-200/60 bg-gradient-to-b from-emerald-100/70 via-stone-50 to-stone-50">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
            About the project
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            How it works
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-stone-600">
            {project.about.intro}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
              {project.name} · {project.subtitle}
            </span>
            {modelName && (
              <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600 shadow-sm">
                {modelName.replaceAll('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </section>

      <AboutSection project={project} showIntro={false} />

      <section className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-stone-800">Ready to see it in action?</p>
            <p className="mt-1 text-sm text-stone-500">
              Upload your own image or start from a sample.
            </p>
          </div>
          <Link
            to="/detect"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Open detector
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  )
}
