import type { Product } from '../types/database'

export const defaultFurnitureInventory: Product[] = [
  {
    id: 'prod-1',
    name: 'Rococo Upholstered 3 Seater Couch',
    slug: 'rococo-upholstered-3-seater-couch',
    category: 'Living Room',
    price: 18450.00,
    stock_quantity: 5,
    material: 'Textured Linen Blend',
    color: 'Warm Sand',
    width: 220,
    height: 76,
    depth: 100,
    is_active: true,
    is_featured: true,
    description: 'A classic silhouette with a hint of mid-century style, the Rococo 3-seater couch is an ode to timeless beauty.',
    sku: 'SOFA-ROC-001',
    product_images: [
      { id: 'img-1', product_id: 'prod-1', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'prod-2',
    name: 'Breen Upholstered Slouch Right With Daybed',
    slug: 'breen-upholstered-slouch-right-with-daybed',
    category: 'Living Room',
    price: 28900.00,
    stock_quantity: 3,
    material: 'Performance Velvet & Solid Wood Frame',
    color: 'Charcoal Grey',
    width: 310,
    height: 85,
    depth: 160,
    is_active: true,
    is_featured: true,
    description: 'Comfy, cushy, not a hard edge in sight. Rounded edges, soft curves... it is clear that the Breen is made for lazy days.',
    sku: 'SOFA-BRN-002',
    product_images: [
      { id: 'img-2', product_id: 'prod-2', image_url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'prod-3',
    name: 'Santorini Slipcover Corner Couch',
    slug: 'santorini-slipcover-corner-couch',
    category: 'Living Room',
    price: 24200.00,
    stock_quantity: 8,
    material: 'Washable Cotton Slipcover',
    color: 'Oatmeal',
    width: 280,
    height: 80,
    depth: 180,
    is_active: true,
    is_featured: true,
    description: 'The posterchild for Lumaro Furniture Studio classic, oversized couch design. With its comfy, lived-in look, the Santorini is one we are known for.',
    sku: 'SOFA-SAN-003',
    product_images: [
      { id: 'img-3', product_id: 'prod-3', image_url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'prod-4',
    name: 'Kariega Solid Teak Dining Table',
    slug: 'kariega-teak-dining-table',
    category: 'Dining Room',
    price: 16950.00,
    stock_quantity: 6,
    material: 'Solid South African Teak',
    color: 'Warm Amber',
    width: 220,
    height: 76,
    depth: 100,
    is_active: true,
    is_featured: true,
    description: 'Architectural legs with hand-sculpted joinery, perfect for family dining and formal entertaining.',
    sku: 'TBL-TEAK-004',
    product_images: [
      { id: 'img-4', product_id: 'prod-4', image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'prod-5',
    name: 'Cape Winelands Slatted Credenza',
    slug: 'cape-winelands-slatted-credenza',
    category: 'Storage',
    price: 14200.00,
    stock_quantity: 4,
    material: 'Solid Wood & Brushed Brass',
    color: 'Natural Matte Oak',
    width: 180,
    height: 80,
    depth: 45,
    is_active: true,
    is_featured: true,
    description: 'Minimalist sideboard with soft-close slatted oak doors and velvet-lined internal drawer dividers.',
    sku: 'STG-OAK-005',
    product_images: [
      { id: 'img-5', product_id: 'prod-5', image_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'prod-6',
    name: 'Table Mountain Bouclé Accent Chair',
    slug: 'table-mountain-boucle-accent-chair',
    category: 'Living Room',
    price: 8950.00,
    stock_quantity: 10,
    material: 'Textured Cream Bouclé',
    color: 'Ivory',
    width: 82,
    height: 78,
    depth: 80,
    is_active: true,
    is_featured: true,
    description: 'Sculptural organic silhouette wrapped in tactile bouclé with tapered blackened timber legs.',
    sku: 'CHR-BOUC-006',
    product_images: [
      { id: 'img-6', product_id: 'prod-6', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'prod-7',
    name: 'Modern Circular Lounge Set',
    slug: 'modern-circular-lounge-set',
    category: 'Living Room',
    price: 32500.00,
    stock_quantity: 2,
    material: 'Full-Grain Bouclé & Dark Walnut',
    color: 'Natural White',
    width: 260,
    height: 82,
    depth: 260,
    is_active: true,
    is_featured: true,
    description: 'Curved contemporary 4-piece sectional offering 360-degree organic comfort.',
    sku: 'SOFA-CIRC-007',
    product_images: [
      { id: 'img-7', product_id: 'prod-7', image_url: 'https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/a9411a86-b059-468b-9c03-c29e311bbb71/1787296485552-0.jpg', is_primary: true }
    ]
  },
  {
    id: 'prod-8',
    name: 'Luxor Geometric Headboard & Bed Base',
    slug: 'luxor-geometric-headboard-bed-base',
    category: 'Bedroom',
    price: 21800.00,
    stock_quantity: 4,
    material: 'Solid South African Hardwood',
    color: 'Deep Espresso',
    width: 195,
    height: 130,
    depth: 215,
    is_active: true,
    is_featured: true,
    description: 'Statement floating geometric timber headboard with integrated ambient backlighting brackets.',
    sku: 'BED-LUX-008',
    product_images: [
      { id: 'img-8', product_id: 'prod-8', image_url: 'https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/c1a82d73-957f-4f99-a34e-0c6aeb82562d/1786968369398-0.jpg', is_primary: true }
    ]
  },
  {
    id: 'prod-9',
    name: 'Modern Black Oval Pedestal Coffee Table',
    slug: 'modern-black-oval-pedestal-coffee-table',
    category: 'Living Room',
    price: 7400.00,
    stock_quantity: 7,
    material: 'Solid Ash & Carbon Black Wax',
    color: 'Carbon Black',
    width: 130,
    height: 42,
    depth: 70,
    is_active: true,
    is_featured: true,
    description: 'Double fluted cylinder pedestal base with beveled edge oval solid ash top.',
    sku: 'TBL-COF-009',
    product_images: [
      { id: 'img-9', product_id: 'prod-9', image_url: 'https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/abd82667-c642-4043-a57a-5fef2597dd23/1786602279649-0.jpg', is_primary: true }
    ]
  }
]
