<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavbarUser from '../../components/NavbarUser.vue'
import { useAuthStore } from '../../store/auth'
import { useCartStore } from '../../store/cart'
import transaksiService from '../../services/transaksiService'
import logService from '../../services/logService'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const alamat = ref('')
const metode = ref('transfer_bank')
const processing = ref(false)
const success = ref(false)
const errorMsg = ref('')

const METODE_OPTIONS = [
  { value: 'transfer_bank', label: 'Transfer Bank (simulasi)' },
  { value: 'e_wallet', label: 'E-Wallet (simulasi)' },
  { value: 'cod', label: 'Bayar di Tempat / COD' }
]

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
}

async function handleBayar() {
  if (cart.items.length === 0) return
  processing.value = true
  errorMsg.value = ''

  try {
    // Simulasi proses pembayaran (tanpa payment gateway asli)
    await new Promise((resolve) => setTimeout(resolve, 900))

    await transaksiService.create({
      user_id: auth.user.id,
      nama_pembeli: auth.user.nama || auth.user.username,
      items: cart.items,
      total_harga: cart.totalHarga,
      metode_pembayaran: metode.value,
      alamat: alamat.value,
      status: 'lunas'
    })

    await logService.catat({
      username: auth.user.username || auth.user.nama,
      aksi: 'checkout',
      keterangan: `Checkout ${cart.totalItem} item senilai ${formatRupiah(cart.totalHarga)}`
    })

    cart.clear()
    success.value = true
  } catch (err) {
    errorMsg.value = 'Gagal memproses pembayaran. Coba lagi.'
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <NavbarUser />

  <main class="mx-auto max-w-3xl px-6 py-14">
    <template v-if="success">
      <div class="card-panel p-10 text-center">
        <h1 class="font-display text-2xl text-brass-light">Pembayaran Berhasil 🎉</h1>
        <p class="mt-2 text-muted">
          Ini simulasi pembayaran, transaksi kamu sudah tercatat dan bisa dilihat admin di laporan.
        </p>
        <router-link to="/" class="btn-primary mt-6 inline-block">Kembali Belanja</router-link>
      </div>
    </template>

    <template v-else>
      <span class="label-eyebrow">Checkout</span>
      <h1 class="mt-2 font-display text-3xl text-ink">Konfirmasi Pesanan</h1>

      <p v-if="cart.items.length === 0" class="mt-8 text-muted">
        Keranjang kosong, tidak ada yang bisa di-checkout.
        <router-link to="/" class="text-brass-light underline">Kembali belanja</router-link>
      </p>

      <div v-else class="mt-8 flex flex-col gap-6">
        <div class="card-panel p-6">
          <h2 class="font-display text-lg text-ink">Ringkasan Pesanan</h2>
          <div class="mt-4 flex flex-col gap-2">
            <div v-for="line in cart.items" :key="line.id" class="flex justify-between text-sm">
              <span class="text-muted">{{ line.nama }} x{{ line.qty }}</span>
              <span class="text-ink">{{ formatRupiah(line.harga * line.qty) }}</span>
            </div>
          </div>
          <div class="hr-brass my-4"></div>
          <div class="flex justify-between font-display text-lg">
            <span class="text-ink">Total</span>
            <span class="text-brass-light">{{ formatRupiah(cart.totalHarga) }}</span>
          </div>
        </div>

        <div class="card-panel p-6">
          <label class="mb-1.5 block text-xs text-muted">Alamat Pengiriman</label>
          <textarea v-model="alamat" class="input-field" rows="2" placeholder="Nama jalan, kota, kode pos"></textarea>

          <label class="mb-1.5 mt-4 block text-xs text-muted">Metode Pembayaran (simulasi)</label>
          <div class="flex flex-col gap-2">
            <label
              v-for="opt in METODE_OPTIONS"
              :key="opt.value"
              class="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-ink"
            >
              <input type="radio" :value="opt.value" v-model="metode" />
              {{ opt.label }}
            </label>
          </div>
        </div>

        <p v-if="errorMsg" class="text-sm text-danger">{{ errorMsg }}</p>

        <button class="btn-primary w-full" :disabled="processing" @click="handleBayar">
          {{ processing ? 'Memproses pembayaran...' : `Bayar Sekarang - ${formatRupiah(cart.totalHarga)}` }}
        </button>
      </div>
    </template>
  </main>
</template>
