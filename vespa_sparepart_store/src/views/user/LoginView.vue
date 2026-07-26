<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ email: '', password: '' })

async function handleSubmit() {
  const ok = await auth.loginUser(form.value)
  if (ok) router.push({ name: 'home' })
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-bg px-6">
    <form class="card-panel w-full max-w-sm p-8" @submit.prevent="handleSubmit">
      <span class="label-eyebrow">Selamat datang kembali</span>
      <h1 class="mt-2 font-display text-2xl text-ink">Masuk</h1>
      <p class="mt-1 text-sm text-muted">Masuk untuk berbelanja sparepart Vespa favoritmu.</p>

      <div class="mt-6 flex flex-col gap-4">
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
        {{ auth.loading ? 'Memproses...' : 'Masuk' }}
      </button>

      <p class="mt-6 text-center text-sm text-muted">
        Belum punya akun?
        <router-link to="/register" class="text-brass-light hover:underline">Daftar di sini</router-link>
      </p>
    </form>
  </main>
</template>
