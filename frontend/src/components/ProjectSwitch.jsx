import { PROJECTS, PROJECT_ORDER } from '../constants'

export default function ProjectSwitch({ value, onChange, disabled }) {
  return (
    <div
      role="tablist"
      aria-label="Choose a detection model"
      className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white p-1 shadow-sm"
    >
      {PROJECT_ORDER.map((id) => {
        const project = PROJECTS[id]
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition disabled:opacity-60 ${
              active
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-emerald-700'
            }`}
          >
            <span aria-hidden="true">{project.emoji}</span>
            {project.name}
          </button>
        )
      })}
    </div>
  )
}
