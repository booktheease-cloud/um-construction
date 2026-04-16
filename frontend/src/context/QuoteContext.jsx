import { createContext, useContext, useMemo, useState } from 'react'

const QuoteContext = createContext(null)

export function QuoteProvider({ children }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(
    () => ({
      quoteOpen: open,
      openQuote: () => setOpen(true),
      closeQuote: () => setOpen(false),
    }),
    [open]
  )
  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useQuote() {
  const ctx = useContext(QuoteContext)
  if (!ctx) throw new Error('useQuote must be used within QuoteProvider')
  return ctx
}
