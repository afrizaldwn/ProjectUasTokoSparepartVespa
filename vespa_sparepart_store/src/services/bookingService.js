import { apiLocal } from './api'

const RESOURCE = '/service'

export default {
  // READ semua booking service
  getAll(params = {}) {
    return apiLocal.get(RESOURCE, { params })
  },

  // READ satu booking by id
  getById(id) {
    return apiLocal.get(`${RESOURCE}/${id}`)
  },

  // CREATE booking baru
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

  // UPDATE booking (termasuk ubah status)
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

  // DELETE booking
  remove(id) {
    return apiLocal.delete(`${RESOURCE}/${id}`)
  }
}
