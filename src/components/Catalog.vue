<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../utils/supabase'
import type { Product } from '../types/database'
import { 
  Search, 
  Box, 
  X, 
  ShoppingBag,
  Heart
} from 'lucide-vue-next'

const props = defineProps<{
  wishlist?: Product[];
}>()

const emit = defineEmits(['select-product', 'quick-add-to-cart', 'toggle-wishlist'])

const products = ref<Product[]>([])
const loading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')
const selectedCategory = ref('All')

const categories = [
  'All',
  'Living Room',
  'Dining Room',
  'Bedroom',
  'Office',
  'Outdoor',
  'Storage'
]

// Sample swatches map to simulate material options seen in screenshot
const sampleSwatches: Record<string, string[]> = {
  'Living Room': ['#968774', '#5e5043', '#2c2927', '#c9bdab'],
  'Dining Room': ['#b88a57', '#6e4726', '#261b11'],
  'Storage': ['#d4c4aa', '#8c6d48', '#38322c'],
  'Default': ['#968774', '#5e5043', '#c9bdab']
}

// Fallback dataset if database is empty initially
const sampleProducts: Product[] = [
  {
    id: 'sample-1',
    name: 'Rococo Upholstered 3 Seater Couch',
    slug: 'rococo-upholstered-3-seater-couch',
    category: 'Living Room',
    price: 18450.00,
    stock_quantity: 5,
    material: 'Textured Linen Blend',
    color: 'Warm Sand',
    width: 220, height: 76, depth: 100,
    is_active: true, is_featured: true,
    description: 'A classic silhouette with a hint of mid-century style, the Rococo 3-seater couch is an ode to timeless beauty.',
    sku: 'SOFA-ROC-001',
    product_images: [
      { id: 'img-1', product_id: 'sample-1', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'sample-2',
    name: 'Breen Upholstered Slouch Right With Daybed',
    slug: 'breen-upholstered-slouch-right-with-daybed',
    category: 'Living Room',
    price: 28900.00,
    stock_quantity: 3,
    material: 'Performance Velvet & Solid Wood Frame',
    color: 'Charcoal Grey',
    width: 310, height: 85, depth: 160,
    is_active: true, is_featured: true,
    description: 'Comfy, cushy, not a hard edge in sight. Rounded edges, soft curves... it is clear that the Breen is made for lazy days.',
    sku: 'SOFA-BRN-002',
    product_images: [
      { id: 'img-2', product_id: 'sample-2', image_url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'sample-3',
    name: 'Santorini Slipcover Corner Couch',
    slug: 'santorini-slipcover-corner-couch',
    category: 'Living Room',
    price: 24200.00,
    stock_quantity: 8,
    material: 'Washable Cotton Slipcover',
    color: 'Oatmeal',
    width: 280, height: 80, depth: 180,
    is_active: true, is_featured: true,
    description: 'The posterchild for Lumaro Furniture Studio classic, oversized couch design. With its comfy, lived-in look, the Santorini is one we are known for.',
    sku: 'SOFA-SAN-003',
    product_images: [
      { id: 'img-3', product_id: 'sample-3', image_url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'sample-4',
    name: 'Kariega Solid Teak Dining Table',
    slug: 'kariega-teak-dining-table',
    category: 'Dining Room',
    price: 16950.00,
    stock_quantity: 6,
    material: 'Solid South African Teak',
    color: 'Warm Amber',
    width: 220, height: 76, depth: 100,
    is_active: true, is_featured: false,
    description: 'Architectural legs with hand-sculpted joinery, perfect for family dining and formal entertaining.',
    sku: 'TBL-TEAK-004',
    product_images: [
      { id: 'img-4', product_id: 'sample-4', image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'sample-5',
    name: 'Cape Winelands Slatted Credenza',
    slug: 'cape-winelands-slatted-credenza',
    category: 'Storage',
    price: 14200.00,
    stock_quantity: 4,
    material: 'French Oak & Brushed Brass',
    color: 'Natural Matte Oak',
    width: 180, height: 80, depth: 45,
    is_active: true, is_featured: false,
    description: 'Minimalist sideboard with soft-close slatted oak doors and velvet-lined internal drawer dividers.',
    sku: 'STG-OAK-005',
    product_images: [
      { id: 'img-5', product_id: 'sample-5', image_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'sample-6',
    name: 'Table Mountain Bouclé Accent Chair',
    slug: 'table-mountain-boucle-accent-chair',
    category: 'Living Room',
    price: 8950.00,
    stock_quantity: 10,
    material: 'Textured Cream Bouclé',
    color: 'Ivory',
    width: 82, height: 78, depth: 80,
    is_active: true, is_featured: true,
    description: 'Sculptural accent armchair crafted from textured cream bouclé upholstery over a solid ash frame.',
    sku: 'CHR-BOU-006',
    product_images: [
      { id: 'img-6', product_id: 'sample-6', image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'sample-7',
    name: 'Drakensberg Leather Sofa (3-Seater)',
    slug: 'drakensberg-leather-sofa',
    category: 'Living Room',
    price: 24900.00,
    stock_quantity: 3,
    material: 'Full-Grain Aniline Leather & Steel',
    color: 'Cognac Brown',
    width: 240, height: 85, depth: 95,
    is_active: true, is_featured: true,
    description: 'Luxurious 3-seater sofa wrapped in premium South African full-grain leather that ages beautifully.',
    sku: 'SOFA-DRK-007',
    product_images: [
      { id: 'img-7', product_id: 'sample-7', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'sample-8',
    name: 'Stellenbosch Executive Desk',
    slug: 'stellenbosch-executive-desk',
    category: 'Office',
    price: 16800.00,
    stock_quantity: 4,
    material: 'Walnut Wood & Powder-Coated Steel',
    color: 'Dark Walnut',
    width: 160, height: 75, depth: 70,
    is_active: true, is_featured: false,
    description: 'Sophisticated executive desk with integrated wireless phone charging pad and cable management.',
    sku: 'DSK-WAL-008',
    product_images: [
      { id: 'img-8', product_id: 'sample-8', image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  },
  {
    id: 'sample-9',
    name: 'Clifton Rattan Queen Bed Frame',
    slug: 'clifton-rattan-queen-bed-frame',
    category: 'Bedroom',
    price: 19500.00,
    stock_quantity: 2,
    material: 'Solid Oak & Natural Cane Rattan',
    color: 'Light Oak',
    width: 168, height: 120, depth: 215,
    is_active: true, is_featured: true,
    description: 'Organic minimalist bed frame featuring a hand-woven rattan headboard framed in solid European oak.',
    sku: 'BED-RAT-009',
    product_images: [
      { id: 'img-9', product_id: 'sample-9', image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', is_primary: true }
    ]
  }
]

async function fetchProducts() {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase query warning (using sample dataset):', error.message)
      products.value = sampleProducts
    } else if (data && data.length > 0) {
      products.value = data.map((p: any) => ({
        ...p,
        product_images: [...(p.product_images || [])].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
      }))
    } else {
      products.value = sampleProducts
    }
  } catch (err: any) {
    console.error('Fetch error:', err)
    products.value = sampleProducts
  } finally {
    loading.value = false
  }
}

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesCategory = selectedCategory.value === 'All' || product.category.toLowerCase() === selectedCategory.value.toLowerCase()
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !query || 
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query)) ||
      (product.material && product.material.toLowerCase().includes(query)) ||
      (product.sku && product.sku.toLowerCase().includes(query))
    return matchesCategory && matchesSearch
  })
})

function getPrimaryImageUrl(product: Product): string {
  if (product.product_images && product.product_images.length > 0) {
    const primary = product.product_images.find(img => img.is_primary)
    return primary ? primary.image_url : product.product_images[0].image_url
  }
  return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
}

function getSwatches(category: string): string[] {
  return sampleSwatches[category] || sampleSwatches['Default']
}

function isWishlisted(productId: string): boolean {
  return (props.wishlist || []).some(item => item.id === productId)
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="space-y-12 bg-[#FAF8F5] p-4 sm:p-8 min-h-screen text-stone-900 font-sans">
    
    <!-- 1. EDITORIAL TOP HIGHLIGHT CARDS -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Card 1: Slipcover Couches -->
      <div 
        @click="selectedCategory = 'Living Room'"
        class="group cursor-pointer space-y-4"
      >
        <div class="relative h-[280px] sm:h-[360px] overflow-hidden bg-stone-200">
          <img 
            src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80" 
            alt="Slipcover Couches"
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </div>
        <div class="pb-2 border-b border-stone-300/80 flex items-center justify-between">
          <h2 class="text-2xl font-serif tracking-tight text-stone-900">Slipcover Couches</h2>
        </div>
      </div>

      <!-- Card 2: Made To Order -->
      <div 
        @click="selectedCategory = 'All'"
        class="group cursor-pointer space-y-4"
      >
        <div class="relative h-[280px] sm:h-[360px] overflow-hidden bg-stone-200">
          <img 
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80" 
            alt="Made To Order"
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </div>
        <div class="pb-2 border-b border-stone-300/80 flex items-center justify-between">
          <h2 class="text-2xl font-serif tracking-tight text-stone-900">Made To Order</h2>
        </div>
      </div>
    </section>

    <!-- 2. FILTER & SEARCH BAR -->
    <div class="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-y border-stone-300/80 py-4">
      <!-- Category Selection Tabs -->
      <div class="flex items-center space-x-6 overflow-x-auto pb-2 md:pb-0 scrollbar-none text-sm">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          :class="[
            'transition-colors whitespace-nowrap cursor-pointer uppercase tracking-wider font-medium text-xs',
            selectedCategory === cat 
              ? 'text-stone-950 font-bold border-b-2 border-black pb-0.5' 
              : 'text-stone-500 hover:text-stone-900'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Minimal Search Box -->
      <div class="relative min-w-[260px]">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search catalog..."
          class="w-full pl-9 pr-8 py-1.5 bg-transparent border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-black transition-all"
        />
        <button 
          v-if="searchQuery" 
          @click="searchQuery = ''" 
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- 3. SECTION HEADER -->
    <div class="flex items-end justify-between pt-2">
      <h2 class="text-3xl font-serif text-stone-900 tracking-tight">
        {{ selectedCategory === 'All' ? 'Best Couch Sellers' : `${selectedCategory} Collection` }}
      </h2>
      <button 
        @click="selectedCategory = 'All'; searchQuery = ''"
        class="text-xs uppercase tracking-widest font-bold underline underline-offset-4 text-stone-900 hover:text-stone-600 transition-colors"
      >
        SHOP ALL
      </button>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="i in 3" :key="i" class="space-y-4 animate-pulse">
        <div class="h-80 bg-stone-200"></div>
        <div class="h-5 bg-stone-200 w-3/4"></div>
        <div class="h-4 bg-stone-200 w-1/2"></div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="filteredProducts.length === 0" class="text-center py-20 bg-stone-100/50 border border-stone-200 space-y-3">
      <Box class="w-10 h-10 text-stone-400 mx-auto stroke-[1.2]" />
      <h3 class="text-lg font-serif text-stone-900">No items found</h3>
      <p class="text-stone-500 text-sm max-w-sm mx-auto">
        There are currently no pieces matching your filter parameters.
      </p>
      <button 
        @click="selectedCategory = 'All'; searchQuery = ''" 
        class="mt-2 px-5 py-2 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-stone-800"
      >
        Reset Catalog
      </button>
    </div>

    <!-- 4. EDITORIAL PRODUCT GRID -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="group space-y-3 cursor-pointer"
        @click="emit('select-product', product)"
      >
        <!-- Product Image & Floating Promo Badges -->
        <div class="relative aspect-square overflow-hidden bg-stone-200">
          <img 
            :src="getPrimaryImageUrl(product)" 
            :alt="product.name"
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          <!-- Pill Promo Badges Top-Left -->
          <div class="absolute top-3 left-3 flex items-center space-x-1.5 z-10">
            <span class="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs">
              PROMO
            </span>
            <span class="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs">
              20% OFF
            </span>
          </div>

          <!-- Quick Add Button Overlay -->
          <button 
            @click.stop="emit('quick-add-to-cart', product)"
            class="absolute bottom-3 right-3 p-2.5 bg-white/90 hover:bg-black hover:text-white text-stone-900 backdrop-blur-xs rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
            title="Quick Add"
          >
            <ShoppingBag class="w-4 h-4" />
          </button>

          <!-- Wishlist Toggle -->
          <button 
            @click.stop="emit('toggle-wishlist', product)"
            class="absolute top-3 right-3 p-2.5 rounded-full shadow-md transition-all cursor-pointer"
            :class="isWishlisted(product.id) ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-white/90 backdrop-blur-xs text-stone-900 hover:text-rose-600 hover:bg-white'"
            :title="isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
          >
            <Heart class="w-4 h-4" :class="isWishlisted(product.id) ? 'fill-current' : ''" />
          </button>
        </div>

        <!-- Product Title & Info -->
        <div class="space-y-1">
          <h3 class="text-lg font-serif text-stone-900 group-hover:text-stone-600 transition-colors leading-snug">
            {{ product.name }}
          </h3>
          
          <p class="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {{ product.description || 'A timeless handcrafted piece designed for contemporary living.' }}
          </p>
        </div>

        <!-- Color Swatch Row -->
        <div class="flex items-center pt-1">
          <div class="flex items-center space-x-1.5">
            <span 
              v-for="(hex, idx) in getSwatches(product.category)" 
              :key="idx"
              class="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs"
              :style="{ backgroundColor: hex }"
            ></span>
            <span class="text-[10px] text-stone-400 font-medium ml-1">+ More</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>