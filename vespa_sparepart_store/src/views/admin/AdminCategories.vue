<script setup>
import { ref, onMounted } from 'vue'
import SidebarAdmin from '../../components/SidebarAdmin.vue'
import kategoriService from '../../services/kategoriService'
import logService from '../../services/logService'
import { useAuthStore } from '../../store/auth'

const auth = useAuthStore()

const items = ref([])
const loading = ref(true)
const errorMsg = ref('')

const showForm = ref(false)
const isEditing = ref(false)
const submitting = ref(false)

const emptyForm = { nama_kategori: '', keterangan: '' }
const form = ref({ ...emptyForm })
const editingId = ref(null)

function currentUsername() {
  return auth.user?.username || auth.user?.nama || '-'
}

async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await kategoriService.getAll()
    items.value = data
  } catch (err) {
    errorMsg.value = 'Gagal memuat data kategori.'
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
  if (!form.value.nama_kategori.trim()) {
    errorMsg.value = 'Nama kategori wajib diisi.'
    return
  }

  submitting.value = true
  errorMsg.value = ''
  try {
    if (isEditing.value) {
      await kategoriService.update(editingId.value, form.value)
      await logService.catat({
        username: currentUsername(),
        aksi: 'update',
        keterangan: `Mengubah kategori: ${form.value.nama_kategori}`
      })
    } else {
      await kategoriService.create(form.value)
      await logService.catat({
        username: currentUsername(),
        aksi: 'create',
        keterangan: `Menambahkan kategori: ${form.value.nama_kategori}`
      })
    }

    showForm.value = false
    await fetchData()
  } catch (err) {
    errorMsg.value = 'Gagal menyimpan data kategori.'
  } finally {
    submitting.value = false
  }
}

async function handleDelete(item) {
  if (!confirm(`Hapus kategori "${item.nama_kategori}"?`)) return
  try {
    await kategoriService.remove(item.id)
    await logService.catat({
      username: currentUsername(),
      aksi: 'delete',
      keterangan: `Menghapus kategori: ${item.nama_kategori}`
    })
    await fetchData()
  } catch (err) {
    errorMsg.value = 'Gagal menghapus kategori.'
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="flex">
    <SidebarAdmin />

    <main class="flex-1 px-8 py-10">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span class="label-eyebrow">Master Data</span>
          <h1 class="mt-2 font-display text-3xl text-ink">Kelola Kategori</h1>
          <p class="mt-1 text-sm text-muted">Tambah, ubah, atau hapus kategori sparepart Vespa.</p>
        </div>
        <button class="btn-primary" @click="openCreateForm">+ Tambah Kategori</button>
      </div>

      <p v-if="errorMsg" class="mt-4 text-sm text-danger">{{ errorMsg }}</p>
      <p v-if="loading" class="mt-8 text-muted">Memuat data...</p>

      <div v-else class="card-panel mt-8 overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="label-eyebrow px-4 py-3 font-medium">Nama Kategori</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Keterangan</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Jumlah Sparepart</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id" class="border-b border-border last:border-0">
              <td class="px-4 py-3 text-ink">{{ item.nama_kategori }}</td>
              <td class="px-4 py-3 text-muted">{{ item.keterangan || '-' }}</td>
              <td class="px-4 py-3 text-muted">{{ item.jumlah_sparepart ?? 0 }}</td>
              <td class="flex gap-2 px-4 py-3">
                <button
                  class="rounded-lg border border-border px-3 py-1.5 text-xs text-ink transition-colors hover:border-brass hover:text-brass-light"
                  @click="openEditForm(item)"
                >
                  Ubah
                </button>
                <button
                  class="rounded-lg border border-danger/60 bg-danger/10 px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger/20"
                  @click="handleDelete(item)"
                >
                  Hapus
                </button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="4" class="px-4 py-8 text-center text-muted">Belum ada data kategori.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
        @click.self="closeForm"
      >
        <form class="card-panel w-full max-w-md p-7" @submit.prevent="handleSubmit">
          <span class="label-eyebrow">{{ isEditing ? 'Perbarui data' : 'Data baru' }}</span>
          <h2 class="mt-2 font-display text-xl text-ink">
            {{ isEditing ? 'Ubah Kategori' : 'Tambah Kategori' }}
          </h2>

          <div class="mt-5 flex flex-col gap-4">
            <div>
              <label class="mb-1.5 block text-xs text-muted">Nama Kategori</label>
              <input v-model="form.nama_kategori" class="input-field" required />
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-muted">Keterangan</label>
              <textarea v-model="form.keterangan" class="input-field" rows="3"></textarea>
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
