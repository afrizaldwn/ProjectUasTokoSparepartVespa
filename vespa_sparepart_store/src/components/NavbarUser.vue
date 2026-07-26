<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useCartStore } from '../store/cart'
import logo from '../assets/piaggio1.png'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

function handleLogout() {
  auth.logout()
  router.push({ name: 'home' })
}

function goToCart() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login' })
    return
  }
  router.push({ name: 'cart' })
}
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <router-link to="/" class="flex items-center gap-3">
        <img :src="logo" alt="Logo" class="h-9 w-9 rounded-full object-cover" />
        <span class="font-display text-lg tracking-wide text-ink">Toko Sparepart Vespa</span>
      </router-link>

      <nav class="flex items-center gap-4">

          <button class="relative rounded-lg p-2 text-ink transition-colors hover:bg-surface-alt" @click="goToCart" aria-label="Keranjang">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-6 w-6">
              <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-1.6 4h11.2M9 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span
              v-if="cart.totalItem > 0"
              class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-danger px-1 text-[11px] font-semibold text-white"
            >
              {{ cart.totalItem }}
            </span>
          </button>

        <a href="/" class="hidden rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-ink sm:inline-block">
          Home
        </a>

          <router-link
            to="/booking-service"
            class="hidden rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-ink sm:inline-block"
          >
            Booking Service
          </router-link>

        <template v-if="auth.isLoggedIn">
          <span class="hidden text-sm text-muted sm:inline">Halo, {{ auth.user.nama }}</span>
          <button class="btn-outline" @click="handleLogout">Keluar</button>
        </template>
        <template v-else>
          <router-link
            to="/booking-service"
            class="hidden rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-ink sm:inline-block"
          >
            Booking Service
          </router-link>
          <router-link class="btn-outline" to="/login">Masuk</router-link>
          <router-link class="btn-primary" to="/register">Daftar</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>