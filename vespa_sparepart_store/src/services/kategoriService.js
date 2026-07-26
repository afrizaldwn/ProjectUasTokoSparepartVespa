import { apiLocal } from './api'

const RESOURCE = '/kategori'

export default {
  // READ semua kategori
  getAll(params = {}) {
    return apiLocal.get(RESOURCE, { params })
  },

  // READ satu kategori by id
  getById(id) {
    return apiLocal.get(`${RESOURCE}/${id}`)
  },

  // CREATE kategori baru
  create(payload) {
    return apiLocal.post(RESOURCE, {
      nama_kategori: payload.nama_kategori,
      keterangan: payload.keterangan || ''
    })
  },

  // UPDATE kategori
  update(id, payload) {
    return apiLocal.put(`${RESOURCE}/${id}`, {
      nama_kategori: payload.nama_kategori,
      keterangan: payload.keterangan || ''
    })
  },

  // DELETE kategori
  remove(id) {
    return apiLocal.delete(`${RESOURCE}/${id}`)
  }
}
