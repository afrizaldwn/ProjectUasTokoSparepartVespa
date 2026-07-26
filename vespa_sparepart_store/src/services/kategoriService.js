import { apiLocal } from './api'

const RESOURCE = '/kategori'

export default {

  getAll(params = {}) {
    return apiLocal.get(RESOURCE, { params })
  },

  getById(id) {
    return apiLocal.get(`${RESOURCE}/${id}`)
  },

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

  remove(id) {
    return apiLocal.delete(`${RESOURCE}/${id}`)
  }
}
