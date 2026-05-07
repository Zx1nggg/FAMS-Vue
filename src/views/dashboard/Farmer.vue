<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    
    <!-- 顶部导航栏 -->
    <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <div class="bg-teal-600 p-1.5 rounded-lg">
          <Fish class="w-6 h-6 text-white" />
        </div>
        <span class="font-bold text-xl tracking-wide text-gray-800">智渔 <span class="text-teal-600">FAMS</span></span>
        <span class="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full ml-2 font-medium border border-emerald-200">运行中</span>
      </div>
      
      <div class="flex items-center gap-6 text-sm">
        <div class="flex items-center gap-2 text-gray-500">
          <Clock class="w-4 h-4" />
          <span>{{ currentTime }}</span>
        </div>
        <div class="h-6 w-px bg-gray-200"></div>
        <div class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <div class="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
            {{ userInitial }}
          </div>
          <div class="flex flex-col">
            <span class="font-semibold text-gray-700 leading-none mb-1">{{ currentUser.name }}</span>
            <span class="text-xs text-gray-500 leading-none">{{ currentUser.role === 'ADMIN' ? '系统管理员' : '养殖场主' }}</span>
          </div>
        </div>
        <button @click="handleLogout" class="text-gray-400 hover:text-red-500 transition-colors" title="退出登录">
          <LogOut class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- 主体内容区 -->
    <main class="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">工作台概览</h1>
          <p class="text-sm text-gray-500 mt-1">欢迎回来，以下是您的生物资产与水质实时监控数据。</p>
        </div>
        <div class="flex gap-3">
          <button class="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <RefreshCw class="w-4 h-4" /> 刷新数据
          </button>
          <button class="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm">
            <Plus class="w-4 h-4" /> 录入巡塘记录
          </button>
        </div>
      </div>

      <!-- 核心 IoT 数据卡片 (数字孪生模拟) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- 水温 -->
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div class="flex justify-between items-start relative z-10">
            <div>
              <p class="text-gray-500 text-sm font-medium mb-1">1号池 · 实时水温</p>
              <div class="flex items-baseline gap-2">
                <h3 class="text-3xl font-bold text-gray-800">28.5</h3>
                <span class="text-gray-500 font-medium">°C</span>
              </div>
            </div>
            <div class="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Thermometer class="w-6 h-6" />
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2 text-sm text-emerald-600 relative z-10">
            <TrendingUp class="w-4 h-4" />
            <span>较昨日同期 +0.2°C</span>
          </div>
        </div>

        <!-- 溶氧量 (重点监控指标) -->
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div class="flex justify-between items-start relative z-10">
            <div>
              <p class="text-gray-500 text-sm font-medium mb-1">1号池 · 溶解氧 (DO)</p>
              <div class="flex items-baseline gap-2">
                <h3 class="text-3xl font-bold text-gray-800">6.8</h3>
                <span class="text-gray-500 font-medium">mg/L</span>
              </div>
            </div>
            <div class="p-3 bg-teal-100 text-teal-600 rounded-xl">
              <Waves class="w-6 h-6" />
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2 text-sm text-emerald-600 relative z-10">
            <CheckCircle2 class="w-4 h-4" />
            <span>水质优良，溶氧充足</span>
          </div>
        </div>

        <!-- PH值 -->
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div class="flex justify-between items-start relative z-10">
            <div>
              <p class="text-gray-500 text-sm font-medium mb-1">1号池 · pH 值</p>
              <div class="flex items-baseline gap-2">
                <h3 class="text-3xl font-bold text-gray-800">7.5</h3>
              </div>
            </div>
            <div class="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <Droplet class="w-6 h-6" />
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2 text-sm text-gray-500 relative z-10">
            <Minus class="w-4 h-4" />
            <span>平稳，无异常波动</span>
          </div>
        </div>
      </div>

      <!-- 图表与消息面板区 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- 左侧：成活率与生长曲线 (ECharts) -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Activity class="w-5 h-5 text-teal-600" /> 
              批次生长与成活率追踪
            </h2>
            <select class="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2 outline-none">
              <option>批次 B-20260428 (南美白对虾)</option>
              <option>批次 B-20260315 (罗非鱼)</option>
            </select>
          </div>
          <!-- ECharts 容器 -->
          <div ref="chartRef" class="w-full h-80"></div>
        </div>

        <!-- 右侧：预警与动态日志 -->
        <div class="space-y-6">
          <!-- 实时告警面板 -->
          <div class="bg-white rounded-2xl border border-red-100 shadow-sm p-6 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle class="w-5 h-5 text-red-500" /> 
              异常监控中心
            </h2>
            <div class="space-y-4">
              <div class="bg-red-50 rounded-xl p-4 border border-red-100">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-sm font-bold text-red-700">溶氧量偏低告警</span>
                  <span class="text-xs text-red-500 bg-red-100 px-2 py-0.5 rounded">未处理</span>
                </div>
                <p class="text-xs text-red-600 leading-relaxed mb-3">
                  监测到 2号池 溶氧量降至 <span class="font-bold">3.2 mg/L</span>，低于安全阈值，请及时开启增氧机。
                </p>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-red-400">10分钟前</span>
                  <button class="text-red-700 hover:text-red-800 font-medium hover:underline">去处理</button>
                </div>
              </div>
              
              <!-- 历史已处理消息 -->
              <div class="flex gap-3 items-start opacity-60">
                <div class="mt-1 w-2 h-2 rounded-full bg-gray-300"></div>
                <div>
                  <p class="text-sm font-medium text-gray-700">3号池水温偏高预警</p>
                  <p class="text-xs text-gray-500 mt-1">2小时前 · 系统已自动记录</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 快速入口 -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-4">快捷操作</h2>
            <div class="grid grid-cols-2 gap-3">
              <button class="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-colors border border-transparent hover:border-teal-100 group text-gray-600">
                <Box class="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span class="text-sm font-medium">采购入库</span>
              </button>
              <button class="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors border border-transparent hover:border-emerald-100 group text-gray-600">
                <MapPin class="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span class="text-sm font-medium">投放登记</span>
              </button>
              <button class="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors border border-transparent hover:border-blue-100 group text-gray-600">
                <Stethoscope class="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span class="text-sm font-medium">用药记录</span>
              </button>
              <button class="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-colors border border-transparent hover:border-orange-100 group text-gray-600">
                <Truck class="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span class="text-sm font-medium">养殖出塘</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
// 图标组件
import { 
  Fish, LogOut, Clock, Thermometer, Waves, Droplet, 
  TrendingUp, CheckCircle2, Minus, AlertTriangle, 
  Activity, RefreshCw, Plus, Box, MapPin, Stethoscope, Truck
} from 'lucide-vue-next'

const router = useRouter()
const chartRef = ref(null)
let chartInstance = null

// 从 localStorage 获取登录用户信息
const currentUser = ref({ name: '游客', role: 'UNKNOWN' })
const userInitial = computed(() => currentUser.value.name.charAt(0))
const currentTime = ref('')

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('aqua_token')
  localStorage.removeItem('aqua_user')
  router.push('/login')
}

// 初始化 ECharts (体现农业大数据的灵魂)
const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['平均体重 (g)', '存活率 (%)'], bottom: 0 },
    grid: { left: '3%', right: '3%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周'],
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '体重(g)',
        position: 'left',
        axisLine: { show: true, lineStyle: { color: '#14b8a6' } }, // Teal-500
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } }
      },
      {
        type: 'value',
        name: '存活率(%)',
        min: 80,
        max: 100,
        position: 'right',
        axisLine: { show: true, lineStyle: { color: '#f59e0b' } }, // Amber-500
        axisLabel: { color: '#6b7280' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '平均体重 (g)',
        type: 'bar',
        yAxisIndex: 0,
        data: [2.5, 4.8, 8.2, 14.5, 22.0, 31.5, 42.0],
        itemStyle: { color: '#2dd4bf', borderRadius: [4, 4, 0, 0] } // Teal-400
      },
      {
        name: '存活率 (%)',
        type: 'line',
        yAxisIndex: 1,
        data: [100, 99.5, 98.2, 97.0, 96.5, 95.8, 95.0],
        itemStyle: { color: '#f59e0b' }, // Amber-500
        lineStyle: { width: 3 },
        symbolSize: 8
      }
    ]
  }
  chartInstance.setOption(option)
}

// 窗口自适应
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  // 加载用户信息
  const userStr = localStorage.getItem('aqua_user')
  if (userStr) {
    currentUser.value = JSON.parse(userStr)
  } else {
    // 防御性跳回登录页 (路由守卫的补充)
    router.push('/login')
  }

  // 初始化时间与图表
  updateTime()
  setInterval(updateTime, 60000)
  
  // 必须加 setTimeout 确保 DOM 已经完全渲染完毕再初始化图表
  setTimeout(() => {
    initChart()
    window.addEventListener('resize', handleResize)
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
/* Tailwind handles the styling */
</style>