<script setup>
import { useRouter } from 'vue-router'
import NavbarUser from '../../components/NavbarUser.vue'
import { useCartStore } from '../../store/cart'

const router = useRouter()
const cart = useCartStore()

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
}

function gambarUrl(gambar) {
  if (!gambar) return 'https://via.placeholder.com/100x100?text=Vespa'
  return gambar.startsWith('http') ? gambar : `/img/${gambar}`
}

function goToCheckout() {
  if (cart.items.length === 0) return
  router.push({ name: 'checkout' })
}
</script>

<template>
  <NavbarUser />

  <main class="mx-auto max-w-4xl px-6 py-14">
    <span class="label-eyebrow">Belanja</span>
    <h1 class="mt-2 font-display text-3xl text-ink">Keranjang Saya</h1>

    <p v-if="cart.items.length === 0" class="mt-10 text-muted">
      Keranjang kamu masih kosong. Yuk cari sparepart favoritmu dulu.
      <router-link to="/" class="text-brass-light underline">Belanja sekarang</router-link>
    </p>

    <div v-else class="mt-8 flex flex-col gap-4">
      <div
        v-for="line in cart.items"
        :key="line.id"
        class="card-panel flex items-center gap-4 p-4"
      >
        <img :src="gambarUrl(line.gambar)" :alt="line.nama" class="h-16 w-16 rounded-lg object-cover" />
        <div class="flex-1">
          <p class="text-ink">{{ line.nama }}</p>
          <p class="text-sm text-brass-light">{{ formatRupiah(line.harga) }}</p>
        </div>
        <input
          type="number"
          min="1"
          class="input-field w-20"
          :value="line.qty"
          @change="cart.updateQty(line.id, $event.target.value)"
        />
        <p class="w-28 text-right text-sm text-muted">{{ formatRupiah(line.harga * line.qty) }}</p>
        <button
          class="rounded-lg border border-danger/60 bg-danger/10 px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger/20"
          @click="cart.removeItem(line.id)"
        >
          Hapus
        </button>
      </div>

      <div class="card-panel mt-4 flex items-center justify-between p-6">
        <div>
          <p class="text-sm text-muted">Total Belanja ({{ cart.totalItem }} item)</p>
          <p class="font-display text-2xl text-brass-light">{{ formatRupiah(cart.totalHarga) }}</p>
        </div>
        <button class="btn-primary" @click="goToCheckout">Checkout</button>
      </div>
    </div>
  </main>
</template>
