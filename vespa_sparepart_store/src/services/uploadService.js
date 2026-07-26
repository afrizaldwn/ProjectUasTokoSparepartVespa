import { apiLocal } from './api'

export default {

  async upload(file) {
    const formData = new FormData()
    formData.append('gambar', file)

    const { data } = await apiLocal.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return data.filename
  }
}
