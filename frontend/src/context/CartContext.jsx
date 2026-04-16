import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'um-cart-v1'

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter(
      (r) =>
        r &&
        typeof r.productId === 'string' &&
        typeof r.name === 'string' &&
        Number(r.pricePkr) >= 0 &&
        Number(r.qty) >= 1
    )
  } catch {
    return []
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStorage())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product, qty = 1) => {
    const q = Math.min(50, Math.max(1, Math.floor(Number(qty)) || 1))
    const line = {
      productId: product.id,
      name: product.name,
      pricePkr: product.pricePkr,
      image: product.image || '',
      categoryTitle: product.categoryTitle || '',
    }
    setItems((prev) => {
      const i = prev.findIndex((p) => p.productId === line.productId)
      if (i === -1) return [...prev, { ...line, qty: q }]
      const next = [...prev]
      next[i] = {
        ...next[i],
        qty: Math.min(50, (next[i].qty || 0) + q),
      }
      return next
    })
  }, [])

  const setQty = useCallback((productId, qty) => {
    const q = Math.floor(Number(qty))
    if (q < 1) {
      setItems((prev) => prev.filter((p) => p.productId !== productId))
      return
    }
    setItems((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, qty: Math.min(50, q) } : p
      )
    )
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const itemCount = useMemo(
    () => items.reduce((s, i) => s + (i.qty || 0), 0),
    [items]
  )

  const subtotalPkr = useMemo(
    () => items.reduce((s, i) => s + i.pricePkr * i.qty, 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      addItem,
      setQty,
      removeItem,
      clearCart,
      itemCount,
      subtotalPkr,
    }),
    [items, addItem, setQty, removeItem, clearCart, itemCount, subtotalPkr]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
