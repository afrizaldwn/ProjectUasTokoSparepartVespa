<script setup>
import { ref, onMounted, computed } from 'vue'
import SidebarAdmin from '../../components/SidebarAdmin.vue'
import sparepartService from '../../services/sparepartService'

const items = ref([])
const loading = ref(true)

const totalStok = computed(() => items.value.reduce((sum, i) => sum + Number(i.stok || 0), 0))
const totalNilai = computed(() =>
  items.value.reduce((sum, i) => sum + Number(i.stok || 0) * Number(i.harga || 0), 0)
)

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
}

onMounted(async () => {
  try {
    const { data } = await sparepartService.getAll()
    items.value = data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex">
    <SidebarAdmin />

    <main class="flex-1 px-8 py-10">
      <span class="label-eyebrow">Ringkasan</span>
      <h1 class="mt-2 font-display text-3xl text-ink">Dashboard</h1>
      <p class="mt-1 text-sm text-muted">Ringkasan data sparepart Vespa.</p>

      <div v-if="!loading" class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div class="card-panel p-6">
          <p class="label-eyebrow">Total Produk</p>
          <h2 class="mt-2 font-display text-3xl text-brass-light">{{ items.length }}</h2>
        </div>
        <div class="card-panel p-6">
          <p class="label-eyebrow">Total Stok</p>
          <h2 class="mt-2 font-display text-3xl text-brass-light">{{ totalStok }}</h2>
        </div>
        <div class="card-panel p-6">
          <p class="label-eyebrow">Estimasi Nilai Stok</p>
          <h2 class="mt-2 font-display text-2xl text-brass-light">{{ formatRupiah(totalNilai) }}</h2>
        </div>
      </div>
    </main>
  </div>
</template>
