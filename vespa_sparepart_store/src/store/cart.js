import { defineStore } from 'pinia'

function storageKey(userId) {
  return `vespa_cart_${userId || 'guest'}`
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [], // [{ id, nama, harga, gambar, qty, stok }]
    userId: null
  }),

  getters: {
    totalItem: (state) => state.items.reduce((sum, i) => sum + i.qty, 0),
    totalHarga: (state) => state.items.reduce((sum, i) => sum + i.qty * Number(i.harga || 0), 0)
  },

  actions: {
    // Panggil sesudah login untuk memuat keranjang milik akun tsb
    loadCart(userId) {
      this.userId = userId
      const saved = localStorage.getItem(storageKey(userId))
      this.items = saved ? JSON.parse(saved) : []
    },

    _persist() {
      localStorage.setItem(storageKey(this.userId), JSON.stringify(this.items))
    },

    addItem(product, qty = 1) {
      const existing = this.items.find((i) => i.id === product.id)
      if (existing) {
        existing.qty += qty
      } else {
        this.items.push({
          id: product.id,
          nama: product.nama,
          harga: product.harga,
          gambar: product.gambar,
          stok: product.stok,
          qty
        })
      }
      this._persist()
    },

    updateQty(id, qty) {
      const item = this.items.find((i) => i.id === id)
      if (!item) return
      item.qty = Math.max(1, Number(qty) || 1)
      this._persist()
    },

    removeItem(id) {
      this.items = this.items.filter((i) => i.id !== id)
      this._persist()
    },

    // Kosongkan keranjang (dipanggil setelah checkout sukses)
    clear() {
      this.items = []
      this._persist()
    },

    // Bersihkan state di memori saat logout, TANPA menghapus data tersimpan
    // di localStorage supaya keranjang tetap ada saat user login lagi.
    reset() {
      this.items = []
      this.userId = null
    }
  }
})
