import { apiLocal } from './api'

export default {
  // Upload satu file gambar ke server lokal, tersimpan fisik di /public/img
  // Mengembalikan nama file (bukan URL penuh) untuk disimpan di data JSON.
  async upload(file) {
    const formData = new FormData()
    formData.append('gambar', file)

    const { data } = await apiLocal.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return data.filename
  }
}
