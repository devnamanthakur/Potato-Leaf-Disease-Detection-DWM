import { CLASS_META } from '../constants'

export default function ProbabilityBars({ probabilities }) {
  const sorted = [...probabilities].sort((a, b) => b.probability - a.probability)

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-stone-700">Class probabilities</p>
      <div className="space-y-3">
        {sorted.map(({ label, probability }) => {
          const meta = CLASS_META[label] || {}
          const percent = probability * 100
          return (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-stone-700">{meta.label || label}</span>
                <span className="tabular-nums text-stone-500">{percent.toFixed(2)}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${meta.bar || 'bg-stone-400'}`}
                  style={{ width: `${Math.max(percent, 1)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
