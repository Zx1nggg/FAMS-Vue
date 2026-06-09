<template>
  <div class="space-y-6">
    <!-- 头部操作区 -->
    <div class="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h2 class="text-lg font-bold text-gray-800">入驻申请审批</h2>
        <p class="text-sm text-gray-500 mt-1">管理养殖基地入驻申请，审核通过后将自动创建用户账号和养殖场。</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-slate-500">
          待审批：
          <span class="font-bold text-amber-600 text-base">{{ pendingCount }}</span>
        </span>
        <button @click="fetchData"
          class="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors">
          <RefreshCw class="w-4 h-4" /> 刷新
        </button>
      </div>
    </div>

    <!-- 状态筛选 Tab -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="flex border-b border-gray-100 px-5">
        <button v-for="tab in tabs" :key="tab.value" @click="currentTab = tab.value; fetchData()"
          class="py-3.5 px-4 text-sm font-medium transition-colors border-b-2 -mb-px"
          :class="currentTab === tab.value
            ? 'border-teal-500 text-teal-600'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'">
          {{ tab.label }}
          <span v-if="tab.count !== null"
            class="ml-1.5 px-1.5 py-0.5 rounded text-xs"
            :class="currentTab === tab.value ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- 数据表格 -->
      <div v-loading="loading" class="p-0">
        <table v-if="list.length > 0" class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-slate-50/50 text-left">
              <th class="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">申请账号</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">姓名</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">养殖场名称</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">所在地</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">状态</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">提交时间</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in list" :key="item.id"
              class="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
              <td class="px-5 py-3 text-slate-400 text-xs">{{ item.id }}</td>
              <td class="px-5 py-3 font-medium text-slate-700">{{ item.username }}</td>
              <td class="px-5 py-3 text-slate-600">{{ item.realName }}</td>
              <td class="px-5 py-3 text-slate-600">{{ item.farmName }}</td>
              <td class="px-5 py-3 text-slate-500 text-xs">
                {{ item.farmProvince || '--' }} {{ item.farmCity || '' }}
              </td>
              <td class="px-5 py-3">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="statusClass(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
              </td>
              <td class="px-5 py-3 text-slate-500 text-xs">{{ formatTime(item.createdAt) }}</td>
              <td class="px-5 py-3">
                <div class="flex gap-1.5">
                  <button @click="viewDetail(item)"
                    class="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                    查看
                  </button>
                  <button v-if="item.status === 0" @click="handleApprove(item)"
                    class="px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                    通过
                  </button>
                  <button v-if="item.status === 0" @click="openRejectDialog(item)"
                    class="px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    拒绝
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 空状态 -->
        <div v-if="!loading && list.length === 0"
          class="py-20 flex flex-col items-center justify-center text-gray-400">
          <FileCheck class="w-16 h-16 mb-4 text-gray-300" />
          <p class="text-lg font-medium text-gray-600 mb-1">暂无{{ currentTabLabel }}申请</p>
          <p class="text-sm">所有入驻申请已处理完毕</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="flex justify-between items-center px-5 py-3 border-t border-gray-100">
        <span class="text-xs text-slate-500">共 {{ total }} 条记录</span>
        <div class="flex gap-1">
          <button :disabled="pageNum <= 1" @click="pageNum--; fetchData()"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            :class="pageNum <= 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'">
            上一页
          </button>
          <span class="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-lg">
            {{ pageNum }} / {{ Math.ceil(total / pageSize) || 1 }}
          </span>
          <button :disabled="pageNum >= Math.ceil(total / pageSize)" @click="pageNum++; fetchData()"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            :class="pageNum >= Math.ceil(total / pageSize) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'">
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== 详情对话框 ==================== -->
    <div v-if="detailVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @click.self="detailVisible = false">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-800">申请详情</h3>
          <button @click="detailVisible = false"
            class="text-slate-400 hover:text-slate-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">申请账号</span>
              <span class="font-medium text-slate-800">{{ detailData?.username }}</span>
            </div>
            <div>
              <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">真实姓名</span>
              <span class="font-medium text-slate-800">{{ detailData?.realName }}</span>
            </div>
            <div>
              <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">联系电话</span>
              <span class="font-medium text-slate-800">{{ detailData?.phone || '未填写' }}</span>
            </div>
            <div>
              <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">电子邮箱</span>
              <span class="font-medium text-slate-800">{{ detailData?.email || '未填写' }}</span>
            </div>
          </div>
          <hr class="border-gray-100" />
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">养殖场名称</span>
              <span class="font-medium text-slate-800">{{ detailData?.farmName }}</span>
            </div>
            <div>
              <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">所在地</span>
              <span class="font-medium text-slate-800">
                {{ detailData?.farmProvince || '--' }} {{ detailData?.farmCity || '--' }}
              </span>
            </div>
            <div class="col-span-2">
              <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">详细地址</span>
              <span class="font-medium text-slate-800">{{ detailData?.farmAddress || '未填写' }}</span>
            </div>
          </div>
          <hr class="border-gray-100" />
          <div>
            <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">申请理由</span>
            <p class="text-sm text-slate-700">{{ detailData?.applicationReason || '未填写' }}</p>
          </div>
          <hr class="border-gray-100" />
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">当前状态</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="statusClass(detailData?.status)">
                {{ statusLabel(detailData?.status) }}
              </span>
            </div>
            <div>
              <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">提交时间</span>
              <span class="font-medium text-slate-800">{{ formatTime(detailData?.createdAt) }}</span>
            </div>
            <div v-if="detailData?.reviewComment">
              <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">审批意见</span>
              <span class="font-medium text-slate-800">{{ detailData?.reviewComment }}</span>
            </div>
            <div v-if="detailData?.reviewedAt">
              <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">审批时间</span>
              <span class="font-medium text-slate-800">{{ formatTime(detailData?.reviewedAt) }}</span>
            </div>
          </div>
        </div>
        <div v-if="detailData?.status === 0" class="flex gap-3 px-6 pb-6">
          <button @click="detailVisible = false; handleApprove(detailData)"
            class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-sm">
            ✓ 审批通过
          </button>
          <button @click="detailVisible = false; openRejectDialog(detailData)"
            class="flex-1 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors text-sm">
            ✕ 拒绝申请
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== 拒绝原因对话框 ==================== -->
    <div v-if="rejectVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @click.self="rejectVisible = false">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-red-700">拒绝入驻申请</h3>
          <button @click="rejectVisible = false"
            class="text-slate-400 hover:text-slate-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <p class="text-sm text-slate-600">
            拒绝账号 <span class="font-bold text-slate-800">{{ rejectTarget?.username }}</span>
            的入驻申请，请填写拒绝原因：
          </p>
          <textarea v-model="rejectReason" rows="3"
            class="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:border-red-400 focus:ring-red-100 transition-colors text-sm resize-none"
            placeholder="请填写拒绝原因（必填）..."></textarea>
          <div class="flex gap-3">
            <button @click="rejectVisible = false"
              class="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="confirmReject" :disabled="!rejectReason.trim() || approving"
              class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              确认拒绝
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '@/utils/request'
import { RefreshCw, FileCheck, X } from 'lucide-vue-next'

// 列表数据
const loading = ref(false)
const approving = ref(false)
const list = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const currentTab = ref(0)
const pendingCount = ref(0)

const tabs = [
  { label: '待审批', value: 0, count: null },
  { label: '已通过', value: 1, count: null },
  { label: '已拒绝', value: 2, count: null },
]
const currentTabLabel = computed(() => {
  const t = tabs.find(t => t.value === currentTab.value)
  return t ? t.label : '全部'
})

// 详情对话框
const detailVisible = ref(false)
const detailData = ref(null)

// 拒绝对话框
const rejectVisible = ref(false)
const rejectTarget = ref(null)
const rejectReason = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/registrations', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        status: currentTab.value
      }
    })
    const data = res.data
    list.value = data.records || []
    total.value = data.total || 0

    // 同时拉取一下待审批总数（用于顶部显示）
    if (currentTab.value !== 0) {
      const countRes = await request.get('/admin/registrations', {
        params: { pageNum: 1, pageSize: 1, status: 0 }
      })
      pendingCount.value = countRes.data.total || 0
    } else {
      pendingCount.value = total.value
    }
  } catch (error) {
    console.error('获取申请列表失败', error)
  } finally {
    loading.value = false
  }
}

const viewDetail = (item) => {
  detailData.value = item
  detailVisible.value = true
}

const handleApprove = async (item) => {
  approving.value = true
  try {
    await request.put(`/admin/registrations/${item.id}/approve`, {
      status: 1,
      reviewComment: '审批通过，欢迎入驻！'
    })
    // 刷新列表
    item.status = 1
    fetchData()
  } catch (error) {
    console.error('审批失败', error)
  } finally {
    approving.value = false
  }
}

const openRejectDialog = (item) => {
  rejectTarget.value = item
  rejectReason.value = ''
  rejectVisible.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value.trim()) return
  approving.value = true
  try {
    await request.put(`/admin/registrations/${rejectTarget.value.id}/approve`, {
      status: 2,
      reviewComment: rejectReason.value.trim()
    })
    rejectVisible.value = false
    rejectTarget.value = null
    fetchData()
  } catch (error) {
    console.error('拒绝失败', error)
  } finally {
    approving.value = false
  }
}

const statusLabel = (status) => {
  const map = { 0: '待审批', 1: '已通过', 2: '已拒绝' }
  return map[status] || '未知'
}

const statusClass = (status) => {
  const map = {
    0: 'bg-amber-50 text-amber-700 border border-amber-200',
    1: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    2: 'bg-red-50 text-red-700 border border-red-200'
  }
  return map[status] || 'bg-slate-50 text-slate-600'
}

const formatTime = (time) => {
  if (!time) return '--'
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  fetchData()
})
</script>
