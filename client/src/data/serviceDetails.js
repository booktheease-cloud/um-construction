const img = {
  construction:
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&q=80',
  waterproof:
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&q=80',
  plumbing:
    'https://images.unsplash.com/photo-1585704031119-1e5f9b21c346?w=900&q=80',
  electrical:
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=900&q=80',
  woodwork:
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80',
}

export const serviceCategories = [
  {
    id: 'construction',
    title: 'Construction services',
    summary: 'From grey structure to finishing.',
    image: img.construction,
    items: [
      {
        name: 'Grey structure',
        description:
          'Columns, beams, slabs, and block work with supervised concrete curing and quality checks.',
      },
      {
        name: 'Renovation',
        description:
          'Structural repairs, layout changes, and upgrades with minimal disruption to daily life.',
      },
      {
        name: 'Tile work',
        description:
          'Precision leveling, waterproofing under wet areas, and neat joint lines for floors & walls.',
      },
    ],
  },
  {
    id: 'waterproofing',
    title: 'Waterproofing',
    summary: 'Stop seepage at the source — roofs, bathrooms, and water retaining structures.',
    image: img.waterproof,
    items: [
      {
        name: 'Roof waterproofing',
        description:
          'Membrane systems, slope correction guidance, and drainage detailing to prevent ponding.',
      },
      {
        name: 'Bathroom leakage solutions',
        description:
          'Pressure testing, targeted breaking, concealed pipe repairs, and re-waterproofing.',
      },
      {
        name: 'Water tank protection',
        description:
          'Food-safe internal coatings and structural crack treatment for overhead/underground tanks.',
      },
    ],
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    summary: 'Installations, upgrades, and emergency leak response across Karachi.',
    image: img.plumbing,
    items: [
      {
        name: 'Pipe installation',
        description:
          'Hot/cold lines, pumps, pressure tanks, and concealed routing with accessible inspection points.',
      },
      {
        name: 'Leakage fixing',
        description:
          'Acoustic/visual tracing where possible to reduce unnecessary damage and cost.',
      },
      {
        name: 'Bathroom fittings',
        description:
          'Mixers, showers, commodes, and vanities installed with proper sealing and testing.',
      },
    ],
  },
  {
    id: 'electrical',
    title: 'Electrical',
    summary: 'Safe wiring, fault finding, and modern distribution for homes and shops.',
    image: img.electrical,
    items: [
      {
        name: 'Wiring',
        description:
          'New circuits, earthing, and cable sizing suitable for AC loads and kitchen appliances.',
      },
      {
        name: 'Fault repair',
        description:
          'Tripping breakers, burnt sockets, low voltage issues — diagnosed with proper tools.',
      },
      {
        name: 'Switchboard installation',
        description:
          'Neat DB assembly, labeling, surge awareness, and compliance-minded workmanship.',
      },
    ],
  },
  {
    id: 'woodwork',
    title: 'Woodwork',
    summary: 'Custom carpentry that matches your space and usage.',
    image: img.woodwork,
    items: [
      {
        name: 'Cabinets',
        description:
          'Kitchen wardrobes, TV units, and storage with durable hardware and finishes.',
      },
      {
        name: 'Doors',
        description:
          'Solid core options, frames, architraves, and smooth operation with quality hinges/locks.',
      },
      {
        name: 'Furniture work',
        description:
          'Beds, shelves, and office tables — measured on-site for a precise fit.',
      },
    ],
  },
]
