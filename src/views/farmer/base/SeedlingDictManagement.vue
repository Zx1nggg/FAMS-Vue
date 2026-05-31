<template>
  <div class="space-y-4">
    <!-- 搜索区 -->
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
      <el-form :inline="true" :model="queryParams" class="!-mb-4">
        <el-form-item label="苗种名称">
          <el-input v-model="queryParams.categoryName" placeholder="请输入品种名称搜索" clearable @keyup.enter="handleQuery" class="!w-64" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery" class="!bg-slate-800 !border-none hover:!bg-slate-700"><Search class="w-4 h-4 mr-1"/> 搜索</el-button>
          <el-button @click="resetQuery"><RefreshCw class="w-4 h-4 mr-1"/> 重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-button type="primary" class="!rounded-xl !bg-teal-600 !border-none hover:!bg-teal-700" @click="handleAdd">
        <span class="flex items-center gap-1.5"><Plus class="w-4 h-4"/> 新增品种规则</span>
      </el-button>
    </div>

    <!-- 表格区 -->
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <el-table v-loading="loading" :data="tableData" stripe class="w-full">
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="苗种品种" prop="categoryName" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <span class="font-bold text-teal-700">{{ scope.row.categoryName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标准养殖周期" prop="growthCycleDays" width="120" align="center">
          <template #default="scope">
            <span v-if="scope.row.growthCycleDays">{{ scope.row.growthCycleDays }} 天</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="自然容许死亡率" prop="allowableMortalityRate" width="140" align="center">
          <template #default="scope">
            <span v-if="scope.row.allowableMortalityRate" class="text-amber-600 font-medium">≤ {{ scope.row.allowableMortalityRate }} %</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        
        <!-- 阈值高亮展示组 -->
        <el-table-column label="环境告警红线" align="center">
          <el-table-column label="最低水温" prop="minTemp" width="110" align="center">
            <template #default="scope">
              <span v-if="scope.row.minTemp" class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">{{ scope.row.minTemp }} ℃</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </el-table-column>
          <el-table-column label="最低溶氧量" prop="minDo" width="120" align="center">
            <template #default="scope">
              <span v-if="scope.row.minDo" class="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold">{{ scope.row.minDo }} mg/L</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleUpdate(scope.row)">修改规则</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 弹窗表单 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="550px" append-to-body class="!rounded-2xl">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px" class="pr-6 mt-4">
        
        <div class="mb-4 pb-2 border-b border-gray-100">
          <span class="text-sm font-bold text-gray-700 border-l-4 border-teal-500 pl-2">基础生物属性</span>
        </div>
        
        <el-form-item label="品种名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="如: 南美白对虾、加州鲈鱼" clearable />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标准周期" prop="growthCycleDays">
              <el-input-number v-model="form.growthCycleDays" :min="1" :max="1000" controls-position="right" class="!w-full" placeholder="天数" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容许死亡率" prop="allowableMortalityRate">
              <el-input-number v-model="form.allowableMortalityRate" :min="0" :max="100" :precision="2" :step="0.5" controls-position="right" class="!w-full" placeholder="%" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="mt-6 mb-4 pb-2 border-b border-gray-100">
          <span class="text-sm font-bold text-gray-700 border-l-4 border-red-500 pl-2">物联网自动告警阈值</span>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低水温界限" prop="minTemp">
              <el-input-number v-model="form.minTemp" :min="-10" :max="50" :precision="2" :step="0.5" controls-position="right" class="!w-full" placeholder="℃" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="极低溶氧界限" prop="minDo">
              <el-input-number v-model="form.minDo" :min="0" :max="20" :precision="2" :step="0.5" controls-position="right" class="!w-full" placeholder="mg/L" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <div class="ml-[130px] text-xs text-gray-400 leading-relaxed mt-1">
          注：当该品种所投放的池塘物联网传感器监测数值低于此界限时，系统将自动向养殖户派发紧急行动告警。
        </div>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="!rounded-lg">取 消</el-button>
          <el-button type="primary" @click="submitForm" class="!rounded-lg !bg-teal-600 !border-none hover:!bg-teal-700" :loading="submitLoading">保 存 规 则</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, RefreshCw } from 'lucide-vue-next'
// 请确保已将你发的接口定义放入 api 中
import { getSeedlingPage, addSeedling, updateSeedling, delSeedling } from '@/api/base'

// 表格与查询参数
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({ pageNum: 1, pageSize: 10, categoryName: '' })

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref(null)

// 对应后端的 DTO / Entity 字段
const form = ref({ 
  id: undefined, 
  categoryName: '', 
  growthCycleDays: undefined, 
  allowableMortalityRate: undefined, 
  minTemp: undefined, 
  minDo: undefined 
})

const rules = {
  categoryName: [
    { required: true, message: '品种名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '品种名称需 2-50 个字符', trigger: 'blur' }
  ]
}

onMounted(() => { getList() })

const getList = async () => {
  loading.value = true
  try {
    const res = await getSeedlingPage(queryParams.value)
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleQuery = () => { queryParams.value.pageNum = 1; getList() }
const resetQuery = () => { queryParams.value.categoryName = ''; handleQuery() }

const handleAdd = () => {
  form.value = { 
    id: undefined, 
    categoryName: '', 
    growthCycleDays: undefined, 
    allowableMortalityRate: undefined, 
    minTemp: undefined, 
    minDo: undefined 
  }
  dialogTitle.value = '新增苗种字典规则'
  dialogVisible.value = true
}

const handleUpdate = (row) => {
  form.value = { ...row }
  dialogTitle.value = '修改苗种字典规则'
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (form.value.id) {
          await updateSeedling(form.value.id, form.value)
          ElMessage.success('规则修改成功')
        } else {
          await addSeedling(form.value)
          ElMessage.success('新增品种规则成功')
        }
        dialogVisible.value = false
        getList()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除苗种字典 "${row.categoryName}" 吗？删除后相关预警模型可能会失效。`, '高危操作警告', { type: 'warning' }).then(async () => {
    await delSeedling(row.id)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}
</script>