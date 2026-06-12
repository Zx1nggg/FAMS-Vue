<template>
  <div class="h-full flex flex-col">
    
    <!-- 防呆提示：未选择农场时拦截 -->
    <div v-if="!currentFarmId" class="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <Home class="w-10 h-10 text-amber-500" />
      </div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">未选择操作场区</h2>
      <p class="text-gray-500 mb-6">在进行苗种投放前，请先指定一个具体的养殖场区。</p>
      <el-button type="primary" size="large" class="!bg-teal-600 !border-none hover:!bg-teal-700 !rounded-xl" @click="$router.push('/farmer/base/farm')">
        去选择养殖场
      </el-button>
    </div>

    <!-- 投放登记业务页面 -->
    <div v-else class="space-y-4">
      
      <!-- 🌟 新增：当前操作场区高亮提示牌 -->
      <div class="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3.5 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-3">
          <div class="p-1.5 bg-emerald-100 rounded-lg">
            <Home class="w-5 h-5 text-emerald-600" />
          </div>
          <span class="text-sm text-emerald-800">
            当前工作空间：<strong class="text-emerald-700 text-base mx-1 tracking-wide">{{ currentFarmName }}</strong>
            <span class="text-xs text-emerald-600/70 ml-2 hidden md:inline">本页所有数据与操作均已隔离，仅对本场区生效。</span>
          </span>
        </div>
        <!-- 提供一键切换快捷入口 -->
        <el-button link type="primary" class="!text-emerald-600 hover:!text-emerald-800 text-xs font-bold" @click="$router.push('/farmer/base/farm')">
          <RefreshCw class="w-3 h-3 mr-1" /> 切换场区
        </el-button>
      </div>

      <!-- 搜索区 -->
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center flex-wrap gap-4">
        <el-form :inline="true" :model="queryParams" class="!-mb-4">
          <el-form-item label="目标池塘">
            <el-select v-model="queryParams.pondId" placeholder="选择池塘过滤" clearable class="!w-40" @change="handleQuery">
              <el-option v-for="pond in pondOptions" :key="pond.id" :label="pond.pondName" :value="pond.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="苗种批次">
            <el-select v-model="queryParams.batchId" placeholder="选择批次过滤" clearable class="!w-48" @change="handleQuery">
              <el-option v-for="batch in allBatches" :key="batch.id" :label="batch.batchNo" :value="batch.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery" class="!bg-slate-800 !border-none hover:!bg-slate-700"><Search class="w-4 h-4 mr-1"/> 搜索</el-button>
            <el-button @click="resetQuery"><RefreshCw class="w-4 h-4 mr-1"/> 重置</el-button>
          </el-form-item>
        </el-form>
        
        <el-button type="primary" class="!rounded-xl !bg-emerald-600 !border-none hover:!bg-emerald-700" @click="handleAdd">
          <span class="flex items-center gap-1.5"><MapPin class="w-4 h-4"/> 登记下塘</span>
        </el-button>
      </div>

      <!-- 表格区 -->
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <el-table v-loading="loading" :data="tableData" stripe class="w-full">
          <el-table-column label="序号" type="index" width="60" align="center" />
          
          <el-table-column label="关联批次号" prop="batchNo" min-width="190">
            <template #default="scope">
              <span class="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-mono font-bold border border-slate-200">
                {{ scope.row.batchNo || '未知批次' }}
              </span>
            </template>
          </el-table-column>
          
          <!-- 🌟 新增：直观展示苗种品种 -->
          <el-table-column label="苗种品种" prop="seedlingName" align="center" min-width="120">
            <template #default="scope">
              <span class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                {{ scope.row.seedlingName || '-' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="投放池塘" prop="pondName" min-width="120">
            <template #default="scope">
              <span class="flex items-center gap-1.5 text-teal-700 font-bold">
                <Box class="w-4 h-4" /> {{ scope.row.pondName || '未知池塘' }}
              </span>
            </template>
          </el-table-column>

          <!-- 🌟 优化：直接使用后端返回的 purchaseUnit 作为单位 -->
          <el-table-column label="投放件数" prop="stockedUnits" align="center" width="120">
            <template #default="scope">
              <span class="text-gray-700 font-bold">{{ scope.row.stockedUnits }} {{ scope.row.purchaseUnit || '件' }}</span>
            </template>
          </el-table-column>

          <!-- 🌟 优化：直接渲染后端算好的 stockedQty -->
          <el-table-column label="折合总尾数" align="center" min-width="130">
            <template #default="scope">
              <div class="flex items-center justify-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                <span>{{ (scope.row.stockedQty || 0).toLocaleString() }}</span>
                <span class="text-xs font-normal">尾</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="下塘日期" prop="stockingDate" align="center" width="120" />

          <el-table-column label="操作" align="center" width="140" fixed="right">
            <template #default="scope">
              <el-button link type="primary" :disabled="scope.row.batchStatus === 3" @click="handleUpdate(scope.row)">
                {{ scope.row.batchStatus === 3 ? '已锁定' : '编辑' }}
              </el-button>
              <el-button link type="danger" :disabled="scope.row.batchStatus === 3" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 弹窗表单 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="550px" append-to-body class="!rounded-2xl">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="pr-6 mt-4">

        <div class="mb-4 pb-2 border-b border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-700">
          <MapPin class="w-4 h-4 text-emerald-500"/> 将批次资产绑定至物理空间
        </div>

        <!-- 已出库锁定提示 -->
        <div v-if="isEditLocked" class="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <span class="text-amber-500 text-base mt-0.5">⚠️</span>
          <div class="text-xs text-amber-700">
            <p class="font-bold mb-0.5">该投放记录关联的批次已出库结算</p>
            <p class="text-amber-600">池塘与批次不可更改，仅允许修改投放件数用于纠错。</p>
          </div>
        </div>

        <el-form-item label="投放池塘" prop="pondId">
          <el-select v-model="form.pondId" placeholder="请选择目标池塘" class="!w-full" filterable
            :disabled="isEditLocked">
            <el-option v-for="pond in pondOptions" :key="pond.id" :label="pond.pondName" :value="pond.id">
              <span style="float: left">{{ pond.pondName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ pond.areaMu }} 亩</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="苗种批次" prop="batchId">
          <el-select v-model="form.batchId" placeholder="请选择要下塘的采购批次" class="!w-full" filterable :disabled="!form.pondId || isEditLocked">
            <el-option v-for="batch in availableBatches" :key="batch.id" :label="batch.batchNo" :value="batch.id">
              <span style="float: left">
                {{ batch.batchNo }} 
                <!-- 🌟 优化下拉框展示：加上品种名称，避免死记批次号 -->
                <span class="text-xs text-gray-400 ml-2">({{ batch.seedlingName || '未知品种' }})</span>
              </span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                密度: {{ batch.densityPerUnit || 0 }} 尾/{{ batch.purchaseUnit || '件' }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="下塘日期" prop="stockingDate">
              <el-date-picker v-model="form.stockingDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" class="!w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="投放件数" prop="stockedUnits">
              <!-- 动态显示包装单位的占位符 -->
              <el-input-number v-model="form.stockedUnits" :min="1" controls-position="right" class="!w-full" :placeholder="`单位: ${selectedBatch?.purchaseUnit || '件'}`" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 🌟 弹窗内的预演计算（体验拉满） -->
        <el-form-item v-if="selectedBatch">
          <div class="w-full mt-1 bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex flex-col gap-2 shadow-inner">
            <!-- 🌟 预览卡片追加品种信息 -->
            <div class="flex justify-between items-center text-xs text-emerald-600">
              <span class="flex items-center gap-1">苗种品种:</span>
              <span class="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-100">
                {{ selectedBatch.seedlingName || '未知品种' }}
              </span>
            </div>
            <div class="flex justify-between items-center text-xs text-emerald-600">
              <span class="flex items-center gap-1">批次密度基准:</span>
              <span class="font-mono bg-white px-2 py-0.5 rounded border border-emerald-100">
                {{ selectedBatch.densityPerUnit || 0 }} 尾 / {{ selectedBatch.purchaseUnit || '件' }}
              </span>
            </div>
            <div class="border-t border-emerald-200/50 my-0.5"></div>
            <div class="flex justify-between items-end text-emerald-800">
              <span class="text-sm font-medium">系统自动换算预估总尾数:</span>
              <span class="font-bold text-2xl font-mono leading-none tracking-tight">
                ≈ {{ calculatedTotal.toLocaleString() }} <span class="text-xs font-normal tracking-normal text-emerald-600">尾</span>
              </span>
            </div>
          </div>
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="!rounded-lg">取 消</el-button>
          <el-button type="primary" @click="submitForm" class="!rounded-lg !bg-emerald-600 !border-none hover:!bg-emerald-700" :loading="submitLoading">确 定 投 放</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, RefreshCw, MapPin, Box, Home } from 'lucide-vue-next'
import { getStockingPage, addStocking, updateStocking, delStocking, getPondPage, getPurchasePage } from '@/api/base'



const currentFarmId = ref(sessionStorage.getItem('current_farm_id'))
const currentFarmName = ref(sessionStorage.getItem('current_farm_name') || '未命名场区')

// 表格与查询参数
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({ pageNum: 1, pageSize: 10, farmId: currentFarmId.value, pondId: undefined, batchId: undefined })

// 辅助下拉框数据
const pondOptions = ref([])
const allBatches = ref([])  // 原始全部批次（搜索用）

// 表单中可选的批次：动态隔离 — 只显示与所选池塘同养殖场的批次，且排除待检疫/已结算
const availableBatches = computed(() => {
  if (!form.value.pondId) return allBatches.value
  const selectedPond = pondOptions.value.find(p => p.id === form.value.pondId)
  if (!selectedPond || selectedPond.farmId == null) return allBatches.value
  return allBatches.value.filter(b => {
    // 隔离：批次必须与池塘同养殖场
    if (b.farmId !== selectedPond.farmId) return false
    // 不可投放的状态：0=待检疫  3=已出库结算
    if (b.batchStatus === 0 || b.batchStatus === 3) return false
    return true
  })
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref(null)
const form = ref({ id: undefined, pondId: undefined, batchId: undefined, stockedUnits: undefined, stockingDate: '' })
const rules = { 
  pondId: [{ required: true, message: '请选择投放池塘', trigger: 'change' }],
  batchId: [{ required: true, message: '请选择苗种批次', trigger: 'change' }],
  stockedUnits: [{ required: true, message: '投放件数不能为空', trigger: 'blur' }],
  stockingDate: [{ required: true, message: '请选择下塘日期', trigger: 'change' }]
}

// 计算当前选中的批次对象
const selectedBatch = computed(() => {
  if (!form.value.batchId) return null
  return allBatches.value.find(b => b.id === form.value.batchId) || null
})

// 根据选中的批次密度和输入的件数，弹窗内动态预览总尾数 (只做前端预览，后端会重算)
const calculatedTotal = computed(() => {
  const units = form.value.stockedUnits || 0
  const density = selectedBatch.value?.densityPerUnit || 0
  return units * density
})

// 编辑模式下，若原始关联批次已出库结算，则锁定表单不可更改池塘/批次
const isEditLocked = computed(() => {
  return !!(form.value.id && form.value.batchStatus === 3)
})

// 切换池塘时清空批次选择，防止跨养殖场残留
watch(() => form.value.pondId, () => {
  form.value.batchId = undefined
})

// 初始化
onMounted(() => {
  if (currentFarmId.value) { 
    getList()
    loadAuxiliaryOptions()
  }
})

// 拉取辅助数据
const loadAuxiliaryOptions = async () => {
  try {
    const pondRes = await getPondPage({ pageNum: 1, pageSize: 100, farmId: currentFarmId.value })
    if (pondRes.code === 200) pondOptions.value = pondRes.data.records
    
    const batchRes = await getPurchasePage({ pageNum: 1, pageSize: 200, farmId: currentFarmId.value })
    if (batchRes.code === 200) {
      allBatches.value = batchRes.data.records
    }
  } catch (error) {
    console.error('辅助下拉字典数据加载失败', error)
  }
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getStockingPage(queryParams.value)
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleQuery = () => { queryParams.value.pageNum = 1; getList() }
const resetQuery = () => { 
  queryParams.value.pondId = undefined
  queryParams.value.batchId = undefined
  handleQuery() 
}

const handleAdd = () => {
  form.value = { 
    id: undefined, 
    pondId: undefined, 
    batchId: undefined, 
    stockedUnits: undefined, 
    stockingDate: new Date().toISOString().split('T')[0] 
  }
  dialogTitle.value = '新增投放登记'
  dialogVisible.value = true
}

const handleUpdate = (row) => {
  form.value = { ...row }
  dialogTitle.value = '修改投放信息'
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (form.value.id) {
          await updateStocking(form.value.id, form.value)
          ElMessage.success('修改成功')
        } else {
          await addStocking(form.value)
          ElMessage.success('苗种投放成功')
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
  ElMessageBox.confirm(`确认删除该条投放记录吗？`, '警告', { type: 'warning' }).then(async () => {
    await delStocking(row.id)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}
</script>