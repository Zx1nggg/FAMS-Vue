<template>
  <div class="max-w-7xl mx-auto w-full">
    <!-- 欢迎语 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Hi, {{ currentUser.name }}</h1>
      <p class="text-sm text-gray-500 mt-1">欢迎回来，以下是您的生物资产与水质实时监控数据。</p>
    </div>

    <!-- 防呆：未选择农场 -->
    <div v-if="!currentFarmId" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center">
      <div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <Home class="w-10 h-10 text-amber-500" />
      </div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">未选择操作场区</h2>
      <p class="text-gray-500 mb-6 text-center">请先前往养殖场管理选择一个场区，再返回查看 IoT 监控数据。</p>
      <el-button type="primary" size="large" class="!bg-teal-600 !border-none hover:!bg-teal-700 !rounded-xl" @click="$router.push('/farmer/base/farm')">
        去选择养殖场
      </el-button>
    </div>

    <!-- 防呆：已选农场但无池塘 -->
    <div v-else-if="!pondsLoading && pondList.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center">
      <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <Box class="w-10 h-10 text-blue-500" />
      </div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">暂无池塘资产</h2>
      <p class="text-gray-500 mb-6 text-center">当前场区下还没有创建池塘，请先添加池塘再查看 IoT 监控数据。</p>
      <el-button type="primary" size="large" class="!bg-teal-600 !border-none hover:!bg-teal-700 !rounded-xl" @click="$router.push('/farmer/base/pond')">
        去创建池塘
      </el-button>
    </div>

    <!-- 正常业务区 -->
    <div v-else>
    <!-- 池塘选择器 + 批次选择器 + 最后更新时间 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-gray-600">监测池塘：</span>
        <el-select
          v-model="selectedPondId"
          placeholder="选择池塘"
          class="!w-40"
          @change="onPondChange"
          :loading="pondsLoading"
        >
          <el-option
            v-for="pond in pondList"
            :key="pond.id"
            :label="pond.pondName"
            :value="pond.id"
          />
        </el-select>
        <span class="text-sm font-medium text-gray-600 ml-2">生长批次：</span>
        <el-select
          v-model="selectedBatchNo"
          placeholder="选择批次"
          class="!w-48"
          @change="onBatchChange"
          :loading="batchesLoading"
          :disabled="!selectedPondId"
        >
          <el-option
            v-for="b in batchList"
            :key="b.batchNo"
            :label="`${b.batchNo}（${b.seedlingName || ''}）`"
            :value="b.batchNo"
          />
        </el-select>
      </div>
      <span class="text-xs text-gray-400 flex items-center gap-1">
        <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': refreshing }" />
        更新于 {{ lastUpdateTime }}
      </span>
    </div>

    <!-- 核心 IoT 数据卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- 水温 -->
      <el-skeleton :loading="cardsLoading" animated>
        <template #template>
          <div class="bg-white rounded-2xl p-6 border border-gray-100 h-[164px]" />
        </template>
        <template #default>
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500"
                 :class="tempStatus.color + ' opacity-20'" />
            <div class="flex justify-between items-start relative z-10">
              <div>
                <p class="text-gray-500 text-sm font-medium mb-1">{{ currentPondName }} · 实时水温</p>
                <div class="flex items-baseline gap-2">
                  <h3 class="text-3xl font-bold text-gray-800">{{ latestData.waterTemp ?? '--' }}</h3>
                  <span class="text-gray-500 font-medium">°C</span>
                </div>
              </div>
              <div class="p-3 rounded-xl" :class="tempStatus.bg">
                <Thermometer class="w-6 h-6" :class="tempStatus.text" />
              </div>
            </div>
            <div class="mt-4 flex items-center gap-2 text-sm relative z-10" :class="tempStatus.labelColor">
              <component :is="tempStatus.icon" class="w-4 h-4" />
              <span>{{ tempStatus.label }}</span>
            </div>
          </div>
        </template>
      </el-skeleton>

      <!-- 溶氧量 -->
      <el-skeleton :loading="cardsLoading" animated>
        <template #template>
          <div class="bg-white rounded-2xl p-6 border border-gray-100 h-[164px]" />
        </template>
        <template #default>
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500"
                 :class="doStatus.color + ' opacity-20'" />
            <div class="flex justify-between items-start relative z-10">
              <div>
                <p class="text-gray-500 text-sm font-medium mb-1">{{ currentPondName }} · 溶解氧 (DO)</p>
                <div class="flex items-baseline gap-2">
                  <h3 class="text-3xl font-bold text-gray-800">{{ latestData.dissolvedOxygen ?? '--' }}</h3>
                  <span class="text-gray-500 font-medium">mg/L</span>
                </div>
              </div>
              <div class="p-3 rounded-xl" :class="doStatus.bg">
                <Waves class="w-6 h-6" :class="doStatus.text" />
              </div>
            </div>
            <div class="mt-4 flex items-center gap-2 text-sm relative z-10" :class="doStatus.labelColor">
              <component :is="doStatus.icon" class="w-4 h-4" />
              <span>{{ doStatus.label }}</span>
            </div>
          </div>
        </template>
      </el-skeleton>

      <!-- pH 值 -->
      <el-skeleton :loading="cardsLoading" animated>
        <template #template>
          <div class="bg-white rounded-2xl p-6 border border-gray-100 h-[164px]" />
        </template>
        <template #default>
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500"
                 :class="phStatus.color + ' opacity-20'" />
            <div class="flex justify-between items-start relative z-10">
              <div>
                <p class="text-gray-500 text-sm font-medium mb-1">{{ currentPondName }} · pH 值</p>
                <div class="flex items-baseline gap-2">
                  <h3 class="text-3xl font-bold text-gray-800">{{ latestData.phValue ?? '--' }}</h3>
                </div>
              </div>
              <div class="p-3 rounded-xl" :class="phStatus.bg">
                <Droplet class="w-6 h-6" :class="phStatus.text" />
              </div>
            </div>
            <div class="mt-4 flex items-center gap-2 text-sm relative z-10" :class="phStatus.labelColor">
              <component :is="phStatus.icon" class="w-4 h-4" />
              <span>{{ phStatus.label }}</span>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 图表与消息面板区 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- 左侧：生长曲线 + IoT 24h 趋势 -->
      <div class="lg:col-span-2 space-y-8">

        <!-- 24h IoT 趋势图（新增） -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Activity class="w-5 h-5 text-teal-600" /> {{ currentPondName }} · 24小时水质趋势
            </h2>
            <span class="text-xs text-gray-400">每分钟采集一次</span>
          </div>
          <!-- 趋势图 / 无数据占位 -->
          <div v-if="historyData.length > 0" ref="iotChartRef" class="w-full h-72"></div>
          <div v-else class="w-full h-72 flex flex-col items-center justify-center text-gray-400">
            <Activity class="w-12 h-12 mb-3 opacity-30" />
            <span class="text-sm">{{ cardsLoading ? '加载中...' : '暂无历史数据' }}</span>
            <span v-if="!cardsLoading" class="text-xs mt-1">IoT 模拟器每 60 秒自动生成，启动后约 1-2 分钟出数据</span>
          </div>
        </div>

        <!-- 批次生长与成活率曲线 -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp class="w-5 h-5 text-teal-600" /> 批次生长与成活率追踪
            </h2>
            <span v-if="growthChartData" class="text-xs text-gray-400">
              {{ growthChartData.seedlingName || '' }} · 投放 {{ growthChartData.initialQuantity }} 尾
            </span>
          </div>
          <!-- 有数据 -->
          <div v-if="growthChartData && growthChartData.dataPoints && growthChartData.dataPoints.length > 0"
               ref="chartRef" class="w-full h-80"></div>
          <!-- 加载中 -->
          <div v-else-if="growthLoading" class="w-full h-80 flex flex-col items-center justify-center text-gray-400">
            <TrendingUp class="w-12 h-12 mb-3 opacity-30 animate-pulse" />
            <span class="text-sm">加载生长数据中...</span>
          </div>
          <!-- 无批次选中 -->
          <div v-else-if="!selectedBatchNo" class="w-full h-80 flex flex-col items-center justify-center text-gray-400">
            <TrendingUp class="w-12 h-12 mb-3 opacity-30" />
            <span class="text-sm">请先选择生长批次</span>
            <span class="text-xs mt-1">选择池塘和批次后可查看生长曲线</span>
          </div>
          <!-- 无数据 -->
          <div v-else class="w-full h-80 flex flex-col items-center justify-center text-gray-400">
            <TrendingUp class="w-12 h-12 mb-3 opacity-30" />
            <span class="text-sm">暂无生长抽测数据</span>
            <span class="text-xs mt-1">在巡塘时填写生长抽测记录后生成曲线</span>
          </div>
        </div>
      </div>

      <!-- 右侧：快捷入口 + 告警面板 -->
      <div class="space-y-6">

        <!-- 快捷入口 -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">核心业务流转</h2>
          <div class="grid grid-cols-2 gap-3">
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

        <!-- 实时告警面板 -->
        <div class="bg-white rounded-2xl border shadow-sm p-6 relative overflow-hidden"
             :class="alarms.length > 0 ? 'border-red-100' : 'border-gray-100'">
          <div class="absolute top-0 left-0 w-1 h-full"
               :class="alarms.length > 0 ? 'bg-red-500' : 'bg-emerald-500'" />
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle class="w-5 h-5" :class="alarms.length > 0 ? 'text-red-500' : 'text-emerald-500'" />
            {{ alarms.length > 0 ? '异常监控中心' : '系统运行正常' }}
          </h2>

          <!-- 告警列表 -->
          <div v-if="alarms.length > 0" class="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
            <div v-for="alarm in alarms" :key="alarm.id"
                 class="rounded-xl p-4 border"
                 :class="alarmLevelClass(alarm.severity)">
              <div class="flex justify-between items-start mb-1">
                <span class="text-sm font-bold" :class="alarmLevelTextClass(alarm.severity)">
                  {{ alarm.title || alarmTypeLabel(alarm.alarmCode) }}
                </span>
                <span class="text-[10px] px-1.5 py-0.5 rounded border"
                      :class="alarmLevelBadgeClass(alarm.severity)">
                  {{ alarmLevelLabel(alarm.severity) }}
                </span>
              </div>
              <p class="text-xs leading-relaxed" :class="alarmLevelTextClass(alarm.severity)">
                {{ alarm.message }}
              </p>
              <div class="mt-2 flex items-center justify-between gap-2">
                <p class="text-[10px] text-gray-400">{{ formatTime(alarm.lastOccurredAt) }}</p>
                <button
                  v-if="alarm.status === 0"
                  class="text-[10px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                  @click="confirmAlarm(alarm.id)"
                >确认告警</button>
                <span v-else class="text-[10px] text-gray-400">{{ alarmStatusLabel(alarm.status) }}</span>
              </div>
            </div>
          </div>

          <!-- 无告警 -->
          <div v-else class="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-5 h-5 text-emerald-500" />
              <span class="text-sm font-medium text-emerald-700">所有指标正常，无须处理</span>
            </div>
            <p class="text-xs text-emerald-600 mt-1">当前各池塘水温、溶氧、pH值均处于安全范围内。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  Thermometer, Waves, Droplet, TrendingUp, TrendingDown, CheckCircle2,
  Minus, AlertTriangle, Activity, Box, Truck, MapPin, Stethoscope, RefreshCw, Home
} from 'lucide-vue-next'
import { getLatestSensorData, getLatestAllSensorData, getSensorDataHistory, getAlarmPage, acknowledgeAlarm, getPondPage, getGrowthChart, getStockingPage } from '@/api/base'

const router = useRouter()

// ==================== 用户 & 农场信息 ====================
const currentUser = ref({ name: '游客' })
const currentFarmId = ref(sessionStorage.getItem('current_farm_id'))

// ==================== 池塘列表 & 选择 ====================
const pondList = ref([])
const pondsLoading = ref(false)
const selectedPondId = ref(null)
const currentPondName = computed(() => {
  const pond = pondList.value.find(p => p.id === selectedPondId.value)
  return pond?.pondName || '--'
})

// ==================== IoT 数据状态 ====================
const cardsLoading = ref(true)
const refreshing = ref(false)
const latestData = ref({ waterTemp: null, dissolvedOxygen: null, phValue: null })
const lastUpdateTime = ref('--')
const historyData = ref([])
const alarms = ref([])

// ==================== 生长曲线状态 ====================
const batchList = ref([])
const batchesLoading = ref(false)
const selectedBatchNo = ref(null)
const growthLoading = ref(false)
const growthChartData = ref(null)

// ==================== 图表实例 ====================
const chartRef = ref(null)
const iotChartRef = ref(null)
let chartInstance = null
let iotChartInstance = null
let refreshTimer = null

// ==================== 传感器状态评估（计算属性） ====================
const tempStatus = computed(() => {
  const t = latestData.value.waterTemp
  if (t == null) return { icon: Minus, color: 'bg-gray-50', bg: 'bg-gray-100', text: 'text-gray-400', labelColor: 'text-gray-400', label: '暂无数据' }
  if (t > 35) return { icon: TrendingUp, color: 'bg-red-50', bg: 'bg-red-100', text: 'text-red-600', labelColor: 'text-red-600', label: `异常偏高 ${t}°C，注意防暑！` }
  if (t > 30) return { icon: TrendingUp, color: 'bg-amber-50', bg: 'bg-amber-100', text: 'text-amber-600', labelColor: 'text-amber-600', label: '水温偏高，加强观察' }
  if (t < 20) return { icon: TrendingDown, color: 'bg-blue-50', bg: 'bg-blue-100', text: 'text-blue-600', labelColor: 'text-blue-600', label: '水温偏低，注意保温' }
  return { icon: CheckCircle2, color: 'bg-blue-50', bg: 'bg-blue-100', text: 'text-blue-600', labelColor: 'text-emerald-600', label: '水温正常，适宜生长' }
})

const doStatus = computed(() => {
  const d = latestData.value.dissolvedOxygen
  if (d == null) return { icon: Minus, color: 'bg-gray-50', bg: 'bg-gray-100', text: 'text-gray-400', labelColor: 'text-gray-400', label: '暂无数据' }
  if (d < 3.5) return { icon: AlertTriangle, color: 'bg-red-50', bg: 'bg-red-100', text: 'text-red-600', labelColor: 'text-red-600', label: `危急！溶氧仅 ${d} mg/L，立即增氧！` }
  if (d < 5.0) return { icon: TrendingDown, color: 'bg-amber-50', bg: 'bg-amber-100', text: 'text-amber-600', labelColor: 'text-amber-600', label: '溶氧偏低，建议开启增氧机' }
  return { icon: CheckCircle2, color: 'bg-teal-50', bg: 'bg-teal-100', text: 'text-teal-600', labelColor: 'text-emerald-600', label: '水质优良，溶氧充足' }
})

const phStatus = computed(() => {
  const p = latestData.value.phValue
  if (p == null) return { icon: Minus, color: 'bg-gray-50', bg: 'bg-gray-100', text: 'text-gray-400', labelColor: 'text-gray-400', label: '暂无数据' }
  if (p < 6.5 || p > 9.0) return { icon: AlertTriangle, color: 'bg-red-50', bg: 'bg-red-100', text: 'text-red-600', labelColor: 'text-red-600', label: `pH 异常 (${p})，需立即调节！` }
  if (p < 7.0 || p > 8.5) return { icon: Minus, color: 'bg-amber-50', bg: 'bg-amber-100', text: 'text-amber-600', labelColor: 'text-amber-600', label: 'pH 轻微偏离，保持观察' }
  return { icon: CheckCircle2, color: 'bg-purple-50', bg: 'bg-purple-100', text: 'text-purple-600', labelColor: 'text-gray-500', label: '平稳，无异常波动' }
})

// ==================== 告警工具方法 ====================
const alarmTypeLabel = (type) => {
  const map = { IOT_DO_LOW: '溶解氧偏低告警', IOT_TEMP_HIGH: '水温过高告警', IOT_PH_LOW: 'pH过低告警', IOT_PH_HIGH: 'pH过高告警', BIOLOGY_MORTALITY: '生物死亡异常告警' }
  return map[type] || type || '系统告警'
}
const alarmLevelLabel = (level) => {
  const map = { 1: '提示', 2: '警告', 3: '严重' }
  return map[level] || '--'
}
const alarmLevelClass = (level) => {
  const map = { 1: 'border-blue-200 bg-blue-50/30', 2: 'border-amber-200 bg-amber-50/30', 3: 'border-red-200 bg-red-50/40 border-l-2 border-l-red-500' }
  return map[level] || 'border-gray-200 bg-gray-50'
}
const alarmLevelBadgeClass = (level) => {
  const map = { 1: 'bg-blue-100 text-blue-600 border-blue-200', 2: 'bg-amber-100 text-amber-600 border-amber-200', 3: 'bg-red-100 text-red-600 border-red-200' }
  return map[level] || ''
}
const alarmLevelTextClass = (level) => {
  const map = { 1: 'text-blue-700', 2: 'text-amber-700', 3: 'text-red-700' }
  return map[level] || 'text-gray-700'
}
const formatTime = (t) => {
  if (!t) return ''
  return new Date(t).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ==================== 数据获取 ====================

const loadPonds = async () => {
  if (!currentFarmId.value) {
    cardsLoading.value = false
    return
  }
  pondsLoading.value = true
  try {
    const res = await getPondPage({ pageNum: 1, pageSize: 100, farmId: currentFarmId.value })
    if (res.code === 200 && res.data?.records) {
      pondList.value = res.data.records
      if (!selectedPondId.value && pondList.value.length > 0) {
        selectedPondId.value = pondList.value[0].id
        loadBatches()
        await loadAllData()
      }
    }
  } finally {
    pondsLoading.value = false
    cardsLoading.value = false
  }
}

const loadLatestData = async () => {
  if (!selectedPondId.value) return
  try {
    const res = await getLatestSensorData(selectedPondId.value)
    if (res.code === 200 && res.data) {
      latestData.value = res.data
    }
  } catch (e) {
    // 首次启动无数据时不报错
  }
}

const loadHistory = async () => {
  if (!selectedPondId.value) return
  try {
    const res = await getSensorDataHistory(selectedPondId.value, 24)
    if (res.code === 200 && res.data) {
      historyData.value = res.data
      await nextTick()
      renderIotChart()
    }
  } catch (e) { /* ignore */ }
}

const loadAlarms = async () => {
  if (!currentFarmId.value) return
  try {
    const res = await getAlarmPage({
      pageNum: 1, pageSize: 10,
      farmId: currentFarmId.value,
      activeOnly: true
    })
    if (res.code === 200 && res.data?.records) {
      alarms.value = res.data.records
    }
  } catch (e) { /* ignore */ }
}

const alarmStatusLabel = (status) => ({ 0: '待确认', 1: '已确认', 2: '处理中' }[status] || '已结束')

const confirmAlarm = async (id) => {
  try {
    await acknowledgeAlarm(id, '养殖户已确认告警')
    await loadAlarms()
  } catch (e) {
    console.error('确认告警失败', e)
  }
}

const loadAllData = async () => {
  refreshing.value = true
  await Promise.all([loadLatestData(), loadHistory(), loadAlarms()])
  lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
  cardsLoading.value = false
  refreshing.value = false
}

const onPondChange = () => {
  cardsLoading.value = true
  selectedBatchNo.value = null
  growthChartData.value = null
  if (chartInstance) { chartInstance.dispose(); chartInstance = null }
  loadBatches()
  loadAllData().finally(() => { cardsLoading.value = false })
}

const onBatchChange = () => {
  loadGrowthChart()
}

// ==================== 批次列表 & 生长曲线数据 ====================

const loadBatches = async () => {
  if (!selectedPondId.value) {
    batchList.value = []
    return
  }
  batchesLoading.value = true
  try {
    const res = await getStockingPage({ pageNum: 1, pageSize: 100, pondId: selectedPondId.value })
    if (res.code === 200 && res.data?.records) {
      // 去重 batchNo，保留 seedlingName
      const seen = new Set()
      batchList.value = res.data.records.filter(r => {
        if (!r.batchNo || seen.has(r.batchNo)) return false
        seen.add(r.batchNo)
        return true
      })
      // 自动选中第一个批次
      if (batchList.value.length > 0 && !selectedBatchNo.value) {
        selectedBatchNo.value = batchList.value[0].batchNo
        loadGrowthChart()
      }
    }
  } catch (e) { /* ignore */ }
  finally { batchesLoading.value = false }
}

const loadGrowthChart = async () => {
  if (!selectedBatchNo.value || !selectedPondId.value) return
  growthLoading.value = true
  growthChartData.value = null
  if (chartInstance) { chartInstance.dispose(); chartInstance = null }
  try {
    const res = await getGrowthChart(selectedBatchNo.value, selectedPondId.value)
    if (res.code === 200 && res.data) {
      growthChartData.value = res.data
      await nextTick()
      renderGrowthChart()
    }
  } catch (e) { /* ignore */ }
  finally { growthLoading.value = false }
}

// ==================== ECharts ====================

// 生长曲线（动态数据）
const renderGrowthChart = () => {
  if (!chartRef.value || !growthChartData.value?.dataPoints?.length) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const dp = growthChartData.value.dataPoints
  const weeks = dp.map(d => d.weekLabel)
  const weights = dp.map(d => d.avgWeight != null ? Number(d.avgWeight) : null)
  const survivalRates = dp.map(d => d.survivalRate != null ? Number(d.survivalRate) : null)

  // 动态 y 轴范围
  const maxWeight = Math.max(...weights.filter(w => w != null), 1)
  const minSurvival = Math.min(...survivalRates.filter(s => s != null), 100)
  const survivalMin = Math.max(0, Math.floor(minSurvival / 5) * 5 - 5)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: function (params) {
        const week = params[0].axisValue
        let html = `<strong>${week}</strong><br/>`
        params.forEach(p => {
          if (p.value != null) {
            html += `${p.marker} ${p.seriesName}: ${p.value}${p.seriesName.includes('体重') ? ' g' : ' %'}<br/>`
          }
        })
        return html
      }
    },
    legend: { data: ['平均体重 (g)', '存活率 (%)'], bottom: 0 },
    grid: { left: '3%', right: '3%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: [{
      type: 'category',
      data: weeks,
      axisLabel: { color: '#6b7280' }
    }],
    yAxis: [
      {
        type: 'value',
        name: '体重(g)',
        min: 0,
        max: Math.ceil(maxWeight * 1.3),
        axisLine: { show: true, lineStyle: { color: '#14b8a6' } }
      },
      {
        type: 'value',
        name: '存活率(%)',
        min: survivalMin,
        max: 100,
        axisLine: { show: true, lineStyle: { color: '#f59e0b' } },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '平均体重 (g)',
        type: 'bar',
        data: weights,
        itemStyle: { color: '#2dd4bf', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '存活率 (%)',
        type: 'line',
        yAxisIndex: 1,
        data: survivalRates,
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 3 }
      }
    ]
  }
  chartInstance.setOption(option, true)
  chartInstance.resize()
}

// 24h 水质趋势图（新增）
const renderIotChart = () => {
  if (!iotChartRef.value || historyData.value.length === 0) return
  if (!iotChartInstance) {
    iotChartInstance = echarts.init(iotChartRef.value)
  }

  const times = historyData.value.map(d => {
    const t = new Date(d.collectTime)
    return t.getHours().toString().padStart(2, '0') + ':' + t.getMinutes().toString().padStart(2, '0')
  })
  const temps = historyData.value.map(d => Number(d.waterTemp))
  const dos = historyData.value.map(d => Number(d.dissolvedOxygen))
  const phs = historyData.value.map(d => Number(d.phValue))

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', crossStyle: { color: '#999' } }
    },
    legend: {
      data: ['水温 °C', '溶氧 mg/L', 'pH'],
      bottom: 0,
      textStyle: { fontSize: 11 }
    },
    grid: { left: '6%', right: '6%', bottom: '12%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: times,
      axisLabel: {
        color: '#6b7280',
        fontSize: 10,
        interval: Math.max(1, Math.floor(times.length / 12))
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '°C / pH',
        nameLocation: 'center',
        nameGap: 35,
        nameRotate: 90,
        nameTextStyle: { color: '#3b82f6', fontSize: 11, fontWeight: 'bold' },
        min: 0,
        max: 40,
        axisLine: { lineStyle: { color: '#3b82f6' } },
        axisLabel: { color: '#3b82f6', fontSize: 10 }
      },
      {
        type: 'value',
        name: 'mg/L',
        nameLocation: 'center',
        nameGap: 35,
        nameRotate: 90,
        nameTextStyle: { color: '#14b8a6', fontSize: 11, fontWeight: 'bold' },
        min: 0,
        max: 14,
        axisLine: { lineStyle: { color: '#14b8a6' } },
        axisLabel: { color: '#14b8a6', fontSize: 10 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '水温 °C',
        type: 'line',
        data: temps,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#3b82f6', width: 2 },
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: '溶氧 mg/L',
        type: 'line',
        yAxisIndex: 1,
        data: dos,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#14b8a6', width: 2 },
        itemStyle: { color: '#14b8a6' }
      },
      {
        name: 'pH',
        type: 'line',
        data: phs,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#a855f7', width: 2, type: 'dashed' },
        itemStyle: { color: '#a855f7' }
      }
    ]
  }
  iotChartInstance.setOption(option, true)
  iotChartInstance.resize()
}

// ==================== 生命周期 ====================

onMounted(async () => {
  const userStr = sessionStorage.getItem('aqua_user')
  if (userStr) currentUser.value = JSON.parse(userStr)

  // resize 监听
  window.addEventListener('resize', () => {
    chartInstance?.resize()
    iotChartInstance?.resize()
  })

  // IoT 数据
  if (currentFarmId.value) {
    // 如果从池塘概览页跳转过来，自动选中目标池塘
    const targetPondId = sessionStorage.getItem('target_pond_id')
    await loadPonds()
    if (targetPondId && pondList.value.some(p => p.id == targetPondId)) {
      selectedPondId.value = Number(targetPondId)
      sessionStorage.removeItem('target_pond_id')
      await loadAllData()
    }
    // 加载批次列表（自动选中第一个并加载生长曲线）
    if (selectedPondId.value) {
      loadBatches()
    }
  }

  // 自动刷新（60 秒）
  refreshTimer = setInterval(() => {
    if (selectedPondId.value) loadAllData()
  }, 60_000)
})

onUnmounted(() => {
  chartInstance?.dispose()
  iotChartInstance?.dispose()
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
