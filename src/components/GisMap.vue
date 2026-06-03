<template>
  <div class="gis-map-wrapper">
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
        {{ currentFarms.length }} 家养殖场
      </span>
    </div>

    <!-- ── 图例 (省级视图时显示) ── -->
    <div v-if="currentProvince" class="map-legend">
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
      <div v-if="loading" class="loading-overlay">
        <Loader2 class="w-5 h-5 animate-spin text-slate-400" />
        <span class="text-slate-500 text-sm">加载地图数据…</span>
      </div>
    </Transition>

    <!-- ── 空状态提示 ── -->
    <Transition name="fade">
      <div
        v-if="showEmptyHint"
        class="empty-hint"
        @click="goBackToNational"
      >
        <AlertCircle class="w-12 h-12 text-slate-300 mb-3" />
        <p class="text-slate-500 font-bold">{{ currentProvince }}暂无养殖场入驻</p>
        <p class="text-slate-400 text-sm mt-1">点击此处返回全国视图</p>
      </div>
    </Transition>

    <!-- ── 养殖场详情弹出卡片 ── -->
    <Transition name="slide-up">
      <div v-if="selectedFarm" class="farm-detail-card">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-bold text-slate-800 text-sm">{{ selectedFarm.name }}</h4>
            <p class="text-xs text-slate-500 mt-0.5">{{ selectedFarm.city }} · {{ selectedFarm.province }}</p>
          </div>
          <button class="text-slate-400 hover:text-slate-600" @click="selectedFarm = null">
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-slate-50 rounded px-2 py-1.5">
            <span class="text-slate-400">品种</span>
            <p class="font-medium text-slate-700">{{ selectedFarm.species }}</p>
          </div>
          <div class="bg-slate-50 rounded px-2 py-1.5">
            <span class="text-slate-400">存栏</span>
            <p class="font-medium text-slate-700">{{ selectedFarm.stock }} 万尾</p>
          </div>
          <div class="bg-slate-50 rounded px-2 py-1.5">
            <span class="text-slate-400">状态</span>
            <p
              :class="[
                'font-medium',
                selectedFarm.status === 'alert' ? 'text-red-600' :
                selectedFarm.status === 'warning' ? 'text-yellow-600' : 'text-emerald-600'
              ]"
            >
              {{ statusLabel(selectedFarm.status) }}
            </p>
          </div>
          <div class="bg-slate-50 rounded px-2 py-1.5">
            <span class="text-slate-400">告警</span>
            <p class="font-medium text-slate-700">{{ selectedFarm.alertCount ?? 0 }} 次/月</p>
          </div>
        </div>
        <div
          v-if="selectedFarm.alertReason"
          class="mt-2 bg-red-50 border border-red-100 rounded px-2 py-1.5 text-xs text-red-700 leading-relaxed"
        >
          ⚠ {{ selectedFarm.alertReason }}
        </div>
        <button
          class="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-1.5 rounded transition-colors"
          @click="selectedFarm = null"
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
import { ArrowLeft, MapPin, Loader2, AlertCircle, X } from 'lucide-vue-next'
import {
  type FarmData,
  provinceFarmCounts,
  allFarms,
  nationalAlertFarms,
  activeProvinces,
  getFarmsByProvince,
  getFarmsByStatus,
  PROVINCE_ADCODE,
} from '@/data/mockFarmData'

// ── 状态 ──────────────────────────────────────────────────
const chartRef = ref<HTMLDivElement | null>(null)
const loading = ref(false)
const currentProvince = ref<string | null>(null)
const selectedFarm = ref<FarmData | null>(null)
const showEmptyHint = ref(false)

let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

// ── 计算属性 ──────────────────────────────────────────────
const currentFarms = computed(() =>
  currentProvince.value ? getFarmsByProvince(currentProvince.value) : []
)

// ── GeoJSON 加载与缓存 ───────────────────────────────────
const geoCache = new Map<string, any>()
const GEO_BASE = 'https://geo.datav.aliyun.com/areas_v3/bound'

async function fetchGeoJSON(code: string): Promise<any> {
  const cacheKey = code
  if (geoCache.has(cacheKey)) return geoCache.get(cacheKey)!

  const url = `${GEO_BASE}/${code}_full.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GeoJSON 加载失败: ${url}`)
  const data = await res.json()
  geoCache.set(cacheKey, data)
  return data
}

// ── ECharts 全国视图 ─────────────────────────────────────
async function renderNationalView() {
  if (!chartInstance) return

  loading.value = true
  showEmptyHint.value = false
  selectedFarm.value = null

  try {
    const chinaGeo = await fetchGeoJSON('100000')

    // 修复：GeoJSON features 的 properties.name 是简名（"北京"），
    // 而我们的数据用的是全名（"北京市"）。这里以 GeoJSON 为准做一次匹配。
    const nameIndex = new Map<string, string>()
    if (chinaGeo.features) {
      for (const f of chinaGeo.features) {
        const geoName = f.properties?.name as string
        // 尝试在 provinceFarmCounts 中找到匹配
        const match = provinceFarmCounts.find(
          p => p.name === geoName || p.name.startsWith(geoName) || geoName.startsWith(p.name)
        )
        if (match) nameIndex.set(geoName, match.name)
      }
    }

    echarts.registerMap('china', chinaGeo)

    // 对齐数据 key 到 GeoJSON properties.name
    interface AlignedItem { name: string; value: number; alertCount: number }
    const alignedData: AlignedItem[] = chinaGeo.features.map((f: any) => {
      const geoName = f.properties?.name as string
      const dataName = nameIndex.get(geoName) ?? geoName
      const found = provinceFarmCounts.find(p => p.name === dataName)
      return {
        name: geoName,
        value: found ? found.value : 0,
        alertCount: found ? found.alertCount : 0,
      }
    })

    const option: echarts.EChartsOption = {
      backgroundColor: '#f1f5f9',

      // 视觉映射：值越高颜色越深 → 农场多的省份一眼可见
      visualMap: {
        min: 0,
        max: 35,
        left: -9999,          // 隐藏组件，只驱动颜色
        top: -9999,
        inRange: {
          color: ['#e2e8f0', '#d1fae5', '#6ee7b7', '#34d399', '#10b981'],
        },
        show: false,
      },

      geo: {
        map: 'china',
        roam: true,
        zoom: 1.18,
        center: [104.5, 36.5],
        aspectScale: 0.85,
        label: {
          show: true,
          fontSize: 10,
          color: '#64748b',
          fontFamily: 'inherit',
        },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
          itemStyle: { areaColor: '#fbbf24', shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.15)' },
        },
        itemStyle: {
          areaColor: '#e2e8f0',
          borderColor: '#ffffff',
          borderWidth: 1.5,
        },
        regions: alignedData
          .filter((d: AlignedItem) => d.value > 0)
          .map((d: AlignedItem) => ({
            name: d.name,
            itemStyle: { areaColor: undefined }, // 交由视觉映射
          })),
      },

      series: [
        // 地图数据层 —— 驱动省份着色
        {
          type: 'map',
          map: 'china',
          geoIndex: 0,
          data: alignedData,
          silent: true, // 事件由 geo 组件处理
        } as any,
        // 涟漪散点 —— only 告警养殖场
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          geoIndex: 0,
          data: nationalAlertFarms.map(f => ({
            name: f.name,
            value: [f.lng, f.lat, f.alertCount ?? 1],
          })),
          symbolSize: (val: number[]) => Math.min((val[2] ?? 1) * 5 + 6, 22),
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke',
            scale: 4,
            period: 5,
            color: '#ef4444',
          },
          itemStyle: {
            color: '#ef4444',
            shadowBlur: 8,
            shadowColor: 'rgba(239,68,68,0.5)',
          },
          label: {
            show: true,
            formatter: '{b}',
            position: 'right',
            fontSize: 10,
            color: '#b91c1c',
          },
          zlevel: 2,
        },
      ],

      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        textStyle: { color: '#1e293b', fontSize: 12 },
        formatter: (params: any) => {
          if (params.seriesType === 'effectScatter') {
            return `<b>⚠ ${params.name}</b><br/>告警次数：${params.value?.[2] ?? '-'} 次<br/><span style="color:#94a3b8">点击所在省份查看详情</span>`
          }
          const d = alignedData.find((a: any) => a.name === params.name)
          if (!d) return params.name
          return `<b>${params.name}</b><br/>养殖场：${d.value} 家${d.alertCount > 0 ? `<br/>⚠ 告警：${d.alertCount} 家` : ''}<br/><span style="color:#94a3b8">点击进入省份视图</span>`
        },
      },
    }

    chartInstance.setOption(option, true)

    // 绑定点击事件 —— 下钻
    chartInstance.off('click')
    chartInstance.on('click', (params: any) => {
      // 只响应 geo map 区域的点击（忽略 scatter）
      if (params.componentType === 'geo' || params.seriesType === 'map') {
        const provinceName = params.name as string
        if (provinceName && activeProvinces.has(provinceName)) {
          drillDownToProvince(provinceName)
        } else if (provinceName) {
          // 该省无养殖场
          currentProvince.value = provinceName
          showEmptyHint.value = true
        }
      }
    })
  } catch (err) {
    console.error('加载全国地图失败:', err)
  } finally {
    loading.value = false
  }
}

// ── ECharts 省级视图 ─────────────────────────────────────
async function renderProvinceView(provinceName: string) {
  if (!chartInstance) return

  loading.value = true
  showEmptyHint.value = false
  selectedFarm.value = null

  const adcode = PROVINCE_ADCODE[provinceName]
  if (!adcode) {
    console.warn(`未找到 ${provinceName} 的 adcode 映射`)
    loading.value = false
    return
  }

  try {
    const provinceGeo = await fetchGeoJSON(adcode)
    echarts.registerMap(provinceName, provinceGeo)

    // 获取当前省份的养殖场
    const farms = getFarmsByProvince(provinceName)
    const { normal, warning, alert } = getFarmsByStatus(provinceName)

    const option: echarts.EChartsOption = {
      backgroundColor: '#f1f5f9',

      geo: {
        map: provinceName,
        roam: true,
        zoom: 1.1,
        aspectScale: 0.85,
        label: {
          show: true,
          fontSize: 10,
          color: '#94a3b8',
          fontFamily: 'inherit',
        },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#334155' },
          itemStyle: { areaColor: '#e2e8f0', shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.1)' },
        },
        itemStyle: {
          areaColor: '#f8fafc',
          borderColor: '#cbd5e1',
          borderWidth: 1,
        },
      },

      series: [
        // 普通养殖场
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          geoIndex: 0,
          data: normal.map(f => ({
            name: f.name,
            value: [f.lng, f.lat, f.stock],
          })),
          symbolSize: (val: number[]) => Math.max(Math.sqrt(val[2] ?? 50) * 1.2, 8),
          itemStyle: {
            color: '#10b981',
            borderColor: '#ffffff',
            borderWidth: 1.5,
            shadowBlur: 4,
            shadowColor: 'rgba(16,185,129,0.3)',
          },
          emphasis: {
            scale: 1.6,
            itemStyle: { color: '#059669' },
          },
          zlevel: 1,
        },
        // ⚠ 注意养殖场
        ...(warning.length > 0
          ? [
              {
                type: 'scatter',
                coordinateSystem: 'geo',
                geoIndex: 0,
                data: warning.map(f => ({
                  name: f.name,
                  value: [f.lng, f.lat, f.stock],
                })),
                symbolSize: (val: number[]) => Math.max(Math.sqrt(val[2] ?? 50) * 1.2, 8),
                itemStyle: {
                  color: '#f59e0b',
                  borderColor: '#ffffff',
                  borderWidth: 1.5,
                  shadowBlur: 6,
                  shadowColor: 'rgba(245,158,11,0.4)',
                },
                emphasis: {
                  scale: 1.6,
                  itemStyle: { color: '#d97706' },
                },
                zlevel: 1,
              } as any,
            ]
          : []),
        // 🔴 告警养殖场 (涟漪)
        ...(alert.length > 0
          ? [
              {
                type: 'effectScatter',
                coordinateSystem: 'geo',
                geoIndex: 0,
                data: alert.map(f => ({
                  name: f.name,
                  value: [f.lng, f.lat, f.alertCount ?? 1],
                })),
                symbolSize: (val: number[]) => Math.min((val[2] ?? 1) * 4 + 8, 24),
                showEffectOn: 'render',
                rippleEffect: {
                  brushType: 'stroke',
                  scale: 5,
                  period: 3,
                  color: '#ef4444',
                },
                itemStyle: {
                  color: '#ef4444',
                  borderColor: '#ffffff',
                  borderWidth: 1.5,
                  shadowBlur: 10,
                  shadowColor: 'rgba(239,68,68,0.6)',
                },
                emphasis: { scale: 1.5 },
                zlevel: 2,
              } as any,
            ]
          : []),
      ],

      // 图例固定在右上角（用 ECharts 原生 legend 不如我们 Tailwind 手绘的灵活，这里留空）
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        textStyle: { color: '#1e293b', fontSize: 12 },
        formatter: (params: any) => {
          const name = params.name ?? ''
          const val = params.value
          const farm = farms.find(f => f.name === name)
          if (farm) {
            const statusText = farm.status === 'alert' ? '🔴 告警' : farm.status === 'warning' ? '🟡 注意' : '🟢 正常'
            return [
              `<b>${farm.name}</b>`,
              `城市：${farm.city}`,
              `品种：${farm.species}`,
              `存栏：${farm.stock} 万尾`,
              `状态：${statusText}`,
              farm.alertCount ? `月告警：${farm.alertCount} 次` : '',
              `<span style="color:#94a3b8">点击查看详情</span>`,
            ].filter(Boolean).join('<br/>')
          }
          return `${name}<br/>坐标：[${Array.isArray(val) ? val.slice(0,2).join(', ') : val}]`
        },
      },
    }

    chartInstance.setOption(option, true)

    // 绑定点击 —— 选中养殖场查看详情
    chartInstance.off('click')
    chartInstance.on('click', (params: any) => {
      if (params.componentType === 'series') {
        const farmName = params.name as string
        const farm = farms.find(f => f.name === farmName)
        if (farm) {
          selectedFarm.value = farm
        }
      }
      // 点击城市区块不做反应（也可以进一步下钻，暂不实现）
    })
  } catch (err) {
    console.error(`加载${provinceName}地图失败:`, err)
  } finally {
    loading.value = false
  }
}

// ── 交互方法 ──────────────────────────────────────────────
async function drillDownToProvince(province: string) {
  currentProvince.value = province
  await nextTick()
  await renderProvinceView(province)
}

async function goBackToNational() {
  currentProvince.value = null
  showEmptyHint.value = false
  selectedFarm.value = null
  await nextTick()
  await renderNationalView()
}

function statusLabel(status: string) {
  return status === 'alert' ? '告警' : status === 'warning' ? '注意' : '正常'
}

// ── 生命周期 ──────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  // 响应容器尺寸变化
  resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize()
  })
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
}

/* ── 顶部导航条 ── */
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

/* ── 图例 ── */
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

/* ── 图表容器 ── */
.chart-container {
  width: 100%;
  height: 100%;
}

/* ── 加载遮罩 ── */
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

/* ── 空状态 ── */
.empty-hint {
  position: absolute;
  inset: 0;
  z-index: 15;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

/* ── 详情卡片 ── */
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

/* ── 转场动画 ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-leave-active {
  transition: all 0.2s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
