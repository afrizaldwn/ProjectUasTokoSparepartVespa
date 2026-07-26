import { apiLocal } from './api'

const RESOURCE = '/logs'

export default {

  getAll(params = {}) {
    return apiLocal.get(RESOURCE, { params: { sortBy: 'waktu', order: 'desc', ...params } })
  },

  async catat({ username = '-', aksi, keterangan = '' }) {
    try {
      await apiLocal.post(RESOURCE, {
        username,
        aksi,
        keterangan,
        waktu: new Date().toISOString()
      })
    } catch (err) {
      // Audit log tidak boleh menggagalkan aksi utama pengguna
      console.error('[AUDIT LOG ERROR]', err)
    }
  }
}
