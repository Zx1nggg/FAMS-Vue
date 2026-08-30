<template>
  <div class="min-h-screen bg-slate-100 p-4 md:p-6">
    <div class="mx-auto max-w-[1500px] space-y-5">
      <header class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">风险异常预警</h1>
          <p class="mt-1 text-sm text-slate-500">集中监管水质、生产和系统风险事件，跟踪确认、处理与闭环状态。</p>
        </div>
        <button
          class="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          :disabled="loading"
          @click="refreshAll"
        >
          <RefreshCw :class="['h-4 w-4', loading && 'animate-spin']" />
          刷新
        </button>
      </header>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div v-for="card in statCards" :key="card.label" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-medium text-slate-500">{{ card.label }}</p>
              <p :class="['mt-2 text-2xl font-bold', card.color]">{{ card.value }}</p>
            </div>
            <component :is="card.icon" :class="['h-6 w-6', card.color]" />
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-800">近 30 天告警趋势</h2>
            <span class="text-xs text-slate-400">按创建时间统计</span>
          </div>
          <div ref="trendRef" class="h-72 w-full"></div>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-800">IoT 实时异常</h2>
            <span class="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">{{ realtimeAlerts.length }} 项</span>
          </div>
          <div class="max-h-72 space-y-3 overflow-auto pr-1">
            <div v-if="realtimeAlerts.length === 0" class="rounded-md border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
              当前暂无实时水质异常
            </div>
            <div v-for="item in realtimeAlerts" :key="`${item.pondId}-${item.alertField}`" class="rounded-md border border-red-100 bg-red-50/60 p-3">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-bold text-slate-800">{{ item.farmName || '未知养殖场' }}</p>
                  <p class="mt-1 text-xs text-slate-500">{{ item.pondName }} · {{ iotFieldLabel(item.alertField) }}</p>
                </div>
                <span class="text-sm font-bold text-red-600">{{ formatNumber(item.currentValue) }}</span>
              </div>
              <p class="mt-2 text-xs text-slate-500">
                阈值：{{ thresholdText(item) }} · {{ formatTime(item.dataTime) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 p-4">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-6">
            <select v-model="filters.farmId" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
              <option value="">全部养殖场</option>
              <option v-for="farm in farms" :key="farm.farmId" :value="farm.farmId">{{ farm.farmName }}</option>
            </select>
            <select v-model="filters.severity" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
              <option value="">全部等级</option>
              <option value="3">严重</option>
              <option value="2">警告</option>
              <option value="1">提示</option>
            </select>
            <select v-model="filters.status" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
              <option value="">全部状态</option>
              <option value="0">待确认</option>
              <option value="1">已确认</option>
              <option value="2">处理中</option>
              <option value="3">已解决</option>
              <option value="4">已关闭</option>
            </select>
            <select v-model="filters.sourceType" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
              <option value="">全部来源</option>
              <option value="IOT">IoT 水质</option>
              <option value="BIOLOGY">生物异常</option>
              <option value="QUARANTINE">检疫异常</option>
              <option value="TRANSPORT">流通异常</option>
              <option value="SYSTEM">系统异常</option>
            </select>
            <input v-model="filters.startDate" type="date" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700" />
            <div class="flex gap-2">
              <input v-model="filters.endDate" type="date" class="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700" />
              <button class="h-9 rounded-md bg-slate-800 px-3 text-sm font-medium text-white hover:bg-slate-700" @click="loadAlerts">筛选</button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[1100px] text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th class="px-4 py-3">告警对象</th>
                <th class="px-4 py-3">事件</th>
                <th class="px-4 py-3">来源</th>
                <th class="px-4 py-3">等级</th>
                <th class="px-4 py-3">状态</th>
                <th class="px-4 py-3">触发值</th>
                <th class="px-4 py-3">最近发生</th>
                <th class="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="alertRows.length === 0">
                <td colspan="8" class="px-4 py-12 text-center text-slate-400">暂无告警记录</td>
              </tr>
              <tr v-for="row in alertRows" :key="row.id" class="hover:bg-slate-50">
                <td class="px-4 py-3">
                  <p class="font-medium text-slate-800">{{ row.farmName || '未知养殖场' }}</p>
                  <p class="mt-1 text-xs text-slate-500">{{ row.pondName || '场区级告警' }}</p>
                </td>
                <td class="px-4 py-3">
                  <p class="font-medium text-slate-800">{{ row.title }}</p>
                  <p class="mt-1 max-w-md truncate text-xs text-slate-500">{{ row.message }}</p>
                </td>
                <td class="px-4 py-3">{{ sourceLabel(row.sourceType) }}</td>
                <td class="px-4 py-3">
                  <span :class="['rounded-full px-2 py-1 text-xs font-medium', severityClass(row.severity)]">{{ severityLabel(row.severity) }}</span>
                </td>
                <td class="px-4 py-3">
                  <span :class="['rounded-full px-2 py-1 text-xs font-medium', statusClass(row.status)]">{{ statusLabel(row.status) }}</span>
                </td>
                <td class="px-4 py-3 text-slate-600">{{ triggerText(row) }}</td>
                <td class="px-4 py-3 text-slate-500">{{ formatTime(row.lastOccurredAt || row.createdAt) }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button v-if="row.status === 0" class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50" @click="openHandle(row, 1)">确认</button>
                    <button v-if="row.status === 0 || row.status === 1" class="rounded-md border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50" @click="openHandle(row, 2)">处理</button>
                    <button v-if="row.status <= 2" class="rounded-md border border-emerald-200 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50" @click="openHandle(row, 3)">解决</button>
                    <button v-if="row.status === 3" class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50" @click="openHandle(row, 4)">关闭</button>
                    <button v-if="row.status >= 3" class="rounded-md border border-amber-200 px-2 py-1 text-xs text-amber-700 hover:bg-amber-50" @click="openHandle(row, 0)">重开</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
          <span>共 {{ pagination.total }} 条</span>
          <div class="flex items-center gap-2">
            <button class="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50" :disabled="pagination.current <= 1" @click="changePage(pagination.current - 1)">上一页</button>
            <span>{{ pagination.current }} / {{ totalPages }}</span>
            <button class="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50" :disabled="pagination.current >= totalPages" @click="changePage(pagination.current + 1)">下一页</button>
          </div>
        </div>
      </section>
    </div>

    <div v-if="handleDialog.visible" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div class="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div class="border-b border-slate-200 px-5 py-4">
          <h3 class="text-base font-bold text-slate-900">{{ statusLabel(handleDialog.status) }}告警</h3>
          <p class="mt-1 text-sm text-slate-500">{{ handleDialog.row?.title }}</p>
        </div>
        <div class="p-5">
          <label class="text-sm font-medium text-slate-700">处理备注</label>
          <textarea v-model="handleDialog.remark" rows="4" class="mt-2 w-full resize-none rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="填写核查结论、处理要求或闭环说明"></textarea>
          <p v-if="handleDialog.status === 3" class="mt-2 text-xs text-amber-600">解决告警必须填写备注。</p>
        </div>
        <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700" @click="handleDialog.visible = false">取消</button>
          <button class="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" :disabled="submitting" @click="submitHandle">提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import { Activity, AlertTriangle, CheckCircle2, Clock3, RefreshCw } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import {
  getAlertList,
  getAlertStats,
  getAlertTrend,
  getFarmsGeo,
  getIotRealtimeAlerts,
  handleAlert,
} from '@/api/regulator'
import type { AlertItem, AlertStats, AlertTrend, FarmGeo, IotRealtimeAlert, PageResult } from '@/types/regulator'

const route = useRoute()
const loading = ref(false)
const submitting = ref(false)
const stats = ref<AlertStats>({
  totalCount: 0,
  activeCount: 0,
  pendingCount: 0,
  processingCount: 0,
  resolvedCount: 0,
  criticalCount: 0,
  todayNewCount: 0,
  byType: {},
  byLevel: {},
})
const trend = ref<AlertTrend[]>([])
const farms = ref<FarmGeo[]>([])
const realtimeAlerts = ref<IotRealtimeAlert[]>([])
const alertRows = ref<AlertItem[]>([])
const pagination = reactive({ current: 1, size: 10, total: 0 })
const filters = reactive({
  farmId: '',
  severity: '',
  status: '',
  sourceType: '',
  startDate: '',
  endDate: '',
})
const trendRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const handleDialog = reactive<{ visible: boolean; row: AlertItem | null; status: number; remark: string }>({
  visible: false,
  row: null,
  status: 1,
  remark: '',
})

const statCards = computed(() => [
  { label: '活动告警', value: stats.value.activeCount ?? 0, color: 'text-red-600', icon: AlertTriangle },
  { label: '严重告警', value: stats.value.criticalCount ?? 0, color: 'text-rose-600', icon: Activity },
  { label: '今日新增', value: stats.value.todayNewCount ?? 0, color: 'text-amber-600', icon: Clock3 },
  { label: '已解决', value: stats.value.resolvedCount ?? 0, color: 'text-emerald-600', icon: CheckCircle2 },
])

const totalPages = computed(() => Math.max(1, Math.ceil(pagination.total / pagination.size)))

onMounted(async () => {
  applyRouteFilter()
  await refreshAll()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
})

async function refreshAll() {
  loading.value = true
  try {
    await Promise.all([loadStats(), loadTrend(), loadRealtimeAlerts(), loadFarms(), loadAlerts()])
  } finally {
    loading.value = false
  }
}

function applyRouteFilter() {
  const farmId = route.query.farmId
  filters.farmId = typeof farmId === 'string' ? farmId : ''
}

async function loadStats() {
  const res = await getAlertStats()
  stats.value = res.data
}

async function loadTrend() {
  const res = await getAlertTrend(30)
  trend.value = res.data || []
  await nextTick()
  renderTrend()
}

async function loadRealtimeAlerts() {
  const res = await getIotRealtimeAlerts()
  realtimeAlerts.value = res.data || []
}

async function loadFarms() {
  const res = await getFarmsGeo()
  farms.value = res.data || []
}

async function loadAlerts() {
  const params = {
    pageNum: pagination.current,
    pageSize: pagination.size,
    farmId: filters.farmId || undefined,
    severity: filters.severity || undefined,
    status: filters.status || undefined,
    sourceType: filters.sourceType || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  }
  const res = await getAlertList(params)
  const page = res.data as PageResult<AlertItem>
  alertRows.value = page.records || []
  pagination.total = page.total || 0
  pagination.current = page.current || pagination.current
  pagination.size = page.size || pagination.size
}

function renderTrend() {
  if (!trendRef.value) return
  if (!chart) chart = echarts.init(trendRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0, right: 0, data: ['严重', '警告', '提示'] },
    grid: { left: 32, right: 18, top: 42, bottom: 28 },
    xAxis: { type: 'category', data: trend.value.map(item => item.date.slice(5)), axisTick: { show: false } },
    yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#e2e8f0' } } },
    series: [
      { name: '严重', type: 'line', smooth: true, data: trend.value.map(item => item.criticalCount), color: '#e11d48' },
      { name: '警告', type: 'line', smooth: true, data: trend.value.map(item => item.warningCount), color: '#f59e0b' },
      { name: '提示', type: 'line', smooth: true, data: trend.value.map(item => item.infoCount), color: '#2563eb' },
    ],
  })
}

function resizeChart() {
  chart?.resize()
}

function changePage(page: number) {
  pagination.current = page
  loadAlerts()
}

function openHandle(row: AlertItem, status: number) {
  handleDialog.row = row
  handleDialog.status = status
  handleDialog.remark = ''
  handleDialog.visible = true
}

async function submitHandle() {
  if (!handleDialog.row) return
  if (handleDialog.status === 3 && !handleDialog.remark.trim()) {
    ElMessage.warning('解决告警必须填写处理备注')
    return
  }
  submitting.value = true
  try {
    await handleAlert(handleDialog.row.id, {
      status: handleDialog.status,
      remark: handleDialog.remark.trim() || undefined,
    })
    ElMessage.success('告警状态已更新')
    handleDialog.visible = false
    await Promise.all([loadStats(), loadAlerts(), loadTrend()])
  } finally {
    submitting.value = false
  }
}

function severityLabel(value?: number) {
  return value === 3 ? '严重' : value === 2 ? '警告' : '提示'
}

function severityClass(value?: number) {
  if (value === 3) return 'bg-red-50 text-red-700'
  if (value === 2) return 'bg-amber-50 text-amber-700'
  return 'bg-blue-50 text-blue-700'
}

function statusLabel(value?: number) {
  const map: Record<number, string> = { 0: '待确认', 1: '已确认', 2: '处理中', 3: '已解决', 4: '已关闭' }
  return map[value ?? 0] || '未知'
}

function statusClass(value?: number) {
  if (value === 0) return 'bg-red-50 text-red-700'
  if (value === 1) return 'bg-blue-50 text-blue-700'
  if (value === 2) return 'bg-amber-50 text-amber-700'
  if (value === 3) return 'bg-emerald-50 text-emerald-700'
  return 'bg-slate-100 text-slate-600'
}

function sourceLabel(value?: string) {
  const map: Record<string, string> = {
    IOT: 'IoT 水质',
    BIOLOGY: '生物异常',
    QUARANTINE: '检疫异常',
    TRANSPORT: '流通异常',
    SYSTEM: '系统',
  }
  return value ? map[value] || value : '未知'
}

function iotFieldLabel(value: string) {
  return value === 'waterTemp' ? '水温异常' : value === 'doLevel' ? '溶氧异常' : 'pH 异常'
}

function thresholdText(item: IotRealtimeAlert) {
  if (item.thresholdMin !== undefined && item.thresholdMax !== undefined) return `${item.thresholdMin} - ${item.thresholdMax}`
  if (item.thresholdMin !== undefined) return `>= ${item.thresholdMin}`
  if (item.thresholdMax !== undefined) return `<= ${item.thresholdMax}`
  return '-'
}

function triggerText(row: AlertItem) {
  if (row.triggerValue === undefined || row.triggerValue === null) return '-'
  const unit = row.metricUnit || ''
  if (row.thresholdValueHigh !== undefined && row.thresholdValueHigh !== null) {
    return `${row.triggerValue}${unit} / ${row.thresholdValue}-${row.thresholdValueHigh}${unit}`
  }
  return `${row.triggerValue}${unit} / ${row.thresholdOperator || ''} ${row.thresholdValue ?? '-'}${unit}`
}

function formatNumber(value?: number) {
  if (value === undefined || value === null) return '-'
  return Number(value).toFixed(2)
}

function formatTime(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}
</script>
