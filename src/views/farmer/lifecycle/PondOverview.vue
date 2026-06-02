<template>
  <div class="h-full flex flex-col">

    <!-- 防呆：未选择农场 -->
    <div v-if="!currentFarmId" class="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <Home class="w-10 h-10 text-amber-500" />
      </div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">未选择操作场区</h2>
      <p class="text-gray-500 mb-6 text-center">请先选择养殖场区，再查看池塘实时概览。</p>
      <el-button type="primary" size="large" class="!bg-teal-600 !border-none hover:!bg-teal-700 !rounded-xl" @click="$router.push('/farmer/base/farm')">
        去选择养殖场
      </el-button>
    </div>

    <!-- 防呆：无池塘 -->
    <div v-else-if="!loading && pondList.length === 0" class="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <Box class="w-10 h-10 text-blue-500" />
      </div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">暂无池塘资产</h2>
      <p class="text-gray-500 mb-6">当前场区下还没有创建池塘，请先添加。</p>
      <el-button type="primary" size="large" class="!bg-teal-600 !border-none hover:!bg-teal-700 !rounded-xl" @click="$router.push('/farmer/base/pond')">
        去创建池塘
      </el-button>
    </div>

    <!-- 正常业务 -->
    <div v-else class="space-y-4">

      <!-- 当前农场提示牌 -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3.5 rounded-2xl border border-blue-100 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-3">
          <div class="p-1.5 bg-blue-100 rounded-lg">
            <LayoutGrid class="w-5 h-5 text-blue-600" />
          </div>
          <span class="text-sm text-blue-800">
            当前工作空间：<strong class="text-blue-700 text-base mx-1 tracking-wide">{{ currentFarmName }}</strong>
            <span class="text-xs text-blue-600/70 ml-2 hidden md:inline">所有池塘数据均为实时采集</span>
          </span>
        </div>
        <span class="text-xs text-blue-500 flex items-center gap-1">
          <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': refreshing }" />
          更新于 {{ lastUpdateTime }}
        </span>
      </div>

      <!-- 批次统计卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">在养批次</p>
          <h3 class="text-2xl font-bold text-gray-800">{{ batchStats.activeBatches }}</h3>
          <p class="text-xs text-gray-400 mt-1">个批次</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">投苗总尾数</p>
          <h3 class="text-2xl font-bold text-emerald-600">{{ formatNumber(batchStats.totalStocked) }}</h3>
          <p class="text-xs text-gray-400 mt-1">尾</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">今日 SOP 任务</p>
          <h3 class="text-2xl font-bold" :class="batchStats.todayPending > 0 ? 'text-amber-600' : 'text-emerald-600'">
            {{ batchStats.todayDone }}/{{ batchStats.todayTotal }}
          </h3>
          <p class="text-xs text-gray-400 mt-1">
            {{ batchStats.todayPending > 0 ? `待打卡 ${batchStats.todayPending} 项` : '全部完成 ✓' }}
          </p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">池塘资产</p>
          <h3 class="text-2xl font-bold text-blue-600">{{ pondList.length }}</h3>
          <p class="text-xs text-gray-400 mt-1">口塘</p>
        </div>
      </div>

      <!-- 🌟 池塘实时概览矩阵 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 class="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
          <LayoutGrid class="w-5 h-5 text-blue-600" /> 池塘实时概览
        </h2>
        <p class="text-xs text-gray-400 mb-4">鼠标悬停查看详情 | 点击卡片跳转 Dashboard 监测该池塘</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <el-popover
            v-for="card in pondCards"
            :key="card.pondId"
            placement="right"
            :width="320"
            trigger="hover"
            :show-after="200"
            :hide-after="100"
          >
            <!-- ================= 卡片主视觉 (Trigger) ================= -->
            <template #reference>
              <div
                class="bg-white rounded-xl border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group"
                :class="[
                  card.health === 'danger' ? 'border-red-200' : card.health === 'warning' ? 'border-amber-200' : 'border-emerald-100 hover:border-emerald-300'
                ]"
                @click="goToDashboard(card.pondId)"
              >
                <!-- 水产元素背景水印 -->
                <Fish class="absolute -right-4 -bottom-4 w-28 h-28 text-blue-50 opacity-0 group-hover:opacity-40 transition-all duration-500 transform group-hover:-translate-x-2 group-hover:-translate-y-2 pointer-events-none" />
                <Waves class="absolute -left-6 bottom-4 w-20 h-20 text-emerald-100/60 group-hover:text-emerald-200/80 transition-all duration-300 pointer-events-none" />

                <!-- 顶部水波纹装饰条 -->
                <div class="h-1.5 w-full bg-gradient-to-r opacity-80"
                     :class="card.health === 'danger' ? 'from-red-400 to-rose-300' : card.health === 'warning' ? 'from-amber-400 to-orange-300' : 'from-teal-400 to-emerald-300'">
                </div>

                <div class="p-4 relative z-10">
                  <!-- 顶部信息 -->
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h3 class="font-bold text-gray-800 text-base group-hover:text-teal-600 transition-colors drop-shadow-sm flex items-center gap-1.5">
                        {{ card.pondName }}
                      </h3>
                      <p class="text-xs text-gray-400 mt-0.5">水面 {{ card.areaMu }} 亩</p>
                    </div>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm border"
                          :class="card.health === 'danger' ? 'bg-red-50 text-red-600 border-red-200' : card.health === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'">
                      {{ card.health === 'danger' ? '⚠ 异常' : card.health === 'warning' ? '⚡ 关注' : '✓ 良好' }}
                    </span>
                  </div>

                  <!-- IoT 指标行 (微发光拟物设计) -->
                  <div class="grid grid-cols-3 gap-2 text-center mb-4">
                    <div class="bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-lg py-2 shadow-inner">
                      <p class="text-[10px] text-gray-500 mb-0.5">水温</p>
                      <p class="text-sm font-bold font-mono" :class="getTempColor(card.waterTemp)">
                        {{ card.waterTemp ?? '--' }}<span class="text-[10px] font-normal ml-0.5">°</span>
                      </p>
                    </div>
                    <div class="bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-lg py-2 shadow-inner">
                      <p class="text-[10px] text-gray-500 mb-0.5">溶氧</p>
                      <p class="text-sm font-bold font-mono" :class="getDoColor(card.dissolvedOxygen)">
                        {{ card.dissolvedOxygen ?? '--' }}
                      </p>
                    </div>
                    <div class="bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-lg py-2 shadow-inner">
                      <p class="text-[10px] text-gray-500 mb-0.5">pH值</p>
                      <p class="text-sm font-bold font-mono" :class="getPhColor(card.phValue)">
                        {{ card.phValue ?? '--' }}
                      </p>
                    </div>
                  </div>

                  <!-- 底部在养信息 -->
                  <div class="flex justify-between items-center text-xs border-t border-dashed border-gray-100 pt-3">
                    <span class="text-gray-600 font-medium truncate max-w-[60%]" :title="card.seedlingName">
                      <Fish class="w-3.5 h-3.5 inline text-teal-500 mr-1 -mt-0.5" />
                      {{ card.seedlingName || '空置期' }}
                    </span>
                    <span v-if="card.pendingTasks > 0" class="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                      待办 {{ card.pendingTasks }}
                    </span>
                    <span v-else class="text-emerald-500 flex items-center gap-1"><CheckCircle2 class="w-3.5 h-3.5" /> 无待办事项</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- ================= 🌟 优化后的 Popover 详情大屏 ================= -->
            <div class="p-1 space-y-3 font-sans">
              <!-- 头部：名称与面积 -->
              <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 class="font-bold text-gray-800 text-base flex items-center gap-1.5">
                  <Box class="w-4 h-4 text-blue-500" /> {{ card.pondName }}
                </h4>
                <span class="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded shadow-inner">
                  {{ card.areaMu }} 亩
                </span>
              </div>

              <!-- 模块 1：生物资产 (蓝色系) -->
              <div class="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                <h5 class="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5">
                  <Fish class="w-3.5 h-3.5" /> 在养生物资产
                </h5>
                <div v-if="card.seedlings.length > 0" class="space-y-1.5">
                  <div v-for="s in card.seedlings" :key="s.name" class="flex justify-between items-center bg-white/60 px-2 py-1 rounded text-xs">
                    <span class="text-gray-700">{{ s.name }}</span>
                    <span class="text-blue-700 font-bold">{{ formatNumber(s.qty) }} 尾</span>
                  </div>
                  <div class="text-[10px] text-gray-400 mt-1 pl-1 line-clamp-1 truncate" :title="card.batchNos">
                    关联批次: {{ card.batchNos }}
                  </div>
                </div>
                <div v-else class="text-xs text-gray-400 py-1 pl-1">当前池塘无投放记录</div>
              </div>

              <!-- 模块 2：实时水质 (青色系) -->
              <div class="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                <h5 class="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                  <Droplets class="w-3.5 h-3.5" /> 物联网实时水质
                </h5>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="flex justify-between items-center bg-white/60 px-2 py-1.5 rounded">
                    <span class="text-gray-500">水温</span>
                    <span class="font-bold font-mono" :class="getTempColor(card.waterTemp)">{{ card.waterTemp ?? '--' }}°C</span>
                  </div>
                  <div class="flex justify-between items-center bg-white/60 px-2 py-1.5 rounded">
                    <span class="text-gray-500">溶氧</span>
                    <span class="font-bold font-mono" :class="getDoColor(card.dissolvedOxygen)">{{ card.dissolvedOxygen ?? '--' }}</span>
                  </div>
                  <div class="flex justify-between items-center bg-white/60 px-2 py-1.5 rounded col-span-2">
                    <span class="text-gray-500">pH 值</span>
                    <span class="font-bold font-mono" :class="getPhColor(card.phValue)">{{ card.phValue ?? '--' }}</span>
                  </div>
                </div>
              </div>

              <!-- 模块 3：养殖操作 (橙黄系) -->
              <div class="bg-amber-50/50 rounded-xl p-3 border border-amber-100/50 relative overflow-hidden">
                <h5 class="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                  <ClipboardList class="w-3.5 h-3.5" /> 今日运营动态
                </h5>
                <div class="space-y-1.5 relative z-10 text-xs">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">SOP 待办</span>
                    <span class="font-bold" :class="card.pendingTasks > 0 ? 'text-amber-600' : 'text-gray-400'">{{ card.pendingTasks }} 项</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">最近巡塘</span>
                    <span class="text-gray-700 font-mono">{{ card.lastPatrolTime ? card.lastPatrolTime.substring(5,16) : '今日未巡' }}</span>
                  </div>
                  <div v-if="batchStats.alarmCount > 0" class="flex justify-between items-center mt-2 pt-2 border-t border-amber-100">
                    <span class="text-red-500 flex items-center gap-1"><AlertTriangle class="w-3.5 h-3.5"/> 全场告警</span>
                    <span class="text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">{{ batchStats.alarmCount }} 条未处理</span>
                  </div>
                </div>
              </div>

            </div>
          </el-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Home, Box, LayoutGrid, Thermometer, Waves, Droplet, RefreshCw, 
  Fish, CheckCircle2, Droplets, ClipboardList, AlertTriangle 
} from 'lucide-vue-next'
import { getPondPage, getLatestAllSensorData, getStockingPage, getPondTaskPage, getPatrolLogPage, getAlarmPage } from '@/api/base'

const router = useRouter()

// ==================== 农场信息 ====================
const currentFarmId = ref(sessionStorage.getItem('current_farm_id'))
const currentFarmName = ref(sessionStorage.getItem('current_farm_name') || '未命名场区')

// ==================== 状态 ====================
const loading = ref(true)
const refreshing = ref(false)
const pondList = ref([])
const allPondIoT = ref({})
const stockingMap = ref({})
const patrolMap = ref({})  // pondId → lastPatrolTime
const lastUpdateTime = ref('--')
let refreshTimer = null

// ==================== 批次统计 ====================
const batchStats = ref({
  activeBatches: 0,
  totalStocked: 0,
  todayDone: 0,
  todayTotal: 0,
  todayPending: 0,
  alarmCount: 0
})

// ==================== 工具函数 ====================
const formatNumber = (n) => n ? n.toLocaleString() : '0'

// ==================== 健康评估 ====================
const getTempColor = (t) => {
  if (t == null) return 'text-gray-400'
  if (t > 35) return 'text-red-600'
  if (t > 30) return 'text-amber-600'
  return 'text-blue-600'
}
const getDoColor = (d) => {
  if (d == null) return 'text-gray-400'
  if (d < 3.5) return 'text-red-600'
  if (d < 5.0) return 'text-amber-600'
  return 'text-teal-600'
}
const getPhColor = (p) => {
  if (p == null) return 'text-gray-400'
  if (p < 6.5 || p > 9.0) return 'text-red-600'
  if (p < 7.0 || p > 8.5) return 'text-amber-600'
  return 'text-gray-700'
}

// ==================== 池塘卡片 computed ====================
const pondCards = computed(() => {
  return pondList.value.map(pond => {
    const iot = allPondIoT.value[pond.id] || {}
    const stock = stockingMap.value[pond.id] || {}
    const doxy = iot.dissolvedOxygen ? Number(iot.dissolvedOxygen) : null
    const temp = iot.waterTemp ? Number(iot.waterTemp) : null
    const ph = iot.phValue ? Number(iot.phValue) : null

    let health = 'normal'
    if (doxy !== null && doxy < 3.5) health = 'danger'
    else if (temp !== null && temp > 35) health = 'danger'
    else if (ph !== null && (ph < 6.5 || ph > 9.0)) health = 'danger'
    else if (doxy !== null && doxy < 5.0) health = 'warning'
    else if (temp !== null && temp > 30) health = 'warning'
    else if (ph !== null && (ph < 7.0 || ph > 8.5)) health = 'warning'

    return {
      pondId: pond.id,
      pondName: pond.pondName,
      areaMu: pond.areaMu,
      waterTemp: iot.waterTemp || null,
      dissolvedOxygen: iot.dissolvedOxygen || null,
      phValue: iot.phValue || null,
      health,
      seedlingName: stock.seedlingName || null,
      batchNos: stock.batchNos || null,
      seedlings: stock.seedlings || [],
      pendingTasks: iot.pendingTasks || 0,
      lastPatrolTime: patrolMap.value[pond.id] || null
    }
  })
})

// ==================== 点击跳转 ====================
const goToDashboard = (pondId) => {
  sessionStorage.setItem('target_pond_id', pondId)
  router.push('/farmer/dashboard')
}

// ==================== 数据加载 ====================
const loadAll = async () => {
  if (!currentFarmId.value) return
  refreshing.value = true
  try {
    await Promise.all([loadPonds(), loadBatchStats()])
    await Promise.all([loadAllPondIoT(), loadPatrolAndAlarm()])
    lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const loadPonds = async () => {
  const res = await getPondPage({ pageNum: 1, pageSize: 100, farmId: currentFarmId.value })
  if (res.code === 200 && res.data?.records) {
    pondList.value = res.data.records
  }
}

const loadBatchStats = async () => {
  try {
    const [stockRes, taskRes] = await Promise.all([
      getStockingPage({ pageNum: 1, pageSize: 500, farmId: currentFarmId.value }),
      getPondTaskPage({ pageNum: 1, pageSize: 500, farmId: currentFarmId.value, scheduledDate: new Date().toISOString().split('T')[0] })
    ])
    if (stockRes.code === 200 && stockRes.data) {
      const records = stockRes.data.records || []
      const activeRecords = records.filter(r => r.batchStatus === 2)
      batchStats.value.activeBatches = activeRecords.length
      batchStats.value.totalStocked = activeRecords.reduce((sum, r) => sum + (r.stockedQty || 0), 0)
      
      const map = {}
      for (const r of activeRecords) {
        if (!r.pondId) continue
        if (!map[r.pondId]) {
          map[r.pondId] = { seedlingNames: new Set(), batchNoSet: new Set(), seedlingQtyMap: new Map() }
        }
        if (r.seedlingName) {
          map[r.pondId].seedlingNames.add(r.seedlingName)
          const prev = map[r.pondId].seedlingQtyMap.get(r.seedlingName) || 0
          map[r.pondId].seedlingQtyMap.set(r.seedlingName, prev + (r.stockedQty || 0))
        }
        if (r.batchNo) map[r.pondId].batchNoSet.add(r.batchNo)
      }
      for (const [pid, info] of Object.entries(map)) {
        const seedlings = []
        for (const [name, qty] of info.seedlingQtyMap) {
          seedlings.push({ name, qty })
        }
        stockingMap.value[pid] = {
          seedlingName: [...info.seedlingNames].join('、'),
          batchNos: [...info.batchNoSet].join('、'),
          seedlings
        }
      }
    }
    if (taskRes.code === 200 && taskRes.data) {
      const tasks = taskRes.data.records || []
      batchStats.value.todayTotal = tasks.length
      batchStats.value.todayDone = tasks.filter(t => t.status === 1).length
      batchStats.value.todayPending = tasks.filter(t => t.status === 0).length
    }
  } catch (e) { /* ignore */ }
}

const loadAllPondIoT = async () => {
  try {
    const res = await getLatestAllSensorData(currentFarmId.value)
    if (res.code === 200 && res.data) {
      const map = {}
      const today = new Date().toISOString().split('T')[0]
      for (const item of res.data) {
        const pid = item.pondId
        map[pid] = { ...item, pendingTasks: 0 }
        getPondTaskPage({ pageNum: 1, pageSize: 50, pondId: pid, scheduledDate: today, status: 0 })
          .then(r => { if (r.code === 200 && r.data) map[pid].pendingTasks = r.data.total || 0 })
          .catch(() => {})
      }
      allPondIoT.value = map
    }
  } catch (e) { /* ignore */ }
}

const loadPatrolAndAlarm = async () => {
  try {
    const [patrolRes, alarmRes] = await Promise.all([
      getPatrolLogPage({ pageNum: 1, pageSize: 500, farmId: currentFarmId.value }),
      getAlarmPage({ pageNum: 1, pageSize: 1, farmId: currentFarmId.value, isHandled: 0 })
    ])
    // 巡塘：取每个池塘最近一次 patrolTime
    if (patrolRes.code === 200 && patrolRes.data) {
      const records = patrolRes.data.records || []
      const map = {}
      for (const r of records) {
        if (!r.pondId) continue
        if (!map[r.pondId] || new Date(r.patrolTime) > new Date(map[r.pondId])) {
          map[r.pondId] = r.patrolTime
        }
      }
      patrolMap.value = map
    }
    // 告警：养殖场级别统计（AlarmRecord 无 pondId，仅 farmId）
    if (alarmRes.code === 200 && alarmRes.data) {
      batchStats.value.alarmCount = alarmRes.data.total || 0
    }
  } catch (e) { /* ignore */ }
}

onMounted(() => { loadAll() })
onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })
</script>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin { animation: spin 1s linear infinite; }
</style>