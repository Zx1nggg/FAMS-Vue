<template>
  <div class="h-full flex flex-col">
    
    <!-- 防呆提示：未选择农场时拦截 -->
    <div v-if="!currentFarmId" class="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <Home class="w-10 h-10 text-amber-500" />
      </div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">未选择操作场区</h2>
      <p class="text-gray-500 mb-6">您需要先指定一个具体的养殖场，才能管理其内部的池塘。</p>
      <el-button type="primary" size="large" class="!bg-teal-600 !border-none hover:!bg-teal-700 !rounded-xl" @click="$router.push('/farmer/base/farm')">
        去选择养殖场
      </el-button>
    </div>

    <!-- 正常的池塘业务页面 -->
    <div v-else class="space-y-4">

      <!-- 当前操作场区高亮提示牌 -->
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
        <el-button link type="primary" class="!text-emerald-600 hover:!text-emerald-800 text-xs font-bold" @click="$router.push('/farmer/base/farm')">
          <RefreshCw class="w-3 h-3 mr-1" /> 切换场区
        </el-button>
      </div>

      <!-- 搜索区 -->
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <el-form :inline="true" :model="queryParams" class="!-mb-4">
          <el-form-item label="池塘名称">
            <el-input v-model="queryParams.pondName" placeholder="请输入名称搜索" clearable @keyup.enter="handleQuery" class="!w-64" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery" class="!bg-slate-800 !border-none hover:!bg-slate-700"><Search class="w-4 h-4 mr-1"/> 搜索</el-button>
            <el-button @click="resetQuery"><RefreshCw class="w-4 h-4 mr-1"/> 重置</el-button>
          </el-form-item>
        </el-form>
        
        <el-button type="primary" class="!rounded-xl !bg-teal-600 !border-none hover:!bg-teal-700" @click="handleAdd">
          <span class="flex items-center gap-1.5"><Plus class="w-4 h-4"/> 新增池塘</span>
        </el-button>
      </div>

      <!-- 表格区 -->
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <el-table v-loading="loading" :data="tableData" stripe class="w-full">
          <el-table-column label="池塘编号" prop="id" align="center" width="100" />
          <el-table-column label="池塘名称" prop="pondName" min-width="150" />
          <el-table-column label="面积 (亩)" prop="areaMu" align="center" width="120">
            <template #default="scope">
              <span class="font-bold text-teal-600">{{ scope.row.areaMu }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="200" fixed="right">
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
    </div>

    <!-- 弹窗表单 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="450px" append-to-body class="!rounded-2xl">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="pr-6 mt-4">
        <el-form-item label="池塘名称" prop="pondName">
          <el-input v-model="form.pondName" placeholder="例如: 1号高位池" clearable />
        </el-form-item>
        <el-form-item label="面积 (亩)" prop="areaMu">
          <el-input-number v-model="form.areaMu" :min="0.1" :precision="2" :step="1" class="!w-full" placeholder="请输入面积" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="!rounded-lg">取 消</el-button>
          <el-button type="primary" @click="submitForm" class="!rounded-lg !bg-teal-600 !border-none" :loading="submitLoading">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, RefreshCw, Home } from 'lucide-vue-next'
import { getPondPage, addPond, updatePond, delPond } from '@/api/base'

const currentFarmId = ref(sessionStorage.getItem('current_farm_id'))
const currentFarmName = ref(sessionStorage.getItem('current_farm_name') || '未命名场区')

// 表格与查询参数
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({ pageNum: 1, pageSize: 10, farmId: currentFarmId.value, pondName: '' })

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref(null)
const form = ref({ id: undefined, farmId: undefined, pondName: '', areaMu: undefined })
const rules = {
  pondName: [
    { required: true, message: '池塘名称不能为空', trigger: 'blur' },
    { min: 2, max: 40, message: '池塘名称需 2-40 个字符', trigger: 'blur' }
  ],
  areaMu: [
    { required: true, message: '面积不能为空', trigger: 'blur' },
    { validator: (rule, value) => {
        if (value === undefined || value === null || value === '') {
          return Promise.reject(new Error('面积不能为空'))
        }
        if (Number.isNaN(Number(value)) || Number(value) <= 0) {
          return Promise.reject(new Error('面积必须大于0'))
        }
        return Promise.resolve()
      }, trigger: 'blur' }
  ]
}

// 初始化
onMounted(() => {
  if (currentFarmId.value) getList()
})

const getList = async () => {
  loading.value = true
  try {
    const res = await getPondPage(queryParams.value)
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleQuery = () => { queryParams.value.pageNum = 1; getList() }
const resetQuery = () => { queryParams.value.pondName = ''; handleQuery() }

const handleAdd = () => {
  form.value = { id: undefined, farmId: currentFarmId.value, pondName: '', areaMu: undefined }
  dialogTitle.value = '新增池塘'
  dialogVisible.value = true
}

const handleUpdate = (row) => {
  form.value = { ...row } // 将行数据复制到表单
  dialogTitle.value = '修改池塘信息' // 设置对话框标题
  dialogVisible.value = true // 显示对话框
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (form.value.id) {
          await updatePond(form.value.id, form.value)
          ElMessage.success('修改成功')
        } else {
          // 强制带上当前场区ID
          form.value.farmId = currentFarmId.value
          await addPond(form.value)
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
  ElMessageBox.confirm(`确认删除池塘 "${row.pondName}" 吗？`, '警告', { type: 'warning' }).then(async () => {
    await delPond(row.id)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}
</script>