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
import SeedlingDictManagement from '../views/farmer/base/SeedlingDictManagement.vue'
import StockingManagement from '../views/farmer/base/StockingManagement.vue'
import DailyPatrol from '../views/farmer/lifecycle/DailyPatrol.vue'
import HarvestSettlement from '../views/farmer/lifecycle/HarvestSettlement.vue'


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
    path: '/register',
    name: 'Register',
    component: () => import('../views/register/Register.vue'),
    meta: { title: '入驻申请' }
  },
  {
    path: '/register/status',
    name: 'RegistrationStatus',
    component: () => import('../views/register/RegistrationStatus.vue'),
    meta: { title: '申请进度查询' }
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
        meta: { title: '我的养殖场区' }
      },
       {
        path: 'base/pond',
        name: 'PondManagement',
        component: PondManagement,
        meta: { title: '我的池塘' }
      },
      {
        path: 'base/supplier',
        name: 'SupplierManagement',
        component: SupplierManagement,
        meta: { title: '供应商管理' }
      },
      {
        path: 'base/purchase',
        name: 'PurchaseBatchManagement',
        component: PurchaseBatchManagement,
        meta: { title: '采购批次管理' }
      },
      {
        path: 'base/seedling',
        name: 'SeedlingDictManagement',
        component: SeedlingDictManagement,
        meta: { title: '我的苗种字典' }
      },
      {
        path: 'lifecycle/stocking',
        name: 'StockingManagement',
        component: StockingManagement,
        meta: { title: '苗种投放登记' }
      },
      {
        path: 'lifecycle/patrol',
        name: 'DailyPatrol',
        component: DailyPatrol,
        meta: { title: '日常巡塘台账' }
      },
      {
        path: 'lifecycle/overview',
        name: 'PondOverview',
        component: () => import('../views/farmer/lifecycle/PondOverview.vue'),
        meta: { title: '池塘实时概览' }
      },
      {
        path: 'lifecycle/harvest',
        name: 'HarvestSettlement',
        component: HarvestSettlement,
        meta: { title: '出塘结算管理' }
      },
      {
        path: 'profile',
        name: 'FarmerProfile',
        component: () => import('../views/farmer/Profile.vue'),
        meta: { title: '个人主页' }
      },
      {
        path: 'settings',
        name: 'FarmerSettings',
        component: () => import('../views/farmer/Settings.vue'),
        meta: { title: '账号设置' }
      }
    ]
  },
  { 
    path: '/dashboard/regulator', 
    name: 'RegulatorDashboard',
    component: RegulatorDashboard 
  },
  // { path: '/dashboard/admin', component: AdminDashboard }

  // 管理员路由（暂时使用内联布局，后续可创建 AdminLayout）
  {
    path: '/admin/registrations',
    name: 'RegistrationManagement',
    component: () => import('../views/admin/RegistrationManagement.vue'),
    meta: { title: '入驻申请审批' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫拦截
// Token 存储在 HttpOnly Cookie 中，前端无法读取
// 因此通过检查 sessionStorage 中的用户信息来判断登录状态
router.beforeEach((to, from, next) => {
  const userStr = sessionStorage.getItem('aqua_user')

  // 需要认证的路由前缀
  const needAuth = to.path.startsWith('/farmer')
    || to.path.startsWith('/dashboard')
    || to.path.startsWith('/admin')

  if (needAuth && !userStr) {
    // 未登录，跳转到门户页
    next('/')
  } else {
    next()
  }
})

export default router
