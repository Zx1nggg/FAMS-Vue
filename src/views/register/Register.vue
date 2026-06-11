<template>
  <div class="min-h-screen flex bg-slate-50 font-sans">

    <!-- 左侧栏：品牌展示区 -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
      <div class="absolute inset-0 bg-slate-900">
        <img src="/register.png" @contextmenu.prevent draggable="false"
          class="absolute inset-0 w-full h-full object-cover opacity-60" alt="养殖基地背景" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-slate-900/50 to-slate-900/90"></div>
      <div class="absolute inset-0"
        style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 30px 30px;">
      </div>

      <div class="relative z-10 text-white px-16 max-w-2xl w-full drop-shadow-2xl">
        <div class="flex items-center gap-3 mb-10 opacity-90">
          <div
            class="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-white/20 overflow-hidden p-0.5 shadow-lg">
            <img src="/华南农业大学-logo.svg" @contextmenu.prevent draggable="false" class="w-full h-full object-contain" alt="华农校徽" />
          </div>
          <div>
            <span class="font-bold tracking-widest text-white text-sm block leading-tight">华南农业大学</span>
            <span class="text-slate-300 font-medium tracking-wider text-[10px]">智慧水产重点实验室研制</span>
          </div>
        </div>

        <h1 class="text-4xl font-bold mb-4 leading-tight tracking-wide flex items-center gap-3">
          <Warehouse class="w-8 h-8 drop-shadow-md text-teal-400" />
          养殖基地入驻申请
        </h1>
        <div class="w-12 h-1 mb-6 rounded-full shadow-sm bg-teal-500"></div>
        <p class="text-slate-200 text-sm leading-relaxed mb-8 max-w-md font-light tracking-wide">
          填写以下信息提交入驻申请，管理员审核通过后即可登录系统。
          请确保填写真实的养殖场信息，以便后续接入物联网设备与数据溯源。
        </p>
        <div class="flex gap-4 text-xs font-medium text-slate-300">
          <span
            class="flex items-center gap-1.5 border border-slate-500/50 bg-slate-800/60 backdrop-blur-sm px-3.5 py-1.5 rounded shadow-sm"><ShieldCheck
              class="w-4 h-4 text-emerald-400" /> 信息加密传输</span>
          <span
            class="flex items-center gap-1.5 border border-slate-500/50 bg-slate-800/60 backdrop-blur-sm px-3.5 py-1.5 rounded shadow-sm"><Clock
              class="w-4 h-4 text-blue-400" /> 1-3个工作日内审核</span>
        </div>
      </div>
    </div>

    <!-- 右侧栏：入驻申请表单 -->
    <div class="w-full lg:w-1/2 flex flex-col justify-center relative bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.05)] z-20">
      <!-- 顶部返回条 -->
      <div class="absolute top-0 left-0 w-full h-16 flex items-center px-8 justify-between bg-white">
        <span class="text-xs font-bold text-slate-400 tracking-wider uppercase">FAMS Registration</span>
        <button @click="router.push('/')"
          class="text-slate-400 hover:text-slate-800 flex items-center gap-1.5 text-sm font-medium transition-colors">
          <ArrowLeft class="w-4 h-4" /> 返回门户
        </button>
      </div>

      <div class="w-full max-w-lg mx-auto px-6 py-12 mt-8">
        <div class="mb-8">
          <div
            class="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-teal-50 transition-colors duration-700">
            <UserPlus class="w-6 h-6 text-teal-600" />
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-1">填写入驻信息</h2>
          <p class="text-slate-500 text-sm">请如实填写以下信息，以便快速通过审核</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <!-- ========== 账号信息 ========== -->
          <fieldset class="border border-slate-200 rounded-xl p-4">
            <legend class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">账号信息</legend>
            <div class="space-y-4">
              <!-- 手机号（登录账号） -->
              <div>
                <label class="block text-left text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  手机号 <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input type="tel" v-model="form.phone" required autocomplete="tel" @blur="checkPhone"
                    @input="phoneAvailable = null"
                    maxlength="11"
                    class="block w-full pl-3 pr-10 py-2.5 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 transition-colors text-sm"
                    :class="phoneBorderClass" placeholder="请输入11位手机号（用于登录）" />
                  <div v-if="checkingPhone" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Loader2 class="w-4 h-4 text-slate-400 animate-spin" />
                  </div>
                  <div v-else-if="phoneAvailable === true"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle class="w-4 h-4 text-emerald-500" />
                  </div>
                  <div v-else-if="phoneAvailable === false"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <XCircle class="w-4 h-4 text-red-500" />
                  </div>
                </div>
                <p v-if="phoneAvailable === false" class="text-xs text-red-500 mt-1">该手机号已被注册或正在审核中</p>
                <p v-else-if="phoneAvailable === true" class="text-xs text-emerald-600 mt-1">该手机号可用</p>
              </div>

              <!-- 密码 -->
              <div>
                <label class="block text-left text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  登录密码 <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input :type="showPassword ? 'text' : 'password'" v-model="form.password" required autocomplete="new-password"
                    class="block w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:border-teal-500 focus:ring-teal-100 transition-colors text-sm"
                    placeholder="请输入密码（至少6位）" />
                  <button type="button" tabindex="-1" @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                    <Eye v-if="showPassword" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- 确认密码 -->
              <div>
                <label class="block text-left text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  确认密码 <span class="text-red-500">*</span>
                </label>
                <input :type="showPassword ? 'text' : 'password'" v-model="confirmPassword" required
                  autocomplete="new-password"
                  class="block w-full pl-3 pr-3 py-2.5 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 transition-colors text-sm"
                  :class="confirmPasswordClass" placeholder="请再次输入密码" />
                <p v-if="confirmPassword && form.password !== confirmPassword" class="text-xs text-red-500 mt-1">
                  两次输入的密码不一致</p>
              </div>
            </div>
          </fieldset>

          <!-- ========== 个人信息 ========== -->
          <fieldset class="border border-slate-200 rounded-xl p-4">
            <legend class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">个人信息</legend>
            <div class="space-y-4">
              <div>
                <label class="block text-left text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  真实姓名 <span class="text-red-500">*</span>
                </label>
                <input type="text" v-model="form.realName" required
                  class="block w-full pl-3 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:border-teal-500 focus:ring-teal-100 transition-colors text-sm"
                  placeholder="请输入您的真实姓名" />
              </div>
              <div>
                <label class="block text-left text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  电子邮箱
                </label>
                <input type="email" v-model="form.email"
                  class="block w-full pl-3 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:border-teal-500 focus:ring-teal-100 transition-colors text-sm"
                  placeholder="email@example.com" />
              </div>
            </div>
          </fieldset>

          <!-- ========== 养殖场信息 ========== -->
          <fieldset class="border border-slate-200 rounded-xl p-4">
            <legend class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">养殖场信息</legend>
            <div class="space-y-4">
              <div>
                <label class="block text-left text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  养殖场名称 <span class="text-red-500">*</span>
                </label>
                <input type="text" v-model="form.farmName" required
                  class="block w-full pl-3 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:border-teal-500 focus:ring-teal-100 transition-colors text-sm"
                  placeholder="如：顺德一区水产养殖基地" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-left text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    所属省份
                  </label>
                  <input type="text" v-model="form.farmProvince"
                    class="block w-full pl-3 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:border-teal-500 focus:ring-teal-100 transition-colors text-sm"
                    placeholder="如：广东省" />
                </div>
                <div>
                  <label class="block text-left text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    所属城市
                  </label>
                  <input type="text" v-model="form.farmCity"
                    class="block w-full pl-3 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:border-teal-500 focus:ring-teal-100 transition-colors text-sm"
                    placeholder="如：佛山市" />
                </div>
              </div>
              <div>
                <label class="block text-left text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  详细地址
                </label>
                <input type="text" v-model="form.farmAddress"
                  class="block w-full pl-3 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:border-teal-500 focus:ring-teal-100 transition-colors text-sm"
                  placeholder="如：佛山市顺德区XX镇XX路XX号" />
              </div>
            </div>
          </fieldset>

          <!-- ========== 申请理由 ========== -->
          <fieldset class="border border-slate-200 rounded-xl p-4">
            <legend class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">补充说明</legend>
            <div>
              <textarea v-model="form.applicationReason" rows="3"
                class="block w-full pl-3 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:border-teal-500 focus:ring-teal-100 transition-colors text-sm resize-none"
                placeholder="请简要说明您的养殖规模、主要品种及入驻需求（选填）"></textarea>
            </div>
          </fieldset>

          <!-- 错误提示 -->
          <div v-if="errorMsg"
            class="text-red-600 text-xs bg-red-50 py-2.5 px-3 border border-red-100 rounded-lg flex items-center gap-2">
            <AlertOctagon class="w-4 h-4" />
            {{ errorMsg }}
          </div>

          <!-- 提交按钮 -->
          <button type="submit" :disabled="loading || !isFormValid"
            class="w-full flex justify-center items-center gap-2 py-3.5 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all duration-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-teal-600 hover:bg-teal-700">
            <template v-if="loading">
              <Loader2 class="animate-spin h-5 w-5 text-white opacity-80" />
              正在提交申请...
            </template>
            <template v-else>
               提交入驻申请
            </template>
          </button>
        </form>

        <!-- 底部链接 -->
        <p class="text-center text-sm text-slate-400 mt-6 pt-4 border-t border-slate-100">
          已有账号？
          <router-link to="/login" class="text-teal-600 hover:underline font-medium">返回登录</router-link>
          <span class="mx-2">|</span>
          <router-link to="/register/status" class="text-teal-600 hover:underline font-medium">查询申请状态</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import {
  ArrowLeft, UserPlus, ShieldCheck, Clock, Eye, EyeOff,
  AlertOctagon, Loader2, CheckCircle, XCircle, Warehouse
} from 'lucide-vue-next'

const router = useRouter()

const loading = ref(false)
const showPassword = ref(false)
const errorMsg = ref('')
const confirmPassword = ref('')
const checkingPhone = ref(false)
const phoneAvailable = ref(null)

const form = reactive({
  phone: '',
  password: '',
  realName: '',
  email: '',
  farmName: '',
  farmProvince: '',
  farmCity: '',
  farmAddress: '',
  applicationReason: ''
})

// 手机号格式校验（中国手机号规则）
const phoneRegex = /^1[3-9]\d{9}$/
const isPhoneValid = computed(() => {
  if (!form.phone) return false
  return phoneRegex.test(form.phone)
})

// 手机号输入框边框颜色
const phoneBorderClass = computed(() => {
  if (phoneAvailable.value === true) return 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100'
  if (phoneAvailable.value === false) return 'border-red-400 focus:border-red-500 focus:ring-red-100'
  if (!form.phone) return 'border-slate-200 focus:border-teal-500 focus:ring-teal-100'
  return isPhoneValid.value
    ? 'border-slate-200 focus:border-teal-500 focus:ring-teal-100'
    : 'border-red-400 focus:border-red-500 focus:ring-red-100'
})

// 确认密码输入框边框颜色
const confirmPasswordClass = computed(() => {
  if (!confirmPassword.value) return 'border-slate-200 focus:border-teal-500 focus:ring-teal-100'
  return form.password === confirmPassword.value
    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100'
    : 'border-red-400 focus:border-red-500 focus:ring-red-100'
})

// 表单是否有效
const isFormValid = computed(() => {
  if (!form.phone || !isPhoneValid.value || !form.password || !form.realName || !form.farmName) return false
  if (form.password !== confirmPassword.value) return false
  if (phoneAvailable.value === false) return false
  return true
})

// 检查手机号可用性
let checkTimer = null
const checkPhone = () => {
  if (!form.phone || !isPhoneValid.value) {
    phoneAvailable.value = null
    return
  }
  clearTimeout(checkTimer)
  checkTimer = setTimeout(async () => {
    checkingPhone.value = true
    try {
      const res = await request.get('/auth/check-phone', { params: { phone: form.phone } })
      phoneAvailable.value = res.data.available
    } catch {
      phoneAvailable.value = null
    } finally {
      checkingPhone.value = false
    }
  }, 500)
}

// 提交入驻申请
const handleSubmit = async () => {
  if (!isFormValid.value) return
  loading.value = true
  errorMsg.value = ''

  try {
    await request.post('/auth/register', form)
    // 提交成功，跳转到成功提示页（用手机号查询进度）
    router.push({
      path: '/register/status',
      query: { phone: form.phone, submitted: '1' }
    })
  } catch (error) {
    errorMsg.value = error.message || '网络连接异常，请检查后端服务是否启动'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
.custom-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: thin;
}
</style>
