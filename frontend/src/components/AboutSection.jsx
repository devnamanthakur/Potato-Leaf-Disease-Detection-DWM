import {
  BarChart3,
  BrainCircuit,
  FlaskConical,
  Info,
  ScanLine,
  Shrink,
  SlidersHorizontal,
} from 'lucide-react'
import { MODEL_RESULTS } from '../constants'

const PIPELINE = [
  { icon: ScanLine, title: '1. Upload', text: 'JPG or PNG leaf photo' },
  { icon: Shrink, title: '2. Resize', text: '300 × 300 pixels, RGB' },
  {
    icon: SlidersHorizontal,
    title: '3. Preprocess',
    text: 'EfficientNet scaling to [-1, 1]',
  },
  { icon: BrainCircuit, title: '4. Classify', text: 'Fine-tuned EfficientNetB3' },
  { icon: BarChart3, title: '5. Explain', text: 'Softmax + Grad-CAM heatmap' },
]

const DESIGN_CHOICES = [
  'Split before augmentation: the 70/15/15 train/val/test split happens on original images, so augmented copies can never leak across splits.',
  'Only the train split is augmented — flips, ±15°/±25° rotations with reflected borders, brightness changes, and zoom.',
  'Moderate oversampling of the small Healthy class (152 originals to 1000) plus balanced class weights during training.',
  'All four architectures trained under an identical protocol, then evaluated once on the untouched 323-image test set.',
]

export default function AboutSection() {
  return (
    <section id="about" className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
          About the project
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
          How it works
        </h2>
        <p className="mt-3 max-w-3xl text-stone-600">
          The deployed model is a fine-tuned EfficientNetB3 with a custom classification
          head, trained on 3,800 PlantVillage images and evaluated on a held-out test set
          that was never trained on or augmented.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PIPELINE.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4"
            >
              <Icon size={18} className="text-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-stone-800">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-stone-500">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-stone-900">
              <FlaskConical size={18} className="text-emerald-600" />
              Model comparison
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              Held-out test set (323 images), identical split and training protocol.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Model</th>
                    <th className="px-4 py-3 font-medium">Test acc.</th>
                    <th className="px-4 py-3 font-medium">Macro F1</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">Params</th>
                  </tr>
                </thead>
                <tbody>
                  {MODEL_RESULTS.map((row) => (
                    <tr
                      key={row.model}
                      className={`border-t border-stone-100 ${
                        row.highlight ? 'bg-emerald-50/70' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-stone-700">
                        {row.model}
                        {row.highlight && (
                          <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-white">
                            deployed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-stone-600">
                        {row.accuracy}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-stone-600">{row.f1}</td>
                      <td className="hidden px-4 py-3 tabular-nums text-stone-600 sm:table-cell">
                        {row.params}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-stone-900">Design choices</h3>
            <ul className="mt-3 space-y-3">
              {DESIGN_CHOICES.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-stone-600"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <Info size={18} className="mt-0.5 shrink-0" />
              <p>
                Limitation: PlantVillage images are captured under lab conditions with
                uniform backgrounds. Field photos with soil, shadows, or multiple leaves
                may be harder — try the "Not a leaf" sample to see how the model behaves
                outside its domain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
