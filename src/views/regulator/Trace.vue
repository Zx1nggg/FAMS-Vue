<template>
  <div class="min-h-screen bg-slate-100 p-4 md:p-6 font-sans">
    <div class="max-w-6xl mx-auto space-y-5">
      <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-slate-800">全链路苗种追溯</h1>
          <p class="text-sm text-slate-500 mt-1">按批次号或溯源码核查供应商、采购、投放、巡塘、投喂、生长与出塘记录。</p>
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <input
            v-model="keyword"
            class="flex-1 md:w-80 px-3 py-2 rounded-md border border-slate-300 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="批次号 / 溯源码"
            @keyup.enter="search"
          />
          <button
            class="px-4 py-2 rounded-md bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:bg-slate-400"
            :disabled="loading"
            @click="search"
          >{{ loading ? '查询中...' : '核查' }}</button>
        </div>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-4">{{ error }}</div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <aside class="bg-white border border-slate-200 rounded-lg shadow-sm h-fit">
          <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-800">近期批次目录</h2>
            <button class="text-xs text-slate-500 hover:text-slate-800" :disabled="batchLoading" @click="loadBatches">
              刷新
            </button>
          </div>
          <div class="p-5">
            <div class="flex gap-2">
              <input
                v-model="batchKeyword"
                class="flex-1 px-3 py-2 rounded-md border border-slate-300 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="筛选批次号"
                @keyup.enter="loadBatches"
              />
              <button class="px-3 py-2 rounded-md bg-slate-800 text-white text-sm hover:bg-slate-700" @click="loadBatches">筛选</button>
            </div>

            <div v-loading="batchLoading" class="mt-4 space-y-2 min-h-40">
              <button
                v-for="batch in batches"
                :key="batch.id"
                class="w-full text-left border rounded-md px-3 py-2 transition-colors"
                :class="keyword === batch.batchNo ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'"
                @click="searchBatch(batch.batchNo)"
              >
                <div class="flex items-start justify-between gap-2">
                  <p class="font-mono text-xs font-bold text-slate-800 break-all">{{ batch.batchNo }}</p>
                  <span :class="['shrink-0 text-[10px] px-1.5 py-0.5 rounded border', batchStatusClass(batch.batchStatus)]">
                    {{ batchStatusLabel(batch.batchStatus) }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-1 truncate">{{ batch.farmName || '未知养殖场' }} · {{ batch.seedlingName || '未知品种' }}</p>
                <p class="text-xs text-slate-400 mt-1">{{ batch.purchaseDate || '未知采购日期' }} · {{ batch.supplierName || '未知供应商' }}</p>
              </button>
              <div v-if="!batchLoading && batches.length === 0" class="py-10 text-center text-sm text-slate-400">
                暂无可追溯批次
              </div>
            </div>
          </div>
        </aside>

        <div class="lg:col-span-2">
          <div v-if="trace" class="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <aside class="bg-white border border-slate-200 rounded-lg shadow-sm p-5 h-fit">
              <p class="text-xs text-slate-500 mb-1">批次号</p>
              <h2 class="text-lg font-bold text-slate-800 font-mono break-all">{{ trace.batchNo }}</h2>
              <p class="text-sm text-emerald-700 font-medium mt-2">{{ trace.seedlingName || '未知品种' }}</p>
              <div class="mt-5 grid grid-cols-2 gap-3 text-center">
                <div class="rounded-md bg-slate-50 border border-slate-100 p-3">
                  <p class="text-xs text-slate-500">节点数</p>
                  <p class="text-xl font-bold text-slate-800">{{ trace.nodes?.length || 0 }}</p>
                </div>
                <div class="rounded-md bg-blue-50 border border-blue-100 p-3">
                  <p class="text-xs text-blue-600">状态</p>
                  <p class="text-sm font-bold text-blue-700 mt-1">已建链</p>
                </div>
              </div>
            </aside>

            <section class="xl:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm p-5">
              <h3 class="text-sm font-bold text-slate-800 mb-4">核查链路</h3>
              <div class="space-y-4">
                <div v-for="(node, index) in trace.nodes" :key="`${node.nodeType}-${index}`" class="border border-slate-200 rounded-lg p-4">
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p class="text-sm font-bold text-slate-800">{{ node.nodeName }}</p>
                      <p class="text-xs text-slate-400 mt-1">{{ formatTime(node.nodeTime) }}</p>
                    </div>
                    <span class="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase">{{ node.nodeType }}</span>
                  </div>
                  <dl class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div v-for="([key, value]) in Object.entries(node.detail || {})" :key="key" class="bg-slate-50 rounded-md px-3 py-2 flex justify-between gap-3">
                      <dt class="text-slate-500 shrink-0">{{ key }}</dt>
                      <dd class="text-slate-800 text-right break-all">{{ value ?? '—' }}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>
          </div>

          <div v-else-if="!loading" class="bg-white border border-dashed border-slate-300 rounded-lg p-12 text-center text-slate-400">
            从左侧选择批次，或输入批次号/溯源码后开始核查。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getTraceBatchList, quickTrace } from '@/api/regulator'
import type { TraceBatch, TraceChain } from '@/types/regulator'

const keyword = ref('')
const loading = ref(false)
const batchLoading = ref(false)
const error = ref('')
const trace = ref<TraceChain | null>(null)
const batchKeyword = ref('')
const batches = ref<TraceBatch[]>([])

onMounted(() => {
  loadBatches()
})

async function loadBatches() {
  batchLoading.value = true
  try {
    const res = await getTraceBatchList({
      pageNum: 1,
      pageSize: 20,
      keyword: batchKeyword.value.trim() || undefined,
    })
    batches.value = res.data?.records || []
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || '批次目录加载失败'
  } finally {
    batchLoading.value = false
  }
}

function searchBatch(batchNo: string) {
  keyword.value = batchNo
  search()
}

async function search() {
  const value = keyword.value.trim()
  if (!value) {
    error.value = '请输入批次号或溯源码'
    return
  }
  loading.value = true
  error.value = ''
  trace.value = null
  try {
    const res = await quickTrace(value)
    trace.value = res.data
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || '查询失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function formatTime(value?: string) {
  if (!value) return '未知时间'
  return new Date(value).toLocaleString('zh-CN')
}

function batchStatusLabel(status?: number) {
  switch (status) {
    case 0: return '待检疫'
    case 1: return '已检疫入库'
    case 2: return '养殖中'
    case 3: return '已结算'
    default: return '未知'
  }
}

function batchStatusClass(status?: number) {
  switch (status) {
    case 0: return 'bg-amber-50 text-amber-700 border-amber-200'
    case 1: return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 2: return 'bg-blue-50 text-blue-700 border-blue-200'
    case 3: return 'bg-slate-100 text-slate-600 border-slate-200'
    default: return 'bg-slate-50 text-slate-500 border-slate-200'
  }
}
</script>
