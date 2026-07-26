<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import logo from '../assets/piaggio1.png'

const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <aside class="flex min-h-screen w-60 flex-col border-r border-border bg-surface px-6 py-8">
    <div class="mb-10 flex items-center gap-3">
      <img :src="logo" alt="Logo" class="h-9 w-9 rounded-full object-cover" />
      <span class="font-display text-base tracking-wide text-ink">Admin Panel</span>
    </div>

    <nav class="flex flex-1 flex-col gap-1">
      <router-link
        to="/admin"
        class="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-alt hover:text-ink"
        active-class="!bg-brass/10 !text-brass-light"
        exact-active-class="!bg-brass/10 !text-brass-light"
      >
        Dashboard
      </router-link>
      <router-link
        to="/admin/produk"
        class="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-alt hover:text-ink"
        active-class="!bg-brass/10 !text-brass-light"
      >
        Data Sparepart
      </router-link>
      <router-link
        to="/admin/kategori"
        class="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-alt hover:text-ink"
        active-class="!bg-brass/10 !text-brass-light"
      >
        Booking Service
      </router-link>
      <router-link
        to="/admin/transaksi"
        class="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-alt hover:text-ink"
        active-class="!bg-brass/10 !text-brass-light"
      >
        Laporan Transaksi
      </router-link>
      <router-link
        to="/admin/profil"
        class="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-alt hover:text-ink"
        active-class="!bg-brass/10 !text-brass-light"
      >
        Profil Saya
      </router-link>

      <p class="mb-1 mt-6 px-3 text-xs uppercase tracking-wide text-muted/70">Administrasi</p>
      <router-link
        to="/admin/pengguna"
        class="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-alt hover:text-ink"
        active-class="!bg-brass/10 !text-brass-light"
      >
        Kelola Pengguna
      </router-link>
      <router-link
        to="/admin/audit-trail"
        class="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-alt hover:text-ink"
        active-class="!bg-brass/10 !text-brass-light"
      >
        Audit Trail
      </router-link>
    </nav>

    <div class="border-t border-border pt-5">
      <p class="mb-3 text-xs text-muted">
        Masuk sebagai<br />
        <strong class="text-ink">{{ auth.user?.nama }}</strong>
      </p>
      <button class="btn-outline w-full" @click="handleLogout">Keluar</button>
    </div>
  </aside>
</template>
