<script setup lang="ts">
import type { Product } from '../types/database'
import { Heart, X, Trash2, ShoppingBag } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean;
  wishlist: Product[];
}>()

const emit = defineEmits(['close', 'remove-item', 'add-to-cart', 'select-product'])

function getPrimaryImageUrl(product: Product): string {
  if (product.product_images && product.product_images.length > 0) {
    const primary = product.product_images.find(img => img.is_primary)
    return primary ? primary.image_url : product.product_images[0].image_url
  }
  return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div
      @click="emit('close')"
      class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
    ></div>

    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">

        <!-- Drawer Header -->
        <div class="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div class="flex items-center space-x-2">
            <Heart class="w-5 h-5 text-rose-600" />
            <h2 class="text-lg font-extrabold text-slate-900">Lumaro Furniture Studio Wishlist</h2>
            <span class="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
              {{ wishlist.length }}
            </span>
          </div>

          <button @click="emit('close')" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Wishlist Items List -->
        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          <div v-if="wishlist.length === 0" class="text-center py-16 space-y-3">
            <Heart class="w-12 h-12 text-slate-300 mx-auto" />
            <p class="text-slate-600 font-semibold">Your wishlist is empty</p>
            <p class="text-xs text-slate-400 max-w-xs mx-auto">Save your favourite Lumaro Furniture Studio pieces and come back to them later.</p>
          </div>

          <div
            v-for="(product, idx) in wishlist"
            :key="product.id"
            class="flex items-center space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl relative"
          >
            <img
              :src="getPrimaryImageUrl(product)"
              class="w-16 h-16 object-cover rounded-xl border border-slate-200 cursor-pointer"
              @click="emit('select-product', product)"
            />

            <div class="flex-1 min-w-0">
              <h4
                class="font-bold text-slate-900 text-sm truncate cursor-pointer hover:text-stone-700 transition-colors"
                @click="emit('select-product', product)"
              >{{ product.name }}</h4>
              <p v-if="product.material" class="text-xs text-slate-500 truncate">
                {{ product.material }}
              </p>
              <div class="flex items-center justify-end mt-2">
                <button
                  @click="emit('add-to-cart', product)"
                  class="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-stone-700 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <ShoppingBag class="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>

            <button
              @click="emit('remove-item', idx)"
              class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Remove from wishlist"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
          Tap the heart on any piece to save it to your wishlist.
        </div>
      </div>
    </div>
  </div>
</template>