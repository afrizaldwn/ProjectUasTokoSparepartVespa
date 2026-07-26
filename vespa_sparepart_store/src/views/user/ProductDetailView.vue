<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavbarUser from '../../components/NavbarUser.vue'
import sparepartService from '../../services/sparepartService'
import { useAuthStore } from '../../store/auth'
import { useCartStore } from '../../store/cart'
import { SERVER_BASE_URL } from '../../services/api'

const props = defineProps({ id: { type: String, required: true } })

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const item = ref(null)
const loading = ref(true)
const qty = ref(1)
const addedMsg = ref('')

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
}

function gambarUrl(gambar) {
  if (!gambar) return 'https://via.placeholder.com/500x400?text=Sparepart+Vespa'
  return gambar.startsWith('http') ? gambar : `${SERVER_BASE_URL}/img/${gambar}`
}

function handleAddToCart() {

  if (!auth.isLoggedIn || auth.isAdmin) {
    router.push({ name: 'login' })
    return
  }

  cart.addItem(item.value, qty.value)
  addedMsg.value = `${qty.value} "${item.value.nama}" ditambahkan ke keranjang.`
  setTimeout(() => (addedMsg.value = ''), 2500)
}

onMounted(async () => {
  try {
    const { data } = await sparepartService.getById(props.id)
    item.value = data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <NavbarUser />

  <main class="mx-auto max-w-6xl px-6 py-14">
    <p v-if="loading" class="text-muted">Memuat...</p>

    <div v-else-if="item" class="grid grid-cols-1 gap-12 md:grid-cols-2">
      <div class="card-panel overflow-hidden">
        <img
          :src="gambarUrl(item.gambar)"
          :alt="item.nama"
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-4">
        <span class="label-eyebrow">{{ item.kategori }}</span>
        <h1 class="font-display text-3xl text-ink">{{ item.nama }}</h1>
        <div class="hr-brass"></div>
        <p class="font-display text-2xl text-brass-light">{{ formatRupiah(item.harga) }}</p>
        <p class="text-sm text-muted">Stok tersedia: {{ item.stok ?? 0 }}</p>
        <p class="leading-relaxed text-ink/80">{{ item.deskripsi || 'Tidak ada deskripsi untuk produk ini.' }}</p>

        <div class="flex items-center gap-3">
          <label class="text-xs text-muted">Jumlah</label>
          <input
            v-model.number="qty"
            type="number"
            min="1"
            :max="item.stok || 99"
            class="input-field w-20"
          />
        </div>

        <button class="btn-primary mt-2 w-fit" @click="handleAddToCart">Tambah ke Keranjang</button>
        <p v-if="addedMsg" class="text-sm text-brass-light">{{ addedMsg }}</p>
      </div>
    </div>

    <p v-else class="text-muted">Produk tidak ditemukan.</p>
  </main>
</template>
