import { BASE, useLocation } from './router'

export function Link({ to, onClick, replace = false, ...props }) {
  const { navigate } = useLocation()
  const href = `${BASE}${to.startsWith('/') ? to : `/${to}`}` || '/'

  function handleClick(event) {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    event.preventDefault()
    navigate(to, { replace })
  }

  return <a href={href || '/'} onClick={handleClick} {...props} />
}
