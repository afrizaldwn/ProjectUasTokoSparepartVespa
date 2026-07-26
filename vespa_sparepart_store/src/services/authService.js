import { apiMock } from './api'

const RESOURCE = '/users'

export default {

  getAll() {
    return apiMock.get(RESOURCE)
  },

  async findByEmail(email) {
    const { data } = await apiMock.get(RESOURCE)
    const matched = data.filter((u) => u.email === email)
    return { data: matched }
  },

  register(payload) {
    return apiMock.post(RESOURCE, {
      nama: payload.nama,
      email: payload.email,
      password: payload.password,
      role: payload.role || 'user'
    })
  }
}
