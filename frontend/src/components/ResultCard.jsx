import { AlertTriangle, Leaf, Loader2, RefreshCw } from 'lucide-react'
import { CLASS_META } from '../constants'
import { toDataUrl } from '../api'
import ProbabilityBars from './ProbabilityBars'
import GradCamSlider from './GradCamSlider'

export default function ResultCard({ status, result, error, previewUrl, onReset }) {
  if (status === 'idle') {
    return (
      <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <Leaf size={22} />
        </span>
        <p className="mt-4 font-semibold text-stone-700">No image analyzed yet</p>
        <p className="mt-1 max-w-xs text-sm text-stone-500">
          Upload a leaf photo or pick one of the samples to see the prediction, confidence
          scores, and the Grad-CAM explanation.
        </p>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Uploaded leaf"
              className="size-20 rounded-xl object-cover"
            />
          )}
          <div>
            <p className="flex items-center gap-2 font-semibold text-stone-800">
              <Loader2 className="animate-spin text-emerald-600" size={18} />
              Analyzing leaf
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Running EfficientNetB3 and computing Grad-CAM — this can take a few seconds
              on CPU.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-3 animate-pulse rounded-full bg-stone-100"
              style={{ width: `${80 - index * 15}%` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="flex items-center gap-2 font-semibold text-red-700">
          <AlertTriangle size={18} />
          Could not analyze the image
        </p>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <RefreshCw size={15} />
          Try another image
        </button>
      </div>
    )
  }

  const meta = CLASS_META[result.predicted_class] || {
    label: result.predicted_class,
    pathogen: '',
    badge: 'bg-stone-100 text-stone-700 ring-stone-200',
    description: '',
  }
  const confidence = (result.confidence * 100).toFixed(2)

  return (
    <div className="animate-fade-up overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
          Prediction
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ${meta.badge}`}
          >
            {meta.label}
          </span>
          <span className="text-3xl font-bold tabular-nums text-stone-900">
            {confidence}%
          </span>
          <span className="text-sm text-stone-500">confidence</span>
        </div>
        {meta.description && (
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            {meta.description}{' '}
            <span className="text-stone-400">{meta.pathogen}</span>
          </p>
        )}
      </div>

      <div className="space-y-6 p-6">
        <ProbabilityBars probabilities={result.probabilities} />
        <GradCamSlider
          original={toDataUrl(result.image)}
          overlay={toDataUrl(result.gradcam.overlay)}
          predictedLabel={meta.label}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 bg-stone-50/60 px-6 py-4">
        <p className="text-xs text-stone-400">
          Model: {result.model_name} · Grad-CAM on the last convolutional layer
        </p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-1.5 text-sm font-medium text-stone-700 transition hover:border-emerald-400 hover:text-emerald-700"
        >
          <RefreshCw size={14} />
          Analyze another
        </button>
      </div>
    </div>
  )
}
