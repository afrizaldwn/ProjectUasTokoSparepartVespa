import { apiLocal } from './api'

const RESOURCE = '/logs'

export default {
  // READ semua log (audit trail) - urut terbaru dulu
  getAll(params = {}) {
    return apiLocal.get(RESOURCE, { params: { sortBy: 'waktu', order: 'desc', ...params } })
  },

  // CATAT satu aktivitas baru. Dipanggil otomatis setiap ada create/update/delete
  // di seluruh modul admin, meniru fungsi catatLog() pada backend PHP.
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
