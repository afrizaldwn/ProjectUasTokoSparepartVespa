<script setup>
import { ref, onMounted } from 'vue'
import SidebarAdmin from '../../components/SidebarAdmin.vue'
import sparepartService from '../../services/sparepartService'
import logService from '../../services/logService'
import uploadService from '../../services/uploadService'
import { useAuthStore } from '../../store/auth'

const auth = useAuthStore()
function currentUsername() {
  return auth.user?.username || auth.user?.nama || '-'
}

const items = ref([])
const loading = ref(true)
const errorMsg = ref('')

const showForm = ref(false)
const isEditing = ref(false)
const submitting = ref(false)

const emptyForm = { nama: '', kategori: '', harga: 0, stok: 0, gambar: '', deskripsi: '' }
const form = ref({ ...emptyForm })
const editingId = ref(null)

// State untuk upload file gambar (disimpan fisik ke folder public/img via server lokal)
const selectedFile = ref(null)
const previewUrl = ref('')
const uploading = ref(false)

function gambarUrl(filename) {
  if (!filename) return ''
  // Sudah berupa URL penuh (data lama) atau nama file di folder img
  return filename.startsWith('http') ? filename : `/img/${filename}`
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await sparepartService.getAll()
    items.value = data
  } catch (err) {
    errorMsg.value = 'Gagal memuat data.'
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  isEditing.value = false
  form.value = { ...emptyForm }
  editingId.value = null
  selectedFile.value = null
  previewUrl.value = ''
  showForm.value = true
}

function openEditForm(item) {
  isEditing.value = true
  form.value = { ...item }
  editingId.value = item.id
  selectedFile.value = null
  previewUrl.value = item.gambar ? gambarUrl(item.gambar) : ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function handleSubmit() {
  submitting.value = true
  try {
    // Kalau admin memilih file baru, upload dulu ke server lokal (folder public/img)
    if (selectedFile.value) {
      uploading.value = true
      const filename = await uploadService.upload(selectedFile.value)
      form.value.gambar = filename
      uploading.value = false
    }

    const payload = {
      ...form.value,
      harga: Number(form.value.harga),
      stok: Number(form.value.stok)
    }

    if (isEditing.value) {
      await sparepartService.update(editingId.value, payload)
      await logService.catat({
        username: currentUsername(),
        aksi: 'update',
        keterangan: `Mengubah sparepart: ${payload.nama}`
      })
    } else {
      await sparepartService.create(payload)
      await logService.catat({
        username: currentUsername(),
        aksi: 'create',
        keterangan: `Menambahkan sparepart: ${payload.nama}`
      })
    }

    showForm.value = false
    await fetchData()
  } catch (err) {
    errorMsg.value = 'Gagal menyimpan data.'
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('Hapus sparepart ini?')) return
  const target = items.value.find((i) => i.id === id)
  try {
    await sparepartService.remove(id)
    await logService.catat({
      username: currentUsername(),
      aksi: 'delete',
      keterangan: `Menghapus sparepart: ${target?.nama || id}`
    })
    await fetchData()
  } catch (err) {
    errorMsg.value = 'Gagal menghapus data.'
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
          <span class="label-eyebrow">Inventaris</span>
          <h1 class="mt-2 font-display text-3xl text-ink">Kelola Sparepart</h1>
          <p class="mt-1 text-sm text-muted">Tambah, ubah, atau hapus data sparepart Vespa.</p>
        </div>
        <button class="btn-primary" @click="openCreateForm">+ Tambah Sparepart</button>
      </div>

      <p v-if="errorMsg" class="mt-4 text-sm text-danger">{{ errorMsg }}</p>
      <p v-if="loading" class="mt-8 text-muted">Memuat data...</p>

      <div v-else class="card-panel mt-8 overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="label-eyebrow px-4 py-3 font-medium">Gambar</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Nama</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Kategori</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Harga</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Stok</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id" class="border-b border-border last:border-0">
              <td class="px-4 py-3">
                <img
                  v-if="item.gambar"
                  :src="gambarUrl(item.gambar)"
                  class="h-10 w-10 rounded-md border border-border object-cover"
                />
                <span v-else class="text-xs text-muted">-</span>
              </td>
              <td class="px-4 py-3 text-ink">{{ item.nama }}</td>
              <td class="px-4 py-3 text-muted">{{ item.kategori }}</td>
              <td class="px-4 py-3 text-brass-light">Rp {{ Number(item.harga).toLocaleString('id-ID') }}</td>
              <td class="px-4 py-3 text-muted">{{ item.stok }}</td>
              <td class="flex gap-2 px-4 py-3">
                <button
                  class="rounded-lg border border-border px-3 py-1.5 text-xs text-ink transition-colors hover:border-brass hover:text-brass-light"
                  @click="openEditForm(item)"
                >
                  Ubah
                </button>
                <button
                  class="rounded-lg border border-danger/60 bg-danger/10 px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger/20"
                  @click="handleDelete(item.id)"
                >
                  Hapus
                </button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-muted">Belum ada data sparepart.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal form Create/Update -->
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
        @click.self="closeForm"
      >
        <form class="card-panel max-h-[90vh] w-full max-w-md overflow-y-auto p-7" @submit.prevent="handleSubmit">
          <span class="label-eyebrow">{{ isEditing ? 'Perbarui data' : 'Data baru' }}</span>
          <h2 class="mt-2 font-display text-xl text-ink">
            {{ isEditing ? 'Ubah Sparepart' : 'Tambah Sparepart' }}
          </h2>

          <div class="mt-5 flex flex-col gap-4">
            <div>
              <label class="mb-1.5 block text-xs text-muted">Nama</label>
              <input v-model="form.nama" class="input-field" required />
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-muted">Kategori</label>
              <input v-model="form.kategori" class="input-field" placeholder="Mesin, Body, Kelistrikan, dll" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-xs text-muted">Harga (Rp)</label>
                <input v-model="form.harga" type="number" min="0" class="input-field" required />
              </div>
              <div>
                <label class="mb-1.5 block text-xs text-muted">Stok</label>
                <input v-model="form.stok" type="number" min="0" class="input-field" required />
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-muted">Gambar Sparepart</label>
              <input type="file" accept="public/img/*" class="input-field" @change="handleFileChange" />
              <p class="mt-1 text-[11px] text-muted">
                File akan disimpan ke folder <code>public/img</code> saat data disimpan.
              </p>
              <img
                v-if="previewUrl"
                :src="previewUrl"
                class="mt-2 h-24 w-24 rounded-lg border border-border object-cover"
              />
              <p v-if="uploading" class="mt-1 text-xs text-brass-light">Mengunggah gambar...</p>
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-muted">Deskripsi</label>
              <textarea v-model="form.deskripsi" class="input-field" rows="3"></textarea>
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
