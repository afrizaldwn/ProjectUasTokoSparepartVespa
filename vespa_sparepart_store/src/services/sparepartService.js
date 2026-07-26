import { apiLocal } from './api'

const RESOURCE = '/sparepart'

export default {

  getAll(params = {}) {
    return apiLocal.get(RESOURCE, { params })
  },

  getById(id) {
    return apiLocal.get(`${RESOURCE}/${id}`)
  },

  create(payload) {
    return apiLocal.post(RESOURCE, payload)
  },

  update(id, payload) {
    return apiLocal.put(`${RESOURCE}/${id}`, payload)
  },

  remove(id) {
    return apiLocal.delete(`${RESOURCE}/${id}`)
  }
}
