<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ nama: '', email: '', password: '' })

async function handleSubmit() {
  const ok = await auth.register(form.value)
  if (ok) router.push({ name: 'home' })
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-bg px-6">
    <form class="card-panel w-full max-w-sm p-8" @submit.prevent="handleSubmit">
      <span class="label-eyebrow">Bergabung dengan kami</span>
      <h1 class="mt-2 font-display text-2xl text-ink">Daftar Akun</h1>
      <p class="mt-1 text-sm text-muted">Buat akun untuk mulai berbelanja.</p>

      <div class="mt-6 flex flex-col gap-4">
        <div>
          <label class="mb-1.5 block text-xs text-muted">Nama Lengkap</label>
          <input v-model="form.nama" class="input-field" required placeholder="Nama kamu" />
        </div>
        <div>
          <label class="mb-1.5 block text-xs text-muted">Email</label>
          <input v-model="form.email" type="email" class="input-field" required placeholder="nama@email.com" />
        </div>
        <div>
          <label class="mb-1.5 block text-xs text-muted">Kata Sandi</label>
          <input v-model="form.password" type="password" class="input-field" required placeholder="••••••••" />
        </div>
      </div>

      <p v-if="auth.error" class="mt-4 text-sm text-danger">{{ auth.error }}</p>

      <button class="btn-primary mt-6 w-full" type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Memproses...' : 'Daftar' }}
      </button>

      <p class="mt-6 text-center text-sm text-muted">
        Sudah punya akun?
        <router-link to="/login" class="text-brass-light hover:underline">Masuk di sini</router-link>
      </p>
    </form>
  </main>
</template>
