<template>
  <div class="space-y-4">
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
      
      <el-button type="primary" class="!rounded-xl !bg-teal-600 !border-none hover:!bg-teal-700" @click="handleAdd">
        <span class="flex items-center gap-1.5"><Plus class="w-4 h-4"/> 新增供应商</span>
      </el-button>
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
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleUpdate(scope.row)">编辑</el-button>
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

<script setup>
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

const validatePhone = (rule, value) => {
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

const handleAdd = () => {
  form.value = { id: undefined, supplierName: '', contactPerson: '', contactPhone: '', qualificationCode: '' }
  dialogTitle.value = '新增供应商'
  dialogVisible.value = true
}

const handleUpdate = (row) => {
  form.value = { ...row }
  dialogTitle.value = '修改供应商信息'
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
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

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除供应商 "${row.supplierName}" 吗？`, '警告', { type: 'warning' }).then(async () => {
    await delSupplier(row.id)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}
</script>