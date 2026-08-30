<template>
  <div class="min-h-screen bg-slate-100 flex flex-col font-sans">

   <!-- 主体内容区 -->
    <main class="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      <div class="flex justify-between items-end mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 tracking-tight">全区水产养殖宏观态势</h1>
          <p class="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            数据实时同步中 | 截至{{ currentDate }}，已接入全区
            <span class="font-semibold text-slate-700">{{ stats.totalFarms || '-' }}</span> 家标准化养殖场数据。
          </p>
        </div>
        <!-- 手动刷新按钮 -->
        <button
          @click="refreshAll"
          :disabled="loading"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw :class="['w-3.5 h-3.5', loading && 'animate-spin']" />
          刷新数据
        </button>
      </div>

      <!-- 宏观统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">入网养殖企业</p>
            <h3 class="text-2xl font-bold text-slate-800">
              <template v-if="!loadingStats">{{ stats.totalFarms }} </template>
              <template v-else><span class="inline-block w-12 h-6 bg-slate-200 animate-pulse rounded"></span></template>
              <span class="text-xs font-normal text-slate-500">家</span>
            </h3>
          </div>
          <div class="p-2 bg-blue-50 text-blue-600 rounded-md"><Building2 class="w-5 h-5" /></div>
        </div>
        <div class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">当前存栏活体总量</p>
            <h3 class="text-2xl font-bold text-slate-800">
              <template v-if="!loadingStats">{{ stats.totalLiveStock?.toLocaleString() }} </template>
              <template v-else><span class="inline-block w-16 h-6 bg-slate-200 animate-pulse rounded"></span></template>
              <span class="text-xs font-normal text-slate-500">万尾</span>
            </h3>
          </div>
          <div class="p-2 bg-emerald-50 text-emerald-600 rounded-md"><Fish class="w-5 h-5" /></div>
        </div>
        <div class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">本月下发检疫证明</p>
            <h3 class="text-2xl font-bold text-slate-800">
              <template v-if="!loadingStats">{{ stats.monthlyCertificates }} </template>
              <template v-else><span class="inline-block w-10 h-6 bg-slate-200 animate-pulse rounded"></span></template>
              <span class="text-xs font-normal text-slate-500">张</span>
            </h3>
          </div>
          <div class="p-2 bg-indigo-50 text-indigo-600 rounded-md"><FileCheck class="w-5 h-5" /></div>
        </div>
        <div class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex items-center justify-between"
             :class="{ 'border-b-4 border-b-red-500': stats.unhandledAlertFarms > 0 }">
          <div>
            <p class="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">未处理水质预警场区</p>
            <h3 class="text-2xl font-bold" :class="stats.unhandledAlertFarms > 0 ? 'text-red-600' : 'text-slate-800'">
              <template v-if="!loadingStats">{{ stats.unhandledAlertFarms }} </template>
              <template v-else><span class="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded"></span></template>
              <span class="text-xs font-normal" :class="stats.unhandledAlertFarms > 0 ? 'text-red-400' : 'text-slate-500'">家</span>
            </h3>
          </div>
          <div class="p-2 bg-red-50 text-red-600 rounded-md"><AlertTriangle class="w-5 h-5" /></div>
        </div>
      </div>

      <!-- 核心功能区 (左侧GIS地图，右侧功能面板) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- 左侧：GIS地图监控 -->
        <div class="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Map class="w-4 h-4 text-blue-600" />
              辖区水产养殖基地 GIS 态势与物联网地图
            </h2>
            <div class="flex gap-4 text-xs font-medium">
              <span class="flex items-center gap-1.5 text-emerald-600">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> 正常运行: {{ geoSummary.normal }}
              </span>
              <span class="flex items-center gap-1.5 text-red-500">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> 告警中: {{ geoSummary.alert }}
              </span>
            </div>
          </div>

          <!-- GIS 地图监控 -->
          <GisMap ref="gisMapRef" :farm-data="farmGeoList" :loading="loadingGeo" />
        </div>

        <!-- 右侧：功能与告警面板 -->
        <div class="space-y-6">

          <!-- 溯源搜索引擎 -->
          <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div class="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Search class="w-4 h-4 text-amber-500" />
                EPCIS 溯源核查终端
              </h2>
            </div>
            <div class="p-4">
              <p class="text-slate-500 text-xs mb-4">输入批次溯源码，调取其供应商资质、水质历史、检疫证明与合规用药流水账。</p>
              <div class="flex gap-2">
                <input
                  v-model="traceKeyword"
                  type="text"
                  class="flex-1 pl-3 pr-3 py-2 rounded-md border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm transition-colors bg-slate-50 focus:bg-white"
                  placeholder="批次号 / 溯源码"
                  @keyup.enter="doTraceSearch"
                />
                <button
                  @click="doTraceSearch"
                  :disabled="tracing"
                  class="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white rounded-md px-4 text-sm font-medium transition-colors shadow-sm"
                >
                  {{ tracing ? '查询中...' : '查询' }}
                </button>
              </div>
              <!-- 追溯结果简要展示 -->
              <div v-if="traceResult" class="mt-4 border border-amber-200 bg-amber-50/50 rounded-lg p-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-slate-700">批次号: {{ traceResult.batchNo }}</span>
                  <button @click="traceResult = null" class="text-slate-400 hover:text-slate-600">
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
                <p class="text-xs text-slate-500 mb-2">品种: {{ traceResult.seedlingName || '—' }} | 追溯节点: {{ traceResult.nodes?.length || 0 }} 个</p>
                <div class="text-xs text-slate-600 space-y-1">
                  <div v-for="node in traceResult.nodes?.slice(0, 3)" :key="node.nodeType" class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full"
                          :class="{
                            'bg-blue-500': node.nodeType === 'supplier',
                            'bg-orange-500': node.nodeType === 'purchase',
                            'bg-green-500': node.nodeType === 'stocking',
                            'bg-cyan-500': node.nodeType === 'growth',
                            'bg-yellow-500': node.nodeType === 'patrol',
                            'bg-purple-500': node.nodeType === 'feed',
                            'bg-red-500': node.nodeType === 'harvest',
                          }"
                    ></span>
                    {{ node.nodeName }}
                  </div>
                  <p v-if="traceResult.nodes?.length > 3" class="text-slate-400">...还有 {{ traceResult.nodes.length - 3 }} 个节点</p>
                </div>
              </div>
              <!-- 追溯错误 -->
              <div v-if="traceError" class="mt-4 text-xs text-red-500">{{ traceError }}</div>
            </div>
          </div>

          <!-- 养殖场统一入口 -->
          <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ListFilter class="w-4 h-4 text-blue-600" />
                养殖场快速定位
              </h2>
              <span class="text-xs text-slate-400">{{ filteredFarmGeoList.length }} 家</span>
            </div>
            <div class="p-4">
              <input
                v-model="farmKeyword"
                type="text"
                class="w-full px-3 py-2 rounded-md border border-slate-300 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="搜索养殖场 / 省份 / 品种"
              />
              <div class="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                <button
                  v-for="farm in filteredFarmGeoList"
                  :key="farm.farmId"
                  class="w-full text-left border rounded-md px-3 py-2 transition-colors"
                  :class="selectedFarmId === farm.farmId ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'"
                  @click="selectFarmFromList(farm)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-slate-800 truncate">{{ farm.farmName }}</p>
                      <p class="text-xs text-slate-500 truncate mt-0.5">{{ farm.address || farm.province || '暂无地址' }}</p>
                    </div>
                    <span
                      class="shrink-0 text-[10px] px-1.5 py-0.5 rounded border"
                      :class="farm.alertStatus === 'critical'
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : farm.alertStatus === 'warning'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'"
                    >
                      {{ statusLabel(farm.alertStatus) }}
                    </span>
                  </div>
                  <div class="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-500">
                    <span>{{ farm.pondCount || 0 }} 口池塘</span>
                    <span>{{ formatStockCount(farm.stockCount) }}</span>
                    <span>{{ farm.mainSpecies || '未知品种' }}</span>
                  </div>
                </button>
                <div v-if="!loadingGeo && filteredFarmGeoList.length === 0" class="py-8 text-center text-sm text-slate-400">
                  暂无匹配养殖场
                </div>
              </div>

              <div v-if="selectedFarm" class="mt-3 border border-blue-100 bg-blue-50/60 rounded-md p-3">
                <div class="flex justify-between gap-3">
                  <div>
                    <p class="text-sm font-bold text-slate-800">{{ selectedFarm.farmName }}</p>
                    <p class="text-xs text-slate-500 mt-1">{{ selectedFarm.address || '暂无地址' }}</p>
                  </div>
                  <button class="text-xs text-blue-700 font-medium hover:text-blue-900" @click="openFarmAlerts(selectedFarm)">
                    看告警
                  </button>
                </div>
                <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div class="bg-white/70 rounded px-2 py-1.5">
                    <span class="text-slate-400">当前品种</span>
                    <p class="font-medium text-slate-700">{{ selectedFarm.mainSpecies || '—' }}</p>
                  </div>
                  <div class="bg-white/70 rounded px-2 py-1.5">
                    <span class="text-slate-400">活跃告警</span>
                    <p class="font-medium text-slate-700">{{ selectedFarm.activeAlarmCount || 0 }} 条</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 高风险异常企业列表 — 重点监管督办名单 -->
          <div class="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col flex-1">
            <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertOctagon class="w-4 h-4 text-red-500" />
                重点监管督办名单
              </h2>
              <span class="text-xs text-slate-400">{{ watchlist.length }} 家</span>
            </div>

            <!-- 加载中 -->
            <div v-if="loadingWatchlist" class="p-4 space-y-3">
              <div v-for="i in 2" :key="i" class="animate-pulse">
                <div class="h-16 bg-slate-100 rounded-md"></div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else-if="watchlist.length === 0" class="p-8 flex flex-col items-center justify-center">
              <CheckCircle class="w-8 h-8 text-emerald-400 mb-2" />
              <p class="text-sm text-slate-500 font-medium">暂无高风险养殖场</p>
              <p class="text-xs text-slate-400 mt-1">所有养殖场运行状态良好</p>
            </div>

            <!-- 督办名单列表 -->
            <div v-else class="p-4 space-y-3">
              <div
                v-for="item in watchlist"
                :key="item.farmId"
                class="border-l-2 p-3 rounded-r-md flex flex-col gap-2"
                :class="{
                  'border-red-500 bg-red-50/30': item.riskType === '死亡率异常',
                  'border-amber-500 bg-amber-50/30': item.riskType === '违规操作',
                  'border-orange-400 bg-orange-50/30': item.riskType === '环境异常',
                }"
              >
                <div class="flex justify-between items-start">
                  <h4 class="font-bold text-sm text-slate-800">{{ item.farmName }}</h4>
                  <span class="text-[10px] px-1.5 py-0.5 rounded border"
                        :class="{
                          'bg-red-100 text-red-600 border-red-200': item.riskType === '死亡率异常',
                          'bg-amber-100 text-amber-600 border-amber-200': item.riskType === '违规操作',
                          'bg-orange-100 text-orange-600 border-orange-200': item.riskType === '环境异常',
                        }"
                  >{{ item.riskType }}</span>
                </div>
                <p class="text-xs text-slate-600">{{ item.riskDescription }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-400">{{ item.riskMetric }}</span>
                  <button class="text-xs text-slate-700 font-medium hover:text-blue-600 bg-white px-2 py-1 rounded border border-slate-300 shadow-sm"
                          @click="traceKeyword = item.farmName; doTraceSearch()">
                    调阅台账
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import request from '@/utils/request'
import {
  ShieldCheck, Search, AlertOctagon, X, CheckCircle, RefreshCw, ListFilter,
  Map, Building2, Fish, FileCheck, AlertTriangle
} from 'lucide-vue-next'
import GisMap from '@/components/GisMap.vue'
import { clearUserCache } from '@/utils/storage'
import {
  getDashboardStats, getDashboardAlerts, getDashboardWatchlist,
  getFarmsGeo, quickTrace
} from '@/api/regulator'
import type {
  DashboardStats, DashboardWatchlist, FarmGeo, TraceChain
} from '@/types/regulator'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态
const loading = ref(false)
const loadingStats = ref(false)
const loadingGeo = ref(false)
const loadingWatchlist = ref(false)
const tracing = ref(false)

const stats = ref<DashboardStats>({
  totalFarms: 0,
  totalLiveStock: 0,
  monthlyCertificates: 0,
  unhandledAlertFarms: 0,
})
const watchlist = ref<DashboardWatchlist[]>([])
const farmGeoList = ref<FarmGeo[]>([])
const gisMapRef = ref<any>(null)
const farmKeyword = ref('')
const selectedFarmId = ref<number | null>(null)

// trace search
const traceKeyword = ref('')
const traceResult = ref<TraceChain | null>(null)
const traceError = ref('')

// 计算属性
const geoSummary = computed(() => {
  const normal = farmGeoList.value.filter(f => f.alertStatus === 'normal').length
  const alert = farmGeoList.value.filter(f => f.alertStatus !== 'normal').length
  return { normal, alert }
})
const filteredFarmGeoList = computed(() => {
  const keyword = farmKeyword.value.trim().toLowerCase()
  if (!keyword) return farmGeoList.value
  return farmGeoList.value.filter(f => {
    return [f.farmName, f.address, f.province, f.mainSpecies]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(keyword))
  })
})
const selectedFarm = computed(() => {
  if (selectedFarmId.value == null) return null
  return farmGeoList.value.find(f => f.farmId === selectedFarmId.value) || null
})
const currentDate = ref('')
// API 调用 

async function fetchStats() {
  loadingStats.value = true
  try {
    const res = await getDashboardStats()
    if (res.data) stats.value = res.data
  } catch (e) {
    console.error('获取统计失败:', e)
  } finally {
    loadingStats.value = false
  }
}

async function fetchWatchlist() {
  loadingWatchlist.value = true
  try {
    const res = await getDashboardWatchlist(10)
    if (res.data) watchlist.value = res.data
  } catch (e) {
    console.error('获取督办名单失败:', e)
  } finally {
    loadingWatchlist.value = false
  }
}

async function fetchGeo() {
  loadingGeo.value = true
  try {
    const res = await getFarmsGeo()
    if (res.data) farmGeoList.value = res.data
  } catch (e) {
    console.error('获取GIS数据失败:', e)
  } finally {
    loadingGeo.value = false
  }
}

async function doTraceSearch() {
  const keyword = traceKeyword.value.trim()
  if (!keyword) {
    traceError.value = '请输入批次号或溯源码'
    return
  }
  tracing.value = true
  traceError.value = ''
  traceResult.value = null
  try {
    const res = await quickTrace(keyword)
    if (res.data) traceResult.value = res.data
  } catch (e: any) {
    traceError.value = e?.response?.data?.message || e?.message || '查询失败，请稍后重试'
  } finally {
    tracing.value = false
  }
}

function selectFarmFromList(farm: FarmGeo) {
  selectedFarmId.value = farm.farmId
  gisMapRef.value?.selectFarm?.(farm.farmId)
}

function openFarmAlerts(farm: FarmGeo) {
  router.push({ path: '/regulator/alerts', query: { farmId: farm.farmId } })
}

function formatStockCount(value: number | null | undefined) {
  const count = Number(value)
  if (!Number.isFinite(count) || count < 0) return '暂无数据'
  if (count >= 10000) return `${Number((count / 10000).toFixed(2)).toLocaleString()} 万尾`
  return `${Math.round(count).toLocaleString()} 尾`
}

function statusLabel(status: FarmGeo['alertStatus']) {
  return status === 'critical' ? '告警' : status === 'warning' ? '注意' : '正常'
}

async function refreshAll() {
  loading.value = true
  await Promise.all([fetchStats(), fetchWatchlist(), fetchGeo()])
  loading.value = false
}

// 登出

async function handleLogout() {
  try {
    await request.post('/auth/logout')
  } catch (error) {
    console.error('退出请求失败', error)
  } finally {
    clearUserCache()
    sessionStorage.removeItem('aqua_user')
    sessionStorage.removeItem('current_farm_id')
    router.push('/login')
  }
}
// 计算当前时间
const updateDate = () => {
  const now = new Date()

  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

//  定时刷新 
let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateDate()
  refreshAll()
  // 每 5 分钟自动刷新
  refreshTimer = setInterval(refreshAll, 5 * 60 * 1000)

})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>
