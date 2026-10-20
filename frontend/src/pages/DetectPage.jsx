import { ArrowRight } from 'lucide-react'
import UploadZone from '../components/UploadZone'
import SampleGallery from '../components/SampleGallery'
import ResultCard from '../components/ResultCard'
import { Link } from '../router/Link.jsx'

export default function DetectPage({
  project,
  samples,
  backendOnline,
  status,
  result,
  error,
  previewUrl,
  pendingSample,
  onAnalyze,
  onSampleSelect,
  onReset,
  resultRef,
}) {
  return (
    <section id="try" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
            Live demo
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Analyze a {project.name.toLowerCase()} image
          </h1>
          <p className="mt-3 text-stone-600">
            Drop in a photo or choose a sample. You&apos;ll get the predicted class,
            confidence, per-class probabilities, and a Grad-CAM heatmap.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {project.subtitle}
        </span>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <UploadZone
            onFile={onAnalyze}
            disabled={status === 'loading'}
            backendOnline={backendOnline}
            project={project}
          />
          {project.hasSamples && (
            <SampleGallery
              samples={samples}
              onSelect={onSampleSelect}
              disabled={status === 'loading'}
              pendingSample={pendingSample}
              project={project}
            />
          )}
        </div>
        <div ref={resultRef} className="lg:sticky lg:top-24">
          <ResultCard
            status={status}
            result={result}
            error={error}
            previewUrl={previewUrl}
            onReset={onReset}
            project={project}
          />
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm">
        <p className="text-stone-600">Curious what happens inside the model?</p>
        <Link
          to="/about"
          className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 transition hover:text-emerald-800"
        >
          How it works
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  )
}
