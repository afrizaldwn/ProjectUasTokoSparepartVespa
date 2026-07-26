import { apiLocal } from './api'

const RESOURCE = '/transaksi'

export default {

  getAll(params = {}) {
    return apiLocal.get(RESOURCE, { params })
  },

  getById(id) {
    return apiLocal.get(`${RESOURCE}/${id}`)
  },

  create(payload) {
    return apiLocal.post(RESOURCE, {
      user_id: payload.user_id,
      nama_pembeli: payload.nama_pembeli,
      items: payload.items,
      total_harga: Number(payload.total_harga || 0),
      metode_pembayaran: payload.metode_pembayaran,
      alamat: payload.alamat || '',
      status: payload.status || 'lunas',
      waktu: new Date().toISOString()
    })
  },

  update(id, payload) {
    return apiLocal.put(`${RESOURCE}/${id}`, payload)
  },

  remove(id) {
    return apiLocal.delete(`${RESOURCE}/${id}`)
  }
}
