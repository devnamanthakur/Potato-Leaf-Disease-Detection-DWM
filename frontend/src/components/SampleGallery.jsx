import { Loader2 } from 'lucide-react'
import { sampleImageUrl } from '../api'
import { SAMPLE_LABELS } from '../constants'

export default function SampleGallery({ samples, onSelect, disabled, pendingSample }) {
  if (!samples.length) return null

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-stone-700">Or try a sample image</p>
        <span className="text-xs text-stone-400">from External_Test_Data</span>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {samples.map(({ name }) => {
          const isPending = pendingSample === name
          return (
            <button
              key={name}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(name)}
              className="group relative overflow-hidden rounded-xl border border-stone-200 bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-60"
            >
              <img
                src={sampleImageUrl(name)}
                alt={SAMPLE_LABELS[name] || name}
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 text-left text-[11px] font-medium text-white">
                {SAMPLE_LABELS[name] || name}
              </span>
              {isPending && (
                <span className="absolute inset-0 grid place-items-center bg-white/70">
                  <Loader2 className="animate-spin text-emerald-600" size={20} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
