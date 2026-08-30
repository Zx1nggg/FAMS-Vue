<template>
  <div class="gis-map-wrapper" @contextmenu.prevent>
    <!-- ── 顶部导航条 ── -->
    <div class="map-toolbar">
      <button
        v-if="currentProvince"
        class="back-btn"
        @click="goBackToNational"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>返回全国</span>
      </button>
      <span class="level-label">
        <MapPin class="w-3.5 h-3.5" />
        {{ currentProvince ? currentProvince + ' · 养殖场分布' : '全国水产养殖基地分布' }}
      </span>
      <span v-if="currentProvince" class="farm-count">
        {{ currentRealFarms.length }} 家养殖场
      </span>
      <span v-else class="farm-count">
        {{ farmData?.length ?? 0 }} 家养殖场
      </span>
    </div>

    <!-- ── 图例 ── -->
    <div class="map-legend">
      <div class="legend-item">
        <span class="dot dot-green"></span> 正常
      </div>
      <div class="legend-item">
        <span class="dot dot-yellow"></span> 注意
      </div>
      <div class="legend-item">
        <span class="dot dot-red"></span> 告警
      </div>
    </div>

    <!-- ── ECharts 容器 ── -->
    <div ref="chartRef" class="chart-container"></div>

    <!-- ── 加载遮罩 ── -->
    <Transition name="fade">
      <div v-if="loading || internalLoading" class="loading-overlay">
        <Loader2 class="w-5 h-5 animate-spin text-slate-400" />
        <span class="text-slate-500 text-sm">加载地图数据…</span>
      </div>
    </Transition>

    <!-- ── 养殖场详情弹出卡片 ── -->
    <Transition name="slide-up">
      <div v-if="selectedFarmInfo" class="farm-detail-card">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-bold text-slate-800 text-sm">{{ selectedFarmInfo.name }}</h4>
            <p class="text-xs text-slate-500 mt-0.5">{{ selectedFarmInfo.address || selectedFarmInfo.city || '' }}</p>
          </div>
          <button class="text-slate-400 hover:text-slate-600" @click="selectedFarmInfo = null">
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-slate-50 rounded px-2 py-1.5">
            <span class="text-slate-400">品种</span>
            <p class="font-medium text-slate-700">{{ selectedFarmInfo.species || '—' }}</p>
          </div>
          <div class="bg-slate-50 rounded px-2 py-1.5">
            <span class="text-slate-400">存栏</span>
            <p class="font-medium text-slate-700">{{ formatStockCount(selectedFarmInfo.stock) }}</p>
          </div>
          <div class="bg-slate-50 rounded px-2 py-1.5">
            <span class="text-slate-400">状态</span>
            <p :class="['font-medium', statusTextColor(selectedFarmInfo.status)]">
              {{ statusLabel(selectedFarmInfo.status) }}
            </p>
          </div>
          <div class="bg-slate-50 rounded px-2 py-1.5">
            <span class="text-slate-400">告警</span>
            <p class="font-medium text-slate-700">{{ selectedFarmInfo.alertCount ?? 0 }} 次</p>
          </div>
        </div>
        <div
          v-if="selectedFarmInfo.alertReason"
          class="mt-2 bg-red-50 border border-red-100 rounded px-2 py-1.5 text-xs text-red-700 leading-relaxed"
        >
          ⚠ {{ selectedFarmInfo.alertReason }}
        </div>
        <button
          class="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-1.5 rounded transition-colors"
          @click="selectedFarmInfo = null"
        >
          关闭
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { ArrowLeft, MapPin, Loader2, X } from 'lucide-vue-next'
import {
  PROVINCE_ADCODE,
  normalizeProvinceName,
  resolveProvinceName,
} from '@/data/provinceAdcodes'
import type { FarmGeo } from '@/types/regulator'

// ── Props ───────────────────────────────────────────────
const props = defineProps<{
  farmData?: FarmGeo[]
  loading?: boolean
}>()

// ── 状态 ────────────────────────────────────────────────
const chartRef = ref<HTMLDivElement | null>(null)
const internalLoading = ref(false)
const currentProvince = ref<string | null>(null)
const selectedFarmInfo = ref<any>(null)

let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

// ── 计算属性 ────────────────────────────────────────────
/** 从接口真实数据中提取省级进驻统计。 */
const realProvinceStats = computed(() => {
  const map = new Map<string, { value: number; alertCount: number }>()
  for (const f of props.farmData || []) {
    const province = resolveProvinceName(f.province)
    if (!province) continue
    const entry = map.get(province) || { value: 0, alertCount: 0 }
    entry.value++
    if (f.alertStatus !== 'normal') entry.alertCount++
    map.set(province, entry)
  }
  return Array.from(map.entries()).map(([name, v]) => ({ name, ...v }))
})

/** 当前省份下的真实养殖场 */
const currentRealFarms = computed(() => {
  if (!currentProvince.value || !props.farmData) return []
  const target = normalizeProvinceName(currentProvince.value)
  return props.farmData.filter(f => normalizeProvinceName(f.province) === target)
})

/**
 * 将 FarmGeo (API真实数据) 转为 GIS 散点格式
 */
function buildRealDataPoints(farms: FarmGeo[] = props.farmData || []): {
  normal: any[]; warning: any[]; critical: any[]
} {
  const normal: any[] = []
  const warning: any[] = []
  const critical: any[] = []

  for (const farm of farms) {
    if (farm.longitude == null || farm.latitude == null) continue
    const point = {
      name: farm.farmName,
      value: [farm.longitude, farm.latitude, Math.max(farm.pondCount || 1, 1)],
      // 附带其他信息供 tooltip 使用
      farmId: farm.farmId,
      species: farm.mainSpecies,
      stock: farm.stockCount,
      alertCount: farm.activeAlarmCount,
      address: farm.address,
      alertStatus: farm.alertStatus,
      pondCount: farm.pondCount,
    }
    switch (farm.alertStatus) {
      case 'critical': critical.push(point); break
      case 'warning':  warning.push(point); break
      default:        normal.push(point); break
    }
  }
  return { normal, warning, critical }
}

// ── ECharts 全国视图 ────────────────────────────────────
const geoCache = new Map<string, any>()
const GEO_BASE = 'https://geo.datav.aliyun.com/areas_v3/bound'

async function fetchGeoJSON(code: string): Promise<any> {
  if (geoCache.has(code)) return geoCache.get(code)!
  const url = `${GEO_BASE}/${code}_full.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GeoJSON 加载失败: ${url}`)
  const data = await res.json()
  geoCache.set(code, data)
  return data
}

async function renderNationalView() {
  if (!chartInstance) return

  internalLoading.value = true
  selectedFarmInfo.value = null

  try {
    const chinaGeo = await fetchGeoJSON('100000')
    echarts.registerMap('china', chinaGeo)
    await renderNationalViewUnified(chinaGeo)
  } catch (err) {
    console.error('加载全国地图失败:', err)
  } finally {
    internalLoading.value = false
  }
}

/** 全国视图：用真实省级统计着色，并叠加真实养殖场散点。 */
async function renderNationalViewUnified(chinaGeo: any) {
  const chart = chartInstance
  if (!chart) return

  const provinceStats = realProvinceStats.value

  // ── 对齐 GeoJSON properties.name 与省级统计数据 ──
  const nameIndex = new Map<string, string>()
  if (chinaGeo.features) {
    for (const f of chinaGeo.features) {
      const geoName = f.properties?.name as string
      const match = provinceStats.find(p =>
        normalizeProvinceName(p.name) === normalizeProvinceName(geoName),
      )
      if (match) nameIndex.set(geoName, match.name)
    }
  }

  interface AlignedItem { name: string; value: number; alertCount: number }
  const alignedData: AlignedItem[] = chinaGeo.features.map((f: any) => {
    const geoName = f.properties?.name as string
    const dataName = nameIndex.get(geoName) ?? geoName
    const found = provinceStats.find(p => p.name === dataName)
    return { name: geoName, value: found ? found.value : 0, alertCount: found ? found.alertCount : 0 }
  })

  const maxVal = Math.max(1, ...alignedData.map(d => d.value))
  const activeGeoNames = new Set(alignedData.filter(d => d.value > 0).map(d => d.name))
  const seriesArr: any[] = [
    { type: 'map', map: 'china', geoIndex: 0, data: alignedData, silent: true },
  ]

  // ── 真实养殖场散点系列 ──
  const { normal, warning, critical } = buildRealDataPoints()
  if (normal.length > 0) seriesArr.push(makeScatterSeries(normal, '#10b981', false, 1, 10))
  if (warning.length > 0) seriesArr.push(makeScatterSeries(warning, '#f59e0b', false, 1))
  if (critical.length > 0) seriesArr.push(makeScatterSeries(critical, '#dc2626', true, 3))

  const option: echarts.EChartsOption = {
    backgroundColor: '#f1f5f9',
    visualMap: {
      min: 0, max: Math.max(maxVal, 10), left: -9999, top: -9999,
      seriesIndex: 0,
      inRange: { color: ['#e2e8f0', '#d1fae5', '#6ee7b7', '#34d399', '#10b981'] },
      show: false,
    },
    geo: {
      map: 'china', roam: true, zoom: 1.18, center: [104.5, 36.5], aspectScale: 0.85,
      label: { show: true, fontSize: 10, color: '#64748b', fontFamily: 'inherit' },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#1e293b' }, itemStyle: { areaColor: '#fbbf24', shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.15)' } },
      itemStyle: { areaColor: '#e2e8f0', borderColor: '#ffffff', borderWidth: 1.5 },
      regions: alignedData.filter(d => d.value > 0).map(d => ({ name: d.name, itemStyle: { areaColor: undefined } })),
    },
    series: seriesArr,
    tooltip: {
      trigger: 'item', backgroundColor: '#ffffff', borderColor: '#e2e8f0', textStyle: { color: '#1e293b', fontSize: 12 },
      formatter: (params: any) => {
        // 真实散点
        if (params.data?.farmId != null) {
          const st = params.data.alertStatus === 'critical' ? '🔴 告警' : params.data.alertStatus === 'warning' ? '🟡 注意' : '🟢 正常'
          return `<b>${params.data.name}</b><br/>品种：${params.data.species || '—'}<br/>存栏：${formatStockCount(params.data.stock)}<br/>状态：${st}${params.data.alertCount ? `<br/>告警：${params.data.alertCount} 次` : ''}`
        }

        // 地图区块
        const d = alignedData.find((a: any) => a.name === params.name)
        if (!d) return params.name
        return `<b>${params.name}</b><br/>养殖场：${d.value} 家${d.alertCount > 0 ? `<br/>⚠ 告警：${d.alertCount} 家` : ''}<br/><span style="color:#94a3b8">点击进入省份视图</span>`
      },
    },
  }

  chart.setOption(option, true)

  chart.off('click')
  chart.on('click', (params: any) => {
    // 真实散点 → 详情卡片
    if (params.componentType === 'series' && params.data?.farmId != null) {
      selectedFarmInfo.value = {
        name: params.data.name,
        address: params.data.address,
        species: params.data.species,
        stock: params.data.stock,
        status: params.data.alertStatus,
        alertCount: params.data.alertCount,
      }
      return
    }
    // 地图区块 → 下钻省份
    if (params.componentType === 'geo' || params.seriesType === 'map') {
      const provinceName = params.name as string
      if (provinceName && activeGeoNames.has(provinceName)) {
        const resolvedName = resolveProvinceName(provinceName)
        if (resolvedName) drillDownToProvince(resolvedName)
      }
    }
  })
}

/** 辅助：构建散点系列 */
function makeScatterSeries(data: any[], color: string, ripple: boolean, zlevel: number, minSize = 6): any {
  const base = {
    type: ripple ? 'effectScatter' : 'scatter',
    coordinateSystem: 'geo', geoIndex: 0, data,
    symbolSize: (val: number[]) => ripplesize(val),
    emphasis: { scale: 1.6 },
    zlevel,
  }
  if (ripple) {
    return {
      ...base,
      showEffectOn: 'render',
      rippleEffect: { brushType: 'stroke', scale: 5, period: 3, color },
      itemStyle: { color, borderColor: '#fff', borderWidth: 1.5, shadowBlur: 10, shadowColor: 'rgba(220,38,38,0.6)' },
    }
  }
  return {
    ...base,
    symbolSize: (val: number[]) => Math.min(Math.max(Math.sqrt(val[2] ?? 1) * 2, minSize), 18),
    itemStyle: { color, borderColor: '#fff', borderWidth: 1, shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.15)' },
  }
}

function ripplesize(val: number[]) {
  return Math.min((val[2] ?? 1) * 4 + 8, 24)
}

// ── 省级视图 ──────────────────────────────────────────────
async function renderProvinceView(provinceName: string) {
  const chart = chartInstance
  if (!chart) return
  internalLoading.value = true
  selectedFarmInfo.value = null

  const adcode = PROVINCE_ADCODE[provinceName]
  if (!adcode) { internalLoading.value = false; return }

  try {
    const provinceGeo = await fetchGeoJSON(adcode)
    echarts.registerMap(provinceName, provinceGeo)

    const seriesArr: any[] = []
    const { normal, warning, critical } = buildRealDataPoints(currentRealFarms.value)
    if (normal.length > 0) seriesArr.push(makeScatterSeries(normal, '#10b981', false, 1, 10))
    if (warning.length > 0) seriesArr.push(makeScatterSeries(warning, '#f59e0b', false, 1))
    if (critical.length > 0) seriesArr.push(makeScatterSeries(critical, '#dc2626', true, 3))

    chart.setOption({
      backgroundColor: '#f1f5f9',
      geo: {
        map: provinceName, roam: true, zoom: 1.1, aspectScale: 0.85,
        label: { show: true, fontSize: 10, color: '#94a3b8', fontFamily: 'inherit' },
        emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#334155' }, itemStyle: { areaColor: '#e2e8f0', shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.1)' } },
        itemStyle: { areaColor: '#f8fafc', borderColor: '#cbd5e1', borderWidth: 1 },
      },
      series: seriesArr,
      tooltip: {
        trigger: 'item', backgroundColor: '#ffffff', borderColor: '#e2e8f0', textStyle: { color: '#1e293b', fontSize: 12 },
        formatter: (params: any) => {
          if (params.data?.farmId != null) {
            const st = params.data.alertStatus === 'critical' ? '🔴 告警' : params.data.alertStatus === 'warning' ? '🟡 注意' : '🟢 正常'
            return `<b>${params.data.name}</b><br/>品种：${params.data.species || '—'}<br/>存栏：${formatStockCount(params.data.stock)}<br/>状态：${st}${params.data.alertCount ? `<br/>告警：${params.data.alertCount} 次` : ''}`
          }

          return params.name
        },
      },
    }, true)

    chart.off('click')
    chart.on('click', (params: any) => {
      if (params.componentType !== 'series' || params.data?.farmId == null) return
      selectedFarmInfo.value = {
        name: params.data.name,
        address: params.data.address,
        species: params.data.species,
        stock: params.data.stock,
        status: params.data.alertStatus,
        alertCount: params.data.alertCount,
      }
    })
  } catch (err) {
    console.error(`加载${provinceName}地图失败:`, err)
  } finally {
    internalLoading.value = false
  }
}

async function drillDownToProvince(province: string) {
  currentProvince.value = province
  await nextTick()
  await renderProvinceView(province)
}

async function goBackToNational() {
  currentProvince.value = null
  selectedFarmInfo.value = null
  await nextTick()
  await renderNationalView()
}

async function selectFarm(farmId: number) {
  const farm = (props.farmData || []).find(item => item.farmId === farmId)
  if (!farm) return

  const province = resolveProvinceName(farm.province || '')
  if (province) {
    currentProvince.value = province
    await nextTick()
    await renderProvinceView(province)
  }

  selectedFarmInfo.value = {
    name: farm.farmName,
    address: farm.address,
    species: farm.mainSpecies,
    stock: farm.stockCount,
    status: farm.alertStatus,
    alertCount: farm.activeAlarmCount,
  }
}

defineExpose({ selectFarm, goBackToNational })

function formatStockCount(value: number | null | undefined) {
  const count = Number(value)
  if (!Number.isFinite(count) || count < 0) return '暂无数据'
  if (count >= 10000) {
    const wan = count / 10000
    const digits = wan >= 100 ? 0 : 2
    return `${Number(wan.toFixed(digits)).toLocaleString()} 万尾`
  }
  return `${Math.round(count).toLocaleString()} 尾`
}

function statusLabel(status: string) {
  return status === 'critical' || status === 'alert' ? '告警' : status === 'warning' ? '注意' : '正常'
}

function statusTextColor(status: string) {
  return status === 'critical' || status === 'alert' ? 'text-red-600' : status === 'warning' ? 'text-yellow-600' : 'text-emerald-600'
}

// ── 监听 prop 变化 ──────────────────────────────────────
watch(() => props.farmData, async () => {
  if (!chartInstance) return
  if (currentProvince.value) await renderProvinceView(currentProvince.value)
  else await renderNationalView()
}, { deep: true })

watch(() => props.loading, (newVal) => {
  if (!newVal && chartInstance) {
    if (currentProvince.value) renderProvinceView(currentProvince.value)
    else renderNationalView()
  }
})

// ── 生命周期 ──────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  resizeObserver = new ResizeObserver(() => chartInstance?.resize())
  resizeObserver.observe(chartRef.value)
  await renderNationalView()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chartInstance?.dispose()
})
</script>

<style scoped>
.gis-map-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  background: #f1f5f9;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  font-family: inherit;
  user-select: none;
  -webkit-user-select: none;
}

.gis-map-wrapper :deep(canvas) {
  -webkit-user-drag: none;
}

.map-toolbar {
  position: absolute;
  top: 10px;
  left: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.back-btn:hover {
  background: #fff;
  color: #1e293b;
  border-color: #cbd5e1;
}

.level-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.farm-count {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.map-legend {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #475569;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
}
.dot-green  { background: #10b981; }
.dot-yellow { background: #f59e0b; }
.dot-red    { background: #ef4444; }

.chart-container {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(241, 245, 249, 0.7);
  backdrop-filter: blur(2px);
}

.farm-detail-card {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 25;
  width: 260px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-leave-active { transition: all 0.2s ease-in; }
.slide-up-enter-from { opacity: 0; transform: translateY(20px); }
.slide-up-leave-to { opacity: 0; transform: translateY(10px); }
</style>
