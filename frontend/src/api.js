const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function parseError(response) {
  try {
    const data = await response.json()
    if (data && data.detail) return data.detail
  } catch {
    return 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

export function toDataUrl(base64Png) {
  return `data:image/png;base64,${base64Png}`
}

export function sampleImageUrl(name) {
  return `${API_BASE}/api/samples/${encodeURIComponent(name)}`
}

export async function fetchConfig() {
  const response = await fetch(`${API_BASE}/api/config`)
  if (!response.ok) throw new Error(await parseError(response))
  return response.json()
}

export async function fetchSamples() {
  const response = await fetch(`${API_BASE}/api/samples`)
  if (!response.ok) throw new Error(await parseError(response))
  const data = await response.json()
  return data.samples || []
}

export async function fetchSampleFile(name) {
  const response = await fetch(sampleImageUrl(name))
  if (!response.ok) throw new Error(await parseError(response))
  const blob = await response.blob()
  return new File([blob], name, { type: blob.type || 'image/png' })
}

export async function predictImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) throw new Error(await parseError(response))
  return response.json()
}
