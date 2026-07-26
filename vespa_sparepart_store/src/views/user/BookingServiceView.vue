<script setup>
import { ref, computed, onMounted } from 'vue'
import NavbarUser from '../../components/NavbarUser.vue'
import bookingService from '../../services/bookingService'
import logService from '../../services/logService'
import { useAuthStore } from '../../store/auth'

const auth = useAuthStore()

const riwayat = ref([])
const loadingRiwayat = ref(true)

const emptyForm = { jenis_vespa: '', no_hp: '', tanggal_service: '', keluhan: '' }
const form = ref({ ...emptyForm })

const submitting = ref(false)
const success = ref(false)
const errorMsg = ref('')

const STATUS_LABEL = {
  menunggu: 'Menunggu konfirmasi',
  proses: 'Sedang dikerjakan',
  selesai: 'Selesai',
  batal: 'Dibatalkan'
}

function statusBadgeClass(status) {
  return {
    menunggu: 'bg-muted/20 text-muted',
    proses: 'bg-brass/20 text-brass-light',
    selesai: 'bg-success/20 text-success',
    batal: 'bg-danger/20 text-danger'
  }[status] || 'bg-muted/20 text-muted'
}

function formatTanggal(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
}

const riwayatSaya = computed(() =>
  riwayat.value
    .filter((b) => String(b.user_id) === String(auth.user?.id))
    .sort((a, b) => new Date(b.tanggal_service) - new Date(a.tanggal_service))
)

async function fetchRiwayat() {
  loadingRiwayat.value = true
  try {
    const { data } = await bookingService.getAll()
    riwayat.value = data
  } catch (err) {
    // riwayat gagal dimuat bukan error fatal, form booking tetap bisa dipakai
  } finally {
    loadingRiwayat.value = false
  }
}

async function handleSubmit() {
  if (!form.value.jenis_vespa || !form.value.no_hp || !form.value.tanggal_service || !form.value.keluhan) {
    errorMsg.value = 'Semua kolom wajib diisi.'
    return
  }

  submitting.value = true
  errorMsg.value = ''
  try {
    // Simulasi proses konfirmasi booking (sama seperti alur checkout)
    await new Promise((resolve) => setTimeout(resolve, 700))

    await bookingService.create({
      user_id: auth.user.id,
      nama_pelanggan: auth.user.nama || auth.user.username,
      no_hp: form.value.no_hp,
      jenis_vespa: form.value.jenis_vespa,
      keluhan: form.value.keluhan,
      tanggal_service: form.value.tanggal_service,
      biaya: 0,
      status: 'menunggu'
    })

    await logService.catat({
      username: auth.user.username || auth.user.nama,
      aksi: 'booking',
      keterangan: `Booking service Vespa ${form.value.jenis_vespa} tanggal ${form.value.tanggal_service}`
    })

    form.value = { ...emptyForm }
    success.value = true
    await fetchRiwayat()
    setTimeout(() => (success.value = false), 3000)
  } catch (err) {
    errorMsg.value = 'Gagal mengirim booking. Coba lagi.'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchRiwayat)
</script>

<template>
  <NavbarUser />

  <main class="mx-auto max-w-3xl px-6 py-14">
    <span class="label-eyebrow">Layanan</span>
    <h1 class="mt-2 font-display text-3xl text-ink">Booking Service Vespa</h1>
    <p class="mt-1 text-sm text-muted">Jadwalkan service Vespa kamu, tim kami akan menghubungi lewat WhatsApp.</p>

    <div class="card-panel mt-8 p-6">
      <p v-if="success" class="mb-4 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
        Booking berhasil dikirim! Status booking kamu: <strong>Menunggu konfirmasi</strong>.
      </p>
      <p v-if="errorMsg" class="mb-4 text-sm text-danger">{{ errorMsg }}</p>

      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-xs text-muted">Jenis Vespa</label>
            <input v-model="form.jenis_vespa" class="input-field" placeholder="Vespa Excel, Super, dll" required />
          </div>
          <div>
            <label class="mb-1.5 block text-xs text-muted">No. HP / WhatsApp</label>
            <input v-model="form.no_hp" class="input-field" required />
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-xs text-muted">Tanggal Service</label>
          <input v-model="form.tanggal_service" type="date" class="input-field" required />
        </div>
        <div>
          <label class="mb-1.5 block text-xs text-muted">Keluhan</label>
          <textarea v-model="form.keluhan" class="input-field" rows="3" placeholder="Ceritakan keluhan Vespa kamu" required></textarea>
        </div>

        <button class="btn-primary mt-2 w-fit" :disabled="submitting">
          {{ submitting ? 'Mengirim booking...' : 'Kirim Booking' }}
        </button>
      </form>
    </div>

    <div class="mt-10">
      <h2 class="font-display text-xl text-ink">Riwayat Booking Saya</h2>

      <p v-if="loadingRiwayat" class="mt-4 text-muted">Memuat riwayat...</p>
      <p v-else-if="riwayatSaya.length === 0" class="mt-4 text-muted">Belum ada riwayat booking service.</p>

      <div v-else class="mt-4 flex flex-col gap-3">
        <div v-for="b in riwayatSaya" :key="b.id" class="card-panel flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p class="text-ink">{{ b.jenis_vespa }}</p>
            <p class="text-xs text-muted">{{ formatTanggal(b.tanggal_service) }} · {{ b.keluhan }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span v-if="b.biaya > 0" class="text-sm text-brass-light">{{ formatRupiah(b.biaya) }}</span>
            <span class="rounded-full px-2.5 py-1 text-xs capitalize" :class="statusBadgeClass(b.status)">
              {{ STATUS_LABEL[b.status] || b.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
