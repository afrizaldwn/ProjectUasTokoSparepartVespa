import { apiMock } from './api'

const RESOURCE = '/users'

export default {

  getAll(params = {}) {
    return apiMock.get(RESOURCE, { params })
  },

  getById(id) {
    return apiMock.get(`${RESOURCE}/${id}`)
  },

  create(payload) {
    return apiMock.post(RESOURCE, {
      nama: payload.nama,
      username: payload.username,
      email: payload.email,
      password: payload.password,
      role: payload.role || 'user',
      status: payload.status || 'aktif'
    })
  },

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

  remove(id) {
    return apiMock.delete(`${RESOURCE}/${id}`)
  },

  async isDuplicate({ username, email, excludeId = null }) {
    const { data } = await apiMock.get(RESOURCE)
    return data.some(
      (u) => String(u.id) !== String(excludeId) && (u.username === username || u.email === email)
    )
  }
}
