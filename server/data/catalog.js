/** Authoritative product catalog — prices in PKR (rupees). Used for display and checkout validation. */

export const productCategories = [
  {
    id: 'waterproofing',
    title: 'Waterproofing chemicals',
    items: [
      {
        id: 'wp-1',
        name: 'Cementitious waterproof coating',
        note: 'For roofs, basements, and wet areas',
        image:
          'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80',
        pricePkr: 4200,
      },
      {
        id: 'wp-2',
        name: 'Liquid membrane system',
        note: 'Flexible protection for terraces',
        image:
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80',
        pricePkr: 6800,
      },
      {
        id: 'wp-3',
        name: 'Crystalline waterproofing admixture',
        note: 'For concrete water tanks & structures',
        image:
          'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80',
        pricePkr: 5100,
      },
    ],
  },
  {
    id: 'sealants',
    title: 'Sealants',
    items: [
      {
        id: 'sl-1',
        name: 'Silicone sanitary sealant',
        note: 'Bathroom & kitchen joints',
        image:
          'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
        pricePkr: 890,
      },
      {
        id: 'sl-2',
        name: 'Polyurethane joint sealant',
        note: 'Expansion joints & facades',
        image:
          'https://images.unsplash.com/photo-1581578731548-c6463ccd3786?w=600&q=80',
        pricePkr: 2400,
      },
    ],
  },
  {
    id: 'adhesives',
    title: 'Adhesives',
    items: [
      {
        id: 'ad-1',
        name: 'Tile adhesive (C2)',
        note: 'Large-format & heavy tiles',
        image:
          'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=600&q=80',
        pricePkr: 1850,
      },
      {
        id: 'ad-2',
        name: 'Stone fixing compound',
        note: 'Marble & granite cladding',
        image:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
        pricePkr: 3200,
      },
    ],
  },
]

const productById = new Map()
for (const cat of productCategories) {
  for (const item of cat.items) {
    productById.set(item.id, {
      ...item,
      categoryId: cat.id,
      categoryTitle: cat.title,
    })
  }
}

export function getProductById(id) {
  return productById.get(id) || null
}

/**
 * @param {{ productId: string, qty: unknown }[]} rawItems
 * @returns {{ ok: true, lines: object[] } | { ok: false, message: string }}
 */
export function resolveCartLines(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { ok: false, message: 'Cart is empty.' }
  }
  if (rawItems.length > 30) {
    return { ok: false, message: 'Too many line items.' }
  }
  const lines = []
  for (const row of rawItems) {
    const productId = typeof row.productId === 'string' ? row.productId.trim() : ''
    const qtyNum = Math.floor(Number(row.qty))
    if (!productId) {
      return { ok: false, message: 'Invalid product in cart.' }
    }
    if (qtyNum < 1 || qtyNum > 50) {
      return { ok: false, message: 'Quantity must be between 1 and 50 per item.' }
    }
    const p = getProductById(productId)
    if (!p) {
      return { ok: false, message: `Unknown product: ${productId}` }
    }
    lines.push({
      productId: p.id,
      name: p.name,
      image: p.image,
      unitPricePkr: p.pricePkr,
      qty: qtyNum,
      categoryTitle: p.categoryTitle,
    })
  }
  return { ok: true, lines }
}

export function sumLinesPkr(lines) {
  return lines.reduce((s, l) => s + l.unitPricePkr * l.qty, 0)
}

/** Stripe Checkout uses smallest currency unit; PKR uses paisa (1 PKR = 100 paisa). */
export function pkrToStripeUnitAmount(pkr) {
  return Math.round(Number(pkr) * 100)
}
