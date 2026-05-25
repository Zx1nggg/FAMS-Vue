import { createRouter, createWebHistory } from 'vue-router'
import Portal from '../views/portal/Index.vue'
import Login from '../views/login/Login.vue'
import FarmerDashboard from '../views/dashboard/Farmer.vue' // 原来的 Index.vue 改名
import RegulatorDashboard from '../views/dashboard/Regulator.vue'
// import AdminDashboard from '../views/dashboard/Admin.vue'
import FarmerLayout from '../layout/FarmerLayout.vue'
import FarmManagement from '../views/farmer/base/FarmManagement.vue'
import PondManagement from '../views/farmer/base/PondManagement.vue'
import SupplierManagement from '../views/farmer/base/SupplierManagement.vue'
import PurchaseBatchManagement from '../views/farmer/base/PurchaseBatchManagement.vue'

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
    path: '/farmer',
    component: FarmerLayout,
    redirect: '/farmer/dashboard', // 默认重定向到工作台
    children: [
      { 
        path: 'dashboard', 
        name: 'FarmerDashboard',
        component: FarmerDashboard,
        meta: { title: '工作台概览' }
      },
      {
        path: 'base/farm',
        name: 'FarmManagement',
        component: FarmManagement,
        meta: { title: '我的养殖场' }
      },
       {
        path: 'base/pond',
        name: 'PondManagement',
        component: PondManagement,
        meta: { title: '我的鱼塘' }
      },
      {
        path: 'base/supplier',
        name: 'SupplierManagement',
        component: SupplierManagement,
        meta: { title: '我的供应商' }
      },
      {
        path: 'base/purchase',
        name: 'PurchaseBatchManagement',
        component: PurchaseBatchManagement,
        meta: { title: '我的采购批次' }
      }
      
    ]
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
// Token 存储在 HttpOnly Cookie 中，前端无法读取
// 因此通过检查 sessionStorage 中的用户信息来判断登录状态
router.beforeEach((to, from, next) => {
  const userStr = sessionStorage.getItem('aqua_user')
  
  // 如果去 dashboard 但没有用户信息（说明未登录），打回入口
  if (to.path.startsWith('/dashboard') && !userStr) {
    next('/')
  } else {
    next()
  }
})

export default router
