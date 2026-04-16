import { useEffect } from 'react'
import { SITE } from '../siteConfig'

export function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = `${title} | ${SITE.company}`
    return () => {
      document.title = prev
    }
  }, [title])
}
