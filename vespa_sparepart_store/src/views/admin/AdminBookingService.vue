<script setup>
import { ref, computed, onMounted } from 'vue'
import SidebarAdmin from '../../components/SidebarAdmin.vue'
import bookingService from '../../services/bookingService'
import logService from '../../services/logService'
import { useAuthStore } from '../../store/auth'

const auth = useAuthStore()

const items = ref([])
const loading = ref(true)
const errorMsg = ref('')

const searchQuery = ref('')
const statusFilter = ref('')

const showForm = ref(false)
const isEditing = ref(false)
const submitting = ref(false)

const STATUS_OPTIONS = ['menunggu', 'proses', 'selesai', 'batal']

const emptyForm = {
  nama_pelanggan: '',
  no_hp: '',
  jenis_vespa: '',
  keluhan: '',
  tanggal_service: '',
  biaya: 0,
  status: 'menunggu'
}
const form = ref({ ...emptyForm })
const editingId = ref(null)

function currentUsername() {
  return auth.user?.username || auth.user?.nama || '-'
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    value || 0
  )
}

function formatTanggal(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const filteredItems = computed(() => {
  return items.value
    .filter((it) => {
      const q = searchQuery.value.trim().toLowerCase()
      if (!q) return true
      return (
        it.nama_pelanggan?.toLowerCase().includes(q) || it.jenis_vespa?.toLowerCase().includes(q)
      )
    })
    .filter((it) => (statusFilter.value ? it.status === statusFilter.value : true))
    .sort((a, b) => new Date(b.tanggal_service) - new Date(a.tanggal_service))
})

async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await bookingService.getAll()
    items.value = data
  } catch (err) {
    errorMsg.value = 'Gagal memuat data booking.'
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  isEditing.value = false
  form.value = { ...emptyForm }
  editingId.value = null
  showForm.value = true
}

function openEditForm(item) {
  isEditing.value = true
  form.value = { ...item }
  editingId.value = item.id
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function handleSubmit() {
  const f = form.value
  if (!f.nama_pelanggan || !f.no_hp || !f.jenis_vespa || !f.keluhan || !f.tanggal_service) {
    errorMsg.value = 'Data tidak lengkap. Semua kolom wajib diisi.'
    return
  }

  submitting.value = true
  errorMsg.value = ''
  try {
    if (isEditing.value) {
      await bookingService.update(editingId.value, f)
      await logService.catat({
        username: currentUsername(),
        aksi: 'update',
        keterangan: `Mengubah booking service: ${f.nama_pelanggan} (${f.jenis_vespa})`
      })
    } else {
      await bookingService.create(f)
      await logService.catat({
        username: currentUsername(),
        aksi: 'create',
        keterangan: `Menambahkan booking service: ${f.nama_pelanggan} (${f.jenis_vespa})`
      })
    }

    showForm.value = false
    await fetchData()
  } catch (err) {
    errorMsg.value = 'Gagal menyimpan data booking.'
  } finally {
    submitting.value = false
  }
}

async function handleDelete(item) {
  if (!confirm(`Hapus booking service milik "${item.nama_pelanggan}"?`)) return
  try {
    await bookingService.remove(item.id)
    await logService.catat({
      username: currentUsername(),
      aksi: 'delete',
      keterangan: `Menghapus booking service: ${item.nama_pelanggan}`
    })
    await fetchData()
  } catch (err) {
    errorMsg.value = 'Gagal menghapus data booking.'
  }
}

function statusBadgeClass(status) {
  return {
    menunggu: 'bg-muted/20 text-muted',
    proses: 'bg-brass/20 text-brass-light',
    selesai: 'bg-success/20 text-success',
    batal: 'bg-danger/20 text-danger'
  }[status] || 'bg-muted/20 text-muted'
}

onMounted(fetchData)
</script>

<template>
  <div class="flex">
    <SidebarAdmin />

    <main class="flex-1 px-8 py-10">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span class="label-eyebrow">Layanan</span>
          <h1 class="mt-2 font-display text-3xl text-ink">Booking Service Vespa</h1>
          <p class="mt-1 text-sm text-muted">Kelola jadwal & status service Vespa pelanggan.</p>
        </div>
        <button class="btn-primary" @click="openCreateForm">+ Tambah Booking</button>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <input
          v-model="searchQuery"
          class="input-field max-w-sm flex-1"
          placeholder="Cari nama pelanggan / jenis vespa..."
        />
        <select v-model="statusFilter" class="input-field w-48">
          <option value="">Semua Status</option>
          <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <p v-if="errorMsg" class="mt-4 text-sm text-danger">{{ errorMsg }}</p>
      <p v-if="loading" class="mt-8 text-muted">Memuat data...</p>

      <div v-else class="card-panel mt-6 overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="label-eyebrow px-4 py-3 font-medium">Pelanggan</th>
              <th class="label-eyebrow px-4 py-3 font-medium">No. HP</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Jenis Vespa</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Keluhan</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Tanggal</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Biaya</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Status</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id" class="border-b border-border last:border-0">
              <td class="px-4 py-3 text-ink">{{ item.nama_pelanggan }}</td>
              <td class="px-4 py-3 text-muted">{{ item.no_hp }}</td>
              <td class="px-4 py-3 text-muted">{{ item.jenis_vespa }}</td>
              <td class="px-4 py-3 text-muted">{{ item.keluhan }}</td>
              <td class="px-4 py-3 text-muted">{{ formatTanggal(item.tanggal_service) }}</td>
              <td class="px-4 py-3 text-brass-light">{{ formatRupiah(item.biaya) }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2.5 py-1 text-xs capitalize" :class="statusBadgeClass(item.status)">
                  {{ item.status }}
                </span>
              </td>
              <td class="flex gap-2 px-4 py-3">
                <button
                  class="rounded-lg border border-border px-3 py-1.5 text-xs text-ink transition-colors hover:border-brass hover:text-brass-light"
                  @click="openEditForm(item)"
                >
                  Edit
                </button>
                <button
                  class="rounded-lg border border-danger/60 bg-danger/10 px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger/20"
                  @click="handleDelete(item)"
                >
                  Hapus
                </button>
              </td>
            </tr>
            <tr v-if="filteredItems.length === 0">
              <td colspan="8" class="px-4 py-8 text-center text-muted">Belum ada data booking service.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
        @click.self="closeForm"
      >
        <form class="card-panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-7" @submit.prevent="handleSubmit">
          <span class="label-eyebrow">{{ isEditing ? 'Perbarui data' : 'Data baru' }}</span>
          <h2 class="mt-2 font-display text-xl text-ink">
            {{ isEditing ? 'Ubah Booking Service' : 'Tambah Booking Service' }}
          </h2>

          <div class="mt-5 flex flex-col gap-4">
            <div>
              <label class="mb-1.5 block text-xs text-muted">Nama Pelanggan</label>
              <input v-model="form.nama_pelanggan" class="input-field" required />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-xs text-muted">No. HP</label>
                <input v-model="form.no_hp" class="input-field" required />
              </div>
              <div>
                <label class="mb-1.5 block text-xs text-muted">Jenis Vespa</label>
                <input v-model="form.jenis_vespa" class="input-field" required placeholder="Vespa Excel, Super, dll" />
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-muted">Keluhan</label>
              <textarea v-model="form.keluhan" class="input-field" rows="2" required></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-xs text-muted">Tanggal Service</label>
                <input v-model="form.tanggal_service" type="date" class="input-field" required />
              </div>
              <div>
                <label class="mb-1.5 block text-xs text-muted">Biaya (Rp)</label>
                <input v-model="form.biaya" type="number" min="0" class="input-field" />
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-muted">Status</label>
              <select v-model="form.status" class="input-field">
                <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button type="button" class="btn-outline" @click="closeForm">Batal</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
