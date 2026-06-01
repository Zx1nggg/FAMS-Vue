<template>
  <div class="max-w-7xl mx-auto w-full">
    <!-- 欢迎语 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Hi, {{ currentUser.name }}</h1>
      <p class="text-sm text-gray-500 mt-1">欢迎回来，以下是您的生物资产与水质实时监控数据。</p>
    </div>

    <!-- 核心 IoT 数据卡片 (与原来保持一致) -->
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
          <div class="p-3 bg-blue-100 text-blue-600 rounded-xl"><Thermometer class="w-6 h-6" /></div>
        </div>
        <div class="mt-4 flex items-center gap-2 text-sm text-emerald-600 relative z-10">
          <TrendingUp class="w-4 h-4" /><span>较昨日同期 +0.2°C</span>
        </div>
      </div>

      <!-- 溶氧量 -->
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
          <div class="p-3 bg-teal-100 text-teal-600 rounded-xl"><Waves class="w-6 h-6" /></div>
        </div>
        <div class="mt-4 flex items-center gap-2 text-sm text-emerald-600 relative z-10">
          <CheckCircle2 class="w-4 h-4" /><span>水质优良，溶氧充足</span>
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
          <div class="p-3 bg-purple-100 text-purple-600 rounded-xl"><Droplet class="w-6 h-6" /></div>
        </div>
        <div class="mt-4 flex items-center gap-2 text-sm text-gray-500 relative z-10">
          <Minus class="w-4 h-4" /><span>平稳，无异常波动</span>
        </div>
      </div>
    </div>

    <!-- 图表与消息面板区 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- 左侧：成活率曲线 -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Activity class="w-5 h-5 text-teal-600" /> 批次生长与成活率追踪
          </h2>
        </div>
        <div ref="chartRef" class="w-full h-80"></div>
      </div>

      <!-- 右侧：快捷入口打通链路 -->
      <div class="space-y-6">
        
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">核心业务流转</h2>
          <div class="grid grid-cols-2 gap-3">
            <!-- 🌟 核心：激活路由跳转 -->
            <button @click="router.push('/farmer/base/pond')" class="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors border border-transparent hover:border-indigo-100 text-gray-600">
              <Box class="w-6 h-6 mb-2" />
              <span class="text-sm font-medium">1. 池塘管理</span>
            </button>
            <button @click="router.push('/farmer/base/purchase')" class="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-colors border border-transparent hover:border-teal-100 text-gray-600">
              <Truck class="w-6 h-6 mb-2" />
              <span class="text-sm font-medium">2. 采购入库</span>
            </button>
            <button @click="router.push('/farmer/lifecycle/stocking')" class="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors border border-transparent hover:border-emerald-100 text-gray-600">
              <MapPin class="w-6 h-6 mb-2" />
              <span class="text-sm font-medium">3. 投放登记</span>
            </button>
            <button @click="router.push('/farmer/lifecycle/patrol')" class="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors border border-transparent hover:border-blue-100 text-gray-600">
              <Stethoscope class="w-6 h-6 mb-2" />
              <span class="text-sm font-medium">4. 日常巡塘</span>
            </button>
          </div>
        </div>

        <!-- 实时告警面板 (保持原有) -->
        <div class="bg-white rounded-2xl border border-red-100 shadow-sm p-6 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-red-500" /> 异常监控中心
          </h2>
          <div class="bg-red-50 rounded-xl p-4 border border-red-100">
            <div class="flex justify-between items-start mb-2">
              <span class="text-sm font-bold text-red-700">溶氧量偏低告警</span>
            </div>
            <p class="text-xs text-red-600 leading-relaxed mb-3">监测到 2号池 溶氧量降至 3.2 mg/L，低于安全阈值，请及时开启增氧机。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { 
  Thermometer, Waves, Droplet, TrendingUp, CheckCircle2, 
  Minus, AlertTriangle, Activity, Box, Truck, MapPin, Stethoscope
} from 'lucide-vue-next'

const router = useRouter()
const chartRef = ref(null)
let chartInstance = null
const currentUser = ref({ name: '游客' })

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['平均体重 (g)', '存活率 (%)'], bottom: 0 },
    grid: { left: '3%', right: '3%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: [{ type: 'category', data: ['第1周', '第2周', '第3周', '第4周', '第5周'], axisLabel: { color: '#6b7280' } }],
    yAxis: [
      { type: 'value', name: '体重(g)', axisLine: { show: true, lineStyle: { color: '#14b8a6' } } },
      { type: 'value', name: '存活率(%)', min: 80, max: 100, axisLine: { show: true, lineStyle: { color: '#f59e0b' } }, splitLine: { show: false } }
    ],
    series: [
      { name: '平均体重 (g)', type: 'bar', data: [2.5, 4.8, 8.2, 14.5, 22.0], itemStyle: { color: '#2dd4bf', borderRadius: [4, 4, 0, 0] } },
      { name: '存活率 (%)', type: 'line', yAxisIndex: 1, data: [100, 99.5, 98.2, 97.0, 96.5], itemStyle: { color: '#f59e0b' }, lineStyle: { width: 3 } }
    ]
  }
  chartInstance.setOption(option)
}

onMounted(() => {
  const userStr = sessionStorage.getItem('aqua_user')
  if (userStr) currentUser.value = JSON.parse(userStr)
  
  setTimeout(() => {
    initChart()
    window.addEventListener('resize', () => chartInstance?.resize())
  }, 100)
})

onUnmounted(() => chartInstance?.dispose())
</script>