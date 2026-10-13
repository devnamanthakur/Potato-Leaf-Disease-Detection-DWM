export default function Footer({ project }) {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-stone-500">
        <p className="font-semibold text-stone-700">{project.footerTitle}</p>
        <p className="mt-2 max-w-3xl leading-relaxed">{project.footerCredits}</p>
        <p className="mt-2 max-w-3xl leading-relaxed">{project.footerSource}</p>
        <p className="mt-4 text-xs text-stone-400">
          Educational demo — not a substitute for professional agronomic advice. MIT
          License.
        </p>
      </div>
    </footer>
  )
}
