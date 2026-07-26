<script setup>
import { ref, onMounted, computed } from 'vue'
import NavbarUser from '../../components/NavbarUser.vue'
import SparepartCard from '../../components/SparepartCard.vue'
import sparepartService from '../../services/sparepartService'

const items = ref([])
const loading = ref(true)
const errorMsg = ref('')
const search = ref('')

async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await sparepartService.getAll()
    items.value = data
  } catch (err) {
    errorMsg.value = 'Gagal memuat data sparepart dari server.'
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  if (!search.value) return items.value
  return items.value.filter((i) => i.nama?.toLowerCase().includes(search.value.toLowerCase()))
})

onMounted(fetchData)
</script>

<template>
  <NavbarUser />

  <section class="border-b border-border bg-gradient-to-b from-surface to-bg">
    <div class="mx-auto max-w-6xl px-6 py-16">
      <span class="label-eyebrow">Sejak dahulu, untuk selamanya</span>
      <h1 class="mt-3 max-w-xl font-display text-4xl leading-tight text-ink sm:text-5xl">
        Sparepart Vespa Original &amp; Aftermarket
      </h1>
      <div class="hr-brass my-5"></div>
      <p class="max-w-md text-muted">
        Lengkap untuk Vespa matic maupun klasik — dari kampas rem sampai body kit.
      </p>
      <input
        v-model="search"
        class="input-field mt-6 max-w-sm"
        placeholder="Cari nama sparepart..."
      />
    </div>
  </section>

  <main class="mx-auto max-w-6xl px-6">
    <p v-if="loading" class="py-16 text-center text-muted">Memuat produk...</p>
    <p v-else-if="errorMsg" class="py-16 text-center text-muted">{{ errorMsg }}</p>
    <p v-else-if="filtered.length === 0" class="py-16 text-center text-muted">Produk tidak ditemukan.</p>

    <div v-else class="grid grid-cols-1 gap-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <SparepartCard v-for="item in filtered" :key="item.id" :item="item" />
    </div>
  </main>

  <footer class="mt-10 border-t border-border py-6 text-center text-xs text-muted">
    <p>&copy; {{ new Date().getFullYear() }} Toko Sparepart Vespa.</p>
  </footer>
</template>