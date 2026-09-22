<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../utils/supabase'
import type { Product, NewProductInput } from '../types/database'
import {
  UploadCloud,
  PackagePlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  List,
  PlusCircle,
  Sparkles,
  Eye,
  EyeOff,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  Star
} from 'lucide-vue-next'

const emit = defineEmits(['logout', 'product-updated'])

const activeTab = ref<'upload' | 'inventory'>('upload')
const products = ref<Product[]>([])
const loading = ref(false)
const uploading = ref(false)
const seeding = ref(false)

const successMessage = ref('')
const errorMessage = ref('')

const selectedFiles = ref<File[]>([])
const imagePreviews = ref<string[]>([])

const editingProductId = ref<string | null>(null)
const existingImages = ref<{ id: string; url: string; is_primary: boolean; sort_order: number }[]>([])

const form = ref<NewProductInput>({
  name: '',
  slug: '',
  category: 'Living Room',
  price: 0,
  sku: '',
  stock_quantity: 1,
  material: '',
  color: '',
  width: undefined,
  height: undefined,
  depth: undefined,
  description: '',
  is_active: true,
  is_featured: false,
})

const categories = [
  'Living Room',
  'Dining Room',
  'Bedroom',
  'Office',
  'Outdoor',
  'Storage'
]

function generateSlug() {
  if (form.value.name) {
    form.value.slug = form.value.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (!form.value.sku) {
      const prefix = form.value.category.substring(0, 3).toUpperCase()
      const rand = Math.floor(1000 + Math.random() * 9000)
      form.value.sku = `${prefix}-${rand}`
    }
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    addFiles(files)
  }
}

function handleFileDrop(event: DragEvent) {
  if (event.dataTransfer?.files) {
    const files = Array.from(event.dataTransfer.files)
    addFiles(files)
  }
}

function addFiles(files: File[]) {
  const validFiles = files.filter(f => f.type.startsWith('image/'))
  selectedFiles.value.push(...validFiles)

  validFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        imagePreviews.value.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  })
}

function removeImage(index: number) {
  selectedFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

function handleEditProduct(product: Product) {
  editingProductId.value = product.id
  form.value = {
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    sku: product.sku || '',
    stock_quantity: product.stock_quantity,
    material: product.material || '',
    color: product.color || '',
    width: product.width,
    height: product.height,
    depth: product.depth,
    description: product.description || '',
    is_active: product.is_active,
    is_featured: product.is_featured,
  }
  existingImages.value = (product.product_images || [])
    .map(img => ({
      id: img.id,
      url: img.image_url,
      is_primary: !!img.is_primary,
      sort_order: img.sort_order ?? 0,
    }))
    .sort((a, b) => a.sort_order - b.sort_order)
  selectedFiles.value = []
  imagePreviews.value = []
  activeTab.value = 'upload'
}

function cancelProductEdit() {
  editingProductId.value = null
  existingImages.value = []
  form.value = {
    name: '',
    slug: '',
    category: 'Living Room',
    price: 0,
    sku: '',
    stock_quantity: 1,
    material: '',
    color: '',
    width: undefined,
    height: undefined,
    depth: undefined,
    description: '',
    is_active: true,
    is_featured: false,
  }
  selectedFiles.value = []
  imagePreviews.value = []
  activeTab.value = 'inventory'
}

async function persistImageOrder(images: { id: string; is_primary: boolean; sort_order: number }[]) {
  await Promise.all(images.map(img =>
    supabase
      .from('product_images')
      .update({ is_primary: img.is_primary, sort_order: img.sort_order })
      .eq('id', img.id)
  ))
}

async function moveExistingImage(index: number, direction: -1 | 1) {
  const target = index + direction
  if (index < 0 || target < 0 || target >= existingImages.value.length) return

  const imgs = existingImages.value.map(img => ({ ...img }))
  ;[imgs[index], imgs[target]] = [imgs[target], imgs[index]]
  existingImages.value = imgs.map((img, i) => ({ ...img, sort_order: i }))

  try {
    await persistImageOrder(existingImages.value)
    successMessage.value = 'Image order updated.'
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update image order.'
  }
}

async function setPrimaryImage(imageId: string) {
  const idx = existingImages.value.findIndex(img => img.id === imageId)
  if (idx === -1 || existingImages.value[idx].is_primary) return

  const imgs = existingImages.value.map(img => ({ ...img }))
  const [moved] = imgs.splice(idx, 1)
  imgs.unshift(moved)

  existingImages.value = imgs.map((img, i) => ({
    ...img,
    is_primary: i === 0,
    sort_order: i,
  }))

  try {
    await persistImageOrder(existingImages.value)
    successMessage.value = 'Primary image updated.'
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update primary image.'
  }
}

function movePreview(index: number, direction: -1 | 1) {
  const target = index + direction
  if (index < 0 || target < 0 || target >= selectedFiles.value.length) return

  ;[selectedFiles.value[index], selectedFiles.value[target]] = [selectedFiles.value[target], selectedFiles.value[index]]
  ;[imagePreviews.value[index], imagePreviews.value[target]] = [imagePreviews.value[target], imagePreviews.value[index]]
}

async function removeExistingImage(imageId: string) {
  if (!confirm('Remove this image?')) return
  try {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (error) throw error
    existingImages.value = existingImages.value.filter(img => img.id !== imageId)

    if (existingImages.value.length > 0 && !existingImages.value.some(img => img.is_primary)) {
      existingImages.value[0].is_primary = true
    }
    existingImages.value = existingImages.value.map((img, i) => ({ ...img, sort_order: i }))

    try {
      await persistImageOrder(existingImages.value)
    } catch { /* non-fatal: order persisted on next reorder */ }

    successMessage.value = 'Image removed.'
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to remove image.'
  }
}

async function fetchInventory() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    products.value = (data || []).map(p => ({
      ...p,
      product_images: [...(p.product_images || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    }))
  } catch (err: any) {
    console.error('Inventory fetch error:', err)
  } finally {
    loading.value = false
  }
}

async function handleProductUpload() {
  if (!form.value.name || !form.value.price) {
    errorMessage.value = 'Please provide product name and price.'
    return
  }

  uploading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    generateSlug()
    const isEditing = editingProductId.value !== null
    const productId = editingProductId.value

    if (isEditing && productId) {
      // UPDATE existing product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: form.value.name,
          slug: form.value.slug,
          category: form.value.category,
          price: form.value.price,
          sku: form.value.sku || null,
          stock_quantity: form.value.stock_quantity,
          material: form.value.material || null,
          color: form.value.color || null,
          width: form.value.width || null,
          height: form.value.height || null,
          depth: form.value.depth || null,
          description: form.value.description || null,
          is_active: form.value.is_active,
          is_featured: form.value.is_featured,
        })
        .eq('id', productId)

      if (updateError) throw updateError

      // Upload new images
      if (selectedFiles.value.length > 0) {
        for (let i = 0; i < selectedFiles.value.length; i++) {
          const file = selectedFiles.value[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`

          const { error: storageError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, { cacheControl: '3600', upsert: true })

          if (!storageError) {
            const { data: publicUrlData } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName)

            const existingCount = existingImages.value.length
            const hasExistingPrimary = existingImages.value.some(img => img.is_primary)
            await supabase.from('product_images').insert([{
              product_id: productId,
              image_url: publicUrlData.publicUrl,
              is_primary: !hasExistingPrimary && i === 0,
              sort_order: existingCount + i,
            }])
          }
        }
      }

      successMessage.value = `Product "${form.value.name}" updated successfully!`
    } else {
      // CREATE new product
      const { data: newProduct, error: prodError } = await supabase
        .from('products')
        .insert([{
          name: form.value.name,
          slug: form.value.slug,
          category: form.value.category,
          price: form.value.price,
          sku: form.value.sku,
          stock_quantity: form.value.stock_quantity,
          material: form.value.material || null,
          color: form.value.color || null,
          width: form.value.width || null,
          height: form.value.height || null,
          depth: form.value.depth || null,
          description: form.value.description || null,
          is_active: form.value.is_active,
          is_featured: form.value.is_featured
        }])
        .select()
        .single()

      if (prodError) throw prodError

      if (selectedFiles.value.length > 0 && newProduct) {
        for (let i = 0; i < selectedFiles.value.length; i++) {
          const file = selectedFiles.value[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${newProduct.id}/${Date.now()}-${i}.${fileExt}`

          const { error: storageError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, { cacheControl: '3600', upsert: true })

          if (!storageError) {
            const { data: publicUrlData } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName)

            await supabase.from('product_images').insert([{
              product_id: newProduct.id,
              image_url: publicUrlData.publicUrl,
              is_primary: i === 0,
              sort_order: i
            }])
          }
        }
      }

      successMessage.value = `Product "${form.value.name}" uploaded successfully!`
    }

    // Reset form
    editingProductId.value = null
    existingImages.value = []
    form.value = {
      name: '',
      slug: '',
      category: 'Living Room',
      price: 0,
      sku: '',
      stock_quantity: 1,
      material: '',
      color: '',
      width: undefined,
      height: undefined,
      depth: undefined,
      description: '',
      is_active: true,
      is_featured: false,
    }
    selectedFiles.value = []
    imagePreviews.value = []
    activeTab.value = 'inventory'

    await fetchInventory()
    emit('product-updated')
  } catch (err: any) {
    console.error('Product upload/update error:', err)
    errorMessage.value = err.message || 'Failed to save product.'
  } finally {
    uploading.value = false
  }
}

async function toggleActive(product: Product) {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)

    if (error) throw error
    product.is_active = !product.is_active
  } catch (err: any) {
    alert('Error toggling status: ' + err.message)
  }
}

async function deleteProduct(productId: string) {
  if (!confirm('Are you sure you want to delete this product?')) return

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) throw error
    products.value = products.value.filter(p => p.id !== productId)
    successMessage.value = 'Product deleted successfully.'
  } catch (err: any) {
    alert('Error deleting product: ' + err.message)
  }
}

async function seedSampleData() {
  if (!confirm('Seed database with 6 luxury South African furniture sample items?')) return

  seeding.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const samples = [
    {
      name: 'Kariega Teak Dining Table',
      slug: 'kariega-teak-dining-table',
      category: 'Dining Room',
      price: 18450.00,
      stock_quantity: 5,
      material: 'Solid South African Teak',
      color: 'Warm Amber',
      width: 220, height: 76, depth: 100,
      is_active: true, is_featured: true,
      description: 'Handcrafted solid teak dining table featuring natural organic grain lines.'
    },
    {
      name: 'Drakensberg Leather Sofa',
      slug: 'drakensberg-leather-sofa',
      category: 'Living Room',
      price: 24900.00,
      stock_quantity: 3,
      material: 'Full-Grain Aniline Leather',
      color: 'Cognac Brown',
      width: 240, height: 85, depth: 95,
      is_active: true, is_featured: true,
      description: 'Luxurious 3-seater sofa wrapped in premium South African full-grain leather.'
    }
  ]

  try {
    for (const item of samples) {
      const { data: newProd, error } = await supabase.from('products').insert([item]).select().single()
      if (!error && newProd) {
        await supabase.from('product_images').insert([{
          product_id: newProd.id,
          image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
          is_primary: true
        }])
      }
    }
    successMessage.value = 'Database seeded with sample items!'
    await fetchInventory()
  } catch (err: any) {
    errorMessage.value = 'Seeding error: ' + err.message
  } finally {
    seeding.value = false
  }
}

onMounted(() => {
  fetchInventory()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
      <div class="flex items-center space-x-2">
        <button
          @click="activeTab = 'upload'"
          :class="[
            'px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center space-x-2 cursor-pointer',
            activeTab === 'upload' ? 'bg-stone-700 text-white shadow-md shadow-stone-700/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          ]"
        >
          <PlusCircle class="w-4 h-4" />
          <span>Upload Product</span>
        </button>

        <button
          @click="activeTab = 'inventory'; fetchInventory()"
          :class="[
            'px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center space-x-2 cursor-pointer',
            activeTab === 'inventory' ? 'bg-stone-700 text-white shadow-md shadow-stone-700/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          ]"
        >
          <List class="w-4 h-4" />
          <span>Manage Inventory ({{ products.length }})</span>
        </button>
      </div>

      <button
        @click="seedSampleData"
        :disabled="seeding"
        class="px-3.5 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer self-end sm:self-auto"
      >
        <Sparkles class="w-3.5 h-3.5" />
        <span>{{ seeding ? 'Seeding...' : 'Seed Sample Data' }}</span>
      </button>
    </div>

    <!-- Alert Notices -->
    <div v-if="successMessage" class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800 flex items-center justify-between font-semibold">
      <div class="flex items-center space-x-2">
        <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
        <span>{{ successMessage }}</span>
      </div>
      <button @click="successMessage = ''" class="text-xs text-emerald-600 hover:underline">Dismiss</button>
    </div>

    <div v-if="errorMessage" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-800 flex items-center justify-between font-semibold">
      <div class="flex items-center space-x-2">
        <AlertCircle class="w-5 h-5 text-rose-600 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>
      <button @click="errorMessage = ''" class="text-xs text-rose-600 hover:underline">Dismiss</button>
    </div>

    <!-- UPLOAD / EDIT FORM -->
    <div v-if="activeTab === 'upload'" class="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
      <div class="border-b border-slate-100 pb-4 flex items-start justify-between">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <PackagePlus v-if="!editingProductId" class="w-5 h-5 text-stone-700" />
            <Pencil v-else class="w-5 h-5 text-stone-700" />
            <span>{{ editingProductId ? 'Edit Furniture Item' : 'Upload New Furniture Item' }}</span>
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            {{ editingProductId ? 'Update the details below. Changes will be reflected immediately on the storefront.' : 'Fill in details and attach images to publish directly to your live Lumaro Furniture Studio store.' }}
          </p>
        </div>
        <button
          v-if="editingProductId"
          @click="cancelProductEdit"
          class="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shrink-0"
        >
          <X class="w-3.5 h-3.5" />
          <span>Cancel Edit</span>
        </button>
      </div>

      <form @submit.prevent="handleProductUpload" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 block">Product Title *</label>
            <input
              v-model="form.name"
              @input="generateSlug"
              type="text"
              required
              placeholder="e.g. Kariega Teak Dining Table"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-stone-600 focus:outline-none"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 block">Category *</label>
            <select
              v-model="form.category"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-stone-600 focus:outline-none"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 block">Price (ZAR R) *</label>
            <input
              v-model.number="form.price"
              type="number"
              step="0.01"
              required
              placeholder="18450.00"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-stone-600 focus:outline-none"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 block">SKU Code</label>
            <input
              v-model="form.sku"
              type="text"
              placeholder="TBL-TEAK-001"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-stone-600 focus:outline-none"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 block">Stock Quantity</label>
            <input
              v-model.number="form.stock_quantity"
              type="number"
              min="0"
              placeholder="5"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-stone-600 focus:outline-none"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 block">Primary Material</label>
            <input
              v-model="form.material"
              type="text"
              placeholder="e.g. Solid South African Teak"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-stone-600 focus:outline-none"
            />
          </div>
        </div>

        <!-- Dimensions -->
        <div class="bg-stone-50/60 p-4 rounded-2xl border border-stone-100 space-y-3">
          <label class="text-xs font-bold text-stone-900 block uppercase tracking-wider">Dimensions (Centimeters cm)</label>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <span class="text-xs text-slate-500 block mb-1">Width (cm)</span>
              <input v-model.number="form.width" type="number" step="0.1" placeholder="220" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <span class="text-xs text-slate-500 block mb-1">Height (cm)</span>
              <input v-model.number="form.height" type="number" step="0.1" placeholder="76" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <span class="text-xs text-slate-500 block mb-1">Depth (cm)</span>
              <input v-model.number="form.depth" type="number" step="0.1" placeholder="100" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 block">Product Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Description of craftsmanship and materials..."
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-stone-600 focus:outline-none"
          ></textarea>
        </div>

        <!-- Image Uploader -->
        <div class="space-y-3">
          <label class="text-xs font-bold text-slate-700 block">Product Photos (Supabase Storage)</label>
          <div 
            @dragover.prevent
            @drop.prevent="handleFileDrop"
            class="border-2 border-dashed border-slate-300 hover:border-stone-500 rounded-2xl p-8 text-center bg-slate-50 transition-colors cursor-pointer relative"
          >
            <input
              type="file"
              multiple
              accept="image/*"
              @change="handleFileSelect"
              class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <UploadCloud class="w-10 h-10 text-stone-600 mx-auto mb-2" />
            <p class="text-sm text-slate-800 font-semibold">Drag & drop product images here, or click to browse</p>
            <p class="text-xs text-slate-500 mt-1">Supports PNG, JPG, WEBP</p>
          </div>

          <!-- Existing Images (edit mode) -->
          <div v-if="existingImages.length > 0" class="pt-2">
            <label class="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wider">Current Images — Hover a tile to reorder or star as primary</label>
            <div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
              <div v-for="(img, idx) in existingImages" :key="img.id" class="relative group rounded-xl overflow-hidden border border-slate-200 h-20 bg-slate-100">
                <img :src="img.url" class="w-full h-full object-cover" />

                <button
                  type="button"
                  @click="setPrimaryImage(img.id)"
                  class="absolute top-1 left-1 p-1 rounded-md transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                  :class="[
                    img.is_primary
                      ? 'bg-amber-400 text-white cursor-default'
                      : 'bg-white/90 hover:bg-amber-100 text-slate-500 hover:text-amber-600'
                  ]"
                  :title="img.is_primary ? 'Primary image (first shown in catalog)' : 'Set as primary image'"
                >
                  <Star class="w-3.5 h-3.5" :class="img.is_primary ? 'fill-white' : ''" />
                </button>

                <button
                  type="button"
                  @click="removeExistingImage(img.id)"
                  class="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>

                <div class="absolute bottom-0 inset-x-0 flex justify-center gap-1 pb-1 pt-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    @click="moveExistingImage(idx, -1)"
                    :disabled="idx === 0"
                    class="p-1 bg-white/90 hover:bg-white text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Move earlier"
                  >
                    <ChevronLeft class="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    @click="moveExistingImage(idx, 1)"
                    :disabled="idx === existingImages.length - 1"
                    class="p-1 bg-white/90 hover:bg-white text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Move later"
                  >
                    <ChevronRight class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- New Image Previews -->
          <div v-if="imagePreviews.length > 0" class="pt-2">
            <label class="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wider">New Images — first preview becomes the catalog cover</label>
            <div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
              <div
                v-for="(src, idx) in imagePreviews"
                :key="'new-'+idx"
                class="relative group rounded-xl overflow-hidden border h-20 bg-slate-100"
                :class="idx === 0 && (!editingProductId || existingImages.length === 0) ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-200'"
              >
                <img :src="src" class="w-full h-full object-cover" />

                <span
                  v-if="idx === 0 && (!editingProductId || existingImages.length === 0)"
                  class="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-400 text-white text-[10px] font-bold rounded-md"
                >
                  <Star class="w-3 h-3 fill-white" />
                  1st
                </span>

                <button
                  type="button"
                  @click="removeImage(idx)"
                  class="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>

                <div class="absolute bottom-0 inset-x-0 flex justify-center gap-1 pb-1 pt-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    @click="movePreview(idx, -1)"
                    :disabled="idx === 0"
                    class="p-1 bg-white/90 hover:bg-white text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Move earlier"
                  >
                    <ChevronLeft class="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    @click="movePreview(idx, 1)"
                    :disabled="idx === imagePreviews.length - 1"
                    class="p-1 bg-white/90 hover:bg-white text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Move later"
                  >
                    <ChevronRight class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Checkboxes -->
        <div class="flex items-center space-x-6 pt-2">
          <label class="flex items-center space-x-2 text-sm text-slate-700 font-semibold cursor-pointer">
            <input v-model="form.is_active" type="checkbox" class="w-4 h-4 accent-stone-600 rounded" />
            <span>Publish Immediately (Active)</span>
          </label>

          <label class="flex items-center space-x-2 text-sm text-slate-700 font-semibold cursor-pointer">
            <input v-model="form.is_featured" type="checkbox" class="w-4 h-4 accent-stone-600 rounded" />
            <span>Mark as Featured Item</span>
          </label>
        </div>

        <!-- Submit -->
        <div class="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            :disabled="uploading"
            class="px-6 py-3.5 bg-stone-700 hover:bg-stone-800 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-stone-700/20 disabled:opacity-50 cursor-pointer flex items-center space-x-2"
          >
            <UploadCloud class="w-4 h-4" />
            <span>{{ uploading ? 'Saving...' : editingProductId ? 'Update Product' : 'Publish Product to Catalog' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- INVENTORY TABLE -->
    <div v-else class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-bold text-slate-900">Live Inventory Items</h3>
        <button @click="fetchInventory" class="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100">
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-700">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th class="p-4">Product</th>
              <th class="p-4">Category</th>
              <th class="p-4">Price</th>
              <th class="p-4">Stock</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="products.length === 0">
              <td colspan="6" class="p-8 text-center text-slate-400">No products uploaded yet.</td>
            </tr>
            <tr v-for="product in products" :key="product.id" class="hover:bg-slate-50 transition-colors">
              <td class="p-4 font-bold text-slate-900 flex items-center space-x-3">
                <img 
                  :src="product.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'" 
                  class="w-10 h-10 object-cover rounded-lg border border-slate-200"
                />
                <div>
                  <span class="block">{{ product.name }}</span>
                  <span class="text-xs text-slate-400 font-mono">{{ product.sku }}</span>
                </div>
              </td>
              <td class="p-4 text-xs font-semibold text-stone-700">{{ product.category }}</td>
              <td class="p-4 font-extrabold text-slate-900">R {{ product.price.toFixed(2) }}</td>
              <td class="p-4">
                <span :class="product.stock_quantity > 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'">
                  {{ product.stock_quantity }}
                </span>
              </td>
              <td class="p-4">
                <button @click="toggleActive(product)" class="flex items-center space-x-1 text-xs font-semibold cursor-pointer">
                  <Eye v-if="product.is_active" class="w-4 h-4 text-emerald-600" />
                  <EyeOff v-else class="w-4 h-4 text-slate-400" />
                  <span :class="product.is_active ? 'text-emerald-600' : 'text-slate-400'">
                    {{ product.is_active ? 'Active' : 'Draft' }}
                  </span>
                </button>
              </td>
              <td class="p-4 text-right">
                <div class="flex items-center justify-end space-x-1">
                  <button @click="handleEditProduct(product)" class="p-2 text-slate-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg" title="Edit">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click="deleteProduct(product.id)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
