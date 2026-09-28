import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png']
const MAX_SIZE_MB = 10

export default function UploadZone({ onFile, disabled, backendOnline }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState('')

  function handleFile(file) {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError('Please choose a JPG or PNG image.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setLocalError(`Image must be smaller than ${MAX_SIZE_MB} MB.`)
      return
    }
    setLocalError('')
    onFile(file)
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragActive(false)
    if (disabled) return
    handleFile(event.dataTransfer.files && event.dataTransfer.files[0])
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a potato leaf image"
        onClick={() => {
          if (!disabled && inputRef.current) inputRef.current.click()
        }}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
            event.preventDefault()
            if (inputRef.current) inputRef.current.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-stone-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/40'
        } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        <span className="grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <UploadCloud size={22} />
        </span>
        <p className="mt-4 font-semibold text-stone-800">Drop a potato leaf image here</p>
        <p className="mt-1 text-sm text-stone-500">
          or click to browse — JPG or PNG, up to {MAX_SIZE_MB} MB
        </p>
        {backendOnline === false && (
          <p className="mt-3 text-xs font-semibold text-red-500">
            Prediction backend is offline
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(event) => {
            handleFile(event.target.files && event.target.files[0])
            event.target.value = ''
          }}
        />
      </div>
      {localError && <p className="mt-2 text-sm text-red-600">{localError}</p>}
    </div>
  )
}
