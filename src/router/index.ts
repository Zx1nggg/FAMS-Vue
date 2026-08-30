import { createRouter, createWebHistory } from 'vue-router'
import Portal from '../views/portal/Index.vue'
import Login from '../views/login/Login.vue'
import FarmerDashboard from '../views/dashboard/Farmer.vue'
import RegulatorDashboard from '../views/dashboard/Regulator.vue'
import FarmerLayout from '../layout/FarmerLayout.vue'
import RegulatorLayout from '../layout/RegulatorLayout.vue'
import AdminLayout from '../layout/AdminLayout.vue'
import FarmManagement from '../views/farmer/base/FarmManagement.vue'
import PondManagement from '../views/farmer/base/PondManagement.vue'
import SupplierManagement from '../views/farmer/base/SupplierManagement.vue'
import PurchaseBatchManagement from '../views/farmer/base/PurchaseBatchManagement.vue'
import SeedlingDictManagement from '../views/farmer/base/SeedlingDictManagement.vue'
import StockingManagement from '../views/farmer/base/StockingManagement.vue'
import DailyPatrol from '../views/farmer/lifecycle/DailyPatrol.vue'
import HarvestSettlement from '../views/farmer/lifecycle/HarvestSettlement.vue'

const routes = [
  {
    path: '/',
    name: 'Portal',
    component: Portal,
    meta: { title: 'FAMS' },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/register/Register.vue'),
    meta: { title: '入驻申请' },
  },
  {
    path: '/register/status',
    name: 'RegistrationStatus',
    component: () => import('../views/register/RegistrationStatus.vue'),
    meta: { title: '申请进度查询' },
  },
  {
    path: '/farmer',
    component: FarmerLayout,
    redirect: '/farmer/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'FarmerDashboard',
        component: FarmerDashboard,
        meta: { title: '工作台概览' },
      },
      {
        path: 'base/farm',
        name: 'FarmManagement',
        component: FarmManagement,
        meta: { title: '我的养殖场区' },
      },
      {
        path: 'base/pond',
        name: 'PondManagement',
        component: PondManagement,
        meta: { title: '我的池塘' },
      },
      {
        path: 'base/supplier',
        name: 'SupplierManagement',
        component: SupplierManagement,
        meta: { title: '供应商管理' },
      },
      {
        path: 'base/purchase',
        name: 'PurchaseBatchManagement',
        component: PurchaseBatchManagement,
        meta: { title: '采购批次管理' },
      },
      {
        path: 'base/seedling',
        name: 'SeedlingDictManagement',
        component: SeedlingDictManagement,
        meta: { title: '苗种字典' },
      },
      {
        path: 'lifecycle/stocking',
        name: 'StockingManagement',
        component: StockingManagement,
        meta: { title: '苗种投放登记' },
      },
      {
        path: 'lifecycle/patrol',
        name: 'DailyPatrol',
        component: DailyPatrol,
        meta: { title: '日常巡塘台账' },
      },
      {
        path: 'lifecycle/overview',
        name: 'PondOverview',
        component: () => import('../views/farmer/lifecycle/PondOverview.vue'),
        meta: { title: '池塘实时概览' },
      },
      {
        path: 'lifecycle/harvest',
        name: 'HarvestSettlement',
        component: HarvestSettlement,
        meta: { title: '出塘结算管理' },
      },
      {
        path: 'lifecycle/trace',
        name: 'Traceability',
        component: () => import('../views/farmer/lifecycle/Traceability.vue'),
        meta: { title: '养殖追溯查询' },
      },
      {
        path: 'profile',
        name: 'FarmerProfile',
        component: () => import('../views/farmer/Profile.vue'),
        meta: { title: '个人主页' },
      },
      {
        path: 'settings',
        name: 'FarmerSettings',
        component: () => import('../views/farmer/Settings.vue'),
        meta: { title: '账号设置' },
      },
    ],
  },
  {
    path: '/regulator',
    name: 'Regulator',
    component: RegulatorLayout,
    redirect: '/regulator/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'RegulatorDashboard',
        component: RegulatorDashboard,
        meta: { title: '监管工作台' },
      },
      {
        path: 'trace',
        name: 'RegulatorTrace',
        component: () => import('../views/regulator/Trace.vue'),
        meta: { title: '全链路追溯' },
      },
      {
        path: 'alerts',
        name: 'RegulatorAlerts',
        component: () => import('../views/regulator/AlertsMonitor.vue'),
        meta: { title: '风险异常预警' },
      },
      {
        path: 'profile',
        name: 'RegulatorProfile',
        component: () => import('../views/regulator/Profile.vue'),
        meta: { title: '个人主页' },
      },
      {
        path: 'settings',
        name: 'RegulatorSettings',
        component: () => import('../views/regulator/Settings.vue'),
        meta: { title: '账号设置' },
      },
      {
        path: 'review',
        name: 'SupplierReview',
        component: () => import('../views/regulator/SupplierReview.vue'),
        meta: { title: '供应商资质审查' },
      }
    ],
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: '中枢运维总览' },
      },
      {
        path: 'users',
        name: 'AdminUserManagement',
        component: () => import('../views/admin/UserManagement.vue'),
        meta: { title: '账号运维' },
      },
      {
        path: 'registrations',
        name: 'RegistrationManagement',
        component: () => import('../views/admin/RegistrationManagement.vue'),
        meta: { title: '入驻申请审批' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const publicPaths = ['/', '/login', '/register', '/register/status']
  if (publicPaths.includes(to.path)) {
    next()
    return
  }

  const userStr = sessionStorage.getItem('aqua_user')
  if (!userStr) {
    next('/login')
    return
  }

  try {
    const user = JSON.parse(userStr)
    const role = user.role || user.userType
    if (to.path.startsWith('/farmer') && role !== 'FARMER') {
      next('/login')
      return
    }
    if (to.path.startsWith('/regulator') && role !== 'REGULATOR' && role !== 'ADMIN') {
      next('/login')
      return
    }
    if (to.path.startsWith('/admin') && role !== 'ADMIN') {
      next('/login')
      return
    }
    next()
  } catch {
    next('/login')
  }
})

export default router
