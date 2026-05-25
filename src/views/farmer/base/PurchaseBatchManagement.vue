<template>
  <div class="h-full flex flex-col">
    <!-- 防呆提示：未选择农场时拦截 -->
    <div v-if="!currentFarmId" class="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <Home class="w-10 h-10 text-amber-500" />
      </div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">未选择操作场区</h2>
      <p class="text-gray-500 mb-6">采购入库必须挂载到具体的养殖场下，请先选择当前工作的场区。</p>
      <el-button type="primary" size="large" class="!bg-teal-600 !border-none hover:!bg-teal-700 !rounded-xl" @click="$router.push('/farmer/base/farm')">
        去选择养殖场
      </el-button>
    </div>

    <!-- 正常业务页面 -->
    <div v-else class="space-y-4">
      <!-- 搜索区 -->
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <el-form :inline="true" :model="queryParams" class="!-mb-4">
          <el-form-item label="批次号">
            <el-input v-model="queryParams.batchNo" placeholder="扫码或输入批次号" clearable @keyup.enter="handleQuery" class="!w-48" />
          </el-form-item>
          <el-form-item label="入库状态">
            <el-select v-model="queryParams.batchStatus" placeholder="全部状态" clearable class="!w-32">
              <el-option label="待检疫" :value="0" />
              <el-option label="已检疫入库" :value="1" />
              <el-option label="养殖中" :value="2" />
              <el-option label="已出库结算" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery" class="!bg-slate-800 !border-none hover:!bg-slate-700"><Search class="w-4 h-4 mr-1"/> 搜索</el-button>
            <el-button @click="resetQuery"><RefreshCw class="w-4 h-4 mr-1"/> 重置</el-button>
          </el-form-item>
        </el-form>
        
        <el-button type="primary" class="!rounded-xl !bg-teal-600 !border-none hover:!bg-teal-700" @click="handleAdd">
          <span class="flex items-center gap-1.5"><Truck class="w-4 h-4"/> 登记进苗</span>
        </el-button>
      </div>

      <!-- 表格区 -->
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <el-table v-loading="loading" :data="tableData" stripe class="w-full">
          <el-table-column label="入库日期" prop="purchaseDate" width="120" />
          <el-table-column label="溯源批次号" prop="batchNo" min-width="160">
            <template #default="scope">
              <span class="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">{{ scope.row.batchNo }}</span>
            </template>
          </el-table-column>
          <el-table-column label="供应商" prop="supplierName" min-width="150" show-overflow-tooltip >
            <template #default="scope">
                {{scope.row.supplierName}}
            </template>
          </el-table-column>
          <el-table-column label="入库总量(尾)" prop="estimatedTotalQty" align="right" width="130">
            <template #default="scope">
              <span class="font-bold text-teal-600">{{ scope.row.estimatedTotalQty.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column label="包装规格" align="center" width="160">
            <template #default="scope">
              <span class="text-xs text-gray-500">{{ scope.row.unitQty }}{{ scope.row.purchaseUnit }} × {{ scope.row.densityPerUnit }}尾</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="batchStatus" align="center" width="110">
            <template #default="scope">
              <el-tag v-if="scope.row.batchStatus === 0" type="warning" effect="light" round>待检疫</el-tag>
              <el-tag v-else-if="scope.row.batchStatus === 1" type="success" effect="light" round>已检疫入库</el-tag>
              <el-tag v-else-if="scope.row.batchStatus === 2" type="primary" effect="light" round>养殖中</el-tag>
              <el-tag v-else-if="scope.row.batchStatus === 3" type="info" effect="light" round>已出库</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="检疫证号" prop="quarantineCertNo" min-width="120" show-overflow-tooltip>
            <template #default="scope">
              <span v-if="scope.row.quarantineCertNo">{{ scope.row.quarantineCertNo }}</span>
              <span v-else class="text-red-400 text-xs flex items-center gap-1"><AlertCircle class="w-3 h-3"/> 缺失</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160" fixed="right">
            <template #default="scope">
              <el-button link type="primary" @click="handleUpdate(scope.row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(scope.row)" :disabled="scope.row.batchStatus >= 2">
                删除
              </el-button>
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
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" append-to-body class="!rounded-2xl">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="pr-6 mt-4">
        
        <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6 flex gap-4">
          <div class="flex-1">
            <el-form-item label="批次号" prop="batchNo" class="!mb-0">
              <el-input v-model="form.batchNo" placeholder="系统自动生成" disabled class="font-mono" />
            </el-form-item>
          </div>
          <div class="flex-1">
            <el-form-item label="入库日期" prop="purchaseDate" class="!mb-0">
              <el-date-picker v-model="form.purchaseDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" class="!w-full" />
            </el-form-item>
          </div>
        </div>

        <el-form-item label="供应商来源" prop="supplierId">
          <el-select v-model="form.supplierId" placeholder="请选择苗种供应商" filterable class="!w-full">
            <el-option v-for="item in supplierOptions" :key="item.id" :label="item.supplierName" :value="item.id" />
          </el-select>
        </el-form-item>

        <!-- 单位与密度联动计算区域 -->
        <div class="grid grid-cols-2 gap-2">
          <el-form-item label="包装单位" prop="purchaseUnit">
            <el-select v-model="form.purchaseUnit" placeholder="单位" class="!w-full">
              <el-option label="袋 (Bag)" value="袋" />
              <el-option label="箱 (Box)" value="箱" />
              <el-option label="车 (Truck)" value="车" />
            </el-select>
          </el-form-item>
          <el-form-item label="包装数量" prop="unitQty">
            <el-input-number v-model="form.unitQty" :min="1" :step="1" class="!w-full" placeholder="件数" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <el-form-item label="单位密度(尾)" prop="densityPerUnit">
            <el-input-number v-model="form.densityPerUnit" :min="1" :step="100" class="!w-full" placeholder="如: 2000" />
          </el-form-item>
          <el-form-item label="预估总数(尾)" prop="estimatedTotalQty">
            <!-- 只读计算属性，使用 :model-value 避免写入警告 -->
            <el-input :model-value="computedTotal" disabled class="font-bold text-teal-600">
              <template #append>尾</template>
            </el-input>
          </el-form-item>
        </div>

        <el-divider class="dashed-divider" />

        <el-form-item label="检疫状态" prop="batchStatus">
          <el-radio-group v-model="form.batchStatus">
            <el-radio :label="0">待检疫</el-radio>
            <el-radio :label="1">已检疫(合规)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="检疫合格证号" prop="quarantineCertNo" v-if="form.batchStatus === 1">
          <el-input v-model="form.quarantineCertNo" placeholder="请输入产地检疫合格证编号" clearable />
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="!rounded-lg">取 消</el-button>
          <el-button type="primary" @click="submitForm" class="!rounded-lg !bg-teal-600 !border-none hover:!bg-teal-700" :loading="submitLoading">确 定 登 记</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Home, Search, RefreshCw, Truck, AlertCircle } from 'lucide-vue-next'
// TODO: 替换为实际 API 导入路径
import { getPurchasePage, addPurchase, updatePurchase, delPurchase, getSupplierList} from '@/api/base'

const currentFarmId = ref(sessionStorage.getItem('current_farm_id'))

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  farmId: currentFarmId.value,
  batchNo: '',
  batchStatus: ''
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref(null)

const form = ref({
  id: undefined,
  farmId: undefined,
  batchNo: '',
  purchaseDate: '',
  supplierId: null,
  purchaseUnit: '袋',
  unitQty: 1,
  densityPerUnit: 2000,
  estimatedTotalQty: 0,
  batchStatus: 0,
  quarantineCertNo: ''
})

// 供应商下拉选项
const supplierOptions = ref([])

// 计算属性：预估总数 = 包装数量 × 单位密度
const computedTotal = computed(() => {
  const qty = Number(form.value.unitQty) || 0
  const density = Number(form.value.densityPerUnit) || 0
  return (qty * density).toLocaleString()
})

// 表单验证规则
const rules = {
  purchaseDate: [{ required: true, message: '请选择入库日期', trigger: 'change' }],
  supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  purchaseUnit: [{ required: true, message: '请选择包装单位', trigger: 'change' }],
  unitQty: [{ required: true, message: '请输入包装数量', trigger: 'blur' }],
  densityPerUnit: [{ required: true, message: '请输入单位密度', trigger: 'blur' }],
  quarantineCertNo: [
    { required: true, message: '请输入检疫合格证号', trigger: 'blur' }
  ]
}

// 初始化
onMounted(() => {
  if (currentFarmId.value) {
    getList()
    loadSuppliers()
  }
})

// 加载供应商列表
const loadSuppliers = async () => {
  try {
    const res = await getSupplierList()
    if (res.code === 200) supplierOptions.value = res.data
  } catch {
    // ignore
  }
}

// 获取分页列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getPurchasePage(queryParams.value)
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.value.batchNo = ''
  queryParams.value.batchStatus = ''
  handleQuery()
}

// 新增
const handleAdd = () => {
  form.value = {
    id: undefined,
    farmId: currentFarmId.value,
    purchaseDate: '',
    supplierId: null,
    purchaseUnit: '袋',
    unitQty: 1,
    densityPerUnit: 2000,
    estimatedTotalQty: 0,
    batchStatus: 0,
    quarantineCertNo: ''
  }
  dialogTitle.value = '登记进苗'
  dialogVisible.value = true
}

// 编辑
const handleUpdate = (row) => {
  form.value = { ...row }
  dialogTitle.value = '修改采购记录'
  dialogVisible.value = true
}

// 提交
const submitForm = async () => {
  if (!formRef.value) return

  // 使用 Promise 风格的校验，确保校验完成后再执行提交逻辑
  try {
    await formRef.value.validate()
  } catch (err) {
    return
  }

  submitLoading.value = true
  try {
    // 准备提交数据（不再强制附加 farmId）
    const submitData = { ...form.value }

    // 新增时：如果 batchNo 为 '' / null / undefined，则删除该字段，避免触发后端 @NotBlank 校验
    if (!submitData.id && (submitData.batchNo === '' || submitData.batchNo == null)) {
      delete submitData.batchNo
    }

    if (submitData.id) {
      await updatePurchase(submitData.id, submitData)
      ElMessage.success('修改成功')
    } else {
      await addPurchase(submitData)
      ElMessage.success('登记成功')
    }
    dialogVisible.value = false
    getList()
  } catch (e) {
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除该批次记录吗？`, '警告', { type: 'warning' })
    .then(async () => {
      await delPurchase(row.id)
      ElMessage.success('删除成功')
      getList()
    })
    .catch(() => {})
}
</script>

<style scoped>
/* 虚线分割线样式 */
.dashed-divider :deep(.el-divider--horizontal) {
  border-top-style: dashed;
}
</style>