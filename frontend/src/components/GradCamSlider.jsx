import { useState } from 'react'

export default function GradCamSlider({ original, overlay, predictedLabel }) {
  const [position, setPosition] = useState(50)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-stone-700">
          Grad-CAM — where the model is looking
        </p>
        <span className="text-xs text-stone-400">drag the slider</span>
      </div>
      <div className="relative select-none overflow-hidden rounded-xl border border-stone-200">
        <img src={original} alt="Processed leaf" className="block w-full" draggable={false} />
        <img
          src={overlay}
          alt="Grad-CAM overlay"
          className="absolute inset-0 block w-full"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          draggable={false}
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow"
          style={{ left: `${position}%` }}
        />
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
          Original
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
          Grad-CAM
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="gradcam-range mt-3 w-full"
        aria-label="Grad-CAM overlay position"
      />
      <p className="mt-2 text-xs text-stone-500">
        Warm regions (red and yellow) are the areas that most influenced the prediction:{' '}
        <span className="font-medium text-stone-700">{predictedLabel}</span>.
      </p>
    </div>
  )
}
