import { ArrowLeft } from 'lucide-react'
import { Link } from '../router/Link.jsx'

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
        404
      </span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-stone-600">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Head back to
        the home page and start from there.
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        <ArrowLeft size={15} />
        Back to home
      </Link>
    </section>
  )
}
