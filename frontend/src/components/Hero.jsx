import { ArrowDown, FlaskConical, Leaf, Target } from 'lucide-react'

const STATS = [
  { icon: Target, value: '99.69%', label: 'test-set accuracy' },
  { icon: FlaskConical, value: '4 models', label: 'compared under one protocol' },
  { icon: Leaf, value: '3 classes', label: 'Early Blight · Healthy · Late Blight' },
]

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-100/70 via-stone-50 to-stone-50" />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 text-center sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
          <Leaf size={13} />
          PlantVillage dataset · leak-free split
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
          Spot potato leaf disease from a single photo
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
          Upload a leaf image and a fine-tuned EfficientNetB3 classifies it as{' '}
          <span className="font-semibold text-emerald-700">Healthy</span>,{' '}
          <span className="font-semibold text-amber-700">Early Blight</span>, or{' '}
          <span className="font-semibold text-red-700">Late Blight</span> — with Grad-CAM
          highlighting the evidence behind the prediction.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#try"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Try the demo
            <ArrowDown size={16} />
          </a>
          <a
            href="#about"
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-emerald-400 hover:text-emerald-700"
          >
            How it works
          </a>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-4 text-left shadow-sm backdrop-blur"
            >
              <Icon size={18} className="text-emerald-600" />
              <p className="mt-2 text-xl font-bold text-stone-900">{value}</p>
              <p className="text-xs text-stone-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
