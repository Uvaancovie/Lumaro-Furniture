<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
  MessageSquare,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Check,
  ShieldCheck
} from 'lucide-vue-next'
import { defaultFurnitureInventory } from '../utils/defaultProducts'
import type { Product } from '../types/database'

const props = defineProps<{
  products?: Product[]
}>()

const emit = defineEmits(['back-to-catalog'])

interface SelectedProductInfo {
  id: string
  name: string
  category: string
  price: number
  sku?: string | null
  imageUrl: string
}

interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  interestedProduct: SelectedProductInfo | null
}

const form = ref<ContactForm>({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  interestedProduct: null,
})

const loading = ref(false)
const submitted = ref(false)
const errorMessage = ref<string | null>(null)

// Interactive Product Dropdown State
const isProductDropdownOpen = ref(false)
const productSearch = ref('')
const selectedCategory = ref('All')
const dropdownContainerRef = ref<HTMLElement | null>(null)

// Fallback to default catalog inventory if database products are loading or empty
const catalogProducts = computed<Product[]>(() => {
  if (props.products && props.products.length > 0) {
    return props.products
  }
  return defaultFurnitureInventory
})

// Unique categories for filtering
const categories = computed(() => {
  const set = new Set<string>()
  catalogProducts.value.forEach(p => {
    if (p.category) set.add(p.category)
  })
  return ['All', ...Array.from(set)]
})

// Filtered products list for dropdown
const filteredProducts = computed(() => {
  return catalogProducts.value.filter(p => {
    const matchCategory = selectedCategory.value === 'All' || p.category === selectedCategory.value
    const q = productSearch.value.toLowerCase().trim()
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.material && p.material.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    return matchCategory && matchSearch
  })
})

function getPrimaryImage(prod: Product): string {
  if (prod.product_images && prod.product_images.length > 0) {
    const primary = prod.product_images.find(img => img.is_primary)
    return primary ? primary.image_url : prod.product_images[0].image_url
  }
  return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'
}

function selectProduct(prod: Product) {
  form.value.interestedProduct = {
    id: prod.id,
    name: prod.name,
    category: prod.category,
    price: prod.price,
    sku: prod.sku,
    imageUrl: getPrimaryImage(prod),
  }
  isProductDropdownOpen.value = false

  // Auto-fill subject if empty or default
  if (!form.value.subject || form.value.subject === 'General Question') {
    form.value.subject = `Inquiry regarding ${prod.name}`
  }
}

function removeSelectedProduct() {
  form.value.interestedProduct = null
}

function handleClickOutside(event: MouseEvent) {
  if (
    dropdownContainerRef.value &&
    !dropdownContainerRef.value.contains(event.target as Node)
  ) {
    isProductDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Use /api/contact.php for native xneelo hosting, or configured API URL
const API_URL = import.meta.env.VITE_VERCEL_API_URL || '/api/contact.php'

async function handleSubmit() {
  errorMessage.value = null
  loading.value = true

  try {
    let targetUrl = API_URL
    let res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(form.value),
    })

    let rawText = await res.text()
    let data: Record<string, any> = {}
    try {
      data = rawText ? JSON.parse(rawText) : {}
    } catch {
      data = {}
    }

    let contentType = res.headers.get('content-type') || ''
    let isHtmlResponse = contentType.includes('text/html') || rawText.trim().startsWith('<!DOCTYPE') || rawText.trim().startsWith('<html')

    // If /api/contact returned HTML (due to .htaccess missing), try /api/contact.php directly
    if ((isHtmlResponse || res.status === 404) && targetUrl !== '/api/contact.php') {
      targetUrl = '/api/contact.php'
      res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form.value),
      })
      rawText = await res.text()
      try {
        data = rawText ? JSON.parse(rawText) : {}
      } catch {
        data = {}
      }
      contentType = res.headers.get('content-type') || ''
      isHtmlResponse = contentType.includes('text/html') || rawText.trim().startsWith('<!DOCTYPE') || rawText.trim().startsWith('<html')
    }

    if (!res.ok || isHtmlResponse || !data.success) {
      throw new Error(data.error || 'Failed to deliver your inquiry. Please email us directly at enquiries@lumarofurniture.co.za.')
    }

    submitted.value = true
    form.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      interestedProduct: null,
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = 'An unexpected error occurred while delivering your inquiry.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-10 animate-fade-in max-w-7xl mx-auto">
    <!-- Top Bar with Back Button -->
    <div class="flex items-center justify-between pb-4 border-b border-stone-200">
      <button
        @click="emit('back-to-catalog')"
        class="inline-flex items-center space-x-2 text-xs md:text-sm font-bold text-stone-600 hover:text-stone-950 transition-colors cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      <span class="inline-flex items-center space-x-1.5 px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-semibold">
        <Sparkles class="w-3.5 h-3.5 text-amber-600" />
        <span>Direct Studio Inquiries</span>
      </span>
    </div>

    <!-- Hero Header -->
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <span class="text-xs font-black text-amber-700 tracking-widest uppercase">
        Connect With Lumaro
      </span>
      <h1 class="text-3xl md:text-5xl font-black text-stone-900 tracking-tight">
        Get in Touch
      </h1>
      <p class="text-stone-600 text-sm md:text-base leading-relaxed">
        Select a furniture piece you are interested in or send us a general inquiry. Our studio artisans respond promptly to all messages.
      </p>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Left Column: Information Cards (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- Contact Details Card -->
        <div class="bg-white border border-stone-200 rounded-2xl p-6 md:p-7 shadow-xs space-y-6">
          <h2 class="text-lg font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center space-x-2">
            <MessageSquare class="w-5 h-5 text-amber-600" />
            <span>Studio Information</span>
          </h2>

          <!-- Email -->
          <div class="flex items-start space-x-4">
            <div class="p-3 bg-amber-50 text-amber-700 rounded-xl shrink-0 border border-amber-100">
              <Mail class="w-5 h-5" />
            </div>
            <div class="space-y-1">
              <span class="block text-xs font-bold text-stone-500 uppercase tracking-wider">Email Inquiries</span>
              <a
                href="mailto:enquiries@lumarofurniture.co.za"
                class="text-sm md:text-base font-bold text-stone-900 hover:text-amber-700 transition-colors break-all"
              >
                enquiries@lumarofurniture.co.za
              </a>
              <p class="text-xs text-stone-500">Direct studio mailbox &bull; Replied within 24 business hours.</p>
            </div>
          </div>

          <!-- Studio Hours -->
          <div class="flex items-start space-x-4">
            <div class="p-3 bg-stone-100 text-stone-700 rounded-xl shrink-0 border border-stone-200">
              <Clock class="w-5 h-5" />
            </div>
            <div class="space-y-1">
              <span class="block text-xs font-bold text-stone-500 uppercase tracking-wider">Operating Hours</span>
              <div class="text-xs md:text-sm text-stone-800 space-y-0.5">
                <p><strong class="text-stone-900">Monday – Friday:</strong> 08:00 – 17:00</p>
                <p><strong class="text-stone-900">Saturday:</strong> 09:00 – 13:00</p>
                <p class="text-stone-500">Sunday & Public Holidays: Closed</p>
              </div>
            </div>
          </div>

          <!-- Nationwide Delivery -->
          <div class="flex items-start space-x-4">
            <div class="p-3 bg-stone-100 text-stone-700 rounded-xl shrink-0 border border-stone-200">
              <MapPin class="w-5 h-5" />
            </div>
            <div class="space-y-1">
              <span class="block text-xs font-bold text-stone-500 uppercase tracking-wider">Nationwide Logistics</span>
              <p class="text-xs md:text-sm text-stone-800">
                White-glove blanket-wrapped delivery across Gauteng, Western Cape, KwaZulu-Natal, and all South African provinces.
              </p>
            </div>
          </div>
        </div>

        <!-- Craftsmanship Assurance Card -->
        <div class="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-stone-900 flex items-center space-x-2">
            <ShieldCheck class="w-4 h-4 text-emerald-600" />
            <span>Lumaro Studio Guarantee</span>
          </h3>
          <ul class="text-xs text-stone-600 space-y-2.5">
            <li class="flex items-start space-x-2">
              <Check class="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Solid Hardwood Integrity:</strong> Genuine sustainably harvested timber with uninterrupted grain continuity.</span>
            </li>
            <li class="flex items-start space-x-2">
              <Check class="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Eco-Friendly Sealants:</strong> Hand-rubbed organic waxes and oils safe for your home.</span>
            </li>
            <li class="flex items-start space-x-2">
              <Check class="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Precision Joinery:</strong> Traditional mortise and tenon joints built to last generations.</span>
            </li>
          </ul>
        </div>

      </div>

      <!-- Right Column: Interactive Contact Form (7 cols) -->
      <div class="lg:col-span-7">
        <div class="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-xs">
          
          <!-- Success State -->
          <div v-if="submitted" class="py-10 text-center space-y-4 animate-fade-in">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 class="w-9 h-9" />
            </div>
            <div class="space-y-2 max-w-md mx-auto">
              <h3 class="text-xl font-bold text-stone-900">Message Delivered Successfully!</h3>
              <p class="text-sm text-stone-600 leading-relaxed">
                Thank you for reaching out. Your inquiry has been sent to our team at 
                <span class="font-semibold text-stone-800">enquiries@lumarofurniture.co.za</span>. 
                We will get back to you shortly.
              </p>
            </div>
            <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                @click="submitted = false"
                class="w-full sm:w-auto px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Send Another Inquiry
              </button>
              <button
                @click="emit('back-to-catalog')"
                class="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Continue Browsing Catalog
              </button>
            </div>
          </div>

          <!-- Form State -->
          <form v-else @submit.prevent="handleSubmit" class="space-y-5">
            <div class="border-b border-stone-100 pb-3">
              <h2 class="text-lg font-bold text-stone-900">Send Us an Inquiry</h2>
              <p class="text-xs text-stone-500">Pick a piece you are interested in and our studio will provide full details.</p>
            </div>

            <!-- Error Banner -->
            <div
              v-if="errorMessage"
              class="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 text-xs md:text-sm animate-fade-in"
            >
              <AlertCircle class="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div class="space-y-1">
                <span class="font-bold">Message Not Sent</span>
                <p class="text-rose-700 leading-relaxed">{{ errorMessage }}</p>
              </div>
            </div>

            <!-- INTERACTIVE PRODUCT PICKER / DROPDOWN -->
            <div ref="dropdownContainerRef" class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Furniture Piece of Interest (Optional)
                </label>
                <span v-if="!form.interestedProduct" class="text-[11px] text-stone-400">
                  Select a product to attach to your message
                </span>
              </div>

              <!-- Selected Product Card View -->
              <div
                v-if="form.interestedProduct"
                class="p-3.5 bg-amber-50/60 border border-amber-300 rounded-xl flex items-center justify-between gap-4 animate-fade-in"
              >
                <div class="flex items-center space-x-3.5 overflow-hidden">
                  <img
                    :src="form.interestedProduct.imageUrl"
                    :alt="form.interestedProduct.name"
                    class="w-14 h-14 object-cover rounded-lg border border-amber-200 shrink-0 bg-white"
                  />
                  <div class="min-w-0">
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-0.5 bg-amber-200/80 text-amber-900 text-[10px] font-bold rounded-md uppercase">
                        {{ form.interestedProduct.category }}
                      </span>
                      <span v-if="form.interestedProduct.sku" class="text-[10px] text-stone-500 font-mono">
                        {{ form.interestedProduct.sku }}
                      </span>
                    </div>
                    <h4 class="text-xs md:text-sm font-bold text-stone-900 truncate mt-0.5">
                      {{ form.interestedProduct.name }}
                    </h4>
                  </div>
                </div>

                <div class="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    @click="isProductDropdownOpen = !isProductDropdownOpen"
                    class="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg border border-stone-200 transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    @click="removeSelectedProduct"
                    class="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove selected product"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Dropdown Trigger Button (When no product is selected) -->
              <div v-else class="relative">
                <button
                  type="button"
                  @click="isProductDropdownOpen = !isProductDropdownOpen"
                  class="w-full px-3.5 py-3 bg-stone-50 hover:bg-stone-100/80 border border-dashed border-stone-300 rounded-xl text-left flex items-center justify-between text-xs md:text-sm text-stone-700 transition-all cursor-pointer group"
                >
                  <div class="flex items-center space-x-2.5">
                    <div class="p-1.5 bg-stone-200/70 group-hover:bg-amber-100 group-hover:text-amber-700 text-stone-600 rounded-lg transition-colors">
                      <Package class="w-4 h-4" />
                    </div>
                    <span class="font-medium text-stone-700">
                      Click to choose a furniture piece from catalog...
                    </span>
                  </div>
                  <div class="flex items-center space-x-1.5 text-stone-400 group-hover:text-stone-700">
                    <span class="text-xs font-medium">{{ catalogProducts.length }} items</span>
                    <ChevronDown
                      class="w-4 h-4 transition-transform duration-200"
                      :class="{ 'rotate-180': isProductDropdownOpen }"
                    />
                  </div>
                </button>
              </div>

              <!-- Interactive Dropdown Popover Menu -->
              <div
                v-if="isProductDropdownOpen"
                class="relative z-30"
              >
                <div class="absolute left-0 right-0 top-1 bg-white border border-stone-300 rounded-2xl shadow-xl overflow-hidden p-3 space-y-3 animate-fade-in">
                  
                  <!-- Dropdown Search & Filter Header -->
                  <div class="space-y-2">
                    <div class="relative flex items-center">
                      <Search class="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
                      <input
                        v-model="productSearch"
                        type="text"
                        placeholder="Search furniture by name, material, or SKU..."
                        class="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 font-medium"
                      />
                      <button
                        v-if="productSearch"
                        @click="productSearch = ''"
                        type="button"
                        class="absolute right-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        <X class="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <!-- Category Pills Filter -->
                    <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                      <button
                        v-for="cat in categories"
                        :key="cat"
                        type="button"
                        @click="selectedCategory = cat"
                        :class="[
                          'px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer',
                          selectedCategory === cat
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        ]"
                      >
                        {{ cat }}
                      </button>
                    </div>
                  </div>

                  <!-- Product Items List -->
                  <div class="max-h-64 overflow-y-auto divide-y divide-stone-100 pr-1">
                    <div
                      v-if="filteredProducts.length === 0"
                      class="py-8 text-center text-xs text-stone-500"
                    >
                      No furniture pieces found matching "{{ productSearch }}".
                    </div>

                    <div
                      v-for="prod in filteredProducts"
                      :key="prod.id"
                      @click="selectProduct(prod)"
                      class="flex items-center justify-between p-2 hover:bg-amber-50/70 rounded-xl cursor-pointer transition-colors group"
                    >
                      <div class="flex items-center space-x-3 overflow-hidden">
                        <img
                          :src="getPrimaryImage(prod)"
                          :alt="prod.name"
                          class="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div class="min-w-0">
                          <h5 class="text-xs font-bold text-stone-900 truncate group-hover:text-amber-900">
                            {{ prod.name }}
                          </h5>
                          <div class="flex items-center space-x-2 text-[11px] text-stone-500">
                            <span>{{ prod.category }}</span>
                            <span v-if="prod.material" class="truncate">&bull; {{ prod.material }}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        class="px-2.5 py-1 text-[11px] font-bold text-stone-700 group-hover:bg-stone-900 group-hover:text-white rounded-lg transition-colors shrink-0 cursor-pointer"
                      >
                        Select
                      </button>
                    </div>
                  </div>

                  <!-- Dropdown Footer -->
                  <div class="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Showing {{ filteredProducts.length }} items</span>
                    <button
                      type="button"
                      @click="isProductDropdownOpen = false"
                      class="text-xs font-bold text-stone-700 hover:text-stone-950 cursor-pointer"
                    >
                      Close Dropdown
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Name & Email Inputs -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="contact-name" class="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Full Name <span class="text-rose-500">*</span>
                </label>
                <input
                  id="contact-name"
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="e.g. Johan van der Merwe"
                  class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs md:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all font-medium"
                />
              </div>

              <div class="space-y-1.5">
                <label for="contact-email" class="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Email Address <span class="text-rose-500">*</span>
                </label>
                <input
                  id="contact-email"
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="johan@example.co.za"
                  class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs md:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <!-- Phone & Subject Inputs -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="contact-phone" class="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Phone Number (Optional)
                </label>
                <input
                  id="contact-phone"
                  v-model="form.phone"
                  type="tel"
                  placeholder="082 123 4567"
                  class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs md:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all font-medium"
                />
              </div>

              <div class="space-y-1.5">
                <label for="contact-subject" class="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Inquiry Topic <span class="text-rose-500">*</span>
                </label>
                <input
                  id="contact-subject"
                  v-model="form.subject"
                  type="text"
                  required
                  placeholder="e.g. Inquiry regarding Rococo Couch"
                  class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs md:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <!-- Message Textarea -->
            <div class="space-y-1.5">
              <label for="contact-message" class="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Message & Questions <span class="text-rose-500">*</span>
              </label>
              <textarea
                id="contact-message"
                v-model="form.message"
                rows="5"
                required
                placeholder="Write your questions or notes regarding delivery, wood finishes, or custom requirements..."
                class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs md:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all font-medium resize-y"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="loading"
                class="w-full sm:w-auto px-8 py-3 bg-stone-900 hover:bg-black text-white rounded-xl text-xs md:text-sm font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
                <Send v-else class="w-4 h-4" />
                <span>{{ loading ? 'Sending Inquiry...' : 'Submit Inquiry' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
