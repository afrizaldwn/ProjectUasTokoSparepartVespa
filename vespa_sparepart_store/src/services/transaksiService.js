import { apiLocal } from './api'

const RESOURCE = '/transaksi'

export default {
  // READ semua transaksi (dipakai di Laporan Transaksi - Admin)
  getAll(params = {}) {
    return apiLocal.get(RESOURCE, { params })
  },

  // READ satu transaksi by id
  getById(id) {
    return apiLocal.get(`${RESOURCE}/${id}`)
  },

  // CREATE transaksi baru (dipanggil saat user checkout / simulasi bayar)
  create(payload) {
    return apiLocal.post(RESOURCE, {
      user_id: payload.user_id,
      nama_pembeli: payload.nama_pembeli,
      items: payload.items, // [{ id, nama, harga, qty, gambar }]
      total_harga: Number(payload.total_harga || 0),
      metode_pembayaran: payload.metode_pembayaran,
      alamat: payload.alamat || '',
      status: payload.status || 'lunas', // simulasi pembayaran langsung sukses
      waktu: new Date().toISOString()
    })
  },

  // UPDATE status transaksi (mis. diproses admin -> dikirim/selesai)
  update(id, payload) {
    return apiLocal.put(`${RESOURCE}/${id}`, payload)
  },

  remove(id) {
    return apiLocal.delete(`${RESOURCE}/${id}`)
  }
}
