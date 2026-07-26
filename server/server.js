/**
 * Server lokal Vespa Parts Store
 * -------------------------------
 * Server ini HANYA menangani:
 *   - Konten: sparepart, kategori, service (booking), logs (audit trail)
 *   - Upload gambar -> disimpan fisik ke folder ../vespa-parts-store/public/img
 *
 * Login & register (data akun/users) TIDAK lewat server ini,
 * itu tetap langsung ke MockAPI dari frontend (lihat src/services/api.js -> apiMock).
 *
 * Cara jalankan:
 *   cd server
 *   npm install
 *   npm start
 *   -> server jalan di http://localhost:5000
 */

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

const DATA_DIR = path.join(__dirname, 'data')

// Folder gambar disimpan di dalam folder server sendiri,
// dan disajikan langsung oleh Express lewat /img/... (lihat app.use di bawah).
// Ini penting supaya tetap jalan saat backend & frontend di-deploy terpisah.
const IMG_DIR = path.join(__dirname, 'public/img')
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true })

// Sajikan folder gambar sebagai static file, bisa diakses lewat: <backend_url>/img/nama-file.jpg
app.use('/img', express.static(IMG_DIR))

// ---------- Upload gambar ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMG_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext
    cb(null, safeName)
  }
})
const upload = multer({ storage })

app.post('/api/upload', upload.single('gambar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada file yang diupload.' })
  }
  res.json({ filename: req.file.filename })
})

// ---------- Helper baca/tulis JSON ----------
function readJson(filename) {
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJson(filename, data) {
  const filePath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// ---------- Generic CRUD untuk tiap resource JSON ----------
function registerCrud(resource, filename) {
  app.get(`/api/${resource}`, (req, res) => {
    res.json(readJson(filename))
  })

  app.get(`/api/${resource}/:id`, (req, res) => {
    const item = readJson(filename).find((d) => String(d.id) === String(req.params.id))
    if (!item) return res.status(404).json({ message: 'Data tidak ditemukan.' })
    res.json(item)
  })

  app.post(`/api/${resource}`, (req, res) => {
    const data = readJson(filename)
    const newItem = { id: Date.now().toString(), ...req.body }
    data.push(newItem)
    writeJson(filename, data)
    res.status(201).json(newItem)
  })

  app.put(`/api/${resource}/:id`, (req, res) => {
    const data = readJson(filename)
    const idx = data.findIndex((d) => String(d.id) === String(req.params.id))
    if (idx === -1) return res.status(404).json({ message: 'Data tidak ditemukan.' })
    data[idx] = { ...data[idx], ...req.body, id: data[idx].id }
    writeJson(filename, data)
    res.json(data[idx])
  })

  app.delete(`/api/${resource}/:id`, (req, res) => {
    const data = readJson(filename)
    const filtered = data.filter((d) => String(d.id) !== String(req.params.id))
    writeJson(filename, filtered)
    res.json({ success: true })
  })
}

registerCrud('sparepart', 'sparepart.json')
registerCrud('kategori', 'kategori.json')
registerCrud('service', 'service.json')
registerCrud('logs', 'logs.json')
registerCrud('transaksi', 'transaksi.json')

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server lokal Vespa Parts Store jalan di http://localhost:${PORT}`)
  console.log(`Gambar upload disimpan di: ${IMG_DIR}`)
})
