<script setup>
import { ref } from 'vue'
import SidebarAdmin from '../../components/SidebarAdmin.vue'
import { useAuthStore } from '../../store/auth'

const auth = useAuthStore()

const profilForm = ref({
  nama: auth.user?.nama || '',
  email: auth.user?.email || ''
})

const passwordForm = ref({
  passwordLama: '',
  passwordBaru: '',
  konfirmasi: ''
})

const savingProfil = ref(false)
const savingPassword = ref(false)
const profilMsg = ref({ type: '', text: '' })
const passwordMsg = ref({ type: '', text: '' })

async function handleUpdateProfil() {
  savingProfil.value = true
  profilMsg.value = { type: '', text: '' }
  try {
    const ok = await auth.updateProfile(profilForm.value)
    profilMsg.value = ok
      ? { type: 'success', text: 'Profil berhasil diperbarui.' }
      : { type: 'error', text: auth.error }
  } finally {
    savingProfil.value = false
  }
}

async function handleUpdatePassword() {
  savingPassword.value = true
  passwordMsg.value = { type: '', text: '' }
  try {
    const ok = await auth.changePassword(passwordForm.value)
    passwordMsg.value = ok
      ? { type: 'success', text: 'Password berhasil diperbarui.' }
      : { type: 'error', text: auth.error }
    if (ok) {
      passwordForm.value = { passwordLama: '', passwordBaru: '', konfirmasi: '' }
    }
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <div class="flex">
    <SidebarAdmin />

    <main class="flex-1 px-8 py-10">
      <span class="label-eyebrow">Akun</span>
      <h1 class="mt-2 font-display text-3xl text-ink">Profil Saya</h1>
      <p class="mt-1 text-sm text-muted">Kelola data diri dan keamanan akun Anda.</p>

      <div class="mt-8 flex max-w-xl flex-col gap-6">

        <form class="card-panel p-7" @submit.prevent="handleUpdateProfil">
          <h2 class="font-display text-xl text-ink">👤 Data Diri</h2>

          <p
            v-if="profilMsg.text"
            class="mt-3 text-sm"
            :class="profilMsg.type === 'success' ? 'text-success' : 'text-danger'"
          >
            {{ profilMsg.type === 'success' ? '✅' : '⚠' }} {{ profilMsg.text }}
          </p>

          <div class="mt-5 flex flex-col gap-4">
            <div>
              <label class="mb-1.5 block text-xs text-muted">Username</label>
              <input class="input-field opacity-60" :value="auth.user?.username" disabled />
              <p class="mt-1 text-xs text-muted">Username tidak dapat diubah.</p>
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-muted">Nama Lengkap</label>
              <input v-model="profilForm.nama" class="input-field" required />
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-muted">Email</label>
              <input v-model="profilForm.email" type="email" class="input-field" required />
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-muted">Role</label>
              <span class="rounded-full bg-brass/20 px-2.5 py-1 text-xs uppercase text-brass-light">
                {{ auth.user?.role }}
              </span>
            </div>
          </div>

          <button class="btn-primary mt-6" type="submit" :disabled="savingProfil">
            {{ savingProfil ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </form>

        <form class="card-panel p-7" @submit.prevent="handleUpdatePassword">
          <h2 class="font-display text-xl text-ink">🔒 Ubah Password</h2>

          <p
            v-if="passwordMsg.text"
            class="mt-3 text-sm"
            :class="passwordMsg.type === 'success' ? 'text-success' : 'text-danger'"
          >
            {{ passwordMsg.type === 'success' ? '✅' : '⚠' }} {{ passwordMsg.text }}
          </p>

          <div class="mt-5 flex flex-col gap-4">
            <div>
              <label class="mb-1.5 block text-xs text-muted">Password Lama</label>
              <input v-model="passwordForm.passwordLama" type="password" class="input-field" required />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-xs text-muted">Password Baru</label>
                <input v-model="passwordForm.passwordBaru" type="password" class="input-field" minlength="6" required />
              </div>
              <div>
                <label class="mb-1.5 block text-xs text-muted">Konfirmasi Password Baru</label>
                <input v-model="passwordForm.konfirmasi" type="password" class="input-field" minlength="6" required />
              </div>
            </div>
          </div>

          <button class="btn-primary mt-6" type="submit" :disabled="savingPassword">
            {{ savingPassword ? 'Menyimpan...' : 'Perbarui Password' }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>
