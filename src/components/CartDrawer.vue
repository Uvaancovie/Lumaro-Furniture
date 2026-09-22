<script setup lang="ts">
import type { CartItem } from '../types/database'
import { ShoppingBag, X, Trash2, ArrowRight } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean;
  cartItems: CartItem[];
}>()

const emit = defineEmits(['close', 'update-quantity', 'remove-item', 'checkout'])
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
            <ShoppingBag class="w-5 h-5 text-stone-700" />
            <h2 class="text-lg font-extrabold text-slate-900">Lumaro Furniture Studio Cart</h2>
            <span class="px-2 py-0.5 bg-stone-100 text-stone-800 text-xs font-bold rounded-full">
              {{ cartItems.length }}
            </span>
          </div>

          <button @click="emit('close')" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Cart Items List -->
        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          <div v-if="cartItems.length === 0" class="text-center py-16 space-y-3">
            <ShoppingBag class="w-12 h-12 text-slate-300 mx-auto" />
            <p class="text-slate-600 font-semibold">Your shopping cart is empty</p>
            <p class="text-xs text-slate-400 max-w-xs mx-auto">Explore our Lumaro Furniture Studio catalog and add pieces to your cart.</p>
          </div>

          <div 
            v-for="(item, idx) in cartItems" 
            :key="idx"
            class="flex items-center space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl relative"
          >
            <img 
              :src="item.product.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80'" 
              class="w-16 h-16 object-cover rounded-xl border border-slate-200"
            />

            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-slate-900 text-sm truncate">{{ item.product.name }}</h4>
              <p v-if="item.product.material" class="text-xs text-slate-500 truncate">
                {{ item.product.material }}
              </p>
              <div class="flex items-center justify-end mt-2">
                <div class="flex items-center space-x-2 bg-white border border-slate-300 rounded-lg text-xs">
                  <button 
                    @click="emit('update-quantity', { index: idx, quantity: item.quantity - 1 })"
                    class="px-2 py-1 hover:bg-slate-100 cursor-pointer"
                  >-</button>
                  <span class="font-bold px-1">{{ item.quantity }}</span>
                  <button 
                    @click="emit('update-quantity', { index: idx, quantity: item.quantity + 1 })"
                    class="px-2 py-1 hover:bg-slate-100 cursor-pointer"
                  >+</button>
                </div>
              </div>
            </div>

            <button 
              @click="emit('remove-item', idx)" 
              class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Footer Checkout Summary -->
        <div v-if="cartItems.length > 0" class="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
          <p class="text-xs text-slate-600 text-center bg-white border border-slate-200 rounded-xl px-4 py-3">
            Pricing is provided on quotation — our team will confirm your total including delivery.
          </p>

          <button
            @click="emit('checkout')"
            class="w-full py-3.5 bg-stone-700 hover:bg-stone-800 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-stone-700/20 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Proceed to Secure Checkout</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
