import axios from 'axios'

/**
 * GANTI dengan Project ID MockAPI kamu sendiri.
 * Buat project di https://mockapi.io lalu tambahkan SATU resource saja:
 *   - "users" -> field: id, nama, username, email, password, role ("admin" | "user"), status
 *
 * Hanya LOGIN & REGISTER (data akun) yang memakai MockAPI.
 * Semua konten lain (sparepart, kategori, booking service, log audit)
 * disimpan di server lokal (folder ../server) sebagai file JSON.
 */
const MOCKAPI_BASE_URL = 'https://6a61a502da10c59c1809ab1c.mockapi.io/'

// Base URL server (Express) - lihat folder /server di root project
// Saat development, otomatis pakai localhost:5000.
// Saat deploy, isi environment variable VITE_API_URL di Vercel/Netlify
// dengan URL backend yang sudah online (contoh: https://nama-app.onrender.com/api)
const LOCAL_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function createInstance(baseURL) {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  instance.interceptors.request.use((config) => config)

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('[API ERROR]', error?.response?.data || error.message)
      return Promise.reject(error)
    }
  )

  return instance
}

// apiMock -> KHUSUS login & register (users) di MockAPI
export const apiMock = createInstance(MOCKAPI_BASE_URL)

// apiLocal -> semua konten lain (sparepart, kategori, booking, logs) + upload gambar
export const apiLocal = createInstance(LOCAL_API_BASE_URL)

// Base URL server tanpa "/api", dipakai untuk membangun URL gambar produk
// contoh hasil: http://localhost:5000  atau  https://nama-app.onrender.com
export const SERVER_BASE_URL = LOCAL_API_BASE_URL.replace(/\/api\/?$/, '')

// default export tetap ada untuk kompatibilitas, mengarah ke apiLocal
export default apiLocal
