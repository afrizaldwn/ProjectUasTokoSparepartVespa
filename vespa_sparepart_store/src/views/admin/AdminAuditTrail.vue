<script setup>
import { ref, computed, onMounted } from 'vue'
import SidebarAdmin from '../../components/SidebarAdmin.vue'
import logService from '../../services/logService'

const items = ref([])
const loading = ref(true)
const errorMsg = ref('')

const searchQuery = ref('')
const aksiFilter = ref('')

const AKSI_OPTIONS = ['login', 'logout', 'registrasi', 'create', 'update', 'delete', 'update_profil', 'update_password']

const filteredItems = computed(() => {
  return items.value
    .filter((log) => {
      const q = searchQuery.value.trim().toLowerCase()
      if (!q) return true
      return (
        log.username?.toLowerCase().includes(q) ||
        log.aksi?.toLowerCase().includes(q) ||
        log.keterangan?.toLowerCase().includes(q)
      )
    })
    .filter((log) => (aksiFilter.value ? log.aksi === aksiFilter.value : true))
    .sort((a, b) => new Date(b.waktu) - new Date(a.waktu))
})

function formatWaktu(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID')
}

function badgeClass(aksi) {
  return {
    login: 'bg-success/20 text-success',
    logout: 'bg-muted/20 text-muted',
    registrasi: 'bg-teal/20 text-teal-light',
    create: 'bg-success/20 text-success',
    update: 'bg-brass/20 text-brass-light',
    delete: 'bg-danger/20 text-danger',
    update_profil: 'bg-brass/20 text-brass-light',
    update_password: 'bg-brass/20 text-brass-light'
  }[aksi] || 'bg-muted/20 text-muted'
}

async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await logService.getAll()
    items.value = data
  } catch (err) {
    errorMsg.value = 'Gagal memuat data log aktivitas.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="flex">
    <SidebarAdmin />

    <main class="flex-1 px-8 py-10">
      <span class="label-eyebrow">Administrasi</span>
      <h1 class="mt-2 font-display text-3xl text-ink">Audit Trail</h1>
      <p class="mt-1 text-sm text-muted">Riwayat aktivitas seluruh pengguna pada sistem.</p>

      <div class="mt-6 flex flex-wrap gap-3">
        <input
          v-model="searchQuery"
          class="input-field max-w-sm flex-1"
          placeholder="Cari username / aksi / keterangan..."
        />
        <select v-model="aksiFilter" class="input-field w-48">
          <option value="">Semua Aksi</option>
          <option v-for="a in AKSI_OPTIONS" :key="a" :value="a">{{ a }}</option>
        </select>
      </div>

      <p v-if="errorMsg" class="mt-4 text-sm text-danger">{{ errorMsg }}</p>
      <p v-if="loading" class="mt-8 text-muted">Memuat data...</p>

      <div v-else class="card-panel mt-6 overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="label-eyebrow px-4 py-3 font-medium">Waktu</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Pengguna</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Aksi</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredItems" :key="log.id" class="border-b border-border last:border-0">
              <td class="whitespace-nowrap px-4 py-3 text-muted">{{ formatWaktu(log.waktu) }}</td>
              <td class="px-4 py-3 text-ink">{{ log.username || '(tidak diketahui)' }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2.5 py-1 text-xs" :class="badgeClass(log.aksi)">{{ log.aksi }}</span>
              </td>
              <td class="px-4 py-3 text-muted">{{ log.keterangan || '-' }}</td>
            </tr>
            <tr v-if="filteredItems.length === 0">
              <td colspan="4" class="px-4 py-8 text-center text-muted">Belum ada aktivitas tercatat.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>
