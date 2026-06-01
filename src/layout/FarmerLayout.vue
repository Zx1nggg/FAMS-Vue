<template>
  <div class="flex h-screen bg-gray-50 font-sans overflow-hidden">
    
    <!-- 左侧：全局侧边菜单栏 (Sidebar) -->
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-20">
      <!-- Logo 区域 -->
      <div class="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800 shrink-0">
        <span class="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shrink-0">
        <img src="/智渔-logo-removebg.png" alt="智渔FAMS" class="w-full h-full object-contain p-1" />
        </span>
        <span class="font-bold text-lg text-white tracking-wide">智渔 <span class="text-teal-500">FAMS</span></span>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        
        <!-- 工作台独立入口 -->
        <router-link 
          to="/farmer/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group"
          :class="[$route.path === '/farmer/dashboard' ? 'bg-teal-500/10 text-teal-400 font-medium' : 'hover:bg-slate-800 hover:text-white']"
        >
          <LayoutDashboard class="w-5 h-5" :class="$route.path === '/farmer/dashboard' ? 'text-teal-400' : 'text-slate-400 group-hover:text-white'" />
          工作台概览
        </router-link>

        <!-- 循环渲染两大业务分组 -->
        <div v-for="group in menuGroups" :key="group.title">
          <p class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ group.title }}</p>
          <div class="space-y-1">
            <router-link 
              v-for="item in group.items" 
              :key="item.path" 
              :to="item.path"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group"
              :class="[
                $route.path === item.path || $route.path.startsWith(item.path + '/')
                  ? 'bg-teal-500/10 text-teal-400 font-medium' 
                  : 'hover:bg-slate-800 hover:text-white'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" :class="$route.path.startsWith(item.path) ? 'text-teal-400' : 'text-slate-400 group-hover:text-white'" />
              {{ item.name }}
            </router-link>
          </div>
        </div>
      </nav>

      <!-- 底部系统状态 (将用户信息移至顶部后，这里保留纯净的系统状态) -->
      <div class="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <span>FAMS v3.0</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> 系统在线</span>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden bg-gray-50">
      
      <!-- 🌟 恢复的顶部 Header -->
      <header class="bg-white h-16 shadow-sm border-b border-gray-200 flex items-center justify-between px-6 z-10 shrink-0">
        <!-- 左侧：页面标题与当前农场标识 -->
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-bold text-gray-800">{{ $route.meta.title || '智渔管理系统' }}</h2>
          <span v-if="currentFarmName" class="text-xs bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full font-medium border border-teal-100 flex items-center gap-1.5">
            <Home class="w-3 h-3" /> 当前场区: {{ currentFarmName }}
          </span>
        </div>
        
        <!-- 右侧：用户头像与下拉菜单 -->
        <div class="flex items-center">
          
          <!-- 下拉菜单容器 (Hover触发) -->
          <div class="relative group cursor-pointer pr-2">
            <!-- 触发区域 -->
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white ring-2 ring-gray-100">
                {{ userInitial }}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-700 leading-none mb-1">{{ currentUser.name }}</span>
                <span class="text-xs text-gray-500 leading-none">{{ currentUser.role === 'ADMIN' ? '系统管理员' : '养殖户' }}</span>
              </div>
              <!-- 下拉小箭头 -->
              <ChevronDown class="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors ml-1" />
            </div>

            <!-- 悬浮菜单面板 (增加过渡动画) -->
            <div class="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 z-50">
              <div class="p-1.5">
                <router-link to="/farmer/profile" class="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600 rounded-lg transition-colors font-medium">
                  <User class="w-4 h-4" /> 个人主页
                </router-link>
                <router-link to="/farmer/settings" class="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600 rounded-lg transition-colors font-medium">
                  <Settings class="w-4 h-4" /> 账号设置
                </router-link>
                
                <div class="h-px bg-gray-100 my-1"></div>
                
                <button @click="handleLogout" class="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                  <LogOut class="w-4 h-4" /> 退出登录
                </button>
              </div>
            </div>
            
            <!-- 隐形的占位桥梁，防止鼠标在滑动到菜单面板时丢失Hover状态 -->
            <div class="absolute -bottom-3 left-0 w-full h-3 bg-transparent"></div>
          </div>
          
        </div>
      </header>

      <!-- 核心子页面渲染区 -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8 relative">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
// 🌟 新增引入 ChevronDown(小箭头), User(个人主页), Settings(设置) 图标
import { 
  Fish, LayoutDashboard, Home, Box, Users, 
  Truck, MapPin, Stethoscope, LogOut, ChevronDown, User, Settings ,BookOpen
} from 'lucide-vue-next'

const router = useRouter()

// 分组菜单结构
const menuGroups = [
  {
    title: '个人资产管理',
    items: [
      { name: '养殖场管理 (切换)', path: '/farmer/base/farm', icon: Home },
      { name: '池塘资产管理', path: '/farmer/base/pond', icon: Box },
      { name: '供应商名录', path: '/farmer/base/supplier', icon: Users },
      { name: '苗种字典管理', path: '/farmer/base/seedling', icon: BookOpen },
      { name: '采购入库登记', path: '/farmer/base/purchase', icon: Truck },
    ]
  },
  {
    title: '核心业务流转',
    items: [
      { name: '苗种投放关联', path: '/farmer/lifecycle/stocking', icon: MapPin },
      { name: '日常巡塘台账', path: '/farmer/lifecycle/patrol', icon: Stethoscope },
    ]
  }
]

const currentUser = ref({ name: '游客', role: 'FARMER' })
const userInitial = computed(() => currentUser.value.name.charAt(0))
const currentFarmName = ref('') // 顶部 Header 显示的当前农场名

onMounted(() => {
  const userStr = sessionStorage.getItem('aqua_user')
  if (userStr) {
    const data = JSON.parse(userStr)
    currentUser.value = data || { name: '游客', role: 'FARMER' }

    // 找出当前选中的农场名字
    const savedFarmId = sessionStorage.getItem('current_farm_id')
    if (savedFarmId && data.farms) {
      const activeFarm = data.farms.find(f => f.id == savedFarmId)
      if (activeFarm) currentFarmName.value = activeFarm.farmName
    }
  }
})

const handleLogout = async () => {
  try { await request.post('/auth/logout') } catch (error) {} 
  finally {
    sessionStorage.removeItem('aqua_user')
    sessionStorage.removeItem('current_farm_id')
    router.push('/login')
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 0px; background: transparent; }
.custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>