<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../utils/supabase'
import { defaultFurnitureInventory } from '../utils/defaultProducts'
import type { Product } from '../types/database'
import { 
  Search, 
  Box, 
  X, 
  ShoppingBag, 
  Heart,
  ArrowUpRight,
  ArrowRight
} from 'lucide-vue-next'

const props = defineProps<{
  wishlist?: Product[];
}>()

const emit = defineEmits(['select-product', 'quick-add-to-cart', 'toggle-wishlist'])

const products = ref<Product[]>(defaultFurnitureInventory)
const loading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')
const isSearchOpen = ref(false)
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

// Sample swatches map to simulate material options
const sampleSwatches: Record<string, string[]> = {
  'Living Room': ['#968774', '#5e5043', '#2c2927', '#c9bdab'],
  'Dining Room': ['#b88a57', '#6e4726', '#261b11'],
  'Storage': ['#d4c4aa', '#8c6d48', '#38322c'],
  'Default': ['#968774', '#5e5043', '#c9bdab']
}

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
      console.warn('Supabase query warning (using default dataset):', error.message)
      products.value = defaultFurnitureInventory
    } else if (data && data.length > 0) {
      products.value = data.map((p: any) => ({
        ...p,
        product_images: [...(p.product_images || [])].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
      }))
    } else {
      products.value = defaultFurnitureInventory
    }
  } catch (err: any) {
    console.error('Fetch error:', err)
    products.value = defaultFurnitureInventory
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

const dropdownSearchResults = computed<Product[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const list = products.value && products.value.length > 0 ? products.value : defaultFurnitureInventory
  if (!query) {
    return list.slice(0, 8)
  }
  return list.filter(p => {
    return (
      p.name.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query)) ||
      (p.material && p.material.toLowerCase().includes(query)) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.color && p.color.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    )
  })
})

function selectFurnitureFromSearch(product: Product) {
  searchQuery.value = ''
  isSearchOpen.value = false
  emit('select-product', product)
}

function handleSearchSubmit() {
  if (dropdownSearchResults.value.length > 0) {
    selectFurnitureFromSearch(dropdownSearchResults.value[0])
  } else {
    isSearchOpen.value = false
  }
}

function onSearchBlur() {
  setTimeout(() => {
    isSearchOpen.value = false
  }, 250)
}

function formatPrice(val: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 2
  }).format(val)
}

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

      <!-- Search Box with Live Furniture Item Picker -->
      <div class="relative min-w-[280px] md:min-w-[320px]">
        <div class="relative w-full flex items-center border border-stone-300 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
          <input
            v-model="searchQuery"
            @focus="isSearchOpen = true"
            @blur="onSearchBlur"
            @keydown.enter.prevent="handleSearchSubmit"
            type="text"
            placeholder="Search furniture items..."
            class="w-full pl-3 pr-8 py-2 text-xs md:text-sm bg-transparent text-stone-900 placeholder-stone-400 focus:outline-none font-medium"
          />
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''" 
            type="button"
            class="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
            title="Clear search"
          >
            <X class="w-3.5 h-3.5" />
          </button>
          <button
            @click="handleSearchSubmit"
            class="bg-stone-900 text-white px-3 py-2.5 flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
            title="Search catalog"
          >
            <Search class="w-4 h-4" />
          </button>
        </div>

        <!-- Dynamic Furniture Items Dropdown Menu -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div
            v-if="isSearchOpen"
            class="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-300 shadow-2xl z-50 max-h-96 overflow-y-auto divide-y divide-stone-100 rounded-sm"
          >
            <!-- Dropdown Header -->
            <div class="p-2.5 bg-stone-50 text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
              <span>{{ searchQuery ? `Matching Furniture (${dropdownSearchResults.length})` : 'Select a Furniture Piece' }}</span>
              <span class="text-[10px] text-stone-600 font-normal lowercase">Click item to view product</span>
            </div>

            <!-- List of Furniture Items -->
            <div v-if="dropdownSearchResults.length > 0" class="py-1">
              <div
                v-for="item in dropdownSearchResults"
                :key="item.id"
                @mousedown.prevent="selectFurnitureFromSearch(item)"
                class="flex items-center space-x-3 px-3 py-2.5 hover:bg-stone-100 cursor-pointer transition-colors group"
              >
                <img
                  :src="getPrimaryImageUrl(item)"
                  :alt="item.name"
                  class="w-11 h-11 object-cover rounded-md border border-stone-200 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-stone-900 truncate group-hover:text-black">
                    {{ item.name }}
                  </p>
                  <div class="flex items-center space-x-2 text-[10px] text-stone-700 mt-0.5">
                    <span class="px-1.5 py-0.2 bg-stone-200 text-stone-800 rounded font-semibold uppercase tracking-wider text-[9px]">{{ item.category }}</span>
                    <span v-if="item.material" class="truncate">{{ item.material }}</span>
                  </div>
                </div>
                <ArrowUpRight class="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>
            </div>

            <!-- No Results State -->
            <div v-else class="p-4 text-center text-xs text-stone-700">
              <p class="font-semibold">No furniture found for "{{ searchQuery }}"</p>
              <button
                @mousedown.prevent="searchQuery = ''; selectedCategory = 'All'; isSearchOpen = false"
                class="mt-2 text-stone-900 font-bold underline hover:text-black cursor-pointer"
              >
                Reset catalog filters
              </button>
            </div>

            <!-- Dropdown Footer Action -->
            <div class="p-2 bg-stone-50 text-center border-t border-stone-200">
              <button
                @mousedown.prevent="isSearchOpen = false"
                class="w-full text-center text-[11px] font-bold text-stone-900 hover:text-black tracking-wide uppercase py-1 cursor-pointer"
              >
                Filter Catalog Grid with "{{ searchQuery || 'All' }}" &rarr;
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 3. SECTION HEADER -->
    <div class="flex items-end justify-between pt-2">
      <h2 class="text-3xl font-serif text-stone-900 tracking-tight">
        {{ selectedCategory === 'All' ? 'Best Couch Sellers' : `${selectedCategory} Collection` }}
      </h2>
      <button 
        @click="selectedCategory = 'All'; searchQuery = ''"
        class="text-xs uppercase tracking-widest font-bold underline underline-offset-4 text-stone-900 hover:text-stone-600 transition-colors cursor-pointer"
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
        class="mt-2 px-5 py-2 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-stone-800 cursor-pointer"
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
            class="absolute bottom-3 right-3 p-2.5 bg-white/90 hover:bg-black hover:text-white text-stone-900 backdrop-blur-xs rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
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
