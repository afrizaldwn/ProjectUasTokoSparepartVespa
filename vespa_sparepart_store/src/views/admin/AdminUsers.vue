<script setup>
import { ref, computed, onMounted } from 'vue'
import SidebarAdmin from '../../components/SidebarAdmin.vue'
import userService from '../../services/userService'
import logService from '../../services/logService'
import { useAuthStore } from '../../store/auth'

const auth = useAuthStore()

const items = ref([])
const loading = ref(true)
const errorMsg = ref('')

const searchQuery = ref('')
const roleFilter = ref('')

const showForm = ref(false)
const isEditing = ref(false)
const submitting = ref(false)

const emptyForm = { nama: '', username: '', email: '', password: '', role: 'user', status: 'aktif' }
const form = ref({ ...emptyForm })
const editingId = ref(null)

function currentUsername() {
  return auth.user?.username || auth.user?.nama || '-'
}

const filteredItems = computed(() => {
  return items.value
    .filter((it) => {
      const q = searchQuery.value.trim().toLowerCase()
      if (!q) return true
      return (
        it.nama?.toLowerCase().includes(q) ||
        it.username?.toLowerCase().includes(q) ||
        it.email?.toLowerCase().includes(q)
      )
    })
    .filter((it) => (roleFilter.value ? it.role === roleFilter.value : true))
})

async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await userService.getAll()
    items.value = data
  } catch (err) {
    errorMsg.value = 'Gagal memuat data pengguna.'
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
  form.value = { ...item, password: '' }
  editingId.value = item.id
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function handleSubmit() {
  const f = form.value
  errorMsg.value = ''

  if (!f.nama || !f.username || !f.email) {
    errorMsg.value = 'Nama, username, dan email wajib diisi.'
    return
  }
  if (!isEditing.value && f.password.length < 6) {
    errorMsg.value = 'Password minimal 6 karakter.'
    return
  }
  if (isEditing.value && f.password && f.password.length < 6) {
    errorMsg.value = 'Password minimal 6 karakter.'
    return
  }

  submitting.value = true
  try {
    const duplikat = await userService.isDuplicate({
      username: f.username,
      email: f.email,
      excludeId: isEditing.value ? editingId.value : null
    })
    if (duplikat) {
      errorMsg.value = 'Username atau email sudah digunakan.'
      return
    }

    if (isEditing.value) {
      await userService.update(editingId.value, f)
      await logService.catat({
        username: currentUsername(),
        aksi: 'update',
        keterangan: `Mengubah data pengguna: ${f.username}`
      })
    } else {
      await userService.create(f)
      await logService.catat({
        username: currentUsername(),
        aksi: 'create',
        keterangan: `Menambahkan pengguna baru: ${f.username} (${f.role})`
      })
    }

    showForm.value = false
    await fetchData()
  } catch (err) {
    errorMsg.value = 'Gagal menyimpan data pengguna.'
  } finally {
    submitting.value = false
  }
}

async function handleDelete(item) {
  if (String(item.id) === String(auth.user?.id)) {
    errorMsg.value = 'Anda tidak dapat menghapus akun Anda sendiri.'
    return
  }
  if (!confirm(`Hapus pengguna "${item.username}"?`)) return

  try {
    await userService.remove(item.id)
    await logService.catat({
      username: currentUsername(),
      aksi: 'delete',
      keterangan: `Menghapus pengguna: ${item.username}`
    })
    await fetchData()
  } catch (err) {
    errorMsg.value = 'Gagal menghapus pengguna.'
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
          <span class="label-eyebrow">Administrasi</span>
          <h1 class="mt-2 font-display text-3xl text-ink">Kelola Pengguna</h1>
          <p class="mt-1 text-sm text-muted">Tambah, ubah, atau hapus akun admin dan pelanggan.</p>
        </div>
        <button class="btn-primary" @click="openCreateForm">+ Tambah Pengguna</button>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <input
          v-model="searchQuery"
          class="input-field max-w-sm flex-1"
          placeholder="Cari nama / username / email..."
        />
        <select v-model="roleFilter" class="input-field w-40">
          <option value="">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <p v-if="errorMsg" class="mt-4 text-sm text-danger">{{ errorMsg }}</p>
      <p v-if="loading" class="mt-8 text-muted">Memuat data...</p>

      <div v-else class="card-panel mt-6 overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="label-eyebrow px-4 py-3 font-medium">Nama</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Username</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Email</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Role</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Status</th>
              <th class="label-eyebrow px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id" class="border-b border-border last:border-0">
              <td class="px-4 py-3 text-ink">{{ item.nama }}</td>
              <td class="px-4 py-3 text-muted">{{ item.username }}</td>
              <td class="px-4 py-3 text-muted">{{ item.email }}</td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2.5 py-1 text-xs uppercase"
                  :class="item.role === 'admin' ? 'bg-brass/20 text-brass-light' : 'bg-teal/20 text-teal-light'"
                >
                  {{ item.role }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2.5 py-1 text-xs capitalize"
                  :class="item.status === 'aktif' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'"
                >
                  {{ item.status || 'aktif' }}
                </span>
              </td>
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
            <tr v-if="filteredItems.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-muted">Belum ada data pengguna.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
        @click.self="closeForm"
      >
        <form class="card-panel max-h-[90vh] w-full max-w-md overflow-y-auto p-7" @submit.prevent="handleSubmit">
          <span class="label-eyebrow">{{ isEditing ? 'Perbarui data' : 'Data baru' }}</span>
          <h2 class="mt-2 font-display text-xl text-ink">
            {{ isEditing ? 'Ubah Pengguna' : 'Tambah Pengguna' }}
          </h2>

          <div class="mt-5 flex flex-col gap-4">
            <div>
              <label class="mb-1.5 block text-xs text-muted">Nama Lengkap</label>
              <input v-model="form.nama" class="input-field" required />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-xs text-muted">Username</label>
                <input v-model="form.username" class="input-field" required />
              </div>
              <div>
                <label class="mb-1.5 block text-xs text-muted">Email</label>
                <input v-model="form.email" type="email" class="input-field" required />
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-muted">
                Password {{ isEditing ? '(kosongkan jika tidak diubah)' : '' }}
              </label>
              <input v-model="form.password" type="password" class="input-field" minlength="6" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-xs text-muted">Role</label>
                <select v-model="form.role" class="input-field">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-xs text-muted">Status</label>
                <select v-model="form.status" class="input-field">
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
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
