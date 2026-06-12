<template>
  <div class="flex h-screen bg-slate-50 font-sans overflow-hidden">
    
    <!-- 左侧：全局侧边菜单栏 (Sidebar) - 监管方主题偏深灰蓝 -->
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-20 shadow-xl">
      <!-- Logo 区域 -->
      <div class="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800 shrink-0">
        <span class="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shrink-0">
          <img src="/智渔-logo-removebg.png" alt="智渔FAMS" class="w-full h-full object-contain p-1" />
        </span>
        <span class="font-bold text-lg text-white tracking-wide">智渔 <span class="text-indigo-500">监管中心</span></span>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        
        <!-- 工作台独立入口 (监管大屏) -->
        <router-link 
          to="/regulator/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group"
          :class="[$route.path === '/regulator/dashboard' ? 'bg-indigo-500/10 text-indigo-400 font-medium' : 'hover:bg-slate-800 hover:text-white']"
        >
          <LayoutDashboard class="w-5 h-5" :class="$route.path === '/regulator/dashboard' ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'" />
          监管大屏总览
        </router-link>

        <!-- 循环渲染业务分组 -->
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
                  ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                  : 'hover:bg-slate-800 hover:text-white'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" :class="$route.path.startsWith(item.path) ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'" />
              {{ item.name }}
            </router-link>
          </div>
        </div>
      </nav>

      <!-- 底部系统状态 (探测交互版) -->
      <div class="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs shrink-0 select-none">
        <span class="text-slate-500">Regulator v3.0</span>
        <div 
          @click="checkServerHealth"
          title="点击手动检测系统连接状态"
          class="flex items-center gap-1.5 cursor-pointer transition-colors font-medium group"
          :class="isServerOnline ? 'text-emerald-500 hover:text-emerald-400' : 'text-red-500 hover:text-red-400'"
        >
          <span class="relative flex h-2 w-2">
            <span v-if="isServerOnline" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2" :class="isServerOnline ? 'bg-emerald-500' : 'bg-red-500'"></span>
          </span>
          {{ isServerOnline ? '数据网在线' : '数据网断开' }}
        </div>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden bg-slate-50">
      
      <!-- 顶部 Header -->
      <header class="relative bg-white h-16 shadow-sm border-b border-gray-200 flex items-center justify-between px-6 z-50 shrink-0">
        <!-- 左侧：页面标题与全局监管模式标识 -->
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-bold text-gray-800">{{ $route.meta.title || '监管控制台' }}</h2>
        </div>
        
        <!-- 右侧：用户头像与下拉菜单 -->
        <div class="flex items-center">
          
          <!-- 下拉菜单容器 -->
          <div class="relative group cursor-pointer pr-2">
            <!-- 触发区域 -->
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white ring-2 ring-gray-100 overflow-hidden">
                <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover" />
                <span v-else>{{ userInitial }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-700 leading-none mb-1">{{ currentUser.name }}</span>
                <span class="text-xs text-indigo-600 font-medium leading-none">{{ roleDisplay }}</span>
              </div>
              <!-- 下拉小箭头 -->
              <ChevronDown class="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors ml-1" />
            </div>

            <!-- 悬浮菜单面板 -->
            <div class="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 z-50">
              <div class="p-1.5">
                <router-link to="/regulator/profile" class="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors font-medium">
                  <User class="w-4 h-4" /> 个人资料
                </router-link>
                <router-link to="/regulator/settings" class="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors font-medium">
                  <Settings class="w-4 h-4" /> 系统设置
                </router-link>
                
                <div class="h-px bg-gray-100 my-1"></div>
                
                <button @click="handleLogout" class="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                  <LogOut class="w-4 h-4" /> 退出登录
                </button>
              </div>
            </div>
            
            <!-- 隐形的占位桥梁 -->
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
import { getCachedAvatar, clearUserCache } from '@/utils/storage'
// 引入适合监管业务的图标
import { 
  LayoutDashboard, Search, AlertTriangle, ShieldCheck, 
  ClipboardCheck, Activity, FileText, Shield,
  LogOut, ChevronDown, User, Settings
} from 'lucide-vue-next'

const router = useRouter()

// 针对监管方的专属菜单结构
const menuGroups = [
  {
    title: '动态监管与预警',
    items: [
      { name: '全链路苗种追溯', path: '/regulator/trace', icon: Search },
      { name: '风险异常预警', path: '/regulator/alerts', icon: AlertTriangle },
    ]
  },
  {
    title: '合规与稽查审查',
    items: [
      { name: '供应商资质审查', path: '/regulator/compliance/suppliers', icon: ShieldCheck },
      { name: '线下抽检档案', path: '/regulator/compliance/inspections', icon: ClipboardCheck },
    ]
  },
  {
    title: '宏观决策与报表',
    items: [
      { name: '多维成活率分析', path: '/regulator/analysis/survival', icon: Activity },
      { name: '产销全局统计表', path: '/regulator/analysis/reports', icon: FileText },
    ]
  }
]

const currentUser = ref({ name: '监管员', role: 'REGULATOR', avatar: '' })
const cachedAvatarBase64 = ref(getCachedAvatar())

const userInitial = computed(() => {
  if (currentUser.value.name && currentUser.value.name.length > 0) {
    return currentUser.value.name.charAt(0)
  }
  return '监'
})

const avatarUrl = computed(() => {
  if (cachedAvatarBase64.value) return cachedAvatarBase64.value
  if (!currentUser.value.avatar) return ''
  return '/api/' + currentUser.value.avatar
})

const roleDisplay = computed(() => {
  const roleMap = {
    'REGULATOR': '监管专员',
    'ADMIN': '系统管理员'
  }
  return roleMap[currentUser.value.role] || '监管人员'
})

// 后端状态探测逻辑
const isServerOnline = ref(true)

const checkServerHealth = async () => {
  try {
    await request.get('/test/health', { timeout: 3000 })
    isServerOnline.value = true
  } catch (error) {
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED' || (error.response && error.response.status >= 500)) {
      isServerOnline.value = false
    } else {
      isServerOnline.value = true
    }
  }
}

onMounted(() => {
  const userStr = sessionStorage.getItem('aqua_user')
  if (userStr) {
    const data = JSON.parse(userStr)
    currentUser.value = data || { name: '监管专员', role: 'REGULATOR' }
  }

  checkServerHealth()
})

const handleLogout = async () => {
  try { await request.post('/auth/logout') } catch (error) {}
  finally {
    clearUserCache()
    sessionStorage.removeItem('aqua_user')
    // 监管方通常不需要清理 farm_id，但统一清理更安全
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