<template>
  <div class="min-h-screen bg-slate-100 p-4 md:p-6">
    <div class="mx-auto max-w-[1500px] space-y-5">
      <header class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">产销全局统计表</h1>
          <p class="mt-1 text-sm text-slate-500">汇总出塘产量、产值、成本与养殖场产量排名，支撑监管报表导出。</p>
        </div>
        <button class="inline-flex h-9 items-center gap-2 rounded-md bg-slate-800 px-4 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60" :disabled="loading || exporting" @click="handleExport">
          <Download class="h-4 w-4" />
          导出 Excel
        </button>
      </header>

      <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
          <select v-model="filters.farmId" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
            <option value="">全部养殖场</option>
            <option v-for="farm in farms" :key="farm.farmId" :value="farm.farmId">{{ farm.farmName }}</option>
          </select>
          <select v-model="filters.seedlingId" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
            <option value="">全部苗种</option>
            <option v-for="seedling in seedlings" :key="seedling.id" :value="seedling.id">{{ seedling.categoryName }}</option>
          </select>
          <input v-model="filters.startDate" type="date" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700" />
          <input v-model="filters.endDate" type="date" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700" />
          <button class="h-9 rounded-md bg-slate-800 px-3 text-sm font-medium text-white hover:bg-slate-700" @click="refreshAll">筛选</button>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <div v-for="card in statCards" :key="card.label" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium text-slate-500">{{ card.label }}</p>
          <p :class="['mt-2 text-xl font-bold', card.color]">{{ card.value }}</p>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-800">养殖场产量排名</h2>
            <span class="text-xs text-slate-400">TOP 10</span>
          </div>
          <div ref="rankRef" class="h-96 w-full"></div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-800">经营结构</h2>
            <span class="text-xs text-slate-400">产值 / 成本 / 利润</span>
          </div>
          <div ref="pieRef" class="h-96 w-full"></div>
        </div>
      </section>

      <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[900px] text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th class="px-4 py-3">排名</th>
                <th class="px-4 py-3">养殖场</th>
                <th class="px-4 py-3 text-right">产量</th>
                <th class="px-4 py-3 text-right">产值</th>
                <th class="px-4 py-3 text-right">净利润</th>
                <th class="px-4 py-3 text-right">出塘批次</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="ranking.length === 0">
                <td colspan="6" class="px-4 py-12 text-center text-slate-400">暂无产销统计数据</td>
              </tr>
              <tr v-for="row in ranking" :key="row.farmId" class="hover:bg-slate-50">
                <td class="px-4 py-3 font-bold text-slate-800">#{{ row.ranking }}</td>
                <td class="px-4 py-3 font-medium text-slate-800">{{ row.farmName }}</td>
                <td class="px-4 py-3 text-right">{{ numberText(row.totalProductionKg) }} kg</td>
                <td class="px-4 py-3 text-right">¥{{ moneyText(row.totalRevenue) }}</td>
                <td class="px-4 py-3 text-right" :class="Number(row.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'">¥{{ moneyText(row.netProfit) }}</td>
                <td class="px-4 py-3 text-right">{{ row.harvestCount }}</td>
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
import { exportAnalysis, getFarmsGeo, getProductionRanking, getProductionStats } from '@/api/regulator'
import { getSeedlingList } from '@/api/base'
import type { FarmGeo, ProductionRanking, ProductionStats } from '@/types/regulator'

const loading = ref(false)
const exporting = ref(false)
const farms = ref<FarmGeo[]>([])
const seedlings = ref<any[]>([])
const ranking = ref<ProductionRanking[]>([])
const stats = ref<ProductionStats>({
  totalProductionKg: 0,
  totalRevenue: 0,
  totalCost: 0,
  netProfit: 0,
  harvestCount: 0,
  participatingFarmCount: 0,
  avgUnitPrice: 0,
})
const rankRef = ref<HTMLDivElement | null>(null)
const pieRef = ref<HTMLDivElement | null>(null)
let rankChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const filters = reactive({
  farmId: '',
  seedlingId: '',
  startDate: '',
  endDate: '',
})

const statCards = computed(() => [
  { label: '总产量', value: `${numberText(stats.value.totalProductionKg)} kg`, color: 'text-blue-600' },
  { label: '总产值', value: `¥${moneyText(stats.value.totalRevenue)}`, color: 'text-emerald-600' },
  { label: '总成本', value: `¥${moneyText(stats.value.totalCost)}`, color: 'text-amber-600' },
  { label: '净利润', value: `¥${moneyText(stats.value.netProfit)}`, color: Number(stats.value.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600' },
  { label: '出塘批次', value: stats.value.harvestCount, color: 'text-slate-800' },
  { label: '参与场区', value: stats.value.participatingFarmCount, color: 'text-indigo-600' },
])

onMounted(async () => {
  await Promise.all([loadOptions(), refreshAll()])
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  rankChart?.dispose()
  pieChart?.dispose()
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
    const [statsRes, rankingRes] = await Promise.all([getProductionStats(params), getProductionRanking({ ...params, limit: 10 })])
    stats.value = statsRes.data
    ranking.value = rankingRes.data || []
    await nextTick()
    renderCharts()
  } finally {
    loading.value = false
  }
}

async function handleExport() {
  exporting.value = true
  try {
    const response = await exportAnalysis({ ...buildParams(), type: 'production' }) as any
    downloadBlob(response.data, 'FAMS-产销统计.xlsx')
  } finally {
    exporting.value = false
  }
}

function buildParams() {
  return {
    farmId: filters.farmId || undefined,
    seedlingId: filters.seedlingId || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  }
}

function renderCharts() {
  if (rankRef.value) {
    if (!rankChart) rankChart = echarts.init(rankRef.value)
    const data = [...ranking.value].reverse()
    rankChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 110, right: 24, top: 20, bottom: 30 },
      xAxis: { type: 'value', axisLabel: { formatter: '{value} kg' } },
      yAxis: { type: 'category', data: data.map(item => item.farmName), axisTick: { show: false } },
      series: [{ type: 'bar', data: data.map(item => item.totalProductionKg), color: '#2563eb', barMaxWidth: 22 }],
    })
  }
  if (pieRef.value) {
    if (!pieChart) pieChart = echarts.init(pieRef.value)
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['46%', '72%'],
        data: [
          { name: '产值', value: Number(stats.value.totalRevenue || 0) },
          { name: '成本', value: Number(stats.value.totalCost || 0) },
          { name: '净利润', value: Math.max(0, Number(stats.value.netProfit || 0)) },
        ],
        color: ['#059669', '#f59e0b', '#2563eb'],
      }],
    })
  }
}

function resizeCharts() {
  rankChart?.resize()
  pieChart?.resize()
}

function numberText(value?: number) {
  return Number(value || 0).toFixed(2)
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
