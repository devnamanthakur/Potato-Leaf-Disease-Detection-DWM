import { ArrowRight, BookOpen, ScanLine } from 'lucide-react'
import Hero from '../components/Hero'
import { Link } from '../router/Link.jsx'

export default function HomePage({ project }) {
  return (
    <>
      <Hero project={project} />

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            to="/detect"
            className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <ScanLine size={20} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-stone-900">Try the live detector</h2>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-stone-600">
              Upload a {project.name.toLowerCase()} image or pick a sample, then see the
              prediction, class probabilities, and Grad-CAM explanation.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              Open detector
              <ArrowRight
                size={15}
                className="transition group-hover:translate-x-0.5"
              />
            </span>
          </Link>

          <Link
            to="/about"
            className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-stone-800 text-white shadow-sm">
              <BookOpen size={20} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-stone-900">How it works</h2>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-stone-600">
              Follow the image pipeline, compare the trained architectures, and read
              about the design choices behind the evaluation.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              Read about the project
              <ArrowRight
                size={15}
                className="transition group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          Currently viewing the{' '}
          <span className="font-semibold text-stone-700">{project.name}</span> model.
          Use the project switch in the header to change detectors.
        </p>
      </section>
    </>
  )
}
