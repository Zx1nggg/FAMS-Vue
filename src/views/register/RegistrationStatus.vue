<template>
  <div class="min-h-screen flex bg-slate-50 font-sans">

    <!-- 左侧栏：品牌展示区 -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
      <div class="absolute inset-0 bg-slate-900">
        <img src="/farmer.png" @contextmenu.prevent draggable="false"
          class="absolute inset-0 w-full h-full object-cover opacity-40" alt="养殖基地背景" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-slate-900/50 to-slate-900/90"></div>
      <div class="absolute inset-0"
        style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 30px 30px;">
      </div>

      <div class="relative z-10 text-white px-16 max-w-2xl w-full drop-shadow-2xl">
        <div class="flex items-center gap-3 mb-10 opacity-90">
          <div
            class="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-white/20 overflow-hidden p-0.5 shadow-lg">
            <img src="/华南农业大学-logo.svg" class="w-full h-full object-contain" alt="华农校徽" />
          </div>
          <div>
            <span class="font-bold tracking-widest text-white text-sm block leading-tight">华南农业大学</span>
            <span class="text-slate-300 font-medium tracking-wider text-[10px]">智慧水产重点实验室研制</span>
          </div>
        </div>

        <h1 class="text-4xl font-bold mb-4 leading-tight tracking-wide">申请进度查询</h1>
        <div class="w-12 h-1 mb-6 rounded-full shadow-sm bg-teal-500"></div>
        <p class="text-slate-200 text-sm leading-relaxed mb-8 max-w-md font-light tracking-wide">
          输入您申请时填写的账号，即可查询入驻申请的审批进度。
        </p>
      </div>
    </div>

    <!-- 右侧栏：查询区域 -->
    <div class="w-full lg:w-1/2 flex flex-col justify-center relative bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.05)] z-20">
      <!-- 顶部返回条 -->
      <div class="absolute top-0 left-0 w-full h-16 flex items-center px-8 justify-between bg-white">
        <span class="text-xs font-bold text-slate-400 tracking-wider uppercase">FAMS Status</span>
        <button @click="router.push('/')"
          class="text-slate-400 hover:text-slate-800 flex items-center gap-1.5 text-sm font-medium transition-colors">
          <ArrowLeft class="w-4 h-4" /> 返回门户
        </button>
      </div>

      <div class="w-full max-w-md mx-auto px-6 py-12 mt-8">
        <div class="mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-teal-50">
            <Search class="w-6 h-6 text-teal-600" />
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-1">申请进度查询</h2>
          <p class="text-slate-500 text-sm">输入申请时的账号查看审批状态</p>
        </div>

        <!-- 查询输入框 -->
        <div class="space-y-4">
          <div>
            <label class="block text-left text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              申请账号
            </label>
            <div class="flex gap-2">
              <input type="text" v-model="queryUsername" @keyup.enter="queryStatus"
                class="flex-1 pl-3 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:border-teal-500 focus:ring-teal-100 transition-colors text-sm"
                placeholder="请输入申请时填写的账号" />
              <button @click="queryStatus" :disabled="!queryUsername || querying"
                class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
                <Loader2 v-if="querying" class="w-4 h-4 animate-spin" />
                <Search v-else class="w-4 h-4" />
                查询
              </button>
            </div>
          </div>

          <!-- 查询结果 -->
          <div v-if="result" class="mt-6">

            <!-- 提交成功提示 (从注册页跳转过来) -->
            <div v-if="justSubmitted"
              class="mb-4 py-3 px-4 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-2 text-sm text-teal-700">
              <CheckCircle class="w-5 h-5 text-teal-500 shrink-0" />
              入驻申请已成功提交！请记好您的账号信息，等待管理员审核。
            </div>

            <!-- 状态：待审批 -->
            <div v-if="result.status === 0"
              class="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <Clock class="w-8 h-8 text-amber-600" />
              </div>
              <h3 class="text-lg font-bold text-amber-800 mb-2">审核中</h3>
              <p class="text-amber-600 text-sm mb-1">您的入驻申请正在审核中</p>
              <p class="text-amber-500 text-xs">账号：<span class="font-mono font-bold">{{ result.username }}</span></p>
              <p class="text-amber-400 text-xs mt-2">提交时间：{{ formatTime(result.createdAt) }}</p>
              <p class="text-slate-400 text-xs mt-4">请耐心等待，管理员将在 1-3 个工作日内完成审核</p>
            </div>

            <!-- 状态：已通过 -->
            <div v-else-if="result.status === 1"
              class="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                <CheckCircle class="w-8 h-8 text-emerald-600" />
              </div>
              <h3 class="text-lg font-bold text-emerald-800 mb-2">审批已通过 🎉</h3>
              <p class="text-emerald-600 text-sm mb-4">恭喜！您的入驻申请已通过审核</p>
              <div class="bg-white rounded-lg p-3 mb-4 text-left text-sm space-y-1">
                <p class="text-slate-500"><span class="font-medium text-slate-700">账号：</span>{{ result.username }}</p>
                <p v-if="result.reviewedAt" class="text-slate-500"><span class="font-medium text-slate-700">审批时间：</span>{{
                  formatTime(result.reviewedAt) }}</p>
                <p v-if="result.reviewComment" class="text-slate-500"><span class="font-medium text-slate-700">审批意见：</span>{{
                  result.reviewComment }}</p>
              </div>
              <router-link to="/login?role=farmer"
                class="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-sm">
                前往登录 <ArrowRight class="w-4 h-4" />
              </router-link>
            </div>

            <!-- 状态：已拒绝 -->
            <div v-else-if="result.status === 2"
              class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <XCircle class="w-8 h-8 text-red-600" />
              </div>
              <h3 class="text-lg font-bold text-red-800 mb-2">申请被拒绝</h3>
              <p class="text-red-600 text-sm mb-1">很遗憾，您的入驻申请未被通过</p>
              <div class="bg-white rounded-lg p-3 mt-3 text-left text-sm space-y-1">
                <p class="text-slate-500"><span class="font-medium text-slate-700">账号：</span>{{ result.username }}</p>
                <p v-if="result.reviewComment" class="text-slate-500">
                  <span class="font-medium text-slate-700">拒绝原因：</span>
                  <span class="text-red-600">{{ result.reviewComment }}</span>
                </p>
                <p v-if="result.reviewedAt" class="text-slate-500"><span class="font-medium text-slate-700">处理时间：</span>{{
                  formatTime(result.reviewedAt) }}</p>
              </div>
              <router-link to="/register"
                class="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors text-sm">
                <RefreshCw class="w-4 h-4" /> 重新提交申请
              </router-link>
            </div>

          </div>

          <!-- 未找到 -->
          <div v-if="notFound"
            class="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center mt-6">
            <SearchX class="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500 text-sm">未找到该账号的申请记录</p>
            <p class="text-slate-400 text-xs mt-1">请确认账号是否正确，或前往提交入驻申请</p>
            <router-link to="/register"
              class="mt-3 inline-block text-teal-600 hover:underline text-sm font-medium">立即申请入驻</router-link>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMsg"
            class="text-red-600 text-xs bg-red-50 py-2.5 px-3 border border-red-100 rounded-lg flex items-center gap-2 mt-4">
            <AlertOctagon class="w-4 h-4" />
            {{ errorMsg }}
          </div>
        </div>

        <!-- 底部链接 -->
        <p class="text-center text-sm text-slate-400 mt-8 pt-4 border-t border-slate-100">
          <router-link to="/login" class="text-teal-600 hover:underline font-medium">返回登录</router-link>
        </p>
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
  RefreshCw, AlertOctagon, Loader2
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const queryUsername = ref('')
const querying = ref(false)
const result = ref(null)
const notFound = ref(false)
const errorMsg = ref('')
const justSubmitted = ref(false)

onMounted(() => {
  // 如果是从注册页跳转过来，自动查询
  const username = route.query.username
  const submitted = route.query.submitted
  if (username) {
    queryUsername.value = username
    justSubmitted.value = submitted === '1'
    queryStatus()
  }
})

const queryStatus = async () => {
  if (!queryUsername.value.trim()) return
  querying.value = true
  errorMsg.value = ''
  result.value = null
  notFound.value = false

  try {
    const res = await request.get('/auth/registration-status', {
      params: { username: queryUsername.value.trim() }
    })
    result.value = res.data
  } catch (error) {
    if (error.message && error.message.includes('404')) {
      notFound.value = true
    } else {
      errorMsg.value = error.message || '查询失败，请稍后重试'
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
