<template>
  <div class="min-h-screen bg-slate-100 p-4 md:p-6">
    <div class="mx-auto max-w-[1500px] space-y-5">
      <header class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">多维成活率分析</h1>
          <p class="mt-1 text-sm text-slate-500">按批次、养殖场和苗种汇总投放、死亡与估算出塘成活情况。</p>
        </div>
        <button class="inline-flex h-9 items-center gap-2 rounded-md bg-slate-800 px-4 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60" :disabled="loading || exporting" @click="handleExport">
          <Download class="h-4 w-4" />
          导出 Excel
        </button>
      </header>

      <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-6">
          <select v-model="filters.farmId" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
            <option value="">全部养殖场</option>
            <option v-for="farm in farms" :key="farm.farmId" :value="farm.farmId">{{ farm.farmName }}</option>
          </select>
          <select v-model="filters.seedlingId" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
            <option value="">全部苗种</option>
            <option v-for="seedling in seedlings" :key="seedling.id" :value="seedling.id">{{ seedling.categoryName }}</option>
          </select>
          <select v-model="filters.groupBy" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
            <option value="batch">按批次</option>
            <option value="farm">按养殖场</option>
            <option value="seedling">按苗种</option>
          </select>
          <input v-model="filters.startDate" type="date" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700" />
          <input v-model="filters.endDate" type="date" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700" />
          <button class="h-9 rounded-md bg-slate-800 px-3 text-sm font-medium text-white hover:bg-slate-700" @click="refreshAll">筛选</button>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div v-for="card in statCards" :key="card.label" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium text-slate-500">{{ card.label }}</p>
          <p :class="['mt-2 text-2xl font-bold', card.color]">{{ card.value }}</p>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-800">成活率对比</h2>
            <span class="text-xs text-slate-400">{{ groupLabel }}</span>
          </div>
          <div ref="barRef" class="h-80 w-full"></div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-800">月度趋势</h2>
            <span class="text-xs text-slate-400">按批次分析日期统计</span>
          </div>
          <div ref="trendRef" class="h-80 w-full"></div>
        </div>
      </section>

      <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[1000px] text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th class="px-4 py-3">统计维度</th>
                <th class="px-4 py-3">养殖场</th>
                <th class="px-4 py-3">苗种</th>
                <th class="px-4 py-3 text-right">投放尾数</th>
                <th class="px-4 py-3 text-right">估算出塘尾数</th>
                <th class="px-4 py-3 text-right">死亡尾数</th>
                <th class="px-4 py-3 text-right">成活率</th>
                <th class="px-4 py-3 text-right">收获重量</th>
                <th class="px-4 py-3 text-right">批次数</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="rows.length === 0">
                <td colspan="9" class="px-4 py-12 text-center text-slate-400">暂无成活率统计数据</td>
              </tr>
              <tr v-for="row in rows" :key="row.dimKey" class="hover:bg-slate-50">
                <td class="px-4 py-3 font-medium text-slate-800">{{ row.dimLabel }}</td>
                <td class="px-4 py-3 text-slate-600">{{ row.farmName || '-' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ row.seedlingName || '-' }}</td>
                <td class="px-4 py-3 text-right">{{ intText(row.stockedQty) }}</td>
                <td class="px-4 py-3 text-right">{{ intText(row.estimatedHarvestQty) }}</td>
                <td class="px-4 py-3 text-right">{{ intText(row.deathQty) }}</td>
                <td class="px-4 py-3 text-right">
                  <span :class="['rounded-full px-2 py-1 text-xs font-bold', rateClass(row.survivalRate)]">{{ numberText(row.survivalRate) }}%</span>
                </td>
                <td class="px-4 py-3 text-right">{{ numberText(row.totalHarvestWeightKg) }} kg</td>
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
import { Download } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { exportAnalysis, getFarmsGeo, getSurvivalRate, getSurvivalTrend } from '@/api/regulator'
import { getSeedlingList } from '@/api/base'
import type { FarmGeo, SurvivalRate, SurvivalTrend } from '@/types/regulator'

const loading = ref(false)
const exporting = ref(false)
const rows = ref<SurvivalRate[]>([])
const trend = ref<SurvivalTrend[]>([])
const farms = ref<FarmGeo[]>([])
const seedlings = ref<any[]>([])
const barRef = ref<HTMLDivElement | null>(null)
const trendRef = ref<HTMLDivElement | null>(null)
let barChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

const filters = reactive({
  farmId: '',
  seedlingId: '',
  groupBy: 'batch',
  startDate: '',
  endDate: '',
})

const groupLabel = computed(() => filters.groupBy === 'farm' ? '养殖场维度' : filters.groupBy === 'seedling' ? '苗种维度' : '批次维度')
const avgRate = computed(() => rows.value.length === 0 ? 0 : rows.value.reduce((sum, row) => sum + Number(row.survivalRate || 0), 0) / rows.value.length)
const statCards = computed(() => [
  { label: '平均成活率', value: `${numberText(avgRate.value)}%`, color: 'text-emerald-600' },
  { label: '统计批次数', value: rows.value.reduce((sum, row) => sum + Number(row.batchCount || 0), 0), color: 'text-blue-600' },
  { label: '累计投放', value: intText(rows.value.reduce((sum, row) => sum + Number(row.stockedQty || 0), 0)), color: 'text-slate-800' },
  { label: '累计死亡', value: intText(rows.value.reduce((sum, row) => sum + Number(row.deathQty || 0), 0)), color: 'text-rose-600' },
])

onMounted(async () => {
  await Promise.all([loadOptions(), refreshAll()])
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  barChart?.dispose()
  trendChart?.dispose()
})

async function loadOptions() {
  const [farmRes, seedlingRes] = await Promise.all([getFarmsGeo(), getSeedlingList()])
  farms.value = farmRes.data || []
  seedlings.value = seedlingRes.data || []
}

async function refreshAll() {
  loading.value = true
  try {
    const params = buildParams()
    const [rateRes, trendRes] = await Promise.all([getSurvivalRate(params), getSurvivalTrend(params)])
    rows.value = rateRes.data || []
    trend.value = trendRes.data || []
    await nextTick()
    renderCharts()
  } finally {
    loading.value = false
  }
}

async function handleExport() {
  exporting.value = true
  try {
    const response = await exportAnalysis({ ...buildParams(), type: 'survival' }) as any
    downloadBlob(response.data, 'FAMS-成活率统计.xlsx')
  } finally {
    exporting.value = false
  }
}

function buildParams() {
  return {
    farmId: filters.farmId || undefined,
    seedlingId: filters.seedlingId || undefined,
    groupBy: filters.groupBy,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  }
}

function renderCharts() {
  if (barRef.value) {
    if (!barChart) barChart = echarts.init(barRef.value)
    const data = rows.value.slice(0, 12)
    barChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 16, top: 20, bottom: 72 },
      xAxis: { type: 'category', data: data.map(item => item.dimLabel), axisLabel: { rotate: 35, width: 90, overflow: 'truncate' } },
      yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
      series: [{ type: 'bar', data: data.map(item => item.survivalRate), itemStyle: { color: (p: any) => rateColor(data[p.dataIndex]?.survivalRate) } }],
    })
  }
  if (trendRef.value) {
    if (!trendChart) trendChart = echarts.init(trendRef.value)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { top: 0, right: 0, data: ['平均', '最高', '最低'] },
      grid: { left: 40, right: 16, top: 44, bottom: 30 },
      xAxis: { type: 'category', data: trend.value.map(item => item.month) },
      yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
      series: [
        { name: '平均', type: 'line', smooth: true, data: trend.value.map(item => item.avgSurvivalRate), color: '#059669' },
        { name: '最高', type: 'line', smooth: true, data: trend.value.map(item => item.maxRate), color: '#2563eb' },
        { name: '最低', type: 'line', smooth: true, data: trend.value.map(item => item.minRate), color: '#e11d48' },
      ],
    })
  }
}

function resizeCharts() {
  barChart?.resize()
  trendChart?.resize()
}

function rateColor(value?: number) {
  const rate = Number(value || 0)
  if (rate < 70) return '#e11d48'
  if (rate < 85) return '#f59e0b'
  return '#059669'
}

function rateClass(value?: number) {
  const rate = Number(value || 0)
  if (rate < 70) return 'bg-red-50 text-red-700'
  if (rate < 85) return 'bg-amber-50 text-amber-700'
  return 'bg-emerald-50 text-emerald-700'
}

function numberText(value?: number) {
  return Number(value || 0).toFixed(1)
}

function intText(value?: number) {
  return Math.round(Number(value || 0)).toLocaleString('zh-CN')
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
