const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function basePath(project) {
  return project === 'papaya' ? `${API_BASE}/api/papaya` : `${API_BASE}/api`
}

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

export function sampleImageUrl(project, name) {
  return `${basePath(project)}/samples/${encodeURIComponent(name)}`
}

export async function fetchProjectConfig(project) {
  const response = await fetch(`${basePath(project)}/config`)
  if (!response.ok) throw new Error(await parseError(response))
  return response.json()
}

export async function fetchProjectSamples(project) {
  const response = await fetch(`${basePath(project)}/samples`)
  if (!response.ok) throw new Error(await parseError(response))
  const data = await response.json()
  return data.samples || []
}

export async function fetchProjectSampleFile(project, name) {
  const response = await fetch(sampleImageUrl(project, name))
  if (!response.ok) throw new Error(await parseError(response))
  const blob = await response.blob()
  return new File([blob], name, { type: blob.type || 'image/png' })
}

export async function predictProjectImage(project, file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${basePath(project)}/predict`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) throw new Error(await parseError(response))
  return response.json()
}
