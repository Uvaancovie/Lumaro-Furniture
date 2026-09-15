<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '../utils/supabase'
import type { Product } from '../types/database'
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Hammer,
  Search,
  MapPin,
  User,
  Heart,
  Menu,
  X,
  Briefcase,
  Building,
  Store,
  GraduationCap,
  Home,
  Palette,
  Layers,
  Sparkles,
  Compass,
} from 'lucide-vue-next'

const props = defineProps<{
  products?: Product[];
  wishlist?: Product[];
}>()

const emit = defineEmits(['explore-catalog', 'select-product', 'quick-add-to-cart', 'products-updated', 'open-cart', 'open-wishlist', 'navigate-admin', 'toggle-wishlist'])

const liveProducts = ref<Product[]>([])
const loading = ref(false)
const activeFaq = ref<number | null>(0)
const searchQuery = ref('')
const mobileNavOpen = ref(false)
const heroIndex = ref(0)
const activeSector = ref('office')

const heroSlides = [
  {
    image: 'https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/a9411a86-b059-468b-9c03-c29e311bbb71/1787296485552-0.jpg',
    alt: '4-Piece Modern Circular Lounge Set - Espresso Round Table & 4 Grey Accent Chairs',
  },
  {
    image: 'https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/58d59cbc-43e5-4488-9068-8b0b4f45ffcb/1787293170209-1.jpg',
    alt: 'Luxury Contemporary Dining Set with Crescent Pedestal Table & High-Back Chairs',
  },
  {
    image: 'https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/c1a82d73-957f-4f99-a34e-0c6aeb82562d/1786968369398-0.jpg',
    alt: 'Luxor Geometric Upholstered Headboard with Gold Accents - Premium Grey',
  },
  {
    image: 'https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/abd82667-c642-4043-a57a-5fef2597dd23/1786602279649-0.jpg',
    alt: 'Modern Black Oval Pedestal Coffee Table',
  },
  {
    image: 'https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/977e3408-1ea6-4518-a7fd-745c19aba022/1786016998600-0.jpg',
    alt: 'Chair & Table Set',
  },
]

let heroTimer: ReturnType<typeof setInterval> | null = null

function nextHero() {
  heroIndex.value = (heroIndex.value + 1) % heroSlides.length
}

function prevHero() {
  heroIndex.value = (heroIndex.value - 1 + heroSlides.length) % heroSlides.length
}

function goToHero(idx: number) {
  heroIndex.value = idx
}

function restartHeroTimer() {
  if (heroTimer) clearInterval(heroTimer)
  heroTimer = setInterval(nextHero, 5000)
}

const navCategories = [
  'Living Room',
  'Couch',
  'Accent Tables & Chairs',
  'Shop By Room',
  

  'Offers',
]

// Fallback real items if database has no records yet
const defaultRealInventory: Product[] = [
  {
    id: 'real-1',
    name: 'Kariega Teak Dining Table',
    slug: 'kariega-teak-dining-table',
    category: 'Dining Room',
    price: 18450.00,
    stock_quantity: 5,
    material: 'Solid South African Teak',
    width: 220, height: 76, depth: 100,
    is_active: true, is_featured: true,
    description: 'Handcrafted solid teak dining table featuring natural organic grain lines.',
    sku: 'TBL-TEAK-001',
    product_images: [{ id: 'img-1', product_id: 'real-1', image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80', is_primary: true }]
  },
  {
    id: 'real-2',
    name: 'Drakensberg Leather Sofa',
    slug: 'drakensberg-leather-sofa',
    category: 'Living Room',
    price: 24900.00,
    stock_quantity: 3,
    material: 'Full-Grain Aniline Leather',
    width: 240, height: 85, depth: 95,
    is_active: true, is_featured: true,
    description: 'Luxurious 3-seater sofa wrapped in premium South African full-grain leather.',
    sku: 'SOFA-DRK-002',
    product_images: [{ id: 'img-2', product_id: 'real-2', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', is_primary: true }]
  },
  {
    id: 'real-3',
    name: 'Cape Winelands Oak Credenza',
    slug: 'cape-winelands-oak-credenza',
    category: 'Storage',
    price: 14200.00,
    stock_quantity: 8,
    material: 'French Oak & Brushed Brass',
    width: 180, height: 80, depth: 45,
    is_active: true, is_featured: true,
    description: 'Minimalist sideboard with soft-close slatted oak doors.',
    sku: 'STG-OAK-003',
    product_images: [{ id: 'img-3', product_id: 'real-3', image_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80', is_primary: true }]
  }
]

async function fetchLiveInventory() {
  if (props.products && props.products.length > 0) {
    liveProducts.value = props.products
    return
  }

  loading.value = true
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      liveProducts.value = (data as any[]).map(p => ({
        ...p,
        product_images: [...(p.product_images || [])].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
      }))
    } else {
      liveProducts.value = defaultRealInventory
    }
  } catch (err) {
    console.error('Fetch live inventory error:', err)
    liveProducts.value = defaultRealInventory
  } finally {
    loading.value = false
  }
}

const displayBestsellers = computed(() => {
  const source = (props.products && props.products.length > 0) ? props.products : liveProducts.value
  const featured = source.filter(p => p.is_featured)
  return (featured.length > 0 ? featured : source).slice(0, 3)
})

const craftsmanshipImageUrl = computed(() => {
  const source = (props.products && props.products.length > 0) ? props.products : liveProducts.value
  if (source.length > 0 && source[0].product_images && source[0].product_images.length > 0) {
    return source[0].product_images[0].image_url
  }
  return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80'
})

function getPrimaryImageUrl(product: Product): string {
  if (product.product_images && product.product_images.length > 0) {
    const primary = product.product_images.find(img => img.is_primary)
    return primary ? primary.image_url : product.product_images[0].image_url
  }
  return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
}

function isWishlisted(productId: string): boolean {
  return (props.wishlist || []).some(item => item.id === productId)
}

function formatPrice(val: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 2
  }).format(val)
}

const faqs = [
  {
    question: 'How is SAFS Furniture delivered across South Africa?',
    answer: 'We provide nationwide White-Glove furniture delivery across Gauteng, Western Cape, KZN, and all major provinces. Delivery includes room placement, unboxing, assembly, and packaging disposal.'
  },
  {
    question: 'Can I order custom dimensions for dining tables or credenzas?',
    answer: 'Yes! All SAFS Furniture pieces are handcrafted in our South African workshop. We can adjust width, length, height, and timber finishes to match your interior design project.'
  },
  {
    question: 'What wood materials do you use?',
    answer: 'We craft exclusively with 100% solid, sustainably harvested South African Teak, European & French Oak, Ash, and Walnut. We never use cheap particleboard or veneers.'
  },
  {
    question: 'What warranty is included?',
    answer: 'Every piece of SAFS Furniture is backed by our 10-Year Structural Timber Warranty against warping, joint separation, and structural defects.'
  }
]

function toggleFaq(idx: number) {
  activeFaq.value = activeFaq.value === idx ? null : idx
}

onMounted(() => {
  fetchLiveInventory()
  restartHeroTimer()
})

onBeforeUnmount(() => {
  if (heroTimer) clearInterval(heroTimer)
})
</script>

<template>
  <div class="space-y-16 pb-16 bg-stone-50/50">

    <!-- 1. HERO & TOP HEADER SECTION -->
    <header class="w-full bg-white shadow-xs border-b border-stone-200">

      <!-- Top Announcement Bar (Consistent with SAFS Beige, Black & White Palette) -->
      <div class="bg-[#f5f2eb] text-stone-900 text-xs py-2.5 px-4 md:px-8 border-b border-stone-200 font-medium tracking-wide">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex-1 text-center font-medium flex items-center justify-center space-x-2">
            <span class="px-2.5 py-0.5 bg-stone-900 text-white text-[10px] font-black uppercase tracking-wider rounded-xs">
              Special Offer
            </span>
            <span class="text-stone-800">
              Enjoy up to <strong class="text-stone-950 font-extrabold underline decoration-stone-400">15% discount</strong> for first time buyers
            </span>
          </div>
          <div class="hidden md:block text-right text-stone-600 text-[11px] font-semibold tracking-wider uppercase">
            Welcome to <span class="text-stone-950 font-bold">South African Furniture</span>
          </div>
        </div>
      </div>

      <!-- Main Navigation Header -->
      <div class="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">

        <!-- Search Box (Left) -->
        <div class="w-full md:w-80 flex items-center">
          <div class="relative w-full flex items-center border border-stone-900 rounded-none overflow-hidden">
            <input
              v-model="searchQuery"
              type="text"
              placeholder=""
              class="w-full px-3 py-1.5 text-sm bg-transparent focus:outline-none"
            />
            <button class="bg-black text-white p-2 flex items-center justify-center hover:bg-stone-800 transition-colors">
              <Search class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Brand Title (Center) -->
        <div class="text-center">
          <h1 class="text-xl md:text-2xl font-semibold text-stone-950 tracking-wide uppercase">
            Furniture
          </h1>
        </div>

        <!-- Quick Utility Icons (Right) -->
        <div class="flex items-center space-x-6 text-stone-800 text-[10px] uppercase font-bold tracking-wider">
          <button class="flex flex-col items-center space-y-1 hover:text-black transition-colors">
            <MapPin class="w-4 h-4 stroke-[1.5]" />
            <span>Find A Store</span>
          </button>

          <button @click="emit('navigate-admin')" class="flex flex-col items-center space-y-1 hover:text-black transition-colors">
            <User class="w-4 h-4 stroke-[1.5]" />
            <span>Sign In</span>
          </button>

          <button class="flex flex-col items-center space-y-1 hover:text-black transition-colors">
            <Truck class="w-4 h-4 stroke-[1.5]" />
            <span>Track Order</span>
          </button>

          <button
    @click="emit('open-wishlist')"
    class="group relative flex flex-col items-center space-y-1 transition-colors"
  >
    <span class="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full shadow-sm transition-all border border-rose-200">
      <Heart class="w-4 h-4 stroke-[1.5]" />
    </span>
    <span class="text-stone-800 group-hover:text-black">Wishlist</span>
    <span
      v-if="(props.wishlist?.length || 0) > 0"
      class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md"
    >
      {{ props.wishlist?.length }}
    </span>
  </button>

          <button @click="emit('open-cart')" class="group relative flex flex-col items-center space-y-1 transition-colors">
            <span class="p-2.5 bg-white/90 hover:bg-black hover:text-white text-stone-900 backdrop-blur-xs rounded-full shadow-md transition-all border border-stone-200">
              <ShoppingBag class="w-4 h-4 stroke-[1.5]" />
            </span>
            <span class="text-stone-800 group-hover:text-black">Cart</span>
          </button>
        </div>
      </div>

      <!-- Black Sub-Navigation Bar -->
      <nav class="bg-black text-white text-xs md:text-sm font-semibold tracking-wide">
        <div class="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <!-- Desktop links -->
          <div class="hidden md:flex items-center justify-between overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              v-for="item in navCategories"
              :key="item"
              @click="emit('explore-catalog')"
              class="px-3 py-1.5 hover:text-stone-300 transition-colors cursor-pointer"
            >
              {{ item }}
            </button>
          </div>

          <!-- Mobile toggle -->
          <div class="md:hidden flex items-center justify-between">
            <button
              @click="mobileNavOpen = !mobileNavOpen"
              class="flex items-center space-x-2 hover:text-stone-300 transition-colors cursor-pointer"
            >
              <Menu v-if="!mobileNavOpen" class="w-5 h-5" />
              <X v-else class="w-5 h-5" />
              <span>Shop Categories</span>
            </button>
            <button @click="emit('explore-catalog')" class="hover:text-stone-300 transition-colors cursor-pointer">
              View All
            </button>
          </div>
        </div>

        <!-- Mobile dropdown menu -->
        <div
          v-if="mobileNavOpen"
          class="md:hidden border-t border-white/10 bg-stone-900"
        >
          <div class="max-w-7xl mx-auto px-4 py-2 grid grid-cols-2 gap-1">
            <button
              v-for="item in navCategories"
              :key="item"
              @click="emit('explore-catalog')"
              class="px-3 py-3 text-left hover:bg-white/5 hover:text-stone-300 rounded-lg transition-colors cursor-pointer"
            >
              {{ item }}
            </button>
          </div>
        </div>
      </nav>

      <!-- Main Hero Visual Showcase Banner -->
      <section class="relative w-full overflow-hidden bg-stone-100">
        <div class="relative w-full h-[400px] sm:h-[500px] md:h-[650px]">
          <Transition name="hero-fade">
            <img
              :key="heroIndex"
              :src="heroSlides[heroIndex].image"
              :alt="heroSlides[heroIndex].alt"
              class="w-full h-full object-cover object-center"
            />
          </Transition>

          <!-- Subtle vignette for realistic room depth -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

          <!-- Prev / Next Arrows -->
          <button
            @click="prevHero(); restartHeroTimer()"
            class="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/80 hover:bg-white text-stone-900 rounded-full shadow-md backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>
          <button
            @click="nextHero(); restartHeroTimer()"
            class="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/80 hover:bg-white text-stone-900 rounded-full shadow-md backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight class="w-5 h-5" />
          </button>

          <!-- Dots Indicator -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
            <button
              v-for="(slide, idx) in heroSlides"
              :key="idx"
              @click="goToHero(idx); restartHeroTimer()"
              class="h-2 rounded-full transition-all duration-300 cursor-pointer"
              :class="idx === heroIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'"
              :aria-label="`Go to slide ${idx + 1}`"
            ></button>
          </div>
        </div>
      </section>

      <!-- Value Props Ticker Below Hero -->
      <div class="bg-stone-900 text-stone-200 py-3.5 px-4 text-xs font-bold border-t border-stone-800">
        <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div class="flex items-center justify-center space-x-2">
            <Award class="w-4 h-4 text-stone-400 shrink-0" />
            <span>100% Solid Hardwood</span>
          </div>
          <div class="flex items-center justify-center space-x-2">
            <ShieldCheck class="w-4 h-4 text-stone-400 shrink-0" />
            <span>10-Year Warranty</span>
          </div>
          <div class="flex items-center justify-center space-x-2">
            <Truck class="w-4 h-4 text-stone-400 shrink-0" />
            <span>White-Glove SA Delivery</span>
          </div>
          <div class="flex items-center justify-center space-x-2">
            <Hammer class="w-4 h-4 text-stone-400 shrink-0" />
            <span>Custom Made to Order</span>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 md:px-8 space-y-20">

      <!-- 2. FEATURED CATEGORIES GRID -->
      <section class="space-y-8">
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <span class="text-xs font-extrabold text-stone-700 uppercase tracking-widest block">Curated Collections</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900">Designed for Every Room</h2>
          <p class="text-slate-600 text-sm">Explore our specialized furniture categories tailored for luxury interiors.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Card 1: Living Room -->
          <div
            @click="emit('explore-catalog')"
            class="group relative h-80 rounded-3xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer"
          >
            <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/a9411a86-b059-468b-9c03-c29e311bbb71/1787296485552-0.jpg" alt="Living Room" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span class="text-xs text-stone-300 font-bold uppercase tracking-wider">Seating & Lounging</span>
              <h3 class="text-xl font-extrabold">Living Room</h3>
              <p class="text-xs text-slate-300 line-clamp-1">Full-grain leather sofas & bouclé armchairs.</p>
            </div>
          </div>

          <!-- Card 2: Dining Room -->
          <div
            @click="emit('explore-catalog')"
            class="group relative h-80 rounded-3xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer"
          >
            <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/58d59cbc-43e5-4488-9068-8b0b4f45ffcb/1787293170209-1.jpg" alt="Dining Room" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span class="text-xs text-stone-300 font-bold uppercase tracking-wider">Dining & Gathering</span>
              <h3 class="text-xl font-extrabold">Dining Room</h3>
              <p class="text-xs text-slate-300 line-clamp-1">Solid teak & oak dining tables.</p>
            </div>
          </div>

          <!-- Card 3: Storage & Credenzas -->
          <div
            @click="emit('explore-catalog')"
            class="group relative h-80 rounded-3xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer"
          >
            <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/c1a82d73-957f-4f99-a34e-0c6aeb82562d/1786968369398-0.jpg" alt="Storage" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span class="text-xs text-stone-300 font-bold uppercase tracking-wider">Sideboards & Cabinets</span>
              <h3 class="text-xl font-extrabold">Storage Credenzas</h3>
              <p class="text-xs text-slate-300 line-clamp-1">Slatted oak sideboards & media consoles.</p>
            </div>
          </div>

          <!-- Card 4: Accent Seating -->
          <div
            @click="emit('explore-catalog')"
            class="group relative h-80 rounded-3xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer"
          >
            <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/abd82667-c642-4043-a57a-5fef2597dd23/1786602279649-0.jpg" alt="Accent Armchairs" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span class="text-xs text-stone-300 font-bold uppercase tracking-wider">Statement Pieces</span>
              <h3 class="text-xl font-extrabold">Accent Chairs</h3>
              <p class="text-xs text-slate-300 line-clamp-1">Sculptural bouclé & ash wood armchairs.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. CORE VALUES & STRATEGIC ADVANTAGE (THE SAFS DIFFERENCE) -->
      <section class="space-y-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 pb-6 gap-4">
          <div class="space-y-2">
            <span class="text-xs font-bold tracking-widest text-stone-900 bg-[#f5f2eb] px-3.5 py-1 rounded-full border border-stone-300 inline-block">
              THE SAFS DIFFERENCE
            </span>
            <h2 class="text-3xl md:text-4xl font-extrabold text-stone-950 tracking-tight">
              Core Values & Strategic Advantage
            </h2>
          </div>
          <p class="text-xs text-stone-600 max-w-md leading-relaxed font-medium">
            Building South Africa's finest handcrafted timber furniture through uncompromising principles and bespoke manufacturing.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <!-- Left Panel: Strategic Advantage (The SAFS Difference Light Timber Pillar) -->
          <div class="lg:col-span-5 bg-[#d6d3d1] text-stone-950 rounded-3xl p-8 md:p-10 border border-stone-400/80 shadow-md flex flex-col justify-between space-y-8 relative overflow-hidden">
            <!-- Subtle background accent element -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>

            <div class="space-y-6 relative z-10">
              <div class="flex items-center justify-between border-b border-stone-400/80 pb-4">
                <span class="text-[10px] font-black uppercase tracking-widest text-stone-800">STRATEGIC ADVANTAGES</span>
                <span class="text-[10px] text-stone-800 uppercase font-bold tracking-wider bg-white/60 px-2 py-0.5 rounded-md border border-stone-400/60">Durban Facility</span>
              </div>

              <h3 class="text-2xl font-extrabold text-stone-950 tracking-tight leading-snug">
                Why Discerning Clients & Architects Partner with SAFS
              </h3>

              <div class="space-y-6 pt-2">
                <!-- Advantage 1 -->
                <div class="flex items-start space-x-4 border-b border-stone-400/60 pb-5">
                  <span class="text-xs font-black text-stone-950 pt-0.5">01</span>
                  <div class="space-y-1">
                    <h4 class="text-sm font-extrabold text-stone-950">Unrivaled Quality</h4>
                    <p class="text-xs text-stone-800 leading-relaxed font-medium">Premium materials sourced for durability and aesthetic longevity.</p>
                  </div>
                </div>

                <!-- Advantage 2 -->
                <div class="flex items-start space-x-4 border-b border-stone-400/60 pb-5">
                  <span class="text-xs font-black text-stone-950 pt-0.5">02</span>
                  <div class="space-y-1">
                    <h4 class="text-sm font-extrabold text-stone-950">Custom Expertise</h4>
                    <p class="text-xs text-stone-800 leading-relaxed font-medium">Tailored solutions that generic suppliers simply cannot provide.</p>
                  </div>
                </div>

                <!-- Advantage 3 -->
                <div class="flex items-start space-x-4">
                  <span class="text-xs font-black text-stone-950 pt-0.5">03</span>
                  <div class="space-y-1">
                    <h4 class="text-sm font-extrabold text-stone-950">Reliable Partnership</h4>
                    <p class="text-xs text-stone-800 leading-relaxed font-medium">Proven track record of delivering on-time and onbudget.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-6 border-t border-stone-400/80 flex items-center justify-between text-[11px] text-stone-800 font-semibold relative z-10">
              <span>South African Timber Craft</span>
              <span class="text-stone-950 font-black underline decoration-stone-500">10-Year Structural Guarantee</span>
            </div>
          </div>

          <!-- Right Panel: Core Values Grid (2x2 Architectural Cards) -->
          <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Core Value 1: Craftsmanship -->
            <div class="bg-white p-7 rounded-3xl border border-stone-200 shadow-xs hover:border-stone-950 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase tracking-widest text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
                    PRECISION JOINERY
                  </span>
                  <span class="text-xs font-black text-stone-700">01</span>
                </div>
                <h3 class="text-lg font-extrabold text-stone-950 group-hover:text-stone-700 transition-colors">
                  Craftsmanship
                </h3>
                <p class="text-xs text-stone-600 leading-relaxed font-normal">
                  Uncompromising attention to detail in every joint, finish, and material choice.
                </p>
              </div>
              <div class="pt-3 border-t border-stone-100 text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center space-x-1.5">
                <div class="w-1.5 h-1.5 bg-stone-900 rounded-full"></div>
                <span>Hand-finished Solid Timbers</span>
              </div>
            </div>

            <!-- Core Value 2: Integrity -->
            <div class="bg-white p-7 rounded-3xl border border-stone-200 shadow-xs hover:border-stone-950 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase tracking-widest text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
                    TRANSPARENT PROCESS
                  </span>
                  <span class="text-xs font-black text-stone-700">02</span>
                </div>
                <h3 class="text-lg font-extrabold text-stone-950 group-hover:text-stone-700 transition-colors">
                  Integrity
                </h3>
                <p class="text-xs text-stone-600 leading-relaxed font-normal">
                  Transparent processes and honest partnerships built on trust and reliability.
                </p>
              </div>
              <div class="pt-3 border-t border-stone-100 text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center space-x-1.5">
                <div class="w-1.5 h-1.5 bg-stone-900 rounded-full"></div>
                <span>Honest Pricing & Sourcing</span>
              </div>
            </div>

            <!-- Core Value 3: Innovation -->
            <div class="bg-white p-7 rounded-3xl border border-stone-200 shadow-xs hover:border-stone-950 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase tracking-widest text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
                    MODERN DESIGN TECH
                  </span>
                  <span class="text-xs font-black text-stone-700">03</span>
                </div>
                <h3 class="text-lg font-extrabold text-stone-950 group-hover:text-stone-700 transition-colors">
                  Innovation
                </h3>
                <p class="text-xs text-stone-600 leading-relaxed font-normal">
                  Leveraging modern design trends and manufacturing technology for superior results.
                </p>
              </div>
              <div class="pt-3 border-t border-stone-100 text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center space-x-1.5">
                <div class="w-1.5 h-1.5 bg-stone-900 rounded-full"></div>
                <span>3D Spatial Visualization</span>
              </div>
            </div>

            <!-- Core Value 4: Client-Centricity -->
            <div class="bg-white p-7 rounded-3xl border border-stone-200 shadow-xs hover:border-stone-950 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase tracking-widest text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
                    BESPOKE BLUEPRINTS
                  </span>
                  <span class="text-xs font-black text-stone-700">04</span>
                </div>
                <h3 class="text-lg font-extrabold text-stone-950 group-hover:text-stone-700 transition-colors">
                  Client-Centricity
                </h3>
                <p class="text-xs text-stone-600 leading-relaxed font-normal">
                  Your vision is our blueprint. We prioritize collaborative design and bespoke service.
                </p>
              </div>
              <div class="pt-3 border-t border-stone-100 text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center space-x-1.5">
                <div class="w-1.5 h-1.5 bg-stone-900 rounded-full"></div>
                <span>Tailored Interior Consults</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. OPERATIONAL EXCELLENCE (PRECISION MANUFACTURING PROCESS TIMELINE) -->
      <section class="bg-[#d6d3d1] text-stone-950 rounded-3xl p-8 md:p-14 border border-stone-400/80 shadow-md relative overflow-hidden space-y-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-400/80 pb-8 gap-4">
          <div class="space-y-2 max-w-2xl">
            <span class="text-xs font-black text-stone-800 uppercase tracking-widest block">OPERATIONAL EXCELLENCE</span>
            <h2 class="text-3xl md:text-4xl font-extrabold text-stone-950 tracking-tight">
              From Concept to Creation:<br class="hidden md:inline" /> Precision Manufacturing.
            </h2>
          </div>
          <p class="text-xs text-stone-800 font-medium max-w-sm leading-relaxed">
            Every piece undergoes rigorous spatial engineering, material selection, and craftsman hand-finishing in our Durban production facility.
          </p>
        </div>

        <!-- Horizontal Process Stepper -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <!-- Step 01 -->
          <div class="space-y-4 relative group">
            <div class="h-40 md:h-48 rounded-xl overflow-hidden border border-stone-400/60 relative shadow-sm">
              <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/a9411a86-b059-468b-9c03-c29e311bbb71/1787296485552-0.jpg" alt="Concept & Discovery" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/10 transition-colors"></div>
              <span class="absolute top-2.5 right-2.5 px-2.5 py-1 bg-white/90 text-stone-950 border border-stone-400 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs">Discovery</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="text-3xl font-black text-stone-950">01</span>
              <span class="text-xs font-black uppercase text-stone-700 tracking-wider">Phase 1</span>
            </div>
            <div class="h-0.5 w-full bg-stone-400 group-hover:bg-stone-950 transition-colors"></div>
            <div class="space-y-2">
              <h3 class="text-lg font-extrabold text-stone-950">Concept</h3>
              <p class="text-xs text-stone-800 leading-relaxed font-medium">Understanding your vision through detailed consultation and spatial analysis.</p>
            </div>
          </div>

          <!-- Step 02 -->
          <div class="space-y-4 relative group">
            <div class="h-40 md:h-48 rounded-xl overflow-hidden border border-stone-400/60 relative shadow-sm">
              <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/977e3408-1ea6-4518-a7fd-745c19aba022/1786016998600-0.jpg" alt="Design & Modeling" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/10 transition-colors"></div>
              <span class="absolute top-2.5 right-2.5 px-2.5 py-1 bg-white/90 text-stone-950 border border-stone-400 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs">Modeling</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="text-3xl font-black text-stone-950">02</span>
              <span class="text-xs font-black uppercase text-stone-700 tracking-wider">Phase 2</span>
            </div>
            <div class="h-0.5 w-full bg-stone-400 group-hover:bg-stone-950 transition-colors"></div>
            <div class="space-y-2">
              <h3 class="text-lg font-extrabold text-stone-950">Design</h3>
              <p class="text-xs text-stone-800 leading-relaxed font-medium">Translating ideas into precise technical drawings and 3D visualizations.</p>
            </div>
          </div>

          <!-- Step 03 -->
          <div class="space-y-4 relative group">
            <div class="h-40 md:h-48 rounded-xl overflow-hidden border border-stone-400/60 relative shadow-sm">
              <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/c1a82d73-957f-4f99-a34e-0c6aeb82562d/1786968369398-0.jpg" alt="Develop & Craft" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/10 transition-colors"></div>
              <span class="absolute top-2.5 right-2.5 px-2.5 py-1 bg-white/90 text-stone-950 border border-stone-400 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs">Craft</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="text-3xl font-black text-stone-950">03</span>
              <span class="text-xs font-black uppercase text-stone-700 tracking-wider">Phase 3</span>
            </div>
            <div class="h-0.5 w-full bg-stone-400 group-hover:bg-stone-950 transition-colors"></div>
            <div class="space-y-2">
              <h3 class="text-lg font-extrabold text-stone-950">Develop</h3>
              <p class="text-xs text-stone-800 leading-relaxed font-medium">Meticulous manufacturing in our Durban facility using premium materials.</p>
            </div>
          </div>

          <!-- Step 04 -->
          <div class="space-y-4 relative group">
            <div class="h-40 md:h-48 rounded-xl overflow-hidden border border-stone-400/60 relative shadow-sm">
              <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/abd82667-c642-4043-a57a-5fef2597dd23/1786602279649-0.jpg" alt="Deliver & Handover" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/10 transition-colors"></div>
              <span class="absolute top-2.5 right-2.5 px-2.5 py-1 bg-white/90 text-stone-950 border border-stone-400 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs">Handover</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="text-3xl font-black text-stone-950">04</span>
              <span class="text-xs font-black uppercase text-stone-700 tracking-wider">Phase 4</span>
            </div>
            <div class="h-0.5 w-full bg-stone-400 group-hover:bg-stone-950 transition-colors"></div>
            <div class="space-y-2">
              <h3 class="text-lg font-extrabold text-stone-950">Deliver</h3>
              <p class="text-xs text-stone-800 leading-relaxed font-medium">Professional installation and final quality assurance for a seamless finish.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. ARCHITECTURAL ENVIRONMENT EXPLORER & PREMIUM PRODUCT RANGE -->
      <section class="space-y-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6 gap-4">
          <div class="space-y-2">
            <span class="text-xs font-black text-stone-700 uppercase tracking-widest block">SPECIALIZED SOLUTIONS FOR DIVERSE ENVIRONMENTS</span>
            <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900">Premium Product Range.</h2>
          </div>
          <p class="text-xs text-slate-600 max-w-md leading-relaxed">
            Tailored architectural furniture suites designed and manufactured to meet demanding sector specifications.
          </p>
        </div>

        <!-- Sector Navigation Bar -->
        <div class="flex overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-slate-100">
          <button
            @click="activeSector = 'office'"
            :class="[
              'px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 border',
              activeSector === 'office'
                ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            ]"
          >
            <Briefcase class="w-4 h-4" />
            <span>Office Furniture</span>
          </button>

          <button
            @click="activeSector = 'reception'"
            :class="[
              'px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 border',
              activeSector === 'reception'
                ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            ]"
          >
            <Building class="w-4 h-4" />
            <span>Reception Areas</span>
          </button>

          <button
            @click="activeSector = 'hospitality'"
            :class="[
              'px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 border',
              activeSector === 'hospitality'
                ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            ]"
          >
            <Home class="w-4 h-4" />
            <span>Hospitality</span>
          </button>

          <button
            @click="activeSector = 'retail'"
            :class="[
              'px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 border',
              activeSector === 'retail'
                ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            ]"
          >
            <Store class="w-4 h-4" />
            <span>Retail & Commercial</span>
          </button>

          <button
            @click="activeSector = 'edu_health'"
            :class="[
              'px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 border',
              activeSector === 'edu_health'
                ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            ]"
          >
            <GraduationCap class="w-4 h-4" />
            <span>Educational & Healthcare</span>
          </button>

          <button
            @click="activeSector = 'residential'"
            :class="[
              'px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 border',
              activeSector === 'residential'
                ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            ]"
          >
            <Palette class="w-4 h-4" />
            <span>Bespoke Residential</span>
          </button>
        </div>

        <!-- Active Sector Architectural Detail Panel -->
        <div class="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-md">
          <!-- Office -->
          <div v-if="activeSector === 'office'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-5 space-y-5">
              <span class="px-3 py-1 bg-[#f5f2eb] text-stone-900 text-[10px] font-black uppercase tracking-widest rounded-full border border-stone-300/60 inline-block">Workplace Ergonomics</span>
              <h3 class="text-2xl md:text-3xl font-extrabold text-slate-900">Office Furniture</h3>
              <p class="text-xs text-slate-600 leading-relaxed">Elevating productivity through ergonomic excellence and sophisticated executive design.</p>
              <button
                @click="emit('explore-catalog')"
                class="px-6 py-2.5 bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>View Office Solutions</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
            <div class="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/a9411a86-b059-468b-9c03-c29e311bbb71/1787296485552-0.jpg" alt="Executive Desk Series" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">SERIES 01</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Executive Desk Series</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Bespoke solid timber desks with integrated wire channels.</p>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/977e3408-1ea6-4518-a7fd-745c19aba022/1786016998600-0.jpg" alt="Boardroom Tables" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">SERIES 02</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Boardroom Tables</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Modular conference configurations engineered for scale.</p>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/c1a82d73-957f-4f99-a34e-0c6aeb82562d/1786968369398-0.jpg" alt="Integrated Storage" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">SERIES 03</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Integrated Storage</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Architectural credenzas and acoustic storage partitions.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Reception -->
          <div v-else-if="activeSector === 'reception'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-5 space-y-5">
              <span class="px-3 py-1 bg-[#f5f2eb] text-stone-900 text-[10px] font-black uppercase tracking-widest rounded-full border border-stone-300/60 inline-block">Brand Statement</span>
              <h3 class="text-2xl md:text-3xl font-extrabold text-slate-900">Reception Areas</h3>
              <p class="text-xs text-slate-600 leading-relaxed">Creating powerful first impressions with our signature Aura Series counters and seating.</p>
              <button
                @click="emit('explore-catalog')"
                class="px-6 py-2.5 bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>View Reception Range</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
            <div class="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/abd82667-c642-4043-a57a-5fef2597dd23/1786602279649-0.jpg" alt="Bespoke Counters" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">FEATURE 01</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Bespoke Counters</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Custom reception desks in solid hardwood & stone fascia.</p>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/a9411a86-b059-468b-9c03-c29e311bbb71/1787296485552-0.jpg" alt="Waiting Area Seating" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">FEATURE 02</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Waiting Area Seating</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Ergonomic lounge modules designed for high-footfall comfort.</p>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/58d59cbc-43e5-4488-9068-8b0b4f45ffcb/1787293170209-1.jpg" alt="Branded Inlays" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">FEATURE 03</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Branded Inlays</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Precision laser-cut corporate emblems and metallic accents.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Hospitality -->
          <div v-else-if="activeSector === 'hospitality'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-5 space-y-5">
              <span class="px-3 py-1 bg-[#f5f2eb] text-stone-900 text-[10px] font-black uppercase tracking-widest rounded-full border border-stone-300/60 inline-block">Curated Comfort</span>
              <h3 class="text-2xl md:text-3xl font-extrabold text-slate-900">Hospitality</h3>
              <p class="text-xs text-slate-600 leading-relaxed">Curated comfort and durable luxury for hotels, restaurants, and premium lounges.</p>
              <button
                @click="emit('explore-catalog')"
                class="px-6 py-2.5 bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>View Hospitality Range</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
            <div class="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/c1a82d73-957f-4f99-a34e-0c6aeb82562d/1786968369398-0.jpg" alt="Hotel Suite Furniture" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">SUITE 01</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Hotel Suite Furniture</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Headboards, integrated nightstands, and vanity credenzas.</p>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/58d59cbc-43e5-4488-9068-8b0b4f45ffcb/1787293170209-1.jpg" alt="Restaurant Fit-outs" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">SUITE 02</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Restaurant Fit-outs</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Custom banquet booths and solid timber dining tables.</p>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/a9411a86-b059-468b-9c03-c29e311bbb71/1787296485552-0.jpg" alt="Lounge Solutions" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">SUITE 03</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Lounge Solutions</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Deep seating leather chairs and cocktail table arrays.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Retail -->
          <div v-else-if="activeSector === 'retail'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-5 space-y-5">
              <span class="px-3 py-1 bg-[#f5f2eb] text-stone-900 text-[10px] font-black uppercase tracking-widest rounded-full border border-stone-300/60 inline-block">High-Traffic Impact</span>
              <h3 class="text-2xl md:text-3xl font-extrabold text-slate-900">Retail & Commercial</h3>
              <p class="text-xs text-slate-600 leading-relaxed">Optimizing high-traffic spaces for enhanced customer experience and brand impact.</p>
              <button
                @click="emit('explore-catalog')"
                class="px-6 py-2.5 bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>View Retail Systems</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
            <div class="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/abd82667-c642-4043-a57a-5fef2597dd23/1786602279649-0.jpg" alt="Bespoke Retail Counters" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">COMMERCIAL 01</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Bespoke Retail Counters</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Modular cash wraps with hidden cable routing & POS integration.</p>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/977e3408-1ea6-4518-a7fd-745c19aba022/1786016998600-0.jpg" alt="Custom Display Units" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">COMMERCIAL 02</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Custom Display Units</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Feature pedestals and illuminated product towers.</p>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/c1a82d73-957f-4f99-a34e-0c6aeb82562d/1786968369398-0.jpg" alt="Integrated Shelving" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">COMMERCIAL 03</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Integrated Shelving</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Heavy-duty hardwood shelving systems engineered for weight.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Educational & Healthcare -->
          <div v-else-if="activeSector === 'edu_health'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-5 space-y-5">
              <span class="px-3 py-1 bg-[#f5f2eb] text-stone-900 text-[10px] font-black uppercase tracking-widest rounded-full border border-stone-300/60 inline-block">Specialized Engineering</span>
              <h3 class="text-2xl md:text-3xl font-extrabold text-slate-900">Educational & Healthcare</h3>
              <p class="text-xs text-slate-600 leading-relaxed">Durable, ergonomic designs engineered for specialized and demanding environments.</p>
              <button
                @click="emit('explore-catalog')"
                class="px-6 py-2.5 bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>View Institutional Fit-outs</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
            <div class="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/977e3408-1ea6-4518-a7fd-745c19aba022/1786016998600-0.jpg" alt="Robust School Furniture" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">INSTITUTIONAL 01</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Robust School Furniture</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Heavy-duty timber desks built for multi-decade resilience.</p>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/c1a82d73-957f-4f99-a34e-0c6aeb82562d/1786968369398-0.jpg" alt="Medical Grade Cabinetry" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">INSTITUTIONAL 02</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Medical Grade Cabinetry</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Hygienic sealed timber and non-porous composite storage.</p>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/abd82667-c642-4043-a57a-5fef2597dd23/1786602279649-0.jpg" alt="Laboratory Workstations" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">INSTITUTIONAL 03</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Laboratory Workstations</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Chemical-resistant surfaces integrated with solid wood framing.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Residential -->
          <div v-else-if="activeSector === 'residential'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-5 space-y-5">
              <span class="px-3 py-1 bg-[#f5f2eb] text-stone-900 text-[10px] font-black uppercase tracking-widest rounded-full border border-stone-300/60 inline-block">Bespoke Luxury</span>
              <h3 class="text-2xl md:text-3xl font-extrabold text-slate-900">Bespoke Residential</h3>
              <p class="text-xs text-slate-600 leading-relaxed">Tailored luxury for discerning homeowners, bringing unique visions to life.</p>
              <button
                @click="emit('explore-catalog')"
                class="px-6 py-2.5 bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>View Residential Craft</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
            <div class="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/c1a82d73-957f-4f99-a34e-0c6aeb82562d/1786968369398-0.jpg" alt="Custom Built-in Wardrobes" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">RESIDENTIAL 01</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Custom Built-in Wardrobes</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Handcrafted solid timber closets with concealed LED illumination.</p>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/58d59cbc-43e5-4488-9068-8b0b4f45ffcb/1787293170209-1.jpg" alt="Statement Dining Tables" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">RESIDENTIAL 02</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Statement Dining Tables</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Live-edge monolithic dining slabs paired with forged steel bases.</p>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
                <div class="h-36 overflow-hidden relative">
                  <img src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/product-images/abd82667-c642-4043-a57a-5fef2597dd23/1786602279649-0.jpg" alt="Luxury Home Office" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-2.5 left-2.5 text-[9px] font-black text-stone-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">RESIDENTIAL 03</span>
                </div>
                <div class="p-4 space-y-1.5">
                  <h4 class="text-sm font-extrabold text-slate-900">Luxury Home Office</h4>
                  <p class="text-[11px] text-slate-500 leading-normal">Tailored writing desks, floating book cases, and wall paneling.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. MATERIALS & FINISHES + SEAMLESS INTEGRATION -->
      <section class="space-y-12">
        <div class="text-center max-w-3xl mx-auto space-y-3">
          <span class="text-xs font-extrabold text-stone-700 uppercase tracking-widest block">SUPERIOR CRAFT SPECIFICATIONS</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900">Materials & Finishes.</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 class="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">Premium Timbers</h3>
            <ul class="space-y-1.5 text-xs text-slate-600">
              <li>• Solid Walnut & Oak</li>
              <li>• Ash & Reclaimed Wood</li>
              <li>• High-Grade Veneers</li>
            </ul>
          </div>

          <div class="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 class="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">Metals & Accents</h3>
            <ul class="space-y-1.5 text-xs text-slate-600">
              <li>• Powder-Coated Steel</li>
              <li>• Brushed Brass & Gold</li>
              <li>• Polished Chrome</li>
            </ul>
          </div>

          <div class="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 class="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">Textiles & Surfaces</h3>
            <ul class="space-y-1.5 text-xs text-slate-600">
              <li>• Full-Grain Leathers</li>
              <li>• Performance Fabrics</li>
              <li>• Solid Surfaces (Corian)</li>
            </ul>
          </div>

          <div class="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 class="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">Finishing Options</h3>
            <ul class="space-y-1.5 text-xs text-slate-600">
              <li>• Natural Hand-Rubbed Oils</li>
              <li>• Matte & High-Gloss Lacquer</li>
              <li>• Custom Stain Matching</li>
            </ul>
          </div>
        </div>

        <!-- Seamless Integration Block -->
        <div class="bg-stone-50 border border-stone-200 rounded-3xl p-8 md:p-12 space-y-8">
          <div class="text-center space-y-2">
            <span class="text-xs font-extrabold text-stone-700 uppercase tracking-widest block">SEAMLESS INTEGRATION</span>
            <h3 class="text-2xl font-extrabold text-slate-900">End-to-End Delivery Protocol</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <span class="text-xs font-black text-stone-500 uppercase tracking-wider block">01 Site Preparation</span>
              <p class="text-xs text-slate-600 leading-relaxed">Detailed site surveys to ensure perfect fit and alignment.</p>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <span class="text-xs font-black text-stone-500 uppercase tracking-wider block">02 Expert Assembly</span>
              <p class="text-xs text-slate-600 leading-relaxed">Professional installation by our skilled in-house teams.</p>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <span class="text-xs font-black text-stone-500 uppercase tracking-wider block">03 Final Handover</span>
              <p class="text-xs text-slate-600 leading-relaxed">Rigorous quality checks and client sign-off on-site.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. DELIVERING LARGE-SCALE PROJECT SUCCESS -->
      <section class="bg-[#d6d3d1] text-stone-950 rounded-3xl p-8 md:p-14 border border-stone-400/80 shadow-md relative overflow-hidden">
        <div class="max-w-4xl mx-auto space-y-8 text-center">
          <div class="space-y-3">
            <span class="text-xs font-extrabold text-stone-800 uppercase tracking-widest block">SECTOR CAPABILITIES</span>
            <h2 class="text-3xl md:text-5xl font-extrabold text-stone-950 tracking-tight">Delivering Large-Scale Project Success.</h2>
          </div>

          <!-- Sector Pills -->
          <div class="flex flex-wrap items-center justify-center gap-3">
            <span class="px-4 py-2 bg-white/70 text-stone-950 border border-stone-400/80 rounded-full text-xs font-bold shadow-xs">Corporate Offices</span>
            <span class="px-4 py-2 bg-white/70 text-stone-950 border border-stone-400/80 rounded-full text-xs font-bold shadow-xs">Hospitality & Hotels</span>
            <span class="px-4 py-2 bg-white/70 text-stone-950 border border-stone-400/80 rounded-full text-xs font-bold shadow-xs">Retail Environments</span>
            <span class="px-4 py-2 bg-white/70 text-stone-950 border border-stone-400/80 rounded-full text-xs font-bold shadow-xs">Luxury Residential</span>
          </div>

          <p class="text-stone-800 text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed pt-4 border-t border-stone-400/80">
            From initial concept to final installation, we are your trusted manufacturing partner for uncompromising quality.
          </p>

          <div>
            <button
              @click="emit('explore-catalog')"
              class="px-8 py-3.5 bg-stone-950 text-white hover:bg-stone-800 text-xs font-black uppercase tracking-widest rounded-full shadow-lg transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <span>Explore Collection</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <!-- 3. CRAFTSMANSHIP & STORY SECTION -->
      <section id="craftsmanship" class="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 md:p-14">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Image Left -->
          <div class="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 group">
            <img
              :src="craftsmanshipImageUrl"
              alt="SAFS Furniture Authentic Timber Craftsmanship"
              class="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-slate-900 border border-slate-200 shadow-md">
              Real Timber Inventory — Supabase Storage
            </div>
          </div>

          <!-- Text Right -->
          <div class="lg:col-span-6 space-y-6">
            <div class="space-y-2">
              <span class="text-xs font-extrabold text-stone-700 uppercase tracking-widest block">The SAFS Furniture Guarantee</span>
              <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                Uncompromising Quality & Authentic Timber
              </h2>
              <p class="text-slate-600 text-sm leading-relaxed">
                We reject mass-produced veneers and synthetic boards. Every SAFS Furniture item is sculpted from solid hardwoods, hand-finished with organic wax sealants that highlight natural grain patterns.
              </p>
            </div>

            <div class="space-y-3 pt-2">
              <div class="flex items-start space-x-3">
                <CheckCircle2 class="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">Sustainably Harvested Hardwoods</h4>
                  <p class="text-xs text-slate-500">Certified solid teak, French oak, and ash wood sourced responsibly.</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <CheckCircle2 class="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">Mortise & Tenon Joinery</h4>
                  <p class="text-xs text-slate-500">Traditional wood joinery methods providing structural stability that lasts decades.</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <CheckCircle2 class="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">Non-Toxic Natural Wax Sealants</h4>
                  <p class="text-xs text-slate-500">Eco-friendly protective finishes safe for indoor environments and family living.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. REAL INVENTORY BESTSELLERS SHOWCASE -->
      <section class="space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span class="text-xs font-extrabold text-stone-700 uppercase tracking-widest block">Real Inventory</span>
            <h2 class="text-3xl font-extrabold text-slate-900">Featured Best Sellers</h2>
          </div>

          <button
            @click="emit('explore-catalog')"
            class="inline-flex items-center space-x-2 text-sm font-bold text-stone-700 hover:text-stone-900 cursor-pointer"
          >
            <span>View Entire Collection</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Inventory Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="product in displayBestsellers"
            :key="product.id"
            class="bg-white border border-slate-200 hover:border-stone-400 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div class="relative h-64 overflow-hidden bg-slate-100 cursor-pointer" @click="emit('select-product', product)">
              <img
                :src="getPrimaryImageUrl(product)"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute top-3 left-3 px-3 py-1 bg-stone-700 text-white text-xs font-bold rounded-lg shadow-md uppercase tracking-wider">
                Best Seller
              </div>
              <div class="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md text-stone-900 text-xs font-semibold rounded-lg shadow-sm border border-slate-200">
                {{ product.category }}
              </div>

              <!-- Wishlist Toggle -->
              <button
                @click.stop="emit('toggle-wishlist', product)"
                class="absolute top-3 right-3 p-2 rounded-full shadow-md transition-all cursor-pointer"
                :class="isWishlisted(product.id) ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-white/90 backdrop-blur-md text-stone-700 hover:text-rose-600 hover:bg-white border border-slate-200'"
                :title="isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
              >
                <Heart class="w-4 h-4" :class="isWishlisted(product.id) ? 'fill-current' : ''" />
              </button>
            </div>

            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-1 cursor-pointer" @click="emit('select-product', product)">
                <h3 class="text-lg font-extrabold text-slate-900 group-hover:text-stone-700 transition-colors">
                  {{ product.name }}
                </h3>
                <p class="text-slate-500 text-xs line-clamp-2">{{ product.description || 'Solid hardwood furniture piece from SAFS Furniture.' }}</p>
              </div>

              <div class="pt-4 border-t border-slate-100 flex items-center justify-end">
                <div class="flex items-center space-x-2">
                  <button
                    @click.stop="emit('select-product', product)"
                    class="px-3.5 py-2 bg-stone-50 text-stone-700 hover:bg-stone-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    @click.stop="emit('quick-add-to-cart', product)"
                    class="p-2 bg-stone-700 hover:bg-stone-800 text-white rounded-xl shadow-sm cursor-pointer"
                    title="Quick Add to Cart"
                  >
                    <ShoppingBag class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) -->
      <section class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <span class="text-xs font-extrabold text-stone-700 uppercase tracking-widest block">Got Questions?</span>
          <h2 class="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div class="space-y-3">
          <div
            v-for="(faq, idx) in faqs"
            :key="idx"
            class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
          >
            <button
              @click="toggleFaq(idx)"
              class="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <span class="text-base">{{ faq.question }}</span>
              <ChevronUp v-if="activeFaq === idx" class="w-5 h-5 text-stone-700" />
              <ChevronDown v-else class="w-5 h-5 text-slate-400" />
            </button>

            <div v-if="activeFaq === idx" class="p-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 0.8s ease;
}

.hero-fade-leave-active {
  position: absolute;
  inset: 0;
}

.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}
</style>