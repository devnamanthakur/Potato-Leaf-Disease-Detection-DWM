import { createContext, useContext } from 'react'

// Vite exposes the configured base path (defaults to '/'). Strip the trailing
// slash so route paths stay canonical, e.g. '/detect' rather than '/detect/'.
export const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

export const ROUTE_EVENT = 'app:navigate'

export function readPath() {
  let path = window.location.pathname

  if (BASE && (path === BASE || path.startsWith(`${BASE}/`))) {
    path = path.slice(BASE.length)
  }

  if (!path.startsWith('/')) path = `/${path}`
  return path.replace(/\/+$/, '') || '/'
}

export function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}

export const LocationContext = createContext({
  path: '/',
  navigate: () => {},
})

export function useLocation() {
  return useContext(LocationContext)
}

export function navigate(to, { replace = false } = {}) {
  const target = to.startsWith('/') ? to : `/${to}`
  const href = `${BASE}${target}` || '/'

  if (target === readPath()) {
    scrollToTop()
    return
  }

  window.history[replace ? 'replaceState' : 'pushState']({}, '', href)
  window.dispatchEvent(new Event(ROUTE_EVENT))
}
