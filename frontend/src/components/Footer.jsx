export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-stone-500">
        <p className="font-semibold text-stone-700">Potato Leaf Disease Detection</p>
        <p className="mt-2 max-w-3xl leading-relaxed">
          Dhruv Sinha — dataset preparation, model training, evaluation, notebooks, and
          deployment. Naman — frontend / UI.
        </p>
        <p className="mt-2 max-w-3xl leading-relaxed">
          Dataset: PlantVillage — Hughes, D. P., &amp; Salathé, M. (2015). An open access
          repository of images on plant health to enable the development of mobile disease
          diagnostics. arXiv:1511.08060.
        </p>
        <p className="mt-4 text-xs text-stone-400">
          Educational demo — not a substitute for professional agronomic advice. MIT
          License.
        </p>
      </div>
    </footer>
  )
}
