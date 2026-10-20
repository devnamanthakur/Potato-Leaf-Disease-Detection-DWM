import { useEffect, useState } from 'react'
import {
  LocationContext,
  ROUTE_EVENT,
  navigate,
  readPath,
  scrollToTop,
} from './router'

export function RouterProvider({ children }) {
  const [path, setPath] = useState(readPath)

  useEffect(() => {
    function handleLocationChange() {
      setPath(readPath())
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener(ROUTE_EVENT, handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener(ROUTE_EVENT, handleLocationChange)
    }
  }, [])

  useEffect(() => {
    scrollToTop()
  }, [path])

  return (
    <LocationContext.Provider value={{ path, navigate }}>
      {children}
    </LocationContext.Provider>
  )
}
