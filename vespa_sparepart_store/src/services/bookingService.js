import { apiLocal } from './api'

const RESOURCE = '/service'

export default {

  getAll(params = {}) {
    return apiLocal.get(RESOURCE, { params })
  },

  getById(id) {
    return apiLocal.get(`${RESOURCE}/${id}`)
  },

  create(payload) {
    return apiLocal.post(RESOURCE, {
      user_id: payload.user_id || null,
      nama_pelanggan: payload.nama_pelanggan,
      no_hp: payload.no_hp,
      jenis_vespa: payload.jenis_vespa,
      keluhan: payload.keluhan,
      tanggal_service: payload.tanggal_service,
      biaya: Number(payload.biaya || 0),
      status: payload.status || 'menunggu'
    })
  },

  update(id, payload) {
    return apiLocal.put(`${RESOURCE}/${id}`, {
      user_id: payload.user_id,
      nama_pelanggan: payload.nama_pelanggan,
      no_hp: payload.no_hp,
      jenis_vespa: payload.jenis_vespa,
      keluhan: payload.keluhan,
      tanggal_service: payload.tanggal_service,
      biaya: Number(payload.biaya || 0),
      status: payload.status
    })
  },

  remove(id) {
    return apiLocal.delete(`${RESOURCE}/${id}`)
  }
}
