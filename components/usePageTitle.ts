'use client'

import { useEffect } from 'react'

// Next.js App Router re-asserts the layout's static <title> on every commit, which
// races a plain `document.title =` set from a client page and silently reverts it.
// A MutationObserver on the <title> node re-corrects it whenever that happens.
export default function usePageTitle(title?: string | null) {
  useEffect(() => {
    if (!title) return
    const desired = `${title} | Fofora Tiyatro`
    document.title = desired
    const titleEl = document.querySelector('title')
    if (!titleEl) return
    const observer = new MutationObserver(() => {
      if (document.title !== desired) document.title = desired
    })
    observer.observe(titleEl, { childList: true, characterData: true, subtree: true })
    return () => observer.disconnect()
  }, [title])
}
