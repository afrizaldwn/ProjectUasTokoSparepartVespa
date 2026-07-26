import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

// User pages
import HomeView from '../views/user/HomeView.vue'
import ProductDetailView from '../views/user/ProductDetailView.vue'
import LoginView from '../views/user/LoginView.vue'
import RegisterView from '../views/user/RegisterView.vue'
import CartView from '../views/user/CartView.vue'
import CheckoutView from '../views/user/CheckoutView.vue'
import BookingServiceView from '../views/user/BookingServiceView.vue'

// Admin pages
import AdminLogin from '../views/admin/AdminLogin.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import AdminProducts from '../views/admin/AdminProducts.vue'
import AdminCategories from '../views/admin/AdminCategories.vue'
import AdminBookingService from '../views/admin/AdminBookingService.vue'
import AdminUsers from '../views/admin/AdminUsers.vue'
import AdminAuditTrail from '../views/admin/AdminAuditTrail.vue'
import AdminProfile from '../views/admin/AdminProfile.vue'
import AdminOrders from '../views/admin/AdminOrders.vue'

const routes = [
  // ---------- USER ----------
  { path: '/', name: 'home', component: HomeView },
  { path: '/produk/:id', name: 'product-detail', component: ProductDetailView, props: true },
  { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
  { path: '/keranjang', name: 'cart', component: CartView, meta: { requiresUser: true } },
  { path: '/checkout', name: 'checkout', component: CheckoutView, meta: { requiresUser: true } },
  { path: '/booking-service', name: 'booking-service', component: BookingServiceView, meta: { requiresUser: true } },

  // ---------- ADMIN ----------
  { path: '/admin/login', name: 'admin-login', component: AdminLogin, meta: { guestOnly: true } },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/produk',
    name: 'admin-products',
    component: AdminProducts,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/kategori',
    name: 'admin-kategori',
    component: AdminCategories,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/booking-service',
    name: 'admin-booking-service',
    component: AdminBookingService,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/pengguna',
    name: 'admin-users',
    component: AdminUsers,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/audit-trail',
    name: 'admin-audit-trail',
    component: AdminAuditTrail,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/profil',
    name: 'admin-profile',
    component: AdminProfile,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/transaksi',
    name: 'admin-transaksi',
    component: AdminOrders,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard: cek login & role sebelum masuk halaman tertentu
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAdmin && (!auth.isLoggedIn || !auth.isAdmin)) {
    return { name: 'admin-login' }
  }

  if (to.meta.requiresUser && (!auth.isLoggedIn || auth.isAdmin)) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && auth.isLoggedIn) {
    return auth.isAdmin ? { name: 'admin-dashboard' } : { name: 'home' }
  }

  return true
})

export default router
