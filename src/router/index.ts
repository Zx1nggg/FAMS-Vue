import { createRouter, createWebHistory } from 'vue-router'
import Portal from '../views/portal/Index.vue'
import Login from '../views/login/Login.vue'
import FarmerDashboard from '../views/dashboard/Farmer.vue' // 原来的 Index.vue 改名
import RegulatorDashboard from '../views/dashboard/Regulator.vue'
// import AdminDashboard from '../views/dashboard/Admin.vue'

const routes = [
  { 
    path: '/', 
    name: 'Portal',
    component: Portal,
    meta: { title: '智渔 FAMS - 角色选择入口' }
  },
  { 
    path: '/login', 
    name: 'Login',
    component: Login 
  },
  { 
    path: '/dashboard/farmer', 
    name: 'FarmerDashboard',
    component: FarmerDashboard 
  },
  { 
    path: '/dashboard/regulator', 
    name: 'RegulatorDashboard',
    component: RegulatorDashboard 
  },
  // { path: '/dashboard/admin', component: AdminDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 简单的路由守卫拦截
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('aqua_token')
  const userStr = localStorage.getItem('aqua_user')
  
  // 如果去 dashboard 但没 token，打回入口
  if (to.path.startsWith('/dashboard') && (!token || !userStr)) {
    next('/')
  } else {
    next()
  }
})

export default router
