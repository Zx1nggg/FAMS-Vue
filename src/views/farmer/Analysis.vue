<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <div v-if="!currentFarmId" class="flex min-h-[70vh] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
        <Home class="h-10 w-10 text-amber-500" />
      </div>
      <h2 class="mb-2 text-xl font-bold text-gray-800">未选择操作场区</h2>
      <p class="mb-6 text-gray-500">您需要先指定一个具体的养殖场，才能查看经营统计与成活率分析。</p>
      <el-button type="primary" size="large" class="!rounded-xl !border-none !bg-teal-600 hover:!bg-teal-700" @click="$router.push('/farmer/base/farm')">
        去选择养殖场
      </el-button>
    </div>

    <div v-else class="mx-auto max-w-[1500px] space-y-5">
      <header class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">经营统计分析</h1>
          <p class="mt-1 text-sm text-gray-500">复盘当前场区「{{ currentFarmName }}」的成活率、产量、成本与利润，辅助下一批次投放决策。</p>
        </div>
        <button
          class="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          :disabled="loading || exporting"
          @click="handleExport"
        >
          <Download class="h-4 w-4" />
          导出 Excel
        </button>
      </header>

      <section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
          <select v-model="filters.seedlingId" class="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700">
            <option value="">全部苗种</option>
            <option v-for="seedling in seedlings" :key="seedling.id" :value="seedling.id">{{ seedling.categoryName }}</option>
          </select>
          <select v-model="filters.groupBy" class="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700">
            <option value="batch">按批次</option>
            <option value="seedling">按苗种</option>
          </select>
          <input v-model="filters.startDate" type="date" class="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700" />
          <input v-model="filters.endDate" type="date" class="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700" />
          <button class="h-9 rounded-md bg-slate-800 px-3 text-sm font-medium text-white hover:bg-slate-700" @click="refreshAll">筛选</button>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <div v-for="card in statCards" :key="card.label" class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium text-gray-500">{{ card.label }}</p>
          <p :class="['mt-2 text-xl font-bold', card.color]">{{ card.value }}</p>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-bold text-gray-800">成活率表现</h2>
            <span class="text-xs text-gray-400">{{ filters.groupBy === 'seedling' ? '苗种维度' : '批次维度' }}</span>
          </div>
          <div ref="survivalRef" class="h-80 w-full"></div>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-bold text-gray-800">月度成活率趋势</h2>
            <span class="text-xs text-gray-400">平均 / 最高 / 最低</span>
          </div>
          <div ref="trendRef" class="h-80 w-full"></div>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm xl:col-span-2">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-bold text-gray-800">产量与利润</h2>
            <span class="text-xs text-gray-400">当前场区出塘统计</span>
          </div>
          <div ref="productionRef" class="h-80 w-full"></div>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-bold text-gray-800">经营结构</h2>
            <span class="text-xs text-gray-400">收入 / 成本 / 利润</span>
          </div>
          <div ref="pieRef" class="h-80 w-full"></div>
        </div>
      </section>

      <section class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 class="text-sm font-bold text-gray-800">成活率明细</h2>
          <span class="text-xs text-gray-400">{{ survivalRows.length }} 条</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[1000px] text-left text-sm">
            <thead class="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3">批次/维度</th>
                <th class="px-4 py-3">苗种</th>
                <th class="px-4 py-3 text-right">投放尾数</th>
                <th class="px-4 py-3 text-right">估算出塘尾数</th>
                <th class="px-4 py-3 text-right">死亡尾数</th>
                <th class="px-4 py-3 text-right">成活率</th>
                <th class="px-4 py-3 text-right">收获重量</th>
                <th class="px-4 py-3 text-right">批次数</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="survivalRows.length === 0">
                <td colspan="8" class="px-4 py-12 text-center text-gray-400">暂无统计数据</td>
              </tr>
              <tr v-for="row in survivalRows" :key="row.dimKey" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-800">{{ row.dimLabel }}</td>
                <td class="px-4 py-3 text-gray-600">{{ row.seedlingName || '-' }}</td>
                <td class="px-4 py-3 text-right">{{ intText(row.stockedQty) }}</td>
                <td class="px-4 py-3 text-right">{{ intText(row.estimatedHarvestQty) }}</td>
                <td class="px-4 py-3 text-right">{{ intText(row.deathQty) }}</td>
                <td class="px-4 py-3 text-right">
                  <span :class="['rounded-full px-2 py-1 text-xs font-bold', rateClass(row.survivalRate)]">{{ numberText(row.survivalRate, 1) }}%</span>
                </td>
                <td class="px-4 py-3 text-right">{{ numberText(row.totalHarvestWeightKg, 2) }} kg</td>
                <td class="px-4 py-3 text-right">{{ row.batchCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import { Download, Home } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import {
  exportFarmerAnalysis,
  getFarmerProductionRanking,
  getFarmerProductionStats,
  getFarmerSurvivalRate,
  getFarmerSurvivalTrend,
  getSeedlingList,
} from '@/api/base'
import type { ProductionRanking, ProductionStats, SurvivalRate, SurvivalTrend } from '@/types/regulator'

const loading = ref(false)
const exporting = ref(false)
const currentFarmId = ref(sessionStorage.getItem('current_farm_id'))
const currentFarmName = ref(sessionStorage.getItem('current_farm_name') || '未命名场区')
const seedlings = ref<any[]>([])
const survivalRows = ref<SurvivalRate[]>([])
const survivalTrend = ref<SurvivalTrend[]>([])
const productionRanking = ref<ProductionRanking[]>([])
const productionStats = ref<ProductionStats>({
  totalProductionKg: 0,
  totalRevenue: 0,
  totalCost: 0,
  netProfit: 0,
  harvestCount: 0,
  participatingFarmCount: 0,
  avgUnitPrice: 0,
})

const filters = reactive({
  seedlingId: '',
  groupBy: 'batch',
  startDate: '',
  endDate: '',
})

const survivalRef = ref<HTMLDivElement | null>(null)
const trendRef = ref<HTMLDivElement | null>(null)
const productionRef = ref<HTMLDivElement | null>(null)
const pieRef = ref<HTMLDivElement | null>(null)
let survivalChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null
let productionChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const avgSurvivalRate = computed(() => {
  if (survivalRows.value.length === 0) return 0
  return survivalRows.value.reduce((sum, row) => sum + Number(row.survivalRate || 0), 0) / survivalRows.value.length
})

const statCards = computed(() => [
  { label: '平均成活率', value: `${numberText(avgSurvivalRate.value, 1)}%`, color: 'text-teal-600' },
  { label: '总投放尾数', value: intText(survivalRows.value.reduce((sum, row) => sum + Number(row.stockedQty || 0), 0)), color: 'text-blue-600' },
  { label: '总产量', value: `${numberText(productionStats.value.totalProductionKg, 2)} kg`, color: 'text-indigo-600' },
  { label: '总收入', value: `¥${moneyText(productionStats.value.totalRevenue)}`, color: 'text-emerald-600' },
  { label: '总成本', value: `¥${moneyText(productionStats.value.totalCost)}`, color: 'text-amber-600' },
  { label: '净利润', value: `¥${moneyText(productionStats.value.netProfit)}`, color: Number(productionStats.value.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600' },
])

onMounted(async () => {
  if (!currentFarmId.value) return
  await Promise.all([loadOptions(), refreshAll()])
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  survivalChart?.dispose()
  trendChart?.dispose()
  productionChart?.dispose()
  pieChart?.dispose()
})

async function loadOptions() {
  const res = await getSeedlingList()
  seedlings.value = res.data || []
}

async function refreshAll() {
  loading.value = true
  try {
    const params = buildParams()
    const [survivalRes, trendRes, productionRes, rankingRes] = await Promise.all([
      getFarmerSurvivalRate(params),
      getFarmerSurvivalTrend(params),
      getFarmerProductionStats(params),
      getFarmerProductionRanking({ ...params, limit: 10 }),
    ])
    survivalRows.value = survivalRes.data || []
    survivalTrend.value = trendRes.data || []
    productionStats.value = productionRes.data
    productionRanking.value = rankingRes.data || []
    await nextTick()
    renderCharts()
  } finally {
    loading.value = false
  }
}

async function handleExport() {
  exporting.value = true
  try {
    const response = await exportFarmerAnalysis({ ...buildParams(), type: 'all' }) as any
    downloadBlob(response.data, 'FAMS-经营统计分析.xlsx')
  } finally {
    exporting.value = false
  }
}

function buildParams() {
  return {
    seedlingId: filters.seedlingId || undefined,
    groupBy: filters.groupBy,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  }
}

function renderCharts() {
  renderSurvivalChart()
  renderTrendChart()
  renderProductionChart()
  renderPieChart()
}

function renderSurvivalChart() {
  if (!survivalRef.value) return
  if (!survivalChart) survivalChart = echarts.init(survivalRef.value)
  const data = survivalRows.value.slice(0, 12)
  survivalChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 42, right: 16, top: 20, bottom: 72 },
    xAxis: { type: 'category', data: data.map(item => item.dimLabel), axisLabel: { rotate: 35, width: 90, overflow: 'truncate' } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{ type: 'bar', data: data.map(item => item.survivalRate), itemStyle: { color: (p: any) => rateColor(data[p.dataIndex]?.survivalRate) }, barMaxWidth: 26 }],
  })
}

function renderTrendChart() {
  if (!trendRef.value) return
  if (!trendChart) trendChart = echarts.init(trendRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0, right: 0, data: ['平均', '最高', '最低'] },
    grid: { left: 42, right: 16, top: 44, bottom: 30 },
    xAxis: { type: 'category', data: survivalTrend.value.map(item => item.month) },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      { name: '平均', type: 'line', smooth: true, data: survivalTrend.value.map(item => item.avgSurvivalRate), color: '#0d9488' },
      { name: '最高', type: 'line', smooth: true, data: survivalTrend.value.map(item => item.maxRate), color: '#2563eb' },
      { name: '最低', type: 'line', smooth: true, data: survivalTrend.value.map(item => item.minRate), color: '#e11d48' },
    ],
  })
}

function renderProductionChart() {
  if (!productionRef.value) return
  if (!productionChart) productionChart = echarts.init(productionRef.value)
  const labels = productionRanking.value.map(item => item.farmName || '当前场区')
  productionChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0, right: 0, data: ['产量', '净利润'] },
    grid: { left: 56, right: 18, top: 44, bottom: 36 },
    xAxis: { type: 'category', data: labels.length ? labels : ['当前场区'] },
    yAxis: [
      { type: 'value', name: 'kg', splitLine: { lineStyle: { color: '#e5e7eb' } } },
      { type: 'value', name: '元' },
    ],
    series: [
      { name: '产量', type: 'bar', data: productionRanking.value.map(item => item.totalProductionKg), color: '#2563eb', barMaxWidth: 26 },
      { name: '净利润', type: 'line', yAxisIndex: 1, data: productionRanking.value.map(item => item.netProfit), color: '#059669' },
    ],
  })
}

function renderPieChart() {
  if (!pieRef.value) return
  if (!pieChart) pieChart = echarts.init(pieRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['46%', '72%'],
      data: [
        { name: '收入', value: Number(productionStats.value.totalRevenue || 0) },
        { name: '成本', value: Number(productionStats.value.totalCost || 0) },
        { name: '利润', value: Math.max(0, Number(productionStats.value.netProfit || 0)) },
      ],
      color: ['#059669', '#f59e0b', '#2563eb'],
    }],
  })
}

function resizeCharts() {
  survivalChart?.resize()
  trendChart?.resize()
  productionChart?.resize()
  pieChart?.resize()
}

function rateColor(value?: number) {
  const rate = Number(value || 0)
  if (rate < 70) return '#e11d48'
  if (rate < 85) return '#f59e0b'
  return '#0d9488'
}

function rateClass(value?: number) {
  const rate = Number(value || 0)
  if (rate < 70) return 'bg-red-50 text-red-700'
  if (rate < 85) return 'bg-amber-50 text-amber-700'
  return 'bg-teal-50 text-teal-700'
}

function numberText(value?: number, digits = 1) {
  return Number(value || 0).toFixed(digits)
}

function intText(value?: number) {
  return Math.round(Number(value || 0)).toLocaleString('zh-CN')
}

function moneyText(value?: number) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('报表已开始下载')
}
</script>
