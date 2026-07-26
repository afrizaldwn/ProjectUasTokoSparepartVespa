import { apiMock } from './api'

const RESOURCE = '/users'

export default {
  // READ semua pengguna (khusus Admin - Kelola Pengguna)
  getAll(params = {}) {
    return apiMock.get(RESOURCE, { params })
  },

  getById(id) {
    return apiMock.get(`${RESOURCE}/${id}`)
  },

  // CREATE pengguna baru oleh Admin
  create(payload) {
    return apiMock.post(RESOURCE, {
      nama: payload.nama,
      username: payload.username,
      email: payload.email,
      password: payload.password, // NOTE: demo saja (MockAPI tanpa hashing di backend nyata)
      role: payload.role || 'user',
      status: payload.status || 'aktif'
    })
  },

  // UPDATE data pengguna. Password hanya dikirim jika diisi (kosong = tidak diubah).
  update(id, payload) {
    const body = {
      nama: payload.nama,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      status: payload.status
    }
    if (payload.password) {
      body.password = payload.password
    }
    return apiMock.put(`${RESOURCE}/${id}`, body)
  },

  // DELETE pengguna
  remove(id) {
    return apiMock.delete(`${RESOURCE}/${id}`)
  },

  // Cek apakah username/email sudah dipakai akun lain (dipakai sebelum create/update)
  async isDuplicate({ username, email, excludeId = null }) {
    const { data } = await apiMock.get(RESOURCE)
    return data.some(
      (u) => String(u.id) !== String(excludeId) && (u.username === username || u.email === email)
    )
  }
}
