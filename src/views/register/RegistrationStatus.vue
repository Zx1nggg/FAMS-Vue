<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans relative selection:bg-teal-200 selection:text-teal-900">
    
    <!-- ================= 1. 顶部全屏背景区 (Hero Banner) ================= -->
    <div class="relative w-full h-[40vh] min-h-[360px] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
      <!-- 沉浸式背景图与遮罩 -->
      <img src="/farmer.png" @contextmenu.prevent draggable="false"
           class="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]" alt="养殖基地背景" />
      <div class="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-slate-900/60 to-slate-900/90"></div>
      <div class="absolute inset-0"
           style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 30px 30px;">
      </div>

      <!-- 顶部悬浮导航 -->
      <div class="absolute top-0 left-0 w-full h-20 flex items-center px-6 sm:px-12 justify-between z-20">
        <span class="text-sm font-bold text-white/70 tracking-widest uppercase flex items-center gap-2">
          <Fish class="w-5 h-5 text-teal-400" /> FAMS Status
        </span>
        <button @click="router.push('/')"
          class="text-teal-100 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
          <ArrowLeft class="w-4 h-4" /> 返回门户
        </button>
      </div>

      <!-- 中间标题内容 -->
      <div class="relative z-10 text-center px-4 flex flex-col items-center transform -translate-y-4">
        <div class="w-14 h-14 bg-white backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 p-2 shadow-lg mb-6">
          <img src="/智渔-logo-removebg.png" @contextmenu.prevent draggable="false" class="w-full h-full object-contain" alt="华农校徽" />
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-wide mb-4 drop-shadow-lg">
          入驻申请进度查询
        </h1>
        <p class="text-teal-100/80 text-sm sm:text-base max-w-lg font-light tracking-wide drop-shadow">
          输入您提交申请时填写的系统账号，实时获取审批状态。
        </p>
      </div>
    </div>

    <!-- ================= 2. 中间悬浮查询卡片 (跨越天际线) ================= -->
    <div class="relative z-20 flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 -mt-20 mb-12">
      <div class="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-6 sm:p-10 flex flex-col">
        
        <!-- 搜索输入组 -->
        <div class="w-full max-w-xl mx-auto">
          <label class="block text-center text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">
            请输入申请账号
          </label>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User class="h-5 w-5 text-slate-400" />
              </div>
              <input type="tel" v-model="queryPhone" @keyup.enter="queryStatus"
                class="block w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-base bg-slate-50 focus:bg-white"
                placeholder="请输入注册时填写的手机号" />
            </div>
            <button @click="queryStatus" :disabled="!queryPhone || querying"
              class="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap">
              <Loader2 v-if="querying" class="w-5 h-5 animate-spin" />
              <Search v-else class="w-5 h-5" />
              立 即 查 询
            </button>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMsg" class="mt-4 text-red-600 text-sm bg-red-50 py-3 px-4 border border-red-100 rounded-xl flex items-center gap-2 justify-center animate-in fade-in zoom-in-95 duration-300">
            <AlertOctagon class="w-4 h-4 shrink-0" />
            {{ errorMsg }}
          </div>
        </div>

        <!-- 分割线 -->
        <div class="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-10 opacity-60"></div>

        <!-- ================= 3. 查询结果展示区 ================= -->
        <div class="w-full max-w-xl mx-auto flex-1 flex flex-col justify-center min-h-[200px]">
          
          <!-- 默认占位图 (无结果且未查询时) -->
          <div v-if="!result && !notFound && !justSubmitted" class="text-center opacity-40 grayscale flex flex-col items-center">
            <Search class="w-16 h-16 text-slate-300 mb-4" />
            <p class="text-slate-400 text-sm">暂无查询数据，请在上方的输入框中输入账号进行检索。</p>
          </div>

          <!-- 提交成功提示 (从注册页跳转过来) -->
          <div v-if="justSubmitted"
            class="mb-6 py-4 px-5 bg-teal-50 border border-teal-200 rounded-xl flex items-start sm:items-center gap-3 text-teal-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CheckCircle class="w-6 h-6 text-teal-500 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p class="font-bold text-base mb-0.5">入驻申请已成功提交！</p>
              <p class="text-sm text-teal-600">请记好您的账号信息，等待管理员审核。您也可以在此页面随时跟进进度。</p>
            </div>
          </div>

          <!-- 状态：待审批 -->
          <div v-if="result && result.status === 0"
            class="bg-white border-2 border-amber-100 rounded-2xl p-8 text-center shadow-sm relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div class="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 mb-4 ring-4 ring-amber-50/50">
              <Clock class="w-10 h-10 text-amber-500" />
            </div>
            <h3 class="text-2xl font-extrabold text-amber-800 mb-2">审核中</h3>
            <p class="text-amber-600 text-sm mb-6">您的入驻申请正在由系统管理员进行核查</p>
            
            <div class="bg-amber-50/50 rounded-xl p-4 text-left space-y-2 border border-amber-100">
              <div class="flex justify-between items-center text-sm border-b border-amber-100 pb-2">
                <span class="text-amber-700/70">申请账号</span>
                <span class="font-mono font-bold text-amber-900">{{ result.phone }}</span>
              </div>
              <div class="flex justify-between items-center text-sm pt-1">
                <span class="text-amber-700/70">提交时间</span>
                <span class="text-amber-900 font-medium">{{ formatTime(result.createdAt) }}</span>
              </div>
            </div>
            <p class="text-slate-400 text-xs mt-6">预计审核周期：1-3 个工作日</p>
          </div>

          <!-- 状态：已通过 -->
          <div v-else-if="result && result.status === 1"
            class="bg-white border-2 border-emerald-100 rounded-2xl p-8 text-center shadow-[0_8px_30px_rgba(16,185,129,0.1)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div class="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 mb-4 ring-4 ring-emerald-50/50">
              <CheckCircle class="w-10 h-10 text-emerald-500" />
            </div>
            <h3 class="text-2xl font-extrabold text-emerald-800 mb-2">审批已通过 🎉</h3>
            <p class="text-emerald-600 text-sm mb-6">恭喜！您的养殖场已成功接入智渔平台</p>
            
            <div class="bg-emerald-50/50 rounded-xl p-4 text-left space-y-2 border border-emerald-100 mb-6">
              <div class="flex justify-between items-center text-sm border-b border-emerald-100/50 pb-2">
                <span class="text-emerald-700/70">登入账号</span>
                <span class="font-mono font-bold text-emerald-900">{{ result.phone }}</span>
              </div>
              <div v-if="result.reviewedAt" class="flex justify-between items-center text-sm border-b border-emerald-100/50 py-2">
                <span class="text-emerald-700/70">通过时间</span>
                <span class="text-emerald-900 font-medium">{{ formatTime(result.reviewedAt) }}</span>
              </div>
              <div v-if="result.reviewComment" class="text-sm pt-2">
                <span class="block text-emerald-700/70 mb-1">审批意见：</span>
                <span class="text-emerald-900 bg-white px-3 py-2 rounded-lg block border border-emerald-100">{{ result.reviewComment }}</span>
              </div>
            </div>
            <router-link to="/login?role=farmer"
              class="inline-flex items-center justify-center w-full gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
              前往控制台登录 <ArrowRight class="w-4 h-4" />
            </router-link>
          </div>

          <!-- 状态：已拒绝 -->
          <div v-else-if="result && result.status === 2"
            class="bg-white border-2 border-rose-100 rounded-2xl p-8 text-center shadow-sm relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div class="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 mb-4 ring-4 ring-rose-50/50">
              <XCircle class="w-10 h-10 text-rose-500" />
            </div>
            <h3 class="text-2xl font-extrabold text-rose-800 mb-2">申请未通过</h3>
            <p class="text-rose-600 text-sm mb-6">很抱歉，您的入驻申请未能满足相关要求</p>
            
            <div class="bg-rose-50/50 rounded-xl p-4 text-left space-y-2 border border-rose-100 mb-6">
              <div class="flex justify-between items-center text-sm border-b border-rose-100/50 pb-2">
                <span class="text-rose-700/70">申请账号</span>
                <span class="font-mono font-bold text-rose-900">{{ result.phone }}</span>
              </div>
              <div v-if="result.reviewComment" class="text-sm border-b border-rose-100/50 py-2">
                <span class="block text-rose-700/70 mb-1">驳回原因：</span>
                <span class="text-rose-600 font-bold bg-white px-3 py-2 rounded-lg block border border-rose-100">{{ result.reviewComment }}</span>
              </div>
              <div v-if="result.reviewedAt" class="flex justify-between items-center text-sm pt-2">
                <span class="text-rose-700/70">处理时间</span>
                <span class="text-rose-900 font-medium">{{ formatTime(result.reviewedAt) }}</span>
              </div>
            </div>
            <router-link to="/register"
              class="inline-flex items-center justify-center w-full gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-md">
              <RefreshCw class="w-4 h-4" /> 重新填写申请资料
            </router-link>
          </div>

          <!-- 状态：未找到 -->
          <div v-if="notFound"
            class="bg-white border-2 border-slate-200 border-dashed rounded-2xl p-10 text-center animate-in fade-in zoom-in-95 duration-500">
            <SearchX class="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 class="text-lg font-bold text-slate-700 mb-1">未找到相关记录</h3>
            <p class="text-slate-500 text-sm mb-6">请核对账号拼写是否正确，或该账号已被彻底删除。</p>
            <router-link to="/register" class="inline-block px-6 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-xl transition-colors border border-teal-200">
              前往提交新申请
            </router-link>
          </div>

        </div>
      </div>
      
      <!-- 底部返回链接 -->
      <div class="mt-8 text-center">
        <router-link to="/login" class="text-slate-500 hover:text-teal-600 font-medium transition-colors flex items-center justify-center gap-1.5">
          <ArrowLeft class="w-4 h-4" /> 返回账号登录页
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import {
  ArrowLeft, ArrowRight, Search, SearchX, Clock, CheckCircle, XCircle,
  RefreshCw, AlertOctagon, Loader2, Fish, User
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const queryPhone = ref('')
const querying = ref(false)
const result = ref(null)
const notFound = ref(false)
const errorMsg = ref('')
const justSubmitted = ref(false)

onMounted(() => {
  // 如果是从注册页跳转过来，自动查询
  const phone = route.query.phone
  const submitted = route.query.submitted
  if (phone) {
    queryPhone.value = phone
    justSubmitted.value = submitted === '1'
    queryStatus()
  }
})

const queryStatus = async () => {
  if (!queryPhone.value.trim()) return
  querying.value = true
  errorMsg.value = ''
  result.value = null
  notFound.value = false

  try {
    const res = await request.get('/auth/registration-status', {
      params: { phone: queryPhone.value.trim() }
    })
    result.value = res.data
    // 查询出结果后，隐藏“刚才已提交”的提示
    justSubmitted.value = false 
  } catch (error) {
    if (error.message && error.message.includes('404')) {
      notFound.value = true
    } else {
      errorMsg.value = error.message || '查询失败，请检查网络或稍后重试'
    }
  } finally {
    querying.value = false
  }
}

const formatTime = (time) => {
  if (!time) return '--'
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<style scoped>
/* 使用简单的动画增强反馈感 */
@keyframes in-zoom {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-in {
  animation: in-zoom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>