<template>
  <div class="min-h-screen bg-slate-100 p-4 md:p-6">
    <div class="mx-auto max-w-[1500px] space-y-5">
      <header class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">供应商资质审查</h1>
          <p class="mt-1 text-sm text-slate-500">统一维护水产苗种供应商名录，农户将从本名录中选择供应商进货。</p>
        </div>
        <button
          class="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-800 px-4 text-sm font-medium text-white hover:bg-slate-700"
          @click="handleAdd"
        >
          <Plus class="h-4 w-4" />
          新增供应商
        </button>
      </header>

      <!-- 搜索区 -->
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="flex flex-1 items-center gap-3">
            <input
              v-model="queryParams.supplierName"
              class="w-full max-w-xs rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              placeholder="供应商名称 / 许可证号"
              @keyup.enter="handleQuery"
            />
            <button
              class="inline-flex h-9 items-center gap-1.5 rounded-md bg-slate-800 px-4 text-sm font-medium text-white hover:bg-slate-700"
              @click="handleQuery"
            >
              <Search class="h-4 w-4" /> 搜索
            </button>
            <button
              class="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              @click="resetQuery"
            >
              <RefreshCw class="h-4 w-4" /> 重置
            </button>
          </div>
        </div>
      </div>

      <!-- 表格区 -->
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
          <el-table-column label="操作" align="center" width="150" fixed="right">
            <template #default="scope">
              <el-button link type="primary" @click="handleUpdate(scope.row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

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
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" append-to-body class="!rounded-2xl">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="pr-6 mt-4">
        <el-form-item label="供应商名称" prop="supplierName">
          <el-input v-model="form.supplierName" placeholder="如: 湛江海联水产种苗公司" clearable />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人姓名" clearable />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入手机或固话" clearable />
        </el-form-item>
        <el-form-item label="资质/执照号" prop="qualificationCode">
          <el-input v-model="form.qualificationCode" placeholder="水产苗种生产许可证号等" clearable />
          <div class="text-xs text-gray-400 mt-1">录入资质编号有助于后续产地追溯审计</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="!rounded-lg">取 消</el-button>
          <el-button type="primary" @click="submitForm" class="!rounded-lg !bg-teal-600 !border-none hover:!bg-teal-700" :loading="submitLoading">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, RefreshCw } from 'lucide-vue-next'
import { getSupplierPage, addSupplier, updateSupplier, delSupplier } from '@/api/base'

// 表格与查询参数
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({ pageNum: 1, pageSize: 10, supplierName: '' })

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref(null)
const form = ref({ id: undefined, supplierName: '', contactPerson: '', contactPhone: '', qualificationCode: '' })

const validatePhone = (_rule: any, value: string) => {
  if (!value) return Promise.resolve()
  const mobilePattern = /^1[3-9]\d{9}$/
  const landlinePattern = /^0\d{2,3}-?\d{7,8}$/
  return mobilePattern.test(value) || landlinePattern.test(value)
    ? Promise.resolve()
    : Promise.reject(new Error('联系电话格式不正确，支持手机或固话'))
}

const rules = {
  supplierName: [
    { required: true, message: '供应商名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '供应商名称需 2-50 个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { validator: validatePhone, trigger: 'blur' }
  ]
}

onMounted(() => { getList() })

const getList = async () => {
  loading.value = true
  try {
    const res = await getSupplierPage(queryParams.value)
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => { queryParams.value.pageNum = 1; getList() }
const resetQuery = () => { queryParams.value.supplierName = ''; handleQuery() }

const handleAdd = () => {
  form.value = { id: undefined, supplierName: '', contactPerson: '', contactPhone: '', qualificationCode: '' }
  dialogTitle.value = '新增供应商'
  dialogVisible.value = true
}

const handleUpdate = (row: any) => {
  form.value = { ...row }
  dialogTitle.value = '修改供应商信息'
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await (formRef.value as any).validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (form.value.id) {
          await updateSupplier(form.value.id, form.value)
          ElMessage.success('修改成功')
        } else {
          await addSupplier(form.value)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        getList()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除供应商 "${row.supplierName}" 吗？`, '警告', { type: 'warning' }).then(async () => {
    await delSupplier(row.id)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}
</script>
