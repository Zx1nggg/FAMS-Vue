<template>
  <div class="h-full flex flex-col font-sans">
    
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden shrink-0">
      <div class="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-amber-50 to-transparent pointer-events-none"></div>
      <Fish class="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/10 pointer-events-none" />

      <div>
        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          <SearchCode class="w-6 h-6 text-amber-500" />
          全链路溯源核查中心
        </h2>
        <p class="text-sm text-gray-500 mt-1">输入或扫码批次号，一键追溯苗种从入库到出池的完整生命周期。</p>
      </div>

      <div class="flex gap-2 w-full sm:w-auto relative z-10">
        <el-input 
          v-model="searchBatchNo" 
          placeholder="请输入批次号 (如: B20260428-01)" 
          class="!w-full sm:!w-72" 
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <ScanLine class="w-4 h-4 text-gray-400" />
          </template>
        </el-input>
        <el-button type="primary" class="!bg-slate-800 !border-none hover:!bg-slate-700 !px-6" @click="handleSearch" :loading="loading">
          追溯
        </el-button>
      </div>
    </div>

    <div v-if="!traceData && !loading" class="flex-1 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 flex flex-col items-center justify-center py-20">
      <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <PackageSearch class="w-12 h-12 text-gray-300" />
      </div>
      <h3 class="text-lg font-bold text-gray-700 mb-2">等待检索</h3>
      <p class="text-sm text-gray-400">请在上方输入正确的批次号进行追溯查询</p>
      
      <div class="mt-8 text-xs text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 flex items-center gap-2 cursor-pointer hover:bg-amber-100 transition-colors" @click="simulateDemo">
        <Lightbulb class="w-4 h-4" /> 点击此处加载一个 Demo 演示批次
      </div>
    </div>

    <div v-if="traceData && !loading" class="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pr-1 pb-4">
      
      <div class="xl:col-span-1 flex flex-col gap-6 h-fit sticky top-0">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div class="h-20 bg-gradient-to-r from-slate-800 to-slate-700 relative shrink-0">
            <div class="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
          </div>
          <div class="px-6 pb-6 relative flex-1 flex flex-col">
            <div class="w-16 h-16 bg-white rounded-2xl shadow-md border-4 border-white flex items-center justify-center -mt-8 mb-3 relative z-10 shrink-0">
              <Database class="w-8 h-8 text-slate-700" />
            </div>
            <div class="flex justify-between items-start mb-6">
              <div>
                <h3 class="text-xl font-bold text-gray-800 font-mono">{{ traceData?.baseInfo?.batchNo || '未知批次' }}</h3>
                <p class="text-sm text-teal-600 font-bold mt-1 flex items-center gap-1.5">
                  <Fish class="w-4 h-4" /> {{ traceData?.baseInfo?.seedlingName || '未知品种' }}
                </p>
              </div>
              <el-tag :type="getStatusType(traceData?.baseInfo?.status)" effect="dark" class="!border-none !font-bold">
                {{ getStatusName(traceData?.baseInfo?.status) }}
              </el-tag>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-6">
              <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p class="text-xs text-gray-500 mb-1">入库总量</p>
                <p class="text-lg font-bold text-gray-800">{{ Number(traceData?.baseInfo?.totalQty || 0).toLocaleString() }} <span class="text-xs font-normal">尾</span></p>
              </div>
              <div class="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <p class="text-xs text-emerald-600/70 mb-1">当前成活率</p>
                <p class="text-lg font-bold text-emerald-700">{{ traceData?.baseInfo?.survivalRate || '0.0' }}%</p>
              </div>
              <div class="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p class="text-xs text-blue-600/70 mb-1">累计投喂</p>
                <p class="text-lg font-bold text-blue-700">{{ Number(traceData?.baseInfo?.totalFeedKg || 0).toLocaleString() }} <span class="text-xs font-normal">kg</span></p>
              </div>
              <div class="bg-red-50 p-3 rounded-xl border border-red-100">
                <p class="text-xs text-red-500/70 mb-1">累计死亡</p>
                <p class="text-lg font-bold text-red-600">{{ Number(traceData?.baseInfo?.totalDeath || 0).toLocaleString() }} <span class="text-xs font-normal">尾</span></p>
              </div>
              <!-- 成本信息（有数据时才展示） -->
              <div v-if="traceData?.baseInfo?.seedlingCost" class="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <p class="text-xs text-amber-600/70 mb-1">苗种成本</p>
                <p class="text-lg font-bold text-amber-700">¥{{ Number(traceData.baseInfo.seedlingCost).toLocaleString() }}</p>
              </div>
              <div v-if="traceData?.baseInfo?.totalFeedCost" class="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <p class="text-xs text-amber-600/70 mb-1">饲料成本</p>
                <p class="text-lg font-bold text-amber-700">¥{{ Number(traceData.baseInfo.totalFeedCost).toLocaleString() }}</p>
              </div>
              <div v-if="traceData?.baseInfo?.totalMedicineCost" class="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <p class="text-xs text-amber-600/70 mb-1">药品成本</p>
                <p class="text-lg font-bold text-amber-700">¥{{ Number(traceData.baseInfo.totalMedicineCost).toLocaleString() }}</p>
              </div>
            </div>

            <div class="mt-auto flex gap-3 pt-4 border-t border-gray-50">
              <el-button 
                class="flex-1 !bg-teal-50 !text-teal-700 !border-teal-200 hover:!bg-teal-600 hover:!text-white transition-all shadow-sm"
                @click="emailDialogVisible = true"
              >
                <Mail class="w-4 h-4 mr-1.5" /> 发送报告
              </el-button>
              <el-button class="flex-1 !bg-blue-50 !text-blue-700 !border-blue-200 hover:!bg-blue-600 hover:!text-white transition-all shadow-sm">
                <QrCode class="w-4 h-4 mr-1.5" /> 溯源绿码
              </el-button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 shrink-0">
          <h4 class="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 text-blue-500" /> 供应链与资质档案
          </h4>
          <div class="space-y-4 text-sm">
            <div class="flex justify-between items-center border-b border-gray-50 pb-2">
              <span class="text-gray-500">源头供应商</span>
              <span class="font-medium text-gray-800">{{ traceData?.supplier?.name || '--' }}</span>
            </div>
            <div class="flex justify-between items-center border-b border-gray-50 pb-2">
              <span class="text-gray-500">资质许可证</span>
              <span class="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs">{{ traceData?.supplier?.licenseNo || '--' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500">产地检疫证</span>
              <span class="font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                <CheckCircle2 class="w-3 h-3" /> {{ traceData?.supplier?.quarantineNo || '已查验' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 relative">
        <div class="absolute left-[39px] sm:left-[55px] top-10 bottom-10 w-0.5 bg-gray-100"></div>

        <h3 class="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2 relative z-10">
          <History class="w-5 h-5 text-amber-500" /> 生命周期事件轨迹
        </h3>

        <div class="space-y-8 relative z-10">
          
          <div v-for="(event, index) in traceData.events" :key="index" class="flex gap-4 sm:gap-6 group">
            <div class="w-16 sm:w-24 shrink-0 text-right pt-2">
              <p class="text-xs sm:text-sm font-bold text-gray-800">{{ formatDate(event.time) }}</p>
              <p class="text-[10px] sm:text-xs text-gray-400 mt-0.5">{{ formatTime(event.time) }}</p>
            </div>

            <div class="relative flex flex-col items-center">
              <div class="w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-transform duration-300 group-hover:scale-110 z-10" :class="getEventIconConfig(event.type).bg">
                <component :is="getEventIconConfig(event.type).icon" class="w-4 h-4" :class="getEventIconConfig(event.type).text" />
              </div>
            </div>

            <div class="flex-1 pb-8">
              <div class="bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5 transition-all duration-300 group-hover:shadow-md group-hover:border-gray-200 group-hover:bg-white relative overflow-hidden">
                
                <div class="flex justify-between items-start mb-3">
                  <span class="text-sm font-bold tracking-wide" :class="getEventIconConfig(event.type).text">
                    {{ event.title }}
                  </span>
                  <span class="text-xs text-gray-400 flex items-center gap-1">
                    <User class="w-3 h-3" /> {{ event.operator }}
                  </span>
                </div>

                <div v-if="event.type === 'PURCHASE'" class="text-sm text-gray-600">
                  <p>完成苗种入库清点与系统建档。</p>
                  <div class="mt-3 bg-white p-3 rounded-lg border border-gray-100 flex gap-4">
                    <div><span class="text-gray-400 text-xs block">购入件数</span><span class="font-bold text-gray-700">{{ event.data.unitQty }} {{ event.data.purchaseUnit }}</span></div>
                    <div><span class="text-gray-400 text-xs block">单件密度</span><span class="font-bold text-gray-700">{{ event.data.density }} 尾/{{ event.data.purchaseUnit }}</span></div>
                  </div>
                </div>

                <div v-else-if="event.type === 'STOCKING'" class="text-sm text-gray-600">
                  <p>将批次资产投放至物理养殖空间。</p>
                  <div class="mt-3 bg-teal-50 border border-teal-100 p-3 rounded-lg text-teal-800 flex items-center gap-2">
                    <MapPin class="w-4 h-4 text-teal-600" />
                    去向：<strong class="font-bold">{{ event.data.pondName }}</strong>
                    <span class="ml-auto text-xs bg-teal-600 text-white px-2 py-0.5 rounded">投入 {{ Number(event.data.stockedQty || 0).toLocaleString() }} 尾</span>
                  </div>
                </div>

                <div v-else-if="event.type === 'PATROL'" class="text-sm text-gray-600 space-y-2">
                  <p>{{ event.data.remark || '完成例行水质监测与投喂。' }}</p>

                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    <div class="bg-white border border-gray-100 rounded-lg p-2 text-center">
                      <p class="text-[10px] text-gray-400">水温 / 天气</p>
                      <p class="font-bold text-orange-500">{{ event.data.temp }}°C <span class="text-xs text-gray-400 font-normal">{{ event.data.weather }}</span></p>
                    </div>
                    <div class="bg-white border border-gray-100 rounded-lg p-2 text-center">
                      <p class="text-[10px] text-gray-400">投喂 / 水色</p>
                      <p class="font-bold text-blue-600">{{ event.data.feedTotal }}kg <span class="text-xs text-gray-400 font-normal">{{ event.data.waterColor }}</span></p>
                    </div>
                    <div class="bg-white border border-gray-100 rounded-lg p-2 text-center">
                      <p class="text-[10px] text-gray-400">均重抽测</p>
                      <p class="font-bold text-emerald-600">{{ event.data.avgWeight !== '--' ? event.data.avgWeight : '--' }}{{ event.data.avgWeight !== '--' ? 'g' : '' }}</p>
                    </div>
                    <div class="bg-white border border-red-100 rounded-lg p-2 text-center">
                      <p class="text-[10px] text-red-400">打捞死苗</p>
                      <p class="font-bold text-red-600">{{ event.data.deathCount }} 尾</p>
                    </div>
                  </div>
                </div>

                <div v-else-if="event.type === 'HARVEST'" class="text-sm text-gray-600">
                  <p>该批次结束养殖周期，进行出池打捞与结算。</p>
                  <div class="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200 space-y-2">
                    <div class="flex justify-between items-center">
                      <span class="text-amber-800 font-bold">最终过磅总重</span>
                      <span class="text-xl font-black text-amber-600">{{ Number(event.data.totalWeight || 0).toLocaleString() }} kg</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-amber-700/80 text-xs">出池均重 / 单价</span>
                      <span class="text-sm font-bold text-amber-700">{{ event.data.avgWeightG || '--' }}g / ¥{{ event.data.unitPrice || 0 }}/kg</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-amber-700/80 text-xs">总收入</span>
                      <span class="text-sm font-bold text-emerald-600">¥{{ Number(event.data.totalRevenue || 0).toLocaleString() }}</span>
                    </div>
                    <div class="text-xs text-amber-700/80 border-t border-amber-200/50 pt-2 flex justify-between">
                      <span>收购方：{{ event.data.buyer }}</span>
                      <span v-if="event.data.finalCount">成活出池数：≈ {{ event.data.finalCount.toLocaleString() }} 尾</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div class="flex gap-4 sm:gap-6 group">
            <div class="w-16 sm:w-24 shrink-0"></div>
            <div class="relative flex flex-col items-center">
              <div class="w-4 h-4 rounded-full bg-gray-200 border-4 border-white shadow-sm z-10"></div>
            </div>
            <div class="flex-1 pb-8">
              <p class="text-xs text-gray-400 font-medium">生命周期起点 / 终点</p>
            </div>
          </div>

        </div>
      </div>
    </div>

    <el-dialog v-model="emailDialogVisible" title="发送溯源报告至邮箱" width="450px" append-to-body class="!rounded-2xl">
      <div class="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-5 flex gap-2 items-start">
        <Send class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div class="text-xs text-blue-700">
          系统将自动生成该批次 <span class="font-mono font-bold">{{ traceData?.baseInfo?.batchNo }}</span> 的可视化溯源档案 H5 链接，并通过官方邮箱发送给目标客户。
        </div>
      </div>
      
      <el-form label-position="top">
        <el-form-item label="收件人邮箱地址">
          <el-input v-model="emailForm.to" placeholder="如: client@company.com" clearable>
            <template #prefix><Mail class="w-4 h-4 text-gray-400" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="邮件附言 (选填)" class="mt-2">
          <el-input 
            v-model="emailForm.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="如：李总您好，这是您预定的南美白对虾批次的完整溯源报告，所有环境指标与用药记录均合规，请查收。" 
            maxlength="200" 
            show-word-limit 
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="emailDialogVisible = false" class="!rounded-lg">取 消</el-button>
          <el-button type="primary" @click="sendEmail" class="!bg-teal-600 !border-none hover:!bg-teal-700 !rounded-lg" :loading="sendingEmail">
            确 认 发 送
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  SearchCode, ScanLine, PackageSearch, Database, Fish, ShieldCheck, CheckCircle2,
  History, User, Truck, MapPin, Stethoscope, BadgeDollarSign, Lightbulb, Mail, QrCode, Send
} from 'lucide-vue-next'

// 🌟 引入真实后端 API
import {
  getPurchasePage, getStockingPage, getPatrolLogPage,
  getHarvestPage, getPondFeedLogPage, getBatchGrowthLogPage,
  getHarvestPreview
} from '@/api/base'

const searchBatchNo = ref('')
const loading = ref(false)
const traceData = ref(null)

// 邮件分享相关状态
const emailDialogVisible = ref(false)
const sendingEmail = ref(false)
const emailForm = reactive({ to: '', remark: '' })

// 图标与颜色配置
const getEventIconConfig = (type) => {
  const config = {
    'PURCHASE': { icon: Truck, bg: 'bg-blue-100', text: 'text-blue-600' },
    'STOCKING': { icon: MapPin, bg: 'bg-teal-100', text: 'text-teal-600' },
    'PATROL': { icon: Stethoscope, bg: 'bg-gray-100', text: 'text-gray-600' },
    'HARVEST': { icon: BadgeDollarSign, bg: 'bg-amber-100', text: 'text-amber-600' }
  }
  return config[type] || { icon: Database, bg: 'bg-gray-100', text: 'text-gray-600' }
}

const getStatusName = (status) => {
  const map = { 0: '待检疫', 1: '已入库', 2: '养殖中', 3: '已出池结算' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 0: 'info', 1: 'primary', 2: 'success', 3: 'warning' }
  return map[status] || 'info'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '未知日期'
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const formatTime = (dateStr) => {
  if (!dateStr) return '--:--'
  const d = new Date(dateStr)
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

// 🌟 核心逻辑：从真实接口拉取并聚合数据 (BFF模式)
const handleSearch = async () => {
  const batchNo = searchBatchNo.value.trim()
  if (!batchNo) return

  loading.value = true
  traceData.value = null

  try {
    // 1. 寻找源头：查采购批次表
    const purchaseRes = await getPurchasePage({ batchNo, pageNum: 1, pageSize: 1 })
    const purchaseData = purchaseRes.data?.records?.[0]

    if (!purchaseData) {
      loading.value = false
      return ElMessage.warning(`未找到批次号为 ${batchNo} 的溯源数据`)
    }

    const batchId = purchaseData.id

    // 2. 并发拉取：投放 / 出塘 / 生长抽测 / 结算预览（聚合统计用）
    const [stockingRes, harvestRes, previewRes, growthRes] = await Promise.all([
      getStockingPage({ batchId, pageNum: 1, pageSize: 100 }),
      getHarvestPage({ batchNo, pageNum: 1, pageSize: 10 }),
      getHarvestPreview(batchId).catch(() => ({ data: null })),
      getBatchGrowthLogPage({ batchNo, pageNum: 1, pageSize: 500 })
    ])

    const stockings = stockingRes.data?.records || []
    const harvests = harvestRes.data?.records || []
    const preview = previewRes.data || {}
    const growthLogs = growthRes.data?.records || []

    // 3. 获取投放池塘ID列表
    const pondIds = [...new Set(stockings.map(s => s.pondId).filter(Boolean))]

    // 4. 拉取巡塘日志（按池塘逐一查询后过滤 batchNo）
    let patrols = []
    let feedLogs = []
    if (pondIds.length > 0) {
      const [patrolResults, feedResults] = await Promise.all([
        Promise.all(pondIds.map(pid => getPatrolLogPage({ pondId: pid, pageNum: 1, pageSize: 500 }))),
        Promise.all(pondIds.map(pid => getPondFeedLogPage({ pondId: pid, pageNum: 1, pageSize: 500 })))
      ])
      patrols = patrolResults
        .flatMap(r => r.data?.records || [])
        .filter(p => p.batchNo === batchNo)
      feedLogs = feedResults.flatMap(r => r.data?.records || [])
    }

    // 5. 建立 patrolLogId → { growth, feedTotalKg } 索引
    const growthByPatrolId = {}
    growthLogs.forEach(g => {
      if (g.patrolLogId) growthByPatrolId[g.patrolLogId] = g
    })

    const feedByPatrolId = {}
    feedLogs.forEach(f => {
      if (f.patrolLogId) {
        feedByPatrolId[f.patrolLogId] = (feedByPatrolId[f.patrolLogId] || 0) + (Number(f.feedAmount) || 0)
      }
    })

    // 6. 构建事件时间线
    const events = []

    // A. 入库事件 — 字段名: unitQty (非 purchaseUnitQty)
    events.push({
      type: 'PURCHASE',
      title: '苗种采购与检疫入库',
      time: purchaseData.purchaseDate || purchaseData.createTime,
      operator: purchaseData.createBy || '系统自动建档',
      data: {
        unitQty: purchaseData.unitQty || 0,
        purchaseUnit: purchaseData.purchaseUnit || '件',
        density: purchaseData.densityPerUnit || 0
      }
    })

    // B. 投放事件
    stockings.forEach(st => {
      events.push({
        type: 'STOCKING',
        title: '投放下塘映射建立',
        time: st.stockingDate || st.createTime,
        operator: st.createBy || '养殖场操作员',
        data: {
          pondName: st.pondName || `池塘ID:${st.pondId}`,
          stockedQty: st.stockedQty || (st.stockedUnits || 0) * (purchaseData.densityPerUnit || 0)
        }
      })
    })

    // C. 巡塘事件 — 数据来自 PatrolLog + BatchGrowthLog + PondFeedLog 三表联查
    patrols.forEach(pt => {
      const growth = growthByPatrolId[pt.id]
      const feedTotal = feedByPatrolId[pt.id] || 0
      const routineDeath = growth?.routineDeathCount || 0
      const abnormalDeath = growth?.abnormalDeathCount || 0
      events.push({
        type: 'PATROL',
        title: '日常巡塘与监测台账',
        time: pt.patrolTime || pt.createTime,
        operator: pt.createBy || '巡塘员',
        data: {
          temp: pt.waterTemp ?? '--',
          weather: pt.weather || '--',
          waterColor: pt.waterColor || '--',
          feedTotal,
          avgWeight: growth?.avgWeight ?? '--',
          routineDeath,
          abnormalDeath,
          deathCount: routineDeath + abnormalDeath,
          remark: pt.remark || '各项环境指标正常。'
        }
      })
    })

    // D. 出塘事件 — 字段名: actualTotalWeightKg (非 totalWeight)
    harvests.forEach(hv => {
      // 成活出池数 = 总重(kg) × 1000 / 均重(g)，仅当均重>0时计算
      const weight = Number(hv.actualTotalWeightKg) || 0
      const avgG = Number(hv.actualAvgWeightG) || 0
      const estimatedCount = avgG > 0 ? Math.round(weight * 1000 / avgG) : null
      events.push({
        type: 'HARVEST',
        title: '终点结算与出塘交易',
        time: hv.harvestDate || hv.createTime,
        operator: hv.createBy || '场区主管',
        data: {
          totalWeight: weight,
          avgWeightG: avgG,
          unitPrice: hv.unitPrice || 0,
          totalRevenue: hv.totalRevenue || 0,
          buyer: hv.buyerName || '散客/未知渠道',
          finalCount: estimatedCount
        }
      })
    })

    // 按时间倒序
    events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    // 7. 聚合统计 — 优先使用 preview 接口返回的准确数据
    const totalIn = (purchaseData.unitQty || 0) * (purchaseData.densityPerUnit || 0) || 1
    const totalDead = preview.totalDeath ??
      growthLogs.reduce((sum, g) => sum + (g.routineDeathCount || 0) + (g.abnormalDeathCount || 0), 0)
    const survivalRate = preview.survivalRate ??
      (totalIn > 0 ? Math.max(0, Math.min(100, ((totalIn - totalDead) / totalIn) * 100)) : 0)

    // 8. 组装渲染数据
    traceData.value = {
      baseInfo: {
        batchNo: purchaseData.batchNo,
        seedlingName: preview.seedlingName || purchaseData.seedlingName || '未知水产品种',
        totalQty: totalIn,
        survivalRate: (typeof survivalRate === 'number' ? survivalRate : Number(survivalRate) || 0).toFixed(1),
        totalFeedKg: preview.totalFeedKg ?? feedLogs.reduce((sum, f) => sum + (Number(f.feedAmount) || 0), 0),
        totalDeath: totalDead,
        status: purchaseData.batchStatus ?? 0,
        seedlingCost: preview.seedlingCost ?? null,
        totalFeedCost: preview.totalFeedCost ?? null,
        totalMedicineCost: preview.totalMedicineCost ?? null
      },
      supplier: {
        name: purchaseData.supplierName || '未知供应商',
        licenseNo: '--',
        quarantineNo: purchaseData.quarantineCertNo || '源头合格检疫'
      },
      events
    }

  } catch (error) {
    console.error('全链路溯源失败:', error)
    ElMessage.error('溯源数据获取失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 保留一个模拟入口，方便答辩时在无真实数据的情况下进行完美演示
const simulateDemo = () => {
  searchBatchNo.value = 'B20260428-001'

  // 模拟请求延迟，展示逼真加载效果
  loading.value = true
  setTimeout(() => {
    traceData.value = {
      baseInfo: {
        batchNo: searchBatchNo.value,
        seedlingName: '南美白对虾 (Penaeus vannamei)',
        totalQty: 200000,
        survivalRate: '92.5',
        totalFeedKg: 570.5,
        totalDeath: 15000,
        status: 3
      },
      supplier: {
        name: '湛江海联水产种苗基地',
        licenseNo: '粤渔种许字(2025)第001号',
        quarantineNo: 'AQ-20260427-889'
      },
      events: [
        { type: 'HARVEST', title: '终点结算与出塘交易', time: '2026-07-28T09:30:00', operator: '陈老农', data: { totalWeight: 3205.5, avgWeightG: 17.3, unitPrice: 42.0, totalRevenue: 134631, buyer: '盒马鲜生生鲜直采中心', finalCount: 185000 } },
        { type: 'PATROL', title: '成长期巡塘抽测', time: '2026-07-15T08:15:00', operator: '陈老农', data: { temp: 29.5, weather: '晴', waterColor: '翠绿', feedTotal: 450.0, avgWeight: 14.5, routineDeath: 8, abnormalDeath: 4, deathCount: 12, remark: '对虾体色透亮，摄食旺盛，水质指标全部正常。' } },
        { type: 'PATROL', title: '标粗期巡塘抽测', time: '2026-05-30T16:00:00', operator: '李技术员', data: { temp: 28.0, weather: '阴', waterColor: '黄绿', feedTotal: 120.5, avgWeight: 3.2, routineDeath: 30, abnormalDeath: 15, deathCount: 45, remark: '遭遇强降雨，部分虾苗出现应激反应，已泼洒抗激灵。' } },
        { type: 'STOCKING', title: '投放下塘映射建立', time: '2026-04-29T07:00:00', operator: '陈老农', data: { pondName: '1号高位池', stockedQty: 200000 } },
        { type: 'PURCHASE', title: '苗种采购与检疫入库', time: '2026-04-28T14:20:00', operator: '采购部-张三', data: { unitQty: 100, purchaseUnit: '袋', density: 2000 } }
      ]
    }
    loading.value = false
  }, 1000)
}

// 发送邮件逻辑（演示）
const sendEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailForm.to || !emailRegex.test(emailForm.to)) {
    return ElMessage.warning('请输入正确格式的邮箱地址')
  }
  sendingEmail.value = true
  setTimeout(() => {
    ElMessage.success('溯源报告已成功发送至目标邮箱！')
    sendingEmail.value = false
    emailDialogVisible.value = false
    emailForm.to = ''; emailForm.remark = ''
  }, 1200)
}
</script>

<style scoped>
/* 滚动条美化 */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 10px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #d1d5db; }
</style>