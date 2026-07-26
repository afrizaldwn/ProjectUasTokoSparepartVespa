import { apiLocal } from './api'

const RESOURCE = '/sparepart'

export default {
  // READ semua data
  getAll(params = {}) {
    return apiLocal.get(RESOURCE, { params })
  },

  // READ satu data by id
  getById(id) {
    return apiLocal.get(`${RESOURCE}/${id}`)
  },

  // CREATE data baru
  create(payload) {
    return apiLocal.post(RESOURCE, payload)
  },

  // UPDATE data
  update(id, payload) {
    return apiLocal.put(`${RESOURCE}/${id}`, payload)
  },

  // DELETE data
  remove(id) {
    return apiLocal.delete(`${RESOURCE}/${id}`)
  }
}
