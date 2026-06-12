<template>
  <div class="h-full flex flex-col font-sans">
    
    <!-- 防呆提示：未选择农场时拦截 -->
    <div v-if="!currentFarmId" class="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <Home class="w-10 h-10 text-amber-500" />
      </div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">未选择操作场区</h2>
      <p class="text-gray-500 mb-6">在进行巡塘登记前，请先指定一个具体的养殖场区。</p>
      <el-button type="primary" size="large" class="!bg-teal-600 !border-none hover:!bg-teal-700 !rounded-xl" @click="$router.push('/farmer/base/farm')">
        去选择养殖场
      </el-button>
    </div>

    <!-- ✅ 巡塘台账核心业务页面 -->
    <div v-else class="space-y-4">
      
      <!-- 🌟 当前操作场区高亮提示牌 -->
      <div class="bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-3.5 rounded-2xl border border-blue-100 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-3">
          <div class="p-1.5 bg-blue-100 rounded-lg">
            <Home class="w-5 h-5 text-blue-600" />
          </div>
          <span class="text-sm text-blue-800">
            当前工作空间：<strong class="text-blue-700 text-base mx-1 tracking-wide">{{ currentFarmName }}</strong>
            <span class="text-xs text-blue-600/70 ml-2 hidden md:inline">正在记录本场区的物理环境与生物状态。</span>
          </span>
        </div>
        <el-button link type="primary" class="!text-blue-600 hover:!text-blue-800 text-xs font-bold" @click="$router.push('/farmer/base/farm')">
          <RefreshCw class="w-3 h-3 mr-1" /> 切换场区
        </el-button>
      </div>

      <!-- 🌟 核心布局：左侧表单与列表 (2/3) + 右侧SOP任务 (1/3) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- ==================== 左侧：巡塘填报与历史台账 ==================== -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- 区域 A：巡塘基础信息记录表单 -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ThermometerSun class="w-5 h-5 text-orange-500" />
              新增巡塘记录
            </h2>
            
            <el-form ref="patrolFormRef" :model="patrolForm" :rules="rules" label-width="80px" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <el-form-item label="关联池塘" prop="pondId">
                <el-select v-model="patrolForm.pondId" placeholder="选择巡查池塘" class="!w-full" filterable>
                  <el-option v-for="pond in pondOptions" :key="pond.id" :label="pond.pondName" :value="pond.id" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="苗种批次" prop="batchNo">
                <el-select v-model="patrolForm.batchNo" placeholder="先选池塘后自动加载批次" class="!w-full" filterable clearable :disabled="!patrolForm.pondId">
                  <el-option v-for="batch in stockBatches" :key="batch.batchNo" :label="batch.batchNo" :value="batch.batchNo">
                    <span style="float: left">{{ batch.batchNo }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ batch.seedlingName || '未知' }}</span>
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="巡塘时间" prop="patrolTime">
                <el-date-picker v-model="patrolForm.patrolTime" type="datetime" placeholder="选择记录时间" value-format="YYYY-MM-DDTHH:mm:ss" class="!w-full" />
              </el-form-item>

              <el-form-item label="天气状况" prop="weather">
                <el-select v-model="patrolForm.weather" placeholder="当前天气" class="!w-full">
                  <el-option label="晴朗 ☀️" value="晴" />
                  <el-option label="多云 ⛅" value="多云" />
                  <el-option label="阴天 ☁️" value="阴" />
                  <el-option label="下雨 🌧️" value="雨" />
                </el-select>
              </el-form-item>

              <el-form-item label="实时水温" prop="waterTemp">
                <el-input-number v-model="patrolForm.waterTemp" :precision="1" :step="0.5" placeholder="°C" class="!w-full" controls-position="right" />
              </el-form-item>

              <el-form-item label="水质颜色" prop="waterColor">
                <el-select v-model="patrolForm.waterColor" placeholder="观察水色" class="!w-full">
                  <el-option label="翠绿 (优)" value="翠绿" />
                  <el-option label="黄绿 (良)" value="黄绿" />
                  <el-option label="浑浊 (差)" value="浑浊" />
                  <el-option label="褐色 (老水)" value="褐色" />
                  <el-option label="发红 (异常)" value="发红" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>

              <el-form-item label="综合备注" prop="remark" class="md:col-span-2">
                <el-input v-model="patrolForm.remark" type="textarea" :rows="2" placeholder="记录水面有无死鱼、吃食情况、设备运转等 (最多500字)" maxlength="500" show-word-limit />
              </el-form-item>

              <div class="md:col-span-2 flex justify-end mt-2">
                <el-button type="primary" @click="submitPatrolLog" :loading="submitLoading" class="!bg-teal-600 !border-none hover:!bg-teal-700 !rounded-lg !px-6">
                  <ClipboardCheck class="w-4 h-4 mr-1.5" /> 提交主巡塘记录
                </el-button>
              </div>
            </el-form>
          </div>

          <!-- 区域 B：今日巡塘记录列表 (支持展开详情) -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList class="w-5 h-5 text-blue-500" />
                历史巡塘台账 <span class="text-xs font-normal text-gray-400">(点击行左侧展开录入生长投喂数据)</span>
              </h2>
              <!-- 列表过滤 -->
              <div class="flex gap-2">
                <el-select v-model="queryParams.pondId" placeholder="按池塘过滤" clearable class="!w-32" @change="handleQuery">
                  <el-option v-for="pond in pondOptions" :key="pond.id" :label="pond.pondName" :value="pond.id" />
                </el-select>
                <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" class="!w-60" @change="handleQuery" />
                <el-button @click="resetQuery" class="!rounded-lg"><RefreshCw class="w-4 h-4" /></el-button>
              </div>
            </div>

            <el-table v-loading="loadingLog" :data="logList" stripe class="w-full text-sm" @expand-change="handleExpandRow">
              <!-- 🌟 展开行：用于追加投喂与生长数据 -->
              <el-table-column type="expand">
                <template #default="scope">
                  <div class="p-4 bg-slate-50 border-y border-slate-200" v-loading="expandLoadings[scope.row.id]">

                    <!-- 已出库锁定提示 -->
                    <div v-if="isBatchHarvested(scope.row.batchNo)" class="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                      <span class="text-amber-500 text-base mt-0.5">⚠️</span>
                      <div class="text-xs text-amber-700">
                        <p class="font-bold mb-0.5">关联批次已出库结算</p>
                        <p class="text-amber-600">历史巡塘数据不可再追加或修改投喂/抽测记录。</p>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

                      <!-- 子功能A：投喂换水记录 -->
                      <div class="bg-white p-4 rounded-xl border border-teal-100 shadow-sm">
                        <h4 class="font-bold text-teal-700 mb-3 flex items-center gap-2">
                          <Droplets class="w-4 h-4" /> 投喂与换水登记
                        </h4>

                        <!-- 历史投喂列表 -->
                        <div v-if="expandData[scope.row.id]?.feedLogs?.length" class="mb-4 space-y-2">
                          <div v-for="log in expandData[scope.row.id].feedLogs" :key="log.id" class="text-xs bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
                            <!-- 饲料投喂行：仅当有饲料品牌或投量时才展示 -->
                            <div v-if="log.feedBrand || log.feedAmount" class="flex justify-between items-center">
                              <span class="text-teal-800">
                                <span class="font-bold">{{log.feedBrand || '未记录品牌'}}</span>
                                | 投饵 <span class="text-amber-600 font-bold">{{log.feedAmount}} kg</span>
                                <template v-if="log.feedTotalAmount">
                                  <span class="text-gray-400"> × ¥{{log.feedUnitPrice}}/kg</span>
                                  <span class="font-bold text-teal-600"> = ¥{{log.feedTotalAmount}}</span>
                                </template>
                                <template v-if="log.waterChangeStatus"> | {{log.waterChangeStatus}}</template>
                              </span>
                              <el-button link type="danger" @click="delFeedLog(log.id, scope.row)" :disabled="isBatchHarvested(scope.row.batchNo)"><Trash2 class="w-3.5 h-3.5"/></el-button>
                            </div>
                            <!-- 纯换水（无饲料、无药品）时只显示换水状态和删除按钮 -->
                            <div v-else-if="log.waterChangeStatus && !log.medicineName" class="flex justify-between items-center">
                              <span class="text-teal-800">{{log.waterChangeStatus}}</span>
                              <el-button link type="danger" @click="delFeedLog(log.id, scope.row)" :disabled="isBatchHarvested(scope.row.batchNo)"><Trash2 class="w-3.5 h-3.5"/></el-button>
                            </div>
                            <!-- 药品行：有药品时展示，无饲料时去掉顶部边框线 -->
                            <div v-if="log.medicineName" :class="['text-purple-700 flex items-center gap-1', (log.feedBrand || log.feedAmount) ? 'mt-1 pt-1 border-t border-teal-100' : '']">
                              💊 {{log.medicineName}}
                              <span v-if="log.medicineDosage"> | {{log.medicineDosage}} {{log.medicineUnit || ''}}</span>
                              <span v-if="log.medicineAmount" class="font-bold"> | 药费 ¥{{log.medicineAmount}}</span>
                            </div>
                          </div>
                        </div>
                        <div v-else class="text-xs text-gray-400 mb-4 px-1">该巡塘点暂无投喂换水记录。</div>

                        <!-- 新增表单 -->
                        <div v-if="!isBatchHarvested(scope.row.batchNo)" class="space-y-2 mt-auto">
                          <!-- 第一行：饲料 -->
                          <div class="flex gap-2 items-center flex-wrap">
                            <el-input v-model="expandData[scope.row.id].feedForm.feedBrand" placeholder="饲料品牌" size="small" class="!w-24" />
                            <el-input-number v-model="expandData[scope.row.id].feedForm.feedAmount" :precision="1" :step="1" :min="0" placeholder="投量(kg)" size="small" class="!w-28" controls-position="right" />
                            <el-input-number v-model="expandData[scope.row.id].feedForm.feedUnitPrice" :precision="2" :step="0.5" :min="0" placeholder="单价(元/kg)" size="small" class="!w-28" controls-position="right" />
                            <span v-if="expandData[scope.row.id].feedForm.feedAmount && expandData[scope.row.id].feedForm.feedUnitPrice" class="text-xs text-teal-600 font-bold whitespace-nowrap">
                              = ¥{{ (expandData[scope.row.id].feedForm.feedAmount * expandData[scope.row.id].feedForm.feedUnitPrice).toFixed(2) }}
                            </span>
                          </div>
                          <!-- 第二行：药品 -->
                          <div class="flex gap-2 items-center flex-wrap">
                            <el-input v-model="expandData[scope.row.id].feedForm.medicineName" placeholder="药品名称(可选)" size="small" class="!w-28" />
                            <el-input-number v-model="expandData[scope.row.id].feedForm.medicineDosage" :precision="1" :step="1" :min="0" placeholder="用量" size="small" class="!w-24" controls-position="right" />
                            <el-select v-model="expandData[scope.row.id].feedForm.medicineUnit" placeholder="单位" size="small" class="!w-20">
                              <el-option label="ml" value="ml" />
                              <el-option label="g" value="g" />
                              <el-option label="袋" value="袋" />
                            </el-select>
                            <el-input-number v-model="expandData[scope.row.id].feedForm.medicineAmount" :precision="2" :step="1" :min="0" placeholder="药费(元)" size="small" class="!w-28" controls-position="right" />
                            <el-input v-model="expandData[scope.row.id].feedForm.waterChangeStatus" placeholder="换水状态" size="small" class="!w-32" />
                            <el-button type="primary" size="small" class="!bg-teal-600 !border-none" @click="submitFeedLog(scope.row)">追加</el-button>
                          </div>
                        </div>
                      </div>

                      <!-- 子功能B：生长死亡抽测 -->
                      <div class="bg-white p-4 rounded-xl border border-blue-100 shadow-sm relative">
                        <div v-if="!scope.row.batchNo" class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl border border-dashed border-gray-300">
                          <span class="text-sm text-gray-500 font-medium"><AlertCircle class="w-4 h-4 inline mr-1" /> 此巡塘记录未关联批次，无法录入生物数据</span>
                        </div>

                        <h4 class="font-bold text-blue-700 mb-3 flex items-center gap-2">
                          <Scale class="w-4 h-4" /> 生长抽测与死亡登记
                        </h4>

                        <div class="grid grid-cols-2 gap-3">
                          <el-form-item label="均长(cm)" class="!mb-0" label-width="70px">
                            <el-input-number v-model="expandData[scope.row.id].growthForm.avgLength" :precision="1" :step="0.5" :min="0" size="small" class="!w-full" controls-position="right" :disabled="isBatchHarvested(scope.row.batchNo)"/>
                          </el-form-item>
                          <el-form-item label="均重(g)" class="!mb-0" label-width="70px">
                            <el-input-number v-model="expandData[scope.row.id].growthForm.avgWeight" :precision="1" :step="0.5" :min="0" size="small" class="!w-full" controls-position="right" :disabled="isBatchHarvested(scope.row.batchNo)"/>
                          </el-form-item>
                          <el-form-item label="日常损耗" class="!mb-0" label-width="70px">
                            <el-input-number v-model="expandData[scope.row.id].growthForm.routineDeathCount" :min="0" :step="1" size="small" class="!w-full" controls-position="right" placeholder="尾" :disabled="isBatchHarvested(scope.row.batchNo)"/>
                          </el-form-item>
                          <el-form-item label="突发死亡" class="!mb-0" label-width="70px">
                            <el-input-number v-model="expandData[scope.row.id].growthForm.abnormalDeathCount" :min="0" :step="1" size="small" class="!w-full" controls-position="right" placeholder="尾" :disabled="isBatchHarvested(scope.row.batchNo)"/>
                          </el-form-item>

                          <el-form-item label="异常原因" class="!mb-0 col-span-2" label-width="70px" v-if="expandData[scope.row.id]?.growthForm?.abnormalDeathCount > 0">
                            <el-input v-model="expandData[scope.row.id].growthForm.abnormalReason" size="small" placeholder="突发死亡必填：如用药不当、缺氧" class="!w-full border-red-200" :disabled="isBatchHarvested(scope.row.batchNo)" />
                          </el-form-item>
                        </div>

                        <div class="flex justify-end mt-3 border-t border-blue-50 pt-3">
                          <el-button type="primary" size="small" class="!bg-blue-600 !border-none" @click="submitGrowthLog(scope.row)" :disabled="isBatchHarvested(scope.row.batchNo)">
                            <Save class="w-3.5 h-3.5 mr-1" />
                            {{ expandData[scope.row.id]?.growthForm?.id ? '更新抽测数据' : '保存抽测数据' }}
                          </el-button>
                        </div>
                      </div>

                    </div>
                  </div>
                </template>
              </el-table-column>

              <!-- 主表字段 -->
              <el-table-column label="池塘" prop="pondName" min-width="100">
                <template #default="scope"><span class="font-bold text-teal-700">{{ scope.row.pondName || '池塘'+scope.row.pondId }}</span></template>
              </el-table-column>
              <el-table-column label="批次号" prop="batchNo" min-width="120" show-overflow-tooltip>
                <template #default="scope">
                  <span class="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{{ scope.row.batchNo || '未关联' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="时间" prop="patrolTime" width="120" align="center">
                <template #default="scope">
                  <span class="text-xs text-gray-500">{{ formatDateTime(scope.row.patrolTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="水温/天气" align="center" width="110">
                <template #default="scope">
                  <div class="flex flex-col items-center">
                    <span class="text-orange-600 font-bold">{{ scope.row.waterTemp }}°C</span>
                    <span class="text-xs text-gray-400">{{ scope.row.weather }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="水色" prop="waterColor" align="center" width="80">
                <template #default="scope">
                  <span :class="getWaterColorClass(scope.row.waterColor)" class="px-2 py-0.5 rounded text-xs border">
                    {{ scope.row.waterColor }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="100" fixed="right">
                <template #default="scope">
                  <el-tooltip v-if="isBatchHarvested(scope.row.batchNo)" content="关联批次已出库，历史数据已锁定" placement="top">
                    <span class="text-xs text-gray-300 cursor-not-allowed">已锁定</span>
                  </el-tooltip>
                  <el-button v-else link type="danger" @click="handleDeleteLog(scope.row)"><Trash2 class="w-4 h-4"/></el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="mt-4 flex justify-end">
              <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :total="logTotal" layout="total, prev, pager, next" @current-change="getLogs" />
            </div>
          </div>
        </div>

        <!-- ==================== 右侧：今日智能 SOP 待办 ==================== -->
        <div class="lg:col-span-1">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 relative overflow-hidden h-full flex flex-col">
            <!-- 装饰背景 -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div class="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h2 class="text-lg font-bold text-emerald-800 flex items-center gap-2">
                  <ListChecks class="w-5 h-5 text-emerald-500" />
                  今日 SOP 待办
                </h2>
                <p class="text-xs text-emerald-600/70 mt-1">系统依据养殖日历自动生成</p>
              </div>
              <el-button v-if="hasPendingTasks" type="success" size="small" class="!bg-emerald-500 !border-none !rounded-lg hover:!bg-emerald-600 shadow-sm" @click="handleBatchCheckOff" :loading="batchLoading">
                一键打卡
              </el-button>
            </div>

            <div class="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar" v-loading="loadingTasks">
              
              <!-- 任务卡片列表 -->
              <div v-for="task in taskList" :key="task.id" 
                   class="p-4 rounded-xl border transition-all duration-300"
                   :class="task.status === 1 ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-emerald-100 hover:shadow-md hover:border-emerald-300'">
                
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <!-- 任务类型标签 -->
                    <span :class="getTaskTypeClass(task.taskType)" class="px-2 py-0.5 rounded text-xs font-bold tracking-wider">
                      {{ getTaskTypeName(task.taskType) }}
                    </span>
                    <span class="text-sm font-bold text-gray-800">{{ task.pondName || '池塘'+task.pondId }}</span>
                  </div>
                  
                  <!-- 状态/打卡按钮 -->
                  <div v-if="task.status === 1" class="flex items-center text-emerald-500 text-xs font-bold gap-1">
                    <CheckCircle2 class="w-4 h-4" /> 已完成
                  </div>
                  <el-button v-else link type="primary" class="!text-emerald-600 hover:!text-emerald-800 text-xs font-bold p-0" @click="handleCheckOff(task)">
                    <CircleDashed class="w-4 h-4 mr-1" /> 去打卡
                  </el-button>
                </div>
                
                <p class="text-sm text-gray-600 mb-2 leading-relaxed" :class="task.status === 1 ? 'line-through' : ''">
                  {{ task.taskDesc }}
                </p>
                <p class="text-xs text-gray-400 font-mono">
                  关联批次: {{ task.batchNo }}
                </p>
              </div>

              <!-- 空状态 -->
              <div v-if="!loadingTasks && taskList.length === 0" class="py-12 flex flex-col items-center justify-center text-gray-400">
                <Coffee class="w-12 h-12 mb-3 text-emerald-200" />
                <p class="text-sm font-medium text-emerald-600/70">今日暂无必须执行的 SOP 任务</p>
                <p class="text-xs mt-1">您可以自由安排日常巡查</p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Home, RefreshCw, ThermometerSun, ClipboardCheck, ClipboardList, 
  Trash2, ListChecks, CheckCircle2, CircleDashed, Coffee, Droplets, Scale, Save, AlertCircle
} from 'lucide-vue-next'

// 导入主记录与SOP API
import {
  getPondPage, getStockingPage, getPurchasePage,
  getPatrolLogPage, addPatrolLog, delPatrolLog,
  getPondTaskPage, checkOffPondTask, batchCheckOffPondTask,
  // 🌟 新增导入展开行的子业务 API
  getPondFeedLogPage, addPondFeedLog, delPondFeedLog,
  getBatchGrowthLogPage, addBatchGrowthLog, updateBatchGrowthLog
} from '@/api/base'

// === 基础状态与上下文 ===
const currentFarmId = ref(sessionStorage.getItem('current_farm_id') ? Number(sessionStorage.getItem('current_farm_id')) : null)
const currentFarmName = ref(sessionStorage.getItem('current_farm_name') || '未命名场区')

// === 字典与下拉数据 ===
const pondOptions = ref([])
const stockBatches = ref([])  // 当前选中池塘已投放的批次 (batchNo + seedlingName)
const allBatches = ref([])    // 当前养殖场全部批次（用于判断已出库状态）

// 已出库结算的批次号集合，用于前端快速判断并锁定关联的巡塘记录
const harvestedBatchNos = computed(() => {
  return new Set(
    allBatches.value
      .filter(b => b.batchStatus === 3)
      .map(b => b.batchNo)
  )
})

const isBatchHarvested = (batchNo) => {
  if (!batchNo) return false
  return harvestedBatchNos.value.has(batchNo)
}

// === 区域A：新增巡塘表单 ===
const patrolFormRef = ref(null)
const submitLoading = ref(false)

// 稳定获取带有 T 的本地时间字符串 (如 2026-06-01T08:00:00)
const getNowStr = () => {
  const now = new Date()
  const pad = n => n.toString().padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

const patrolForm = ref({
  pondId: undefined,
  batchNo: '',
  patrolTime: '', 
  weather: '晴',
  waterTemp: undefined,
  waterColor: '翠绿',
  remark: ''
})

const rules = {
  pondId: [{ required: true, message: '请选择池塘', trigger: 'change' }],
  patrolTime: [{ required: true, message: '请选择巡塘时间', trigger: 'change' }],
  waterTemp: [{ required: true, message: '请输入水温', trigger: 'blur' }]
}

// 选中池塘后动态拉取其投放记录，批次下拉仅显示该池塘已有的批次（排除已出库的）
watch(() => patrolForm.value.pondId, async (newPondId) => {
  patrolForm.value.batchNo = ''
  stockBatches.value = []
  if (!newPondId) return
  try {
    const res = await getStockingPage({ pageNum: 1, pageSize: 100, pondId: newPondId })
    if (res.code === 200 && res.data?.records) {
      const seen = new Set()
      stockBatches.value = res.data.records
        .filter(r => r.batchNo && !seen.has(r.batchNo) && seen.add(r.batchNo))
        .map(r => ({ batchNo: r.batchNo, seedlingName: r.seedlingName || '未知' }))
        .filter(r => !isBatchHarvested(r.batchNo)) // 已出库批次不可新增巡塘记录
    }
  } catch (e) { /* ignore */ }
})

// 重置主巡塘表单到初始状态并重置校验（若可用）
const resetPatrolForm = () => {
  if (patrolFormRef.value && typeof patrolFormRef.value.resetFields === 'function') {
    patrolFormRef.value.resetFields()
  }
  patrolForm.value = {
    pondId: undefined,
    batchNo: '',
    patrolTime: '',
    weather: '晴',
    waterTemp: undefined,
    waterColor: '翠绿',
    remark: ''
  }
}

// === 区域B：巡塘日志列表 ===
const logList = ref([])
const loadingLog = ref(false)
const logTotal = ref(0)
const dateRange = ref([])
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  farmId: currentFarmId.value,
  pondId: undefined,
  startDate: '',
  endDate: ''
})

// === 区域C：SOP待办任务 ===
const taskList = ref([])
const loadingTasks = ref(false)
const batchLoading = ref(false)
const todayDateStr = new Date().toISOString().split('T')[0]

const hasPendingTasks = computed(() => {
  return taskList.value.some(t => t.status === 0)
})

// === 🌟 扩展区域：行内展开数据绑定状态 ===
const expandData = ref({}) // 存储按 patrolLogId 划分的子表单和子列表数据
const expandLoadings = ref({}) // 存储展开行各自的 loading 状态

const getEmptyFeedForm = () => ({
  feedBrand: '',
  feedAmount: undefined,
  feedUnitPrice: undefined,
  waterChangeStatus: '',
  medicineName: '',
  medicineDosage: undefined,
  medicineUnit: '',
  medicineAmount: undefined,
})
const getEmptyGrowthForm = () => ({ id: undefined, avgLength: undefined, avgWeight: undefined, routineDeathCount: undefined, abnormalDeathCount: undefined, abnormalReason: '' })

// === 初始化 ===
onMounted(() => {
  if (currentFarmId.value) {
    loadDictionaries()
    getLogs()
    getTasks()
  }
})

// 加载池塘下拉列表
const loadDictionaries = async () => {
  try {
    const pondRes = await getPondPage({ pageNum: 1, pageSize: 100, farmId: currentFarmId.value })
    if (pondRes.code === 200) pondOptions.value = pondRes.data.records
    // 加载全部批次，用于判断已出库状态
    const batchRes = await getPurchasePage({ pageNum: 1, pageSize: 200, farmId: currentFarmId.value })
    if (batchRes.code === 200) allBatches.value = batchRes.data.records
  } catch (e) {
    console.error('辅助字典加载失败', e)
  }
}

// ==================== 区域A 功能 ====================
const submitPatrolLog = async () => {
  if (!patrolFormRef.value) return
  await patrolFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await addPatrolLog(patrolForm.value)
        ElMessage.success('主巡塘记录提交成功')
        // 完整重置表单并刷新列表
        resetPatrolForm()
        getLogs()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// ==================== 区域B 功能 ====================
const getLogs = async () => {
  loadingLog.value = true
  try {
    if (dateRange.value && dateRange.value.length === 2) {
      queryParams.value.startDate = dateRange.value[0] || ''
      queryParams.value.endDate = dateRange.value[1] || ''
    } else {
      queryParams.value.startDate = ''
      queryParams.value.endDate = ''
    }
    const res = await getPatrolLogPage(queryParams.value)
    if (res.code === 200) {
      logList.value = res.data.records
      logTotal.value = res.data.total
    }
  } finally {
    loadingLog.value = false
  }
}

const handleQuery = () => { queryParams.value.pageNum = 1; getLogs() }
const resetQuery = () => {
  queryParams.value.pondId = undefined
  dateRange.value = []
  handleQuery()
}

const handleDeleteLog = (row) => {
  ElMessageBox.confirm(`确认删除该条巡塘记录吗？将会同步删除关联的抽测与投喂数据！`, '高危操作警告', { type: 'warning' }).then(async () => {
    await delPatrolLog(row.id)
    ElMessage.success('删除成功')
    getLogs()
  }).catch(() => {})
}

// ==================== 🌟 展开行子业务逻辑 ====================
const handleExpandRow = async (row, expandedRows) => {
  const isExpanded = expandedRows.some(r => r.id === row.id)
  if (isExpanded) {
    // 初始化该行的数据结构
    if (!expandData.value[row.id]) {
      expandData.value[row.id] = reactive({
        feedLogs: [],
        feedForm: getEmptyFeedForm(),
        growthForm: getEmptyGrowthForm()
      })
    }
    await loadExpandData(row)
  }
}

// 加载该巡塘记录对应的详细投喂与抽测数据
const loadExpandData = async (row) => {
  expandLoadings.value[row.id] = true
  try {
    // 1. 加载投喂记录列表
    const feedRes = await getPondFeedLogPage({ patrolLogId: row.id, pageNum: 1, pageSize: 50 })
    expandData.value[row.id].feedLogs = feedRes.data?.records || []

    // 2. 加载生长记录详情 (一对一关联，取第一条)
    if (row.batchNo) {
      const growthRes = await getBatchGrowthLogPage({ patrolLogId: row.id, pageNum: 1, pageSize: 1 })
      const growthRec = growthRes.data?.records?.[0]
      if (growthRec) {
        expandData.value[row.id].growthForm = { ...growthRec }
      } else {
        expandData.value[row.id].growthForm = getEmptyGrowthForm()
      }
    }
  } catch (e) {
    console.error('拉取详情失败', e)
  } finally {
    expandLoadings.value[row.id] = false
  }
}

// 追加投喂记录
const submitFeedLog = async (row) => {
  const form = expandData.value[row.id].feedForm
  if (!form.feedAmount && !form.medicineName && !form.waterChangeStatus) {
    return ElMessage.warning('请至少填写投喂量、药品或换水状态中的一项')
  }
  
  const submitData = {
    ...form,
    patrolLogId: row.id,
    pondId: row.pondId,
    logDate: row.patrolTime.split('T')[0] // 提取出 YYYY-MM-DD (基于后端返回的格式切分)
  }
  
  expandLoadings.value[row.id] = true
  try {
    await addPondFeedLog(submitData)
    ElMessage.success('投喂换水记录追加成功')
    expandData.value[row.id].feedForm = getEmptyFeedForm()
    await loadExpandData(row) // 刷新当前行列表
  } finally {
    expandLoadings.value[row.id] = false
  }
}

// 删除单条投喂记录
const delFeedLog = async (feedLogId, row) => {
  try {
    await delPondFeedLog(feedLogId)
    ElMessage.success('记录已移除')
    await loadExpandData(row)
  } catch (e) {}
}

// 保存/更新生长抽测记录
const submitGrowthLog = async (row) => {
  const form = expandData.value[row.id].growthForm
  
  // 防呆校验：异常死亡必填原因
  if (form.abnormalDeathCount > 0 && !form.abnormalReason) {
    return ElMessage.error('请填写异常死亡原因！')
  }

  const submitData = {
    ...form,
    patrolLogId: row.id,
    pondId: row.pondId,
    batchNo: row.batchNo,
    logDate: row.patrolTime.split('T')[0]
  }

  expandLoadings.value[row.id] = true
  try {
    if (submitData.id) {
      await updateBatchGrowthLog(submitData.id, submitData)
      ElMessage.success('抽测数据更新成功')
    } else {
      await addBatchGrowthLog(submitData)
      ElMessage.success('抽测数据保存成功')
    }
    await loadExpandData(row)
  } finally {
    expandLoadings.value[row.id] = false
  }
}


// ==================== 区域C 功能 ====================
const getTasks = async () => {
  loadingTasks.value = true
  try {
    const res = await getPondTaskPage({ 
      pageNum: 1, pageSize: 50, 
      farmId: currentFarmId.value, 
      scheduledDate: todayDateStr 
    })
    if (res.code === 200) {
      const tasks = res.data.records || []
      taskList.value = tasks.sort((a, b) => a.status - b.status)
    }
  } finally {
    loadingTasks.value = false
  }
}

const handleCheckOff = async (task) => {
  try {
    await checkOffPondTask(task.id)
    ElMessage.success('打卡成功')
    task.status = 1
  } catch (error) {
    ElMessage.error('打卡失败')
  }
}

const handleBatchCheckOff = async () => {
  const pendingIds = taskList.value.filter(t => t.status === 0).map(t => t.id)
  if (pendingIds.length === 0) return

  batchLoading.value = true
  try {
    await batchCheckOffPondTask(pendingIds)
    ElMessage.success('今日任务已全部一键打卡！')
    getTasks() 
  } finally {
    batchLoading.value = false
  }
}

// === 辅助渲染函数 ===
const formatDateTime = (str) => {
  if (!str) return '-'
  return str.replace('T', ' ').substring(5, 16) 
}

const getWaterColorClass = (color) => {
  const map = {
    '翠绿': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    '黄绿': 'bg-lime-50 text-lime-600 border-lime-200',
    '浑浊': 'bg-yellow-50 text-yellow-600 border-yellow-200',
    '发红': 'bg-red-50 text-red-600 border-red-200',
    '褐色': 'bg-stone-50 text-stone-600 border-stone-200',
  }
  return map[color] || 'bg-gray-50 text-gray-600 border-gray-200'
}

const getTaskTypeName = (type) => {
  const map = { 'DISINFECT': '消毒', 'TEST': '抽测', 'WATER': '换水', 'FEED': '投喂' }
  return map[type] || '通用任务'
}

const getTaskTypeClass = (type) => {
  const map = {
    'DISINFECT': 'bg-purple-100 text-purple-700',
    'TEST': 'bg-blue-100 text-blue-700',
    'WATER': 'bg-cyan-100 text-cyan-700',
    'FEED': 'bg-orange-100 text-orange-700'
  }
  return map[type] || 'bg-gray-100 text-gray-700'
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1fae5; border-radius: 10px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #a7f3d0; }
</style>