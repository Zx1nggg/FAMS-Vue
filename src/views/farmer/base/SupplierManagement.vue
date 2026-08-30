<template>
  <div class="space-y-4">
    <!-- 只读说明 -->
    <div class="bg-teal-50/60 border border-teal-100 px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-sm">
      <Info class="w-5 h-5 text-teal-600 shrink-0" />
      <span class="text-sm text-teal-700">供应商名录由监督方统一维护，本页仅供查阅，进货时请从该名录中选择供应商。</span>
    </div>

    <!-- 搜索区 -->
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
      <el-form :inline="true" :model="queryParams" class="!-mb-4">
        <el-form-item label="供应商名称">
          <el-input v-model="queryParams.supplierName" placeholder="请输入名称搜索" clearable @keyup.enter="handleQuery" class="!w-64" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery" class="!bg-slate-800 !border-none hover:!bg-slate-700"><Search class="w-4 h-4 mr-1"/> 搜索</el-button>
          <el-button @click="resetQuery"><RefreshCw class="w-4 h-4 mr-1"/> 重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区 -->
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <el-table v-loading="loading" :data="tableData" stripe class="w-full">
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="供应商名称" prop="supplierName" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <span class="font-bold text-gray-700">{{ scope.row.supplierName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="联系人" prop="contactPerson" width="120" />
        <el-table-column label="联系电话" prop="contactPhone" width="150" />
        <el-table-column label="营业执照/资质号" prop="qualificationCode" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <span v-if="scope.row.qualificationCode" class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
              {{ scope.row.qualificationCode }}
            </span>
            <span v-else class="text-gray-400 text-sm">暂无记录</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, RefreshCw, Info } from 'lucide-vue-next'
import { getSupplierPage } from '@/api/base'

// 表格与查询参数
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({ pageNum: 1, pageSize: 10, supplierName: '' })

onMounted(() => { getList() })

const getList = async () => {
  loading.value = true
  try {
    const res = await getSupplierPage(queryParams.value)
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleQuery = () => { queryParams.value.pageNum = 1; getList() }
const resetQuery = () => { queryParams.value.supplierName = ''; handleQuery() }
</script>
