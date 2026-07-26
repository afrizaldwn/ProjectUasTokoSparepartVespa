import { defineStore } from 'pinia'
import authService from '../services/authService'
import userService from '../services/userService'
import logService from '../services/logService'
import { useCartStore } from './cart'

const STORAGE_KEY = 'vespa_store_session'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {

    async loginUser({ email, password }) {
      return this._loginWithRole({ email, password, expectedRole: 'user' })
    },

    async loginAdmin({ email, password }) {
      return this._loginWithRole({ email, password, expectedRole: 'admin' })
    },

    async _loginWithRole({ email, password, expectedRole }) {
      this.loading = true
      this.error = null
      try {
        const { data } = await authService.findByEmail(email)
        const found = data.find((u) => u.email === email && u.password === password)

        if (!found) {
          this.error = 'Email atau kata sandi salah'
          return false
        }

        if (found.role !== expectedRole) {
          this.error =
            expectedRole === 'admin'
              ? 'Akun ini bukan admin'
              : 'Akun ini terdaftar sebagai admin, gunakan halaman login admin'
          return false
        }

        this.user = found
        localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
        useCartStore().loadCart(found.id)
        logService.catat({
          username: found.username || found.nama,
          aksi: 'login',
          keterangan: `User ${found.username || found.nama} berhasil login`
        })
        return true
      } catch (err) {
        this.error = 'Gagal terhubung ke server. Coba lagi.'
        return false
      } finally {
        this.loading = false
      }
    },

    async register({ nama, email, password }) {
      this.loading = true
      this.error = null
      try {
        const { data: existing } = await authService.findByEmail(email)
        if (existing.length > 0) {
          this.error = 'Email sudah terdaftar'
          return false
        }

        const { data } = await authService.register({ nama, email, password, role: 'user' })
        this.user = data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        useCartStore().loadCart(data.id)
        return true
      } catch (err) {
        console.error('REGISTER ERROR:', err)
        this.error = 'Gagal mendaftar. Coba lagi.'
        return false
      } finally {
        this.loading = false
      }
    },

    logout() {
      if (this.user) {
        logService.catat({
          username: this.user.username || this.user.nama,
          aksi: 'logout',
          keterangan: `User ${this.user.username || this.user.nama} logout`
        })
      }
      this.user = null
      localStorage.removeItem(STORAGE_KEY)
      useCartStore().reset()
    },

    restoreSession() {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        this.user = JSON.parse(saved)
        useCartStore().loadCart(this.user.id)
      }
    },

    async updateProfile({ nama, email }) {
      this.loading = true
      this.error = null
      try {
        const duplikat = await userService.isDuplicate({ email, username: this.user.username, excludeId: this.user.id })
        if (duplikat) {
          this.error = 'Email sudah digunakan oleh akun lain.'
          return false
        }

        const { data } = await userService.update(this.user.id, {
          nama,
          email,
          username: this.user.username,
          role: this.user.role,
          status: this.user.status || 'aktif'
        })

        this.user = { ...this.user, ...data }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user))
        logService.catat({
          username: this.user.username || this.user.nama,
          aksi: 'update_profil',
          keterangan: 'User memperbarui data profil sendiri'
        })
        return true
      } catch (err) {
        this.error = 'Gagal memperbarui profil. Coba lagi.'
        return false
      } finally {
        this.loading = false
      }
    },

    async changePassword({ passwordLama, passwordBaru, konfirmasi }) {
      this.loading = true
      this.error = null
      try {
        if (this.user.password !== passwordLama) {
          this.error = 'Password lama tidak sesuai.'
          return false
        }
        if (passwordBaru.length < 6) {
          this.error = 'Password baru minimal 6 karakter.'
          return false
        }
        if (passwordBaru !== konfirmasi) {
          this.error = 'Konfirmasi password baru tidak sesuai.'
          return false
        }

        await userService.update(this.user.id, {
          nama: this.user.nama,
          email: this.user.email,
          username: this.user.username,
          role: this.user.role,
          status: this.user.status || 'aktif',
          password: passwordBaru
        })

        this.user = { ...this.user, password: passwordBaru }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user))
        logService.catat({
          username: this.user.username || this.user.nama,
          aksi: 'update_password',
          keterangan: 'User mengganti password akun sendiri'
        })
        return true
      } catch (err) {
        this.error = 'Gagal memperbarui password. Coba lagi.'
        return false
      } finally {
        this.loading = false
      }
    }
  }
})
