<template>
  <div class="space-y-5">
    <header>
      <h1 class="text-2xl font-bold text-slate-900">苗种检疫审核</h1>
      <p class="mt-1 text-sm text-slate-500">采购登记只会生成待检疫批次。监管人员核验材料并签发证号后，批次才允许下塘。</p>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <el-form :inline="true" :model="query" class="!-mb-4">
        <el-form-item label="批次号">
          <el-input v-model="query.batchNo" clearable placeholder="输入批次号" class="!w-56" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="query.batchStatus" clearable placeholder="全部状态" class="!w-36">
            <el-option label="待检疫" :value="0" />
            <el-option label="已检疫入库" :value="1" />
            <el-option label="养殖中" :value="2" />
            <el-option label="已出塘" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <el-table v-loading="loading" :data="rows" stripe>
        <el-table-column prop="batchNo" label="批次号" min-width="190">
          <template #default="{ row }"><span class="font-mono font-semibold text-slate-700">{{ row.batchNo }}</span></template>
        </el-table-column>
        <el-table-column prop="farmName" label="养殖场" min-width="140">
          <template #default="{ row }">{{ row.farmName || `场区 #${row.farmId}` }}</template>
        </el-table-column>
        <el-table-column prop="supplierName" label="供应商" min-width="160" show-overflow-tooltip />
        <el-table-column prop="seedlingName" label="苗种" min-width="120" />
        <el-table-column prop="purchaseDate" label="采购日期" width="120" />
        <el-table-column label="数量" width="150">
          <template #default="{ row }">{{ row.unitQty }}{{ row.purchaseUnit }} / {{ Number(row.estimatedTotalQty || 0).toLocaleString() }}尾</template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.batchStatus === 0" type="warning">待检疫</el-tag>
            <el-tag v-else-if="row.batchStatus === 1" type="success">已检疫入库</el-tag>
            <el-tag v-else-if="row.batchStatus === 2" type="primary">养殖中</el-tag>
            <el-tag v-else type="info">已出塘</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quarantineCertNo" label="检疫证号" min-width="150">
          <template #default="{ row }">{{ row.quarantineCertNo || '—' }}</template>
        </el-table-column>
        <el-table-column prop="quarantineReviewedAt" label="审核时间" min-width="165">
          <template #default="{ row }">{{ row.quarantineReviewedAt ? String(row.quarantineReviewedAt).replace('T', ' ') : '—' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-if="row.batchStatus === 0" link type="primary" @click="openApproval(row)">核验并签发</el-button>
            <span v-else class="text-xs text-slate-400">已完成</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize" :total="total"
          layout="total, sizes, prev, pager, next" @size-change="load" @current-change="load" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="签发检疫合格证明" width="480px">
      <div class="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        <div>批次：<span class="font-mono font-semibold">{{ selected?.batchNo }}</span></div>
        <div class="mt-1">{{ selected?.supplierName }} · {{ selected?.seedlingName }}</div>
      </div>
      <el-form ref="approvalForm" :model="approval" :rules="approvalRules" label-width="100px">
        <el-form-item label="检疫证号" prop="quarantineCertNo">
          <el-input v-model="approval.quarantineCertNo" maxlength="100" show-word-limit placeholder="请输入核验后的检疫合格证号" />
        </el-form-item>
      </el-form>
      <p class="text-xs leading-5 text-amber-600">签发后该批次将变为“已检疫入库”并允许下塘；供应来源、苗种和数量将锁定。</p>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="approve">确认签发</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { approvePurchaseQuarantine, getPurchasePage } from '@/api/base'

const rows = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const approvalForm = ref<any>()
const selected = ref<any>(null)
const query = ref({ pageNum: 1, pageSize: 10, batchNo: '', batchStatus: 0 as number | '' })
const approval = ref({ quarantineCertNo: '' })
const approvalRules = { quarantineCertNo: [{ required: true, message: '请输入检疫合格证号', trigger: 'blur' }] }

const load = async () => {
  loading.value = true
  try {
    const result = await getPurchasePage(query.value)
    rows.value = result.data?.records || []
    total.value = result.data?.total || 0
  } finally {
    loading.value = false
  }
}

const search = () => { query.value.pageNum = 1; load() }
const reset = () => { query.value.batchNo = ''; query.value.batchStatus = 0; search() }

const openApproval = (row: any) => {
  selected.value = row
  approval.value.quarantineCertNo = ''
  dialogVisible.value = true
}

const approve = async () => {
  try { await approvalForm.value?.validate() } catch { return }
  submitting.value = true
  try {
    await approvePurchaseQuarantine(selected.value.id, approval.value.quarantineCertNo)
    ElMessage.success('检疫合格证明已签发，该批次现可下塘')
    dialogVisible.value = false
    await load()
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>
