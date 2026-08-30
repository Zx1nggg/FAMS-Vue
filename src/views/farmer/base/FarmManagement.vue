<template>
  <div class="space-y-6">
    <!-- 头部操作区 -->
    <div class="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h2 class="text-lg font-bold text-gray-800">我的养殖场区</h2>
        <p class="text-sm text-gray-500 mt-1">管理您的物理养殖基地，点击“进入该场”即可切换当前工作空间。</p>
      </div>
      <el-button type="primary" class="!rounded-xl !bg-teal-600 !border-none hover:!bg-teal-700" @click="handleAdd">
        <span class="flex items-center gap-1.5"><Plus class="w-4 h-4"/> 新增场区</span>
      </el-button>
    </div>

    <!-- 卡片展示区 -->
    <div v-loading="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      
      <!-- 动态渲染养殖场卡片 -->
      <div v-for="farm in farmList" :key="farm.id" 
           class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 overflow-hidden flex flex-col relative group">
        
        <!-- 当前选中标识 -->
        <div v-if="currentFarmId == farm.id" class="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm">
          当前所在场区
        </div>

        <div class="p-6 flex-1 relative">
          <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform">
            <Home class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2 truncate" :title="farm.farmName">{{ farm.farmName }}</h3>
          <p class="text-xs text-gray-400">场区编号: F-{{ farm.id.toString().padStart(6, '0') }}</p>
          <p class="mt-3 text-xs text-gray-500 line-clamp-1" :title="farm.address">
            {{ farm.address || '未填写详细地址' }}
          </p>
          <div class="mt-3 flex items-center gap-2 text-xs">
            <span
              class="rounded-full px-2 py-0.5 font-medium"
              :class="hasGeo(farm) ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
            >
              {{ hasGeo(farm) ? '已配置地图坐标' : '缺少地图坐标' }}
            </span>
          </div>
        </div>
        
        <div class="border-t border-gray-50 bg-gray-50/50 p-4 flex gap-2 justify-between items-center">
          <div class="flex gap-2">
            <el-button link type="primary" class="!text-gray-500 hover:!text-blue-600" @click="handleUpdate(farm)">编辑</el-button>
            <el-button link type="danger" class="!text-gray-500 hover:!text-red-500" @click="handleDelete(farm)">删除</el-button>
          </div>
          <el-button 
            type="primary" 
            size="small" 
            class="!rounded-lg !px-4"
            :class="currentFarmId == farm.id ? '!bg-gray-300 !border-none !text-white' : '!bg-teal-50 !text-teal-700 !border-teal-100 hover:!bg-teal-600 hover:!text-white'"
            :disabled="currentFarmId == farm.id"
            @click="enterFarm(farm)" 
          >
            <!-- 🌟 注意上面这行：@click="enterFarm(farm)" 传了整个 farm 对象 -->
            {{ currentFarmId == farm.id ? '已在场内' : '进入该场' }} <ArrowRight v-if="currentFarmId != farm.id" class="w-3 h-3 ml-1" />
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && farmList.length === 0" class="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
        <Building2 class="w-16 h-16 mb-4 text-gray-300" />
        <p class="text-lg font-medium text-gray-600 mb-1">暂无养殖场区</p>
        <p class="text-sm">您还没有创建任何养殖场，请先点击右上角新增</p>
      </div>
    </div>

    <!-- 弹窗表单 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="560px" append-to-body class="!rounded-2xl">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="pr-6 mt-4">
        <el-form-item label="场区名称" prop="farmName">
          <el-input v-model="form.farmName" placeholder="请输入养殖场名称 (如: 高明一区基地)" clearable />
        </el-form-item>
        <el-form-item label="所在地区" required>
          <div class="grid w-full grid-cols-2 gap-2">
            <el-select v-model="form.province" placeholder="选择省份" filterable @change="handleProvinceChange">
              <el-option
                v-for="province in provinceOptions"
                :key="province.name"
                :label="province.name"
                :value="province.name"
              />
            </el-select>
            <el-select v-model="form.city" placeholder="选择城市" filterable>
              <el-option v-for="city in cityOptions" :key="city.name" :label="city.name" :value="city.name" />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="form.detailAddress" placeholder="填写镇街、村、基地位置等补充信息" clearable />
        </el-form-item>
        <div class="ml-[100px] -mt-2 mb-2 text-xs text-slate-400">
          系统会根据所选城市自动生成监管地图点位，无需手动填写经纬度。
        </div>
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
import { computed, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Home, Building2, ArrowRight } from 'lucide-vue-next'
import { getFarmPage, addFarm, updateFarm, delFarm } from '@/api/base'
import { CHINA_LOCATION_TREE, resolveApproxFarmCoordinate } from '@/data/chinaLocations'

const farmList = ref([])
const loading = ref(false)
const currentFarmId = ref(sessionStorage.getItem('current_farm_id') ? Number(sessionStorage.getItem('current_farm_id')) : null)

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref(null)
const form = ref({
  id: undefined,
  farmName: '',
  province: '广东省',
  city: '',
  detailAddress: ''
})
const rules = {
  farmName: [
    { required: true, message: '场区名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '场区名称需 2-50 个字符', trigger: 'blur' }
  ]
}

const provinceOptions = CHINA_LOCATION_TREE
const cityOptions = computed(() => {
  return provinceOptions.find(item => item.name === form.value.province)?.cities ?? []
})

const handleProvinceChange = () => {
  form.value.city = ''
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getFarmPage({ pageNum: 1, pageSize: 100 }) 
    farmList.value = res?.data?.records ?? []
  } finally {
    loading.value = false
  }
}

onMounted(() => { loadData() })

const hasGeo = (farm) => farm.longitude !== null && farm.longitude !== undefined && farm.latitude !== null && farm.latitude !== undefined

// 🌟 核心修改点：接收整个 farm 对象，把名字也存起来
const enterFarm = (farm) => {
  // 1. 存 ID (给后端接口查数据用)
  sessionStorage.setItem('current_farm_id', String(farm.id))
  currentFarmId.value = Number(farm.id)
  
  // 2. 存 Name (给前端其它页面显示提示牌用)
  sessionStorage.setItem('current_farm_name', farm.farmName)
  
  ElMessage.success(`已切换至：${farm.farmName}`)
  
  // 3. 这里你用了 window.location.href，这是一个很棒的技巧！
  // 它可以强制刷新页面，确保全局 Header 和新页面都能立刻读到最新的 sessionStorage
  setTimeout(() => {
    window.location.href = '/farmer/base/pond'
  }, 500)
}

const handleAdd = () => {
  form.value = { id: undefined, farmName: '', province: '广东省', city: '', detailAddress: '' }
  dialogTitle.value = '新增养殖场区'
  dialogVisible.value = true
}

const handleUpdate = (row) => {
  const parsed = parseAddress(row.address)
  form.value = {
    id: row.id,
    farmName: row.farmName,
    province: parsed.province,
    city: parsed.city,
    detailAddress: parsed.detailAddress
  }
  dialogTitle.value = '修改养殖场区'
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (!form.value.city) {
        ElMessage.warning('请选择场区所在城市')
        return
      }
      submitLoading.value = true
      try {
        const address = buildAddress()
        const coordinate = resolveApproxFarmCoordinate(form.value.province, form.value.city, `${form.value.farmName}${address}`)
        const submitData = {
          ...form.value,
          address,
          longitude: coordinate.longitude,
          latitude: coordinate.latitude
        }
        delete submitData.province
        delete submitData.city
        delete submitData.detailAddress
        if (form.value.id) {
          await updateFarm(form.value.id, submitData)
          ElMessage.success('修改成功')
        } else {
          await addFarm(submitData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        loadData()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const buildAddress = () => {
  return [form.value.province, form.value.city, form.value.detailAddress]
    .filter(Boolean)
    .join(' ')
}

const parseAddress = (address = '') => {
  const parts = String(address || '').split(/\s+/).filter(Boolean)
  const province = provinceOptions.some(item => item.name === parts[0]) ? parts[0] : '广东省'
  const provinceCityOptions = provinceOptions.find(item => item.name === province)?.cities ?? []
  const city = provinceCityOptions.some(item => item.name === parts[1]) ? parts[1] : ''
  return {
    province,
    city,
    detailAddress: city ? parts.slice(2).join(' ') : address
  }
}

const handleDelete = (row) => {
  if (currentFarmId.value === row.id) {
    return ElMessage.warning('无法删除当前正在使用的场区，请先切换至其他场区！')
  }
  ElMessageBox.confirm(`确认删除养殖场 "${row.farmName}" 吗？删除后池塘数据可能受影响。`, '警告', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    await delFarm(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}
</script>
