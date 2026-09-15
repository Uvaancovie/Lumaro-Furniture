<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from './utils/supabase'
import type { Product, CartItem } from './types/database'
import LandingPage from './components/LandingPage.vue'
import Catalog from './components/Catalog.vue'
import ProductDetail from './components/ProductDetail.vue'
import AdminLogin from './components/AdminLogin.vue'
import AdminUpload from './components/AdminUpload.vue'
import CartDrawer from './components/CartDrawer.vue'
import WishlistDrawer from './components/WishlistDrawer.vue'
import { Store, ShieldCheck, LogOut, ShoppingBag, Building2, CheckCircle2, Home, Menu, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const currentView = computed<'landing' | 'catalog' | 'detail' | 'admin'>(() => {
  const name = route.name
  if (name === 'catalog') return 'catalog'
  if (name === 'product') return 'detail'
  if (name === 'admin') return 'admin'
  return 'landing'
})

const selectedProduct = ref<Product | null>(null)
const allProducts = ref<Product[]>([])

const userSession = ref<any>(null)
const loadingAuth = ref(true)

// Shopping Cart State
const cartItems = ref<CartItem[]>([])
const isCartOpen = ref(false)
const toastMessage = ref('')

// Wishlist State
const wishlistItems = ref<Product[]>([])
const isWishlistOpen = ref(false)
const WISHLIST_STORAGE_KEY = 'safs_wishlist'

const totalCartCount = computed(() => {
  return cartItems.value.reduce((acc, item) => acc + item.quantity, 0)
})

const mobileMenuOpen = ref(false)

function navigateTo(view: 'landing' | 'catalog' | 'detail' | 'admin') {
  const paths: Record<string, string> = {
    landing: '/',
    catalog: '/catalog',
    detail: '/catalog',
    admin: '/admin',
  }
  router.push(paths[view])
  mobileMenuOpen.value = false
}

// Resolve the product from the URL slug (also supports id fallback)
watch(
  () => [route.name, route.params.slug, allProducts.value] as const,
  ([name, slug, products]) => {
    if (name !== 'product') return

    const found = products.find(
      p => p.slug === slug || p.id === slug
    )

    if (found) {
      selectedProduct.value = found
      return
    }

    if (products.length > 0) {
      router.replace('/catalog')
    }
  },
  { immediate: true }
)

// SEO: dynamic document title for shareable product links
watch(
  () => [route.name, selectedProduct.value?.name] as const,
  ([name, productName]) => {
    if (name === 'product' && productName) {
      document.title = `${productName} | South African Furniture`
    } else if (name === 'catalog') {
      document.title = 'Catalog | South African Furniture'
    } else if (name === 'admin') {
      document.title = 'Admin Portal | South African Furniture'
    } else {
      document.title = 'South African Furniture — Handcrafted Hardwood Collection'
    }
  },
  { immediate: true }
)

async function fetchAllProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      allProducts.value = (data as any[]).map(p => ({
        ...p,
        product_images: [...(p.product_images || [])].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
      }))
    }
  } catch (err) {
    console.error('Error fetching inventory for App:', err)
  }
}

async function checkAuthSession() {
  loadingAuth.value = true
  try {
    const { data } = await supabase.auth.getSession()
    userSession.value = data.session?.user || null
  } catch (err) {
    console.error('Session check error:', err)
  } finally {
    loadingAuth.value = false
  }
}

function handleAuthenticated(user: any) {
  userSession.value = user
  router.push('/admin')
}

async function handleLogout() {
  await supabase.auth.signOut()
  userSession.value = null
  router.push('/')
}

function handleSelectProduct(product: Product) {
  selectedProduct.value = product
  router.push({ name: 'product', params: { slug: product.slug || product.id } })
}

function handleAddToCart(payload: { product: Product; quantity: number; selectedMaterial?: string }) {
  const existingIndex = cartItems.value.findIndex(item => item.product.id === payload.product.id)
  
  if (existingIndex > -1) {
    cartItems.value[existingIndex].quantity += payload.quantity
  } else {
    cartItems.value.push({
      product: payload.product,
      quantity: payload.quantity,
      selectedMaterial: payload.selectedMaterial
    })
  }

  showToast(`Added "${payload.product.name}" to cart!`)
}

function handleQuickAddToCart(product: Product) {
  handleAddToCart({ product, quantity: 1 })
}

function updateCartQuantity(payload: { index: number; quantity: number }) {
  if (payload.quantity <= 0) {
    cartItems.value.splice(payload.index, 1)
  } else {
    cartItems.value[payload.index].quantity = payload.quantity
  }
}

function removeCartItem(index: number) {
  cartItems.value.splice(index, 1)
}

function handleCheckout() {
  showToast('Checkout initialized! Thank you for choosing SAFS Furniture.')
  cartItems.value = []
  isCartOpen.value = false
}

// --- Wishlist ---
function loadWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (raw) {
      wishlistItems.value = JSON.parse(raw)
    }
  } catch (err) {
    console.error('Failed to load wishlist from storage:', err)
  }
}

function persistWishlist() {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems.value))
  } catch (err) {
    console.error('Failed to persist wishlist:', err)
  }
}

function toggleWishlist(product: Product) {
  const existingIndex = wishlistItems.value.findIndex(item => item.id === product.id)

  if (existingIndex > -1) {
    wishlistItems.value.splice(existingIndex, 1)
    showToast(`Removed "${product.name}" from wishlist`)
  } else {
    wishlistItems.value.push(product)
    showToast(`Added "${product.name}" to wishlist!`)
  }

  persistWishlist()
}

function isProductWishlisted(productId: string): boolean {
  return wishlistItems.value.some(item => item.id === productId)
}

function removeFromWishlist(index: number) {
  wishlistItems.value.splice(index, 1)
  persistWishlist()
}

function addWishlistToCart(product: Product) {
  handleAddToCart({ product, quantity: 1 })
  const existingIndex = wishlistItems.value.findIndex(item => item.id === product.id)
  if (existingIndex > -1) {
    wishlistItems.value.splice(existingIndex, 1)
    persistWishlist()
  }
}

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

onMounted(() => {
  fetchAllProducts()
  checkAuthSession()
  loadWishlist()
  supabase.auth.onAuthStateChange((_event, session) => {
    userSession.value = session?.user || null
  })
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
    
    <!-- Top Navigation Bar -->
    <header
      v-if="currentView !== 'landing'"
      class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        <!-- Logo -->
        <div 
          @click="navigateTo('landing')"
          class="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group shrink-0"
        >
          <div class="w-12 h-12 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-stone-200 bg-white flex items-center justify-center shrink-0">
            <img 
              src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/south-african-furniture-logo/south-african-furniture.jpg" 
              alt="South African Furniture" 
              class="w-full h-full object-cover"
              style="width: 48.1733px; height: 48.1733px;"
            />
          </div>
          <div>
            <span class="text-base sm:text-xl font-black text-slate-900 tracking-tight block group-hover:text-stone-700 transition-colors leading-tight">
              South African Furniture
            </span>
            <span class="hidden sm:block text-[10px] text-stone-700 tracking-widest uppercase -mt-0.5 font-bold leading-tight">
              Handcrafted Collection
            </span>
          </div>
        </div>

        <!-- Desktop Nav (hidden on mobile) -->
        <nav class="hidden sm:flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            @click="navigateTo('landing')"
            class="px-3 lg:px-4 py-2 text-xs lg:text-sm font-bold rounded-lg lg:rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          >
            <Home class="w-4 h-4" />
            <span class="hidden lg:inline">Home</span>
          </button>
          <button
            @click="navigateTo('catalog')"
            :class="[
              'px-3 lg:px-4 py-2 text-xs lg:text-sm font-bold rounded-lg lg:rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap',
              currentView === 'catalog' || currentView === 'detail'
                ? 'bg-stone-700 text-white shadow-md shadow-stone-700/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            ]"
          >
            <Store class="w-4 h-4" />
            <span>Catalog</span>
          </button>
          <button
            @click="navigateTo('admin')"
            :class="[
              'px-3 lg:px-4 py-2 text-xs lg:text-sm font-bold rounded-lg lg:rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap',
              currentView === 'admin' 
                ? 'bg-stone-700 text-white shadow-md shadow-stone-700/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            ]"
          >
            <ShieldCheck class="w-4 h-4" />
            <span class="hidden lg:inline">Admin</span>
            <span class="lg:hidden">Admin</span>
          </button>
        </nav>

        <!-- Right Actions -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          <!-- Shopping Cart Drawer Button -->
          <button
            @click="isCartOpen = true"
            class="relative p-2 sm:p-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg sm:rounded-xl transition-all cursor-pointer border border-stone-200 shadow-xs flex items-center space-x-1.5"
          >
            <ShoppingBag class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="hidden sm:inline text-xs font-extrabold uppercase">Cart</span>
            <span 
              v-if="totalCartCount > 0"
              class="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-stone-700 text-white text-[10px] sm:text-[11px] font-black rounded-full flex items-center justify-center shadow-md animate-bounce"
            >
              {{ totalCartCount }}
            </span>
          </button>

          <!-- Admin Session Badge (desktop) -->
          <template v-if="userSession">
            <div class="hidden md:flex items-center space-x-2">
              <span class="hidden lg:inline px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-800 font-bold">
                Admin Active
              </span>
              <button
                @click="handleLogout"
                class="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 rounded-lg sm:rounded-xl hover:bg-slate-100 transition-colors"
                title="Sign Out Admin"
              >
                <LogOut class="w-4 h-4 sm:w-4 sm:h-4" />
              </button>
            </div>
          </template>

          <!-- Mobile Hamburger -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="sm:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            :title="mobileMenuOpen ? 'Close menu' : 'Open menu'"
          >
            <Menu v-if="!mobileMenuOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div
        v-if="mobileMenuOpen"
        class="sm:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-lg"
      >
        <div class="px-4 py-3 space-y-1">
          <button
            @click="navigateTo('landing')"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer text-slate-700 hover:bg-slate-100"
          >
            <Home class="w-5 h-5" />
            <span>Home</span>
          </button>
          <button
            @click="navigateTo('catalog')"
            :class="[
              'w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer',
              currentView === 'catalog' || currentView === 'detail' ? 'bg-stone-700 text-white' : 'text-slate-700 hover:bg-slate-100'
            ]"
          >
            <Store class="w-5 h-5" />
            <span>Catalog</span>
          </button>
          <button
            @click="navigateTo('admin')"
            :class="[
              'w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer',
              currentView === 'admin' ? 'bg-stone-700 text-white' : 'text-slate-700 hover:bg-slate-100'
            ]"
          >
            <ShieldCheck class="w-5 h-5" />
            <span>Admin Portal</span>
          </button>

          <!-- Mobile Admin badge -->
          <template v-if="userSession">
            <div class="border-t border-slate-100 pt-3 mt-2 flex items-center justify-between">
              <span class="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-800 font-bold">
                Admin Active
              </span>
              <button
                @click="handleLogout"
                class="flex items-center space-x-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                <LogOut class="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </header>

    <!-- Floating Toast Notification -->
    <div 
      v-if="toastMessage"
      class="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 flex items-center space-x-3 text-sm font-semibold animate-fade-in"
    >
      <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0" />
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Dynamic Shopping Cart Drawer -->
    <CartDrawer
      :is-open="isCartOpen"
      :cart-items="cartItems"
      @close="isCartOpen = false"
      @update-quantity="updateCartQuantity"
      @remove-item="removeCartItem"
      @checkout="handleCheckout"
    />

    <!-- Dynamic Wishlist Drawer -->
    <WishlistDrawer
      :is-open="isWishlistOpen"
      :wishlist="wishlistItems"
      @close="isWishlistOpen = false"
      @remove-item="removeFromWishlist"
      @add-to-cart="addWishlistToCart"
      @select-product="handleSelectProduct"
    />

    <!-- Main View Routing -->
    <main class="flex-1 w-full mx-auto">

      <!-- View 0: Landing Page (full-bleed, owns its own header/hero) -->
      <div
        v-if="currentView === 'landing'"
        class="w-full"
      >
        <LandingPage
          :products="allProducts"
          :wishlist="wishlistItems"
          @explore-catalog="navigateTo('catalog')"
          @select-product="handleSelectProduct"
          @quick-add-to-cart="handleQuickAddToCart"
          @products-updated="fetchAllProducts"
          @open-cart="isCartOpen = true"
          @open-wishlist="isWishlistOpen = true"
          @navigate-admin="navigateTo('admin')"
          @toggle-wishlist="toggleWishlist"
        />
      </div>

      <!-- Nested View Container -->
      <div v-else class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- View 1: Main Catalog -->
      <Catalog 
        v-if="currentView === 'catalog'" 
        :wishlist="wishlistItems"
        @select-product="handleSelectProduct"
        @quick-add-to-cart="handleQuickAddToCart"
        @toggle-wishlist="toggleWishlist"
      />

      <!-- View 2: E-Commerce Product Detail Page -->
      <ProductDetail 
        v-else-if="currentView === 'detail' && selectedProduct" 
        :product="selectedProduct"
        :all-products="allProducts"
        :wishlist="wishlistItems"
        @back="navigateTo('catalog')"
        @add-to-cart="handleAddToCart"
        @select-product="handleSelectProduct"
        @toggle-wishlist="toggleWishlist"
      />

      <!-- View 3: Admin Portal -->
      <template v-else-if="currentView === 'admin'">
        <AdminUpload 
          v-if="userSession" 
          @logout="handleLogout" 
          @product-updated="fetchAllProducts"
        />
        <AdminLogin 
          v-else 
          @authenticated="handleAuthenticated" 
        />
      </template>
      </div>
    </main>

    <!-- Royal White Footer -->
    <footer class="bg-white border-t border-slate-200 text-slate-500 py-8 text-xs text-center">
      <div class="max-w-7xl mx-auto px-4 space-y-2">
        <p class="font-bold text-slate-800">
          South African Furniture — Handcrafted Hardwood Collection
        </p>
        <p class="text-slate-400">
          Designed with Vue 3, Supabase PostgreSQL & Storage, hosted on Vercel Edge Serverless.
        </p>
      </div>
    </footer>
  </div>
</template>
