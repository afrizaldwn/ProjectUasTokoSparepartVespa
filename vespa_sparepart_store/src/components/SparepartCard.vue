<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useCartStore } from '../store/cart'
import { SERVER_BASE_URL } from '../services/api'

const props = defineProps({
  item: { type: Object, required: true }
})

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
}

function gambarUrl(gambar) {
  if (!gambar) return 'https://via.placeholder.com/300x220?text=Sparepart+Vespa'
  return gambar.startsWith('http') ? gambar : `${SERVER_BASE_URL}/img/${gambar}`
}

function quickAdd() {
  if (!auth.isLoggedIn || auth.isAdmin) {
    router.push({ name: 'login' })
    return
  }
  cart.addItem(props.item, 1)
}
</script>

<template>
  <router-link
    :to="`/produk/${item.id}`"
    class="card-panel group flex flex-col overflow-hidden transition-colors hover:border-brass/60"
  >
    <div class="aspect-[4/3] overflow-hidden bg-surface-alt">
      <img
        :src="gambarUrl(item.gambar)"
        :alt="item.nama"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div class="flex flex-col gap-1.5 p-4">
      <span class="label-eyebrow">{{ item.kategori || 'Umum' }}</span>
      <h3 class="font-display text-lg text-ink">{{ item.nama }}</h3>
      <p class="font-medium text-brass-light">{{ formatRupiah(item.harga) }}</p>
      <div class="mt-1 flex items-center justify-between">
        <p class="text-xs text-muted">Stok: {{ item.stok ?? 0 }}</p>
        <button
          class="rounded-lg border border-brass/60 px-2.5 py-1 text-xs text-brass-light transition-colors hover:bg-brass/10"
          @click.stop.prevent="quickAdd"
        >
          + Keranjang
        </button>
      </div>
    </div>
  </router-link>
</template>
