<template>
  <div class="h-full flex flex-col">

    <!-- 防呆提示：未选择农场时拦截 -->
    <div v-if="!currentFarmId" class="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <Home class="w-10 h-10 text-amber-500" />
      </div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">未选择操作场区</h2>
      <p class="text-gray-500 mb-6">在进行出塘结算前，请先指定一个具体的养殖场区。</p>
      <el-button type="primary" size="large" class="!bg-teal-600 !border-none hover:!bg-teal-700 !rounded-xl" @click="$router.push('/farmer/base/farm')">
        去选择养殖场
      </el-button>
    </div>

    <!-- 出塘结算业务页面 -->
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
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center flex-wrap gap-4">
        <el-form :inline="true" :model="queryParams" class="!-mb-4">
          <el-form-item label="批次号">
            <el-input v-model="queryParams.batchNo" placeholder="输入批次号" clearable class="!w-48" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="出塘池塘">
            <el-select v-model="queryParams.pondId" placeholder="选择池塘" clearable class="!w-40" @change="handleQuery">
              <el-option v-for="pond in pondOptions" :key="pond.id" :label="pond.pondName" :value="pond.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery" class="!bg-slate-800 !border-none hover:!bg-slate-700"><Search class="w-4 h-4 mr-1"/> 搜索</el-button>
            <el-button @click="resetQuery"><RefreshCw class="w-4 h-4 mr-1"/> 重置</el-button>
          </el-form-item>
        </el-form>

        <el-button type="primary" class="!rounded-xl !bg-emerald-600 !border-none hover:!bg-emerald-700" @click="handleAdd">
          <span class="flex items-center gap-1.5"><DollarSign class="w-4 h-4"/> 出塘结算</span>
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

          <el-table-column label="苗种品种" prop="seedlingName" align="center" min-width="110">
            <template #default="scope">
              <span class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                {{ scope.row.seedlingName || '-' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="出塘池塘" prop="pondName" min-width="120">
            <template #default="scope">
              <span class="flex items-center gap-1.5 text-teal-700 font-bold">
                <Box class="w-4 h-4" /> {{ scope.row.pondName || '未知池塘' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="出塘日期" prop="harvestDate" align="center" width="110" />

          <el-table-column label="实际总重(kg)" prop="actualTotalWeightKg" align="center" width="140">
            <template #default="scope">
              <span class="text-gray-800 font-bold">{{ scope.row.actualTotalWeightKg }}</span>
            </template>
          </el-table-column>

          <el-table-column label="均重(g)" prop="actualAvgWeightG" align="center" width="100">
            <template #default="scope">
              <span class="text-gray-600">{{ scope.row.actualAvgWeightG || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="总收入(元)" prop="totalRevenue" align="center" width="130">
            <template #default="scope">
              <span class="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                {{ scope.row.totalRevenue ? scope.row.totalRevenue.toLocaleString() : '-' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="总成本(元)" prop="totalCost" align="center" width="130">
            <template #default="scope">
              <span class="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                {{ scope.row.totalCost ? scope.row.totalCost.toLocaleString() : '-' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="净利润(元)" prop="netProfit" align="center" width="140">
            <template #default="scope">
              <span v-if="scope.row.netProfit != null"
                :class="scope.row.netProfit >= 0
                  ? 'text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100'
                  : 'text-red-600 font-bold bg-red-50 px-2 py-1 rounded-md border border-red-100'">
                {{ scope.row.netProfit.toLocaleString() }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </el-table-column>

          <el-table-column label="收购方" prop="buyerName" align="center" width="110">
            <template #default="scope">
              <span class="text-gray-600">{{ scope.row.buyerName || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="结算状态" align="center" width="100">
            <template #default="scope">
              <span v-if="scope.row.settlementStatus === 1" class="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-medium border border-emerald-100">已结算</span>
              <span v-else class="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-medium border border-gray-200">未结算</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="140" fixed="right">
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
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="680px" append-to-body class="!rounded-2xl">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="pr-6 mt-4">

        <div class="mb-4 pb-2 border-b border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-700">
          <DollarSign class="w-4 h-4 text-emerald-500"/> 出塘结算信息
        </div>

        <div class="mb-4 pb-2 border-b border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-700">
          <Box class="w-4 h-4 text-teal-500"/> 出塘信息
        </div>

        <!-- 先选池塘（新增时可改，编辑时锁定） -->
        <el-form-item label="出塘池塘" prop="pondId">
          <el-select v-model="form.pondId" placeholder="请先选择出塘池塘" class="!w-full" filterable
            :disabled="!!form.id"
            @change="onPondChange">
            <el-option v-for="pond in availablePonds" :key="pond.id" :label="pond.pondName" :value="pond.id">
              <span style="float: left">{{ pond.pondName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ pond.areaMu }} 亩 · {{ pondStockBatchCount(pond.id) }} 批可出</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 再选批次，只显示该塘投放过的养殖中批次（新增时可改，编辑时锁定） -->
        <el-form-item label="苗种批次" prop="batchNo">
          <el-select v-model="form.batchNo" placeholder="请选择要出塘的批次" class="!w-full" filterable
            :disabled="!form.pondId || !!form.id"
            @change="onBatchChange">
            <el-option v-for="batch in availableBatches" :key="batch.id" :label="batch.batchNo" :value="batch.batchNo">
              <span style="float: left">
                {{ batch.batchNo }}
                <span class="text-xs text-gray-400 ml-2">({{ batch.seedlingName || '未知品种' }})</span>
              </span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ batch.purchaseDate }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出塘日期" prop="harvestDate">
              <el-date-picker v-model="form.harvestDate" type="date" placeholder="选择出塘日期" value-format="YYYY-MM-DD" class="!w-full" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 结算预览卡片（选批次后显示，编辑时不显示） -->
        <el-form-item v-if="form.batchNo && !form.id && previewData" label=" ">
          <div class="w-full bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100 shadow-inner space-y-2">
            <div class="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
              <Fish class="w-4 h-4" /> 养殖数据预览
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="flex justify-between bg-white/70 px-2 py-1 rounded">
                <span class="text-gray-500">苗种品种</span>
                <span class="font-bold text-blue-700">{{ previewData.seedlingName || '-' }}</span>
              </div>
              <div class="flex justify-between bg-white/70 px-2 py-1 rounded">
                <span class="text-gray-500">投放日期</span>
                <span class="font-bold text-blue-700">{{ previewData.stockingDate || '-' }}</span>
              </div>
              <div class="flex justify-between bg-white/70 px-2 py-1 rounded">
                <span class="text-gray-500">投放尾数</span>
                <span class="font-bold text-blue-700">{{ (previewData.totalStockedQty || 0).toLocaleString() }} 尾</span>
              </div>
              <div class="flex justify-between bg-white/70 px-2 py-1 rounded">
                <span class="text-gray-500">养殖天数</span>
                <span class="font-bold text-blue-700">{{ previewData.cultureDays || '-' }} 天</span>
              </div>
              <div class="flex justify-between bg-white/70 px-2 py-1 rounded">
                <span class="text-gray-500">最新均重</span>
                <span class="font-bold text-blue-700">{{ previewData.latestAvgWeightG || '-' }} g</span>
              </div>
              <div class="flex justify-between bg-white/70 px-2 py-1 rounded">
                <span class="text-gray-500">累计死亡</span>
                <span class="font-bold text-red-500">{{ previewData.totalDeath || 0 }} 尾</span>
              </div>
              <div class="flex justify-between bg-white/70 px-2 py-1 rounded">
                <span class="text-gray-500">存活率</span>
                <span class="font-bold text-emerald-600">{{ previewData.survivalRate || '-' }}%</span>
              </div>
              <div class="flex justify-between bg-white/70 px-2 py-1 rounded">
                <span class="text-gray-500">总投喂量</span>
                <span class="font-bold text-amber-600">{{ previewData.totalFeedKg || 0 }} kg</span>
              </div>
              <div class="col-span-2 flex justify-between bg-blue-100/70 px-2 py-1.5 rounded mt-1">
                <span class="text-gray-600 font-medium">预估产量</span>
                <span class="font-bold text-lg text-blue-700 leading-none">{{ previewData.predictedYieldKg || '-' }} kg</span>
              </div>
              <!-- 成本参考值 -->
              <div v-if="previewData.seedlingCost" class="col-span-2 flex justify-between bg-amber-50/70 px-2 py-1 rounded">
                <span class="text-gray-600 font-medium">参考苗种成本</span>
                <span class="font-bold text-amber-700">¥{{ Number(previewData.seedlingCost).toLocaleString() }}</span>
              </div>
              <div v-if="previewData.totalFeedCost" class="col-span-2 flex justify-between bg-amber-50/70 px-2 py-1 rounded">
                <span class="text-gray-600 font-medium">参考饲料成本</span>
                <span class="font-bold text-amber-700">¥{{ Number(previewData.totalFeedCost).toLocaleString() }}</span>
              </div>
              <div v-if="previewData.totalMedicineCost" class="col-span-2 flex justify-between bg-amber-50/70 px-2 py-1 rounded">
                <span class="text-gray-600 font-medium">参考药品成本</span>
                <span class="font-bold text-amber-700">¥{{ Number(previewData.totalMedicineCost).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实际总重(kg)" prop="actualTotalWeightKg">
              <el-input-number v-model="form.actualTotalWeightKg" :min="0" :precision="2" controls-position="right" class="!w-full" placeholder="过磅总重" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="均重(g/尾)" prop="actualAvgWeightG">
              <el-input-number v-model="form.actualAvgWeightG" :min="0" :precision="1" controls-position="right" class="!w-full" placeholder="出池抽测均重" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="mb-4 pb-2 border-b border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-700">
          <DollarSign class="w-4 h-4 text-amber-500"/> 销售与成本
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出塘单价" prop="unitPrice">
              <el-input-number v-model="form.unitPrice" :min="0" :precision="2" controls-position="right" class="!w-full" placeholder="元/kg" />
              <span class="text-xs text-gray-400 ml-2">元/kg</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总收入" prop="totalRevenue">
              <span class="text-lg font-bold text-emerald-600">{{ computedRevenue.toLocaleString() }} 元</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="苗种成本">
              <el-input-number v-model="form.seedlingCost" :min="0" :precision="2" controls-position="right" class="!w-full" placeholder="元" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="饲料成本">
              <el-input-number v-model="form.feedCost" :min="0" :precision="2" controls-position="right" class="!w-full" placeholder="元" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="药品成本">
              <el-input-number v-model="form.medicineCost" :min="0" :precision="2" controls-position="right" class="!w-full" placeholder="元" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="其他成本">
              <el-input-number v-model="form.otherCost" :min="0" :precision="2" controls-position="right" class="!w-full" placeholder="元" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 结算汇总实时预览 -->
        <el-form-item label="结算汇总" v-if="computedRevenue > 0 || computedTotalCost > 0">
          <div class="w-full bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
            <div class="flex justify-between items-center text-sm mb-1">
              <span class="text-gray-500">总收入</span>
              <span class="font-bold text-emerald-600 text-lg">¥{{ computedRevenue.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center text-sm mb-1">
              <span class="text-gray-500">总成本</span>
              <span class="font-bold text-amber-600 text-lg">¥{{ computedTotalCost.toLocaleString() }}</span>
            </div>
            <div class="border-t border-gray-200 my-1.5"></div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-gray-700">净利润</span>
              <span :class="computedProfit >= 0 ? 'text-emerald-600' : 'text-red-600'" class="font-bold text-xl">
                ¥{{ computedProfit.toLocaleString() }}
              </span>
            </div>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收购方">
              <el-input v-model="form.buyerName" placeholder="收购方/去向" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="form.remark" placeholder="备注信息" maxlength="500" />
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="!rounded-lg">取 消</el-button>
          <el-button type="primary" @click="submitForm" class="!rounded-lg !bg-emerald-600 !border-none hover:!bg-emerald-700" :loading="submitLoading">
            {{ form.id ? '保 存 修 改' : '确 认 结 算' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshCw, DollarSign, Box, Home, Fish } from 'lucide-vue-next'
import { getHarvestPage, addHarvest, updateHarvest, delHarvest, getHarvestPreview, getPondPage, getPurchasePage, getStockingPage } from '@/api/base'

const currentFarmId = ref(sessionStorage.getItem('current_farm_id'))
const currentFarmName = ref(sessionStorage.getItem('current_farm_name') || '未命名场区')

// 表格与查询参数
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({ pageNum: 1, pageSize: 10, farmId: currentFarmId.value, batchNo: undefined, pondId: undefined })

// 辅助下拉数据
const pondOptions = ref([])       // 全部池塘
const allBatches = ref([])        // 全部批次
const stockingRecords = ref([])   // 全部投放记录（用于 pond↔batch 联动）

/**
 * pondId → Set<batchId>  哪些批次投放在该池塘
 */
const pondBatchMap = computed(() => {
  const map = new Map()
  for (const s of stockingRecords.value) {
    if (!map.has(s.pondId)) map.set(s.pondId, new Set())
    map.get(s.pondId).add(s.batchId)
  }
  return map
})

/**
 * 新增表单中可选池塘：有养殖中批次投放的池塘（或编辑时全部可选）
 */
const availablePonds = computed(() => {
  if (form.value.id) {
    // 编辑模式：只显示已选池塘（锁定不可切换，但保留在列表中）
    return pondOptions.value.filter(p => p.id === form.value.pondId)
  }
  // 新增模式：只显示有可出塘批次的池塘
  return pondOptions.value.filter(p => {
    const batchIds = pondBatchMap.value.get(p.id)
    if (!batchIds || batchIds.size === 0) return false
    // 该池塘至少有一个 status=2 的批次
    return allBatches.value.some(b => batchIds.has(b.id) && b.batchStatus === 2)
  })
})

/**
 * 某池塘中可出塘的批次数（用于下拉提示）
 */
function pondStockBatchCount(pondId) {
  const batchIds = pondBatchMap.value.get(pondId)
  if (!batchIds) return 0
  return allBatches.value.filter(b => batchIds.has(b.id) && b.batchStatus === 2).length
}

/**
 * 新增表单中可选批次：选中池塘后，仅显示投放在该塘且养殖中的批次
 */
const availableBatches = computed(() => {
  if (!form.value.pondId) return []
  const batchIds = pondBatchMap.value.get(form.value.pondId)
  if (!batchIds) return []
  return allBatches.value.filter(b => batchIds.has(b.id) && b.batchStatus === 2)
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref(null)
const previewData = ref(null)

const form = ref({
  id: undefined,
  batchNo: undefined,
  pondId: undefined,
  harvestDate: '',
  actualTotalWeightKg: undefined,
  actualAvgWeightG: undefined,
  unitPrice: undefined,
  seedlingCost: undefined,
  feedCost: undefined,
  medicineCost: undefined,
  otherCost: undefined,
  buyerName: '',
  remark: ''
})

const rules = {
  batchNo: [{ required: true, message: '请选择出塘批次', trigger: 'change' }],
  pondId: [{ required: true, message: '请选择出塘池塘', trigger: 'change' }],
  harvestDate: [{ required: true, message: '请选择出塘日期', trigger: 'change' }],
  actualTotalWeightKg: [{ required: true, message: '实际总重不能为空', trigger: 'blur' }]
}

// ==================== 前端实时计算 ====================

const computedRevenue = computed(() => {
  const weight = form.value.actualTotalWeightKg || 0
  const price = form.value.unitPrice || 0
  return parseFloat((weight * price).toFixed(2))
})

const computedTotalCost = computed(() => {
  const s = form.value.seedlingCost || 0
  const f = form.value.feedCost || 0
  const m = form.value.medicineCost || 0
  const o = form.value.otherCost || 0
  return parseFloat((s + f + m + o).toFixed(2))
})

const computedProfit = computed(() => {
  return parseFloat((computedRevenue.value - computedTotalCost.value).toFixed(2))
})

// ==================== 表单联动 ====================

/** 切换池塘 → 清空批次、清空预览 */
function onPondChange() {
  form.value.batchNo = undefined
  previewData.value = null
}

/** 切换批次 → 加载预览，自动回填成本参考值 */
async function onBatchChange(batchNo) {
  if (!batchNo) {
    previewData.value = null
    return
  }
  const selectedBatch = allBatches.value.find(b => b.batchNo === batchNo)
  if (!selectedBatch) return

  try {
    const res = await getHarvestPreview(selectedBatch.id)
    if (res.code === 200) {
      previewData.value = res.data

      // 自动回填上游成本参考值（仅新增时，编辑时不覆盖已有值）
      if (!form.value.id) {
        if (res.data.seedlingCost && form.value.seedlingCost == null) {
          form.value.seedlingCost = Number(res.data.seedlingCost)
        }
        if (res.data.totalFeedCost && form.value.feedCost == null) {
          form.value.feedCost = Number(res.data.totalFeedCost)
        }
        if (res.data.totalMedicineCost && form.value.medicineCost == null) {
          form.value.medicineCost = Number(res.data.totalMedicineCost)
        }
      }
    }
  } catch (e) {
    console.error('预览加载失败', e)
  }
}

// ==================== 初始化 ====================

onMounted(() => {
  if (currentFarmId.value) {
    getList()
    loadAuxiliaryOptions()
  }
})

async function loadAuxiliaryOptions() {
  try {
    const [pondRes, batchRes, stockingRes] = await Promise.all([
      getPondPage({ pageNum: 1, pageSize: 100, farmId: currentFarmId.value }),
      getPurchasePage({ pageNum: 1, pageSize: 200, farmId: currentFarmId.value }),
      getStockingPage({ pageNum: 1, pageSize: 500, farmId: currentFarmId.value })
    ])
    if (pondRes.code === 200) pondOptions.value = pondRes.data.records
    if (batchRes.code === 200) allBatches.value = batchRes.data.records
    if (stockingRes.code === 200) stockingRecords.value = stockingRes.data.records
  } catch (error) {
    console.error('辅助下拉字典数据加载失败', error)
  }
}

async function getList() {
  loading.value = true
  try {
    const res = await getHarvestPage(queryParams.value)
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() {
  queryParams.value.batchNo = undefined
  queryParams.value.pondId = undefined
  handleQuery()
}

function handleAdd() {
  form.value = {
    id: undefined,
    batchNo: undefined,
    pondId: undefined,
    harvestDate: new Date().toISOString().split('T')[0],
    actualTotalWeightKg: undefined,
    actualAvgWeightG: undefined,
    unitPrice: undefined,
    seedlingCost: undefined,
    feedCost: undefined,
    medicineCost: undefined,
    otherCost: undefined,
    buyerName: '',
    remark: ''
  }
  previewData.value = null
  dialogTitle.value = '新增出塘结算'
  dialogVisible.value = true
}

function handleUpdate(row) {
  form.value = {
    id: row.id,
    batchNo: row.batchNo,
    pondId: row.pondId,
    harvestDate: row.harvestDate,
    actualTotalWeightKg: row.actualTotalWeightKg,
    actualAvgWeightG: row.actualAvgWeightG,
    unitPrice: row.unitPrice,
    seedlingCost: row.seedlingCost,
    feedCost: row.feedCost,
    medicineCost: row.medicineCost,
    otherCost: row.otherCost,
    buyerName: row.buyerName || '',
    remark: row.remark || ''
  }
  previewData.value = null
  dialogTitle.value = '修改出塘记录'
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (form.value.id) {
          await updateHarvest(form.value.id, form.value)
          ElMessage.success('修改成功')
        } else {
           const submitData = { ...form.value, settlementStatus: 1 }
          await addHarvest(submitData)
          ElMessage.success('出塘结算成功')
        }
        dialogVisible.value = false
        getList()
        loadAuxiliaryOptions()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

function handleDelete(row) {
  ElMessageBox.confirm(
    `确认删除该出塘记录吗？删除后对应批次将恢复为"养殖中"状态，可重新出塘。`,
    '警告',
    { type: 'warning' }
  ).then(async () => {
    await delHarvest(row.id)
    ElMessage.success('删除成功，批次已恢复为养殖中状态')
    getList()
    loadAuxiliaryOptions()
  }).catch(() => {})
}
</script>
