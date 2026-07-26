import { apiMock } from './api'

const RESOURCE = '/users'

export default {
  // Ambil semua user (dipakai untuk cek email saat login/register)
  getAll() {
    return apiMock.get(RESOURCE)
  },

  // Cari user berdasarkan email — ambil semua data lalu filter di JS
  // (query filter langsung ?email=... di MockAPI kadang error 404, jadi dihindari)
  async findByEmail(email) {
    const { data } = await apiMock.get(RESOURCE)
    const matched = data.filter((u) => u.email === email)
    return { data: matched }
  },

  // Registrasi user baru. role default "user"
  register(payload) {
    return apiMock.post(RESOURCE, {
      nama: payload.nama,
      email: payload.email,
      password: payload.password, // NOTE: demo saja, di real app wajib di-hash di backend
      role: payload.role || 'user'
    })
  }
}
