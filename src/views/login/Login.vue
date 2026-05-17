<template>
  <div class="min-h-screen flex bg-slate-50 font-sans">
    
    <!-- 左侧栏：展示区 -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
      
      <!-- 动态切换的背景图 -->
      <div class="absolute inset-0 bg-slate-900">
         <img src="/farmer.png" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out" :class="currentRole === 'farmer' ? 'opacity-100' : 'opacity-0'" alt="生产与示范端背景" />
         <img src="/regulator.png" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out" :class="currentRole === 'regulator' ? 'opacity-100' : 'opacity-0'" alt="科研与监管端背景" />
         <img src="/admin.png" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out" :class="currentRole === 'admin' ? 'opacity-100' : 'opacity-0'" alt="中枢与运维端背景" />
      </div>

      <!-- 科技感遮罩层 -->
      <div class="absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ease-in-out"
           :class="{
             'from-teal-900/70 via-slate-900/40 to-slate-900/90': currentRole === 'farmer',
             'from-blue-900/80 via-slate-900/50 to-slate-900/90': currentRole === 'regulator',
             'from-slate-800/80 via-black/60 to-black/90': currentRole === 'admin'
           }">
      </div>
      
      <!-- 科技网格纹理 -->
      <div class="absolute inset-0" style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 30px 30px;"></div>

      <!-- 为文字容器增加阴影 -->
      <div class="relative z-10 text-white px-16 max-w-2xl w-full drop-shadow-2xl">
        
        <!-- 高校标识 -->
        <div class="flex items-center gap-3 mb-10 opacity-90">
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-white/20 overflow-hidden p-0.5 shadow-lg">
            <img src="/华南农业大学-logo.svg" class="w-full h-full object-contain" alt="华农校徽" />
          </div>
          <div>
            <span class="font-bold tracking-widest text-white text-sm block leading-tight">华南农业大学</span>
            <span class="text-slate-300 font-medium tracking-wider text-[10px]">智慧水产重点实验室研制</span>
          </div>
        </div>
        
        <h1 class="text-4xl font-bold mb-4 leading-tight tracking-wide flex items-center gap-3">
          <component :is="roleConfig.icon" class="w-8 h-8 drop-shadow-md" :class="roleConfig.textClass" />
          {{ roleConfig.title }}
        </h1>
        
        <!-- 动态颜色下划线 -->
        <div class="w-12 h-1 mb-6 rounded-full shadow-sm" :class="roleConfig.bgClass"></div>

        <p class="text-slate-200 text-sm leading-relaxed mb-8 max-w-md font-light tracking-wide">
          {{ roleConfig.desc }}
          系统全线接入国家部委数据规范，您的所有操作将记录于 EPCIS 底层溯源日志中。
        </p>

        <div class="flex gap-4 text-xs font-medium text-slate-300">
          <span class="flex items-center gap-1.5 border border-slate-500/50 bg-slate-800/60 backdrop-blur-sm px-3.5 py-1.5 rounded shadow-sm"><ShieldCheck class="w-4 h-4 text-emerald-400"/> 国密级全链路加密</span>
          <span class="flex items-center gap-1.5 border border-slate-500/50 bg-slate-800/60 backdrop-blur-sm px-3.5 py-1.5 rounded shadow-sm"><Activity class="w-4 h-4 text-blue-400"/> 实时运行监测中</span>
        </div>
      </div>
    </div>

    <!-- 右侧栏：表单区 -->
    <div class="w-full lg:w-1/2 flex flex-col justify-center relative bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.05)] z-20">
      
      <!-- 顶部返回条 -->
      <div class="absolute top-0 left-0 w-full h-16 flex items-center px-8 justify-between bg-white">
        <span class="text-xs font-bold text-slate-400 tracking-wider uppercase">FAMS Identity Auth</span>
        <button @click="router.push('/')" class="text-slate-400 hover:text-slate-800 flex items-center gap-1.5 text-sm font-medium transition-colors">
           <ArrowLeft class="w-4 h-4" /> 返回门户
        </button>
      </div>

      <div class="w-full max-w-sm mx-auto px-6 py-12">
        <div class="mb-10">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-colors duration-700" :class="roleConfig.lightBgClass">
             <User class="w-6 h-6 transition-colors duration-700" :class="roleConfig.textClass" />
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-1">账号登录</h2>
          <p class="text-slate-500 text-sm">请输入 {{ roleConfig.title }} 授权账号</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 账号输入框 -->
          <div>
            <label class="block text-left text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Username</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                v-model="loginForm.username"
                required
                autocomplete="username"
                @input="errorMsg = ''"
                class="block w-full text-left pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 transition-colors bg-slate-50 focus:bg-white text-sm"
                :class="roleConfig.focusClass"
                placeholder="请输入系统分配的账号"
              />
            </div>
          </div>

          <!-- 密码输入框 -->
          <div>
            <label class=" text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide flex justify-between">
              <span>Password</span>
              <a href="#" class="font-normal hover:underline transition-colors duration-700" :class="roleConfig.textClass">忘记密码？</a>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-4 w-4 text-slate-400" />
              </div>
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="loginForm.password"
                required
                autocomplete="current-password"
                @input="errorMsg = ''"
                class="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 transition-colors bg-slate-50 focus:bg-white text-sm"
                :class="roleConfig.focusClass"
                placeholder="请输入密码"
              />
              <button
                type="button"
                tabindex="-1"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                <Eye v-if="showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- 记住我 -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                v-model="loginForm.rememberUsername"
                class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
              />
              <span class="text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                记住账号
              </span>
            </label>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMsg" class="text-red-600 text-xs bg-red-50 py-2.5 px-3 border border-red-100 rounded-lg flex items-center gap-2">
             <AlertOctagon class="w-4 h-4" />
             {{ errorMsg }}
          </div>

          <!-- 动态主题色的登录按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center items-center gap-2 py-3.5 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all duration-500 hover:shadow-md"
            :class="roleConfig.btnClass"
          >
            <template v-if="loading">
              <svg class="animate-spin h-5 w-5 text-white opacity-80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              身份核验中...
            </template>
            <template v-else>
              进 入 系 统
            </template>
          </button>
        </form>

        <!-- 测试账号提示 (开发环境用) -->
        <div class="mt-10 pt-6 border-t border-slate-100">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">快捷登录测试 (Dev Only)</p>
          <div class="flex gap-2">
             <button @click="fillTestAccount('admin')" class="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded text-xs transition-colors font-medium">
                填入 Admin
             </button>
             <button @click="fillTestAccount('farmer')" class="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded text-xs transition-colors font-medium">
                填入 Farmer
             </button>
             <button @click="fillTestAccount('leader')" class="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded text-xs transition-colors font-medium">
                填入 Regulator
             </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import { User, Lock, ArrowLeft, ShieldCheck, Activity, AlertOctagon, Waves, LineChart, Cpu, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const currentRole = ref('farmer')
const errorMsg = ref('')
const showPassword = ref(false)

const loginForm = reactive({ username: '', password: '', rememberUsername: false })

const roleConfigs = {
  farmer: { 
    title: '生产与示范端', desc: '执行基地日常巡塘录入、苗种出入库调拨与边缘设备调控。',
    icon: Waves, textClass: 'text-teal-500', bgClass: 'bg-teal-500', lightBgClass: 'bg-teal-50', focusClass: 'focus:border-teal-500 focus:ring-teal-500', btnClass: 'bg-teal-600 hover:bg-teal-700'
  },
  regulator: { 
    title: '科研与监管端', desc: '宏观把控区域养殖态势，进行全链路合规审计与生长数据挖掘。',
    icon: LineChart, textClass: 'text-blue-400', bgClass: 'bg-blue-500', lightBgClass: 'bg-blue-50', focusClass: 'focus:border-blue-500 focus:ring-blue-500', btnClass: 'bg-blue-600 hover:bg-blue-700'
  },
  admin: { 
    title: '中枢与运维端', desc: '执行系统底层生物学阈值字典调优与区域账号权限指派。',
    icon: Cpu, textClass: 'text-slate-400', bgClass: 'bg-slate-500', lightBgClass: 'bg-slate-100', focusClass: 'focus:border-slate-500 focus:ring-slate-500', btnClass: 'bg-slate-800 hover:bg-slate-900'
  }
}

const roleConfig = computed(() => roleConfigs[currentRole.value] || roleConfigs.farmer)

onMounted(() => {
  // 确定界面角色 UI 优先级： 路由携带 > 最后一次登录的记录 > 默认
  const lastRole = localStorage.getItem('fams_last_role')
  if (route.query.role) {
    currentRole.value = route.query.role
  } else if (lastRole) {
    currentRole.value = lastRole
  } else {
    currentRole.value = 'farmer'
  }

  // 精准匹配：读取保存的账号对象
  const savedAccountStr = localStorage.getItem('fams_remembered_account')
  if (savedAccountStr) {
    try {
      const savedAccount = JSON.parse(savedAccountStr)
      // 只有当保存的角色和当前正在打开的页面角色一致时，才自动填入账号
      if (savedAccount.role === currentRole.value) {
        loginForm.username = savedAccount.username
        loginForm.rememberUsername = true
      }
    } catch (e) {
      localStorage.removeItem('fams_remembered_account')
    }
  }
})

// 快捷测试账号填入
const fillTestAccount = (role) => {
  loginForm.username = role
  loginForm.password = '123456' 
  errorMsg.value = ''
  
  if(role === 'admin') currentRole.value = 'admin'
  if(role === 'farmer') currentRole.value = 'farmer'
  if(role === 'leader') currentRole.value = 'regulator'
}

  // 后端的真实登录请求
const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    const res = await request.post('/auth/login', {
      username: loginForm.username,
      password: loginForm.password
    })

    // -------------------------------------------------------
    // 🎯 核心理解：Token 存在哪里？
    //
    // 后端登录成功后，自动将 Token 写入了 HttpOnly Cookie（aqua_token）。
    // HttpOnly 意味着 JavaScript 代码根本无法读取/修改这个 Cookie，
    // 浏览器会在每次同源请求中自动携带它。
    //
    // ⚡ 所以你在这里不需要、也做不到手动存 Token！
    //    只需要把用来展示昵称和头像的 user 信息存下来即可。
    // -------------------------------------------------------

    // 后端响应格式：Result<Map<String, Object>>
    // = { code: 200, message: "success", data: { user: { name, role } } }
    const { user } = res.data

    // 存用户展示信息（昵称、角色），Token 由 HttpOnly Cookie 管理
    sessionStorage.setItem('aqua_user', JSON.stringify(user))

    // 解决退出重定向问题：在登录时，无论如何都记录一下最后一次成功登录的身份界面
    localStorage.setItem('fams_last_role', currentRole.value)

    // 解决串台问题：存入对象（包含角色和账号）
    if (loginForm.rememberUsername) {
      localStorage.setItem('fams_remembered_account', JSON.stringify({
        username: loginForm.username,
        role: currentRole.value
      }))
    } else {
      localStorage.removeItem('fams_remembered_account')
    }

    // 路由分发 
    let path = '/'
    if (user.role === 'FARMER') path = '/dashboard/farmer'
    else if (user.role === 'REGULATOR') path = '/dashboard/regulator'
    else if (user.role === 'ADMIN') path = '/dashboard/admin'
    
    router.push(path)

  } catch (error) {
    errorMsg.value = error.message || '网络连接异常，请检查后端服务是否启动'
  } finally {
    loading.value = false
  }
}
</script>
