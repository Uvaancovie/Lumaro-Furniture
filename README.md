# Lumaro Furniture Studio 

**Premium South African Hardwood Furniture Storefront**

SAFS Furniture is a modern single-page e-commerce application for browsing, managing, and purchasing handcrafted solid-timber furniture. Built for the South African market with ZAR pricing, nationwide white-glove delivery messaging, and an admin portal for full inventory control.

---

## Table of Contents

- [Documentation](#documentation)
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
  - [Storefront](#storefront)
  - [Product Catalog](#product-catalog)
  - [Product Detail](#product-detail)
  - [Shopping Cart & Checkout](#shopping-cart--checkout)
  - [Admin Portal](#admin-portal)
  - [Backend & Security](#backend--security)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Brand & Market Positioning](#brand--market-positioning)
- [Scripts](#scripts)

---

## Documentation

This README is the high-level overview. Detailed guides live in **[`docs/`](./docs/)**:

| Guide | Audience |
|---|---|
| [docs/README.md](./docs/README.md) | Everyone — docs map & ownership |
| [Getting started](./docs/getting-started.md) | Developers |
| [Architecture](./docs/architecture.md) | Developers |
| [Database & storage](./docs/database.md) | Developers / Ops |
| [Admin guide](./docs/admin-guide.md) | Admins / Support |
| [Storefront user guide](./docs/storefront-user-guide.md) | Customers / Support |
| [Deployment](./docs/deployment.md) | Developers / Ops |
| [Troubleshooting](./docs/troubleshooting.md) | QA / Support / Devs |
| [Privacy & compliance](./docs/privacy-compliance.md) | PM / Legal / Devs |
| [Contributing to docs](./docs/contributing-docs.md) | Everyone |

---

## Overview

SAFS Furniture showcases a curated collection of solid South African teak, French oak, ash, walnut, and full-grain leather pieces. The app combines a polished customer-facing storefront with a secure admin portal powered by Supabase Auth, PostgreSQL, and Storage.

| Area | Description |
|---|---|
| **Brand** | SAFS Furniture — South African Hardwoods |
| **Currency** | South African Rand (ZAR) |
| **App type** | Vue 3 SPA (client-side routing via view state) |
| **Backend** | Supabase (Auth + PostgreSQL + Storage) |
| **Hosting** | Vercel (SPA rewrites) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vue 3.5 + TypeScript + Composition API (`<script setup>`) |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| **Icons** | Lucide Vue Next |
| **Build** | Vite 6 |
| **Backend-as-a-Service** | Supabase (`@supabase/supabase-js`) |
| **Database** | PostgreSQL (Supabase) with Row Level Security |
| **File storage** | Supabase Storage (`product-images` public bucket) |
| **Auth** | Supabase Auth (email/password sign-in & sign-up) |
| **Hosting** | Vercel Edge / static SPA |
| **Utilities** | `clsx`, `tailwind-merge` |

---

## Features

### Storefront

#### Landing page
- **Hero section** with brand messaging for bespoke South African craftsmanship
- **Stats bar**: 100% solid timber, 10-year warranty, white-glove SA delivery, custom made-to-order
- **Category collection cards** (Living Room, Dining Room, Bedroom, Office, Outdoor, Storage)
- **Featured / bestseller product grid** pulled from live Supabase inventory (with local fallback samples)
- **Craftsmanship story section** with dynamic workshop imagery
- **FAQ accordion** covering delivery, custom dimensions, materials, and warranty
- **Quick-add to cart** from featured product cards
- Responsive mobile-first layout with sticky navigation

#### Global navigation & UX
- Sticky top header with logo, Home / Catalog / Admin nav, and cart button
- **Mobile hamburger menu** with full navigation and admin session controls
- Live **cart item count badge** with bounce animation
- **Toast notifications** for cart actions and checkout confirmation
- Admin session badge (“Admin Active”) when signed in
- Smooth view switching between Landing, Catalog, Product Detail, and Admin

---

### Product Catalog

- Live product fetch from Supabase (`products` + nested `product_images`)
- Shows only **active** products to the public
- **Category filter pills**: All, Living Room, Dining Room, Bedroom, Office, Outdoor, Storage
- **Full-text style search** across name, description, material, and SKU
- Product cards with primary image, price (ZAR), category, stock cues, and featured badges
- Quick-add to cart from catalog grid
- Click-through to full product detail view
- Graceful **sample/fallback inventory** when the database is empty or unreachable

---

### Product Detail

- Full e-commerce product page layout
- **Image gallery** with primary hero image, thumbnail carousel, and lightbox zoom
- Featured and category badges
- Star rating display (static social proof)
- ZAR price formatting with “Includes VAT” label
- **Live stock status** (in stock count vs made-to-order)
- SKU display
- Primary material highlight
- **Quantity selector** with live subtotal
- Add-to-cart with success feedback animation
- Tabbed information panels:
  - Product Description
  - Specifications & Dimensions (width / height / depth, material, color)
  - Shipping & White-Glove Delivery
  - Care & Maintenance
- **Related products** from same category or featured items
- Breadcrumb-style back navigation to catalog

---

### Shopping Cart & Checkout

- Slide-over **cart drawer** (right-side panel with backdrop)
- Line items with image, name, material, line total
- Inline **quantity update** (+ / −) and **remove item**
- Empty cart state with guidance to browse the catalog
- Order summary:
  - Subtotal
  - Estimated SA delivery fee (**R450**, or **free** when subtotal exceeds **R15,000**)
  - Grand total (incl. VAT messaging)
- **Proceed to Secure Checkout** action (client-side confirmation toast; cart cleared)
- Cart state held in-memory for the session (SPA state)

---

### Admin Portal

Protected by Supabase authentication. Unauthenticated users see the login/sign-up form; authenticated users access the full inventory console.

#### Authentication
- Email/password **sign in** and **sign up**
- Password show/hide toggle
- Session persistence via Supabase Auth
- Auth state listener keeps UI in sync
- One-click **sign out** from header or admin view
- Error and success messaging for auth flows

#### Product upload / create
- Create new catalog products with:
  - Name, auto-generated **slug**, category
  - Price (ZAR), SKU (auto-suggested from category), stock quantity
  - Material, color, dimensions (width / height / depth)
  - Description
  - **Active** and **Featured** flags
- **Multi-image upload** via file picker or drag-and-drop
- Image previews before save
- Images uploaded to Supabase Storage (`product-images` bucket)
- Public URLs stored in `product_images` with primary flag and sort order

#### Inventory management
- Full product list (active and inactive)
- Edit existing products (pre-fills form, supports adding/removing images)
- Toggle product **active/inactive** visibility on the storefront
- Delete products
- Seed sample catalog data for demos/development
- Live refresh after create/update so the storefront catalog stays current

---

### Backend & Security

#### Supabase PostgreSQL
- `products` table with commerce fields (price, stock, category, dimensions, flags)
- `product_images` table with cascade delete on product removal
- Indexes on slug, category, active status, and product image foreign key

#### Row Level Security (RLS)
- Public can **read active products**
- Authenticated admins have **full CRUD** on products and images
- Product images are publicly readable
- Storage policies:
  - Public read on `product-images`
  - Authenticated upload and delete only

#### Storage
- Public bucket: `product-images`
- Per-product folder structure for uploaded assets
- CDN-style public URLs for storefront display

---

## Project Structure

```
furniture/
├── src/
│   ├── App.vue                 # Shell: nav, routing views, cart state, toasts
│   ├── main.ts                 # Vue app bootstrap
│   ├── style.css               # Tailwind entry / global styles
│   ├── components/
│   │   ├── LandingPage.vue     # Marketing homepage
│   │   ├── Catalog.vue         # Browse, filter, search products
│   │   ├── ProductDetail.vue   # PDP with gallery, tabs, related items
│   │   ├── CartDrawer.vue      # Cart slide-over + totals
│   │   ├── AdminLogin.vue      # Admin auth (sign in / sign up)
│   │   └── AdminUpload.vue     # Product CRUD + image upload + inventory
│   ├── types/
│   │   └── database.ts         # Product, ProductImage, CartItem types
│   └── utils/
│       └── supabase.ts         # Supabase client
├── supabase/
│   └── schema.sql              # Tables, indexes, RLS, storage policies
├── public/                     # Static assets, favicons, sample images
├── dist/                       # Production build output
├── docs/                       # Human-facing documentation suite
│   ├── README.md               # Docs index & ownership
│   ├── getting-started.md
│   ├── architecture.md
│   ├── database.md
│   ├── admin-guide.md
│   ├── storefront-user-guide.md
│   ├── deployment.md
│   ├── troubleshooting.md
│   ├── privacy-compliance.md
│   └── contributing-docs.md
├── admin/
│   └── login.md                # Local admin notes (do not commit secrets)
├── data-privacy/
│   └── GPDR.md                 # Legacy compliance scratch notes
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json                 # SPA rewrite rules
└── .env.example
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended 20+)
- A **Supabase** project (URL + publishable/anon key)
- npm, pnpm, or yarn

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and set your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key
```

### 3. Set up the database

In the Supabase SQL Editor, run the schema script:

```text
supabase/schema.sql
```

This creates:

- `products` and `product_images` tables
- Performance indexes
- RLS policies
- `product-images` storage bucket and policies

### 4. Create an admin user

Either:

- Use the in-app **Admin → Create Admin Account** flow, or
- Create a user in the Supabase Auth dashboard

### 5. Run the development server

```bash
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

### 6. Build for production

```bash
npm run build
npm run preview   # optional local preview of the production build
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon / publishable key (client-safe) |

> Never commit service-role keys. The frontend only uses the public anon/publishable key; write access is enforced by RLS for authenticated users.

---

## Database Schema

### `products`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | `gen_random_uuid()` |
| `name` | TEXT | Required |
| `slug` | TEXT | Unique URL-friendly identifier |
| `description` | TEXT | Optional |
| `price` | DECIMAL(10,2) | ZAR unit price |
| `sku` | TEXT | Unique stock-keeping unit |
| `stock_quantity` | INT | Default `0` |
| `category` | TEXT | e.g. Living Room, Dining Room |
| `material` | TEXT | Timber / leather / fabric |
| `color` | TEXT | Optional finish color |
| `width` / `height` / `depth` | DECIMAL(8,2) | Dimensions (cm) |
| `is_active` | BOOLEAN | Controls storefront visibility |
| `is_featured` | BOOLEAN | Homepage / related highlighting |
| `created_at` / `updated_at` | TIMESTAMPTZ | Audit timestamps |

### `product_images`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `product_id` | UUID (FK) | Cascades on product delete |
| `image_url` | TEXT | Public Supabase Storage URL |
| `alt_text` | TEXT | Optional accessibility text |
| `sort_order` | INT | Gallery order |
| `is_primary` | BOOLEAN | Primary catalog/card image |
| `created_at` | TIMESTAMPTZ | |

---

## Deployment

### Vercel (recommended)

The project includes `vercel.json` with SPA rewrites so all routes serve `index.html`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

1. Connect the Git repository to Vercel
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in project environment variables
3. Build command: `npm run build`
4. Output directory: `dist`

### Manual static hosting

```bash
npm run build
```

Deploy the contents of `dist/` to any static host (Netlify, Cloudflare Pages, S3 + CloudFront, etc.). Ensure SPA fallback routing is configured.

---

## Brand & Market Positioning

| Topic | Detail |
|---|---|
| **Market** | South Africa (nationwide delivery focus) |
| **Materials** | Solid teak, oak, ash, walnut; full-grain leather; no particleboard positioning |
| **Warranty messaging** | 10-year structural timber warranty |
| **Delivery messaging** | White-glove delivery (placement, assembly, packaging removal) |
| **Customization** | Made-to-order dimensions and finishes |
| **Pricing** | ZAR with VAT-inclusive messaging |
| **Free shipping threshold** | Orders over **R15,000** (cart logic) |
| **Standard delivery estimate** | **R450** when under free threshold |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check-friendly production build |
| `npm run preview` | Preview the production build locally |
| `npm run types:check` | Run `vue-tsc --noEmit` for TypeScript validation |

---

## Feature Summary Checklist

| Feature | Status |
|---|---|
| Marketing landing page | ✅ |
| Featured products & categories | ✅ |
| Catalog browse with category filters | ✅ |
| Search by name / material / SKU | ✅ |
| Product detail page with gallery | ✅ |
| Specs, shipping & care tabs | ✅ |
| Related products | ✅ |
| Client-side shopping cart | ✅ |
| Free shipping over R15,000 | ✅ |
| Toast notifications | ✅ |
| Responsive mobile navigation | ✅ |
| Admin sign-in / sign-up | ✅ |
| Product create / edit / delete | ✅ |
| Multi-image upload to Storage | ✅ |
| Toggle active / featured flags | ✅ |
| RLS-secured catalog data | ✅ |
| Sample data fallback / seed | ✅ |
| Vercel SPA deployment config | ✅ |
| Full payment gateway | ⏳ Simulated checkout (no payment provider yet) |
| Persistent cart / orders DB | ⏳ Session-only cart; no order records yet |
| POPIA consent at checkout | 📋 Documented in `data-privacy/` for future work |

---

## License

Private project — all rights reserved unless otherwise specified by the repository owner.

---

**SAFS Furniture** — Handcrafted South African Hardwood Collection  
Built with Vue 3, Supabase, and Tailwind CSS.
