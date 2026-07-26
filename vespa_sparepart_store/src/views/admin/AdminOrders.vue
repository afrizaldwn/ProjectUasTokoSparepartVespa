<script setup>
import { ref, computed, onMounted } from 'vue'
import SidebarAdmin from '../../components/SidebarAdmin.vue'
import transaksiService from '../../services/transaksiService'

const items = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')
const statusFilter = ref('')
const expandedId = ref(null)

const STATUS_OPTIONS = ['lunas', 'diproses', 'dikirim', 'selesai', 'batal']

const METODE_LABEL = {
  transfer_bank: 'Transfer Bank',
  e_wallet: 'E-Wallet',
  cod: 'Bayar di Tempat (COD)'
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
}

function formatWaktu(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

const filteredItems = computed(() => {
  return items.value
    .filter((t) => {
      const q = searchQuery.value.trim().toLowerCase()
      if (!q) return true
      return t.nama_pembeli?.toLowerCase().includes(q)
    })
    .filter((t) => (statusFilter.value ? t.status === statusFilter.value : true))
    .sort((a, b) => new Date(b.waktu) - new Date(a.waktu))
})

const totalPendapatan = computed(() =>
  items.value.filter((t) => t.status !== 'batal').reduce((sum, t) => sum + Number(t.total_harga || 0), 0)
)

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await transaksiService.getAll()
    items.value = data
  } catch (err) {
    errorMsg.value = 'Gagal memuat data transaksi.'
  } finally {
    loading.value = false
  }
}

async function updateStatus(id, status) {
  try {
    await transaksiService.update(id, { status })
    await fetchData()
  } catch (err) {
    errorMsg.value = 'Gagal memperbarui status transaksi.'
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="flex">
    <SidebarAdmin />

    <main class="flex-1 px-8 py-10">
      <span class="label-eyebrow">Penjualan</span>
      <h1 class="mt-2 font-display text-3xl text-ink">Laporan Transaksi</h1>
      <p class="mt-1 text-sm text-muted">Riwayat checkout dari seluruh pengguna toko.</p>

      <div class="mt-6 card-panel p-6">
        <p class="label-eyebrow">Total Pendapatan (di luar transaksi batal)</p>
        <h2 class="mt-2 font-display text-3xl text-brass-light">{{ formatRupiah(totalPendapatan) }}</h2>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <input v-model="searchQuery" class="input-field max-w-xs" placeholder="Cari nama pembeli..." />
        <select v-model="statusFilter" class="input-field max-w-[10rem]">
          <option value="">Semua status</option>
          <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <p v-if="errorMsg" class="mt-4 text-sm text-danger">{{ errorMsg }}</p>
      <p v-if="loading" class="mt-8 text-muted">Memuat data...</p>

      <div v-else class="card-panel mt-6 overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="label-eyebrow px-4 py-3 font-medium">Waktu</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Pembeli</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Item</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Total</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Metode</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="t in filteredItems" :key="t.id">
              <tr class="cursor-pointer border-b border-border last:border-0 hover:bg-surface-alt" @click="toggleExpand(t.id)">
                <td class="px-4 py-3 text-muted">{{ formatWaktu(t.waktu) }}</td>
                <td class="px-4 py-3 text-ink">{{ t.nama_pembeli }}</td>
                <td class="px-4 py-3 text-muted">{{ t.items?.length || 0 }} produk</td>
                <td class="px-4 py-3 text-brass-light">{{ formatRupiah(t.total_harga) }}</td>
                <td class="px-4 py-3 text-muted">{{ METODE_LABEL[t.metode_pembayaran] || t.metode_pembayaran }}</td>
                <td class="px-4 py-3">
                  <select
                    class="input-field text-xs"
                    :value="t.status"
                    @click.stop
                    @change="updateStatus(t.id, $event.target.value)"
                  >
                    <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
                  </select>
                </td>
              </tr>
              <tr v-if="expandedId === t.id" class="border-b border-border bg-surface-alt/40">
                <td colspan="6" class="px-4 py-4">
                  <p class="mb-2 text-xs text-muted">Alamat: {{ t.alamat || '-' }}</p>
                  <ul class="flex flex-col gap-1 text-xs text-ink">
                    <li v-for="line in t.items" :key="line.id" class="flex justify-between">
                      <span>{{ line.nama }} x{{ line.qty }}</span>
                      <span>{{ formatRupiah(line.harga * line.qty) }}</span>
                    </li>
                  </ul>
                </td>
              </tr>
            </template>
            <tr v-if="filteredItems.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-muted">Belum ada transaksi.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>
