import request from '@/utils/request'

// ==================== 养殖场管理 ====================
export const getFarmPage = (params: Record<string, any>) => request({ url: '/base/farm/list', method: 'get', params })
export const addFarm = (data: any) => request({ url: '/base/farm', method: 'post', data })
export const updateFarm = (id: string | number, data: any) => request({ url: `/base/farm/${id}`, method: 'put', data })
export const delFarm = (ids: string | number) => request({ url: `/base/farm/${ids}`, method: 'delete' })

// ==================== 池塘管理 ====================
export const getPondPage = (params: Record<string, any>) => request({ url: '/base/pond/list', method: 'get', params })
export const addPond = (data: any) => request({ url: '/base/pond', method: 'post', data })
export const updatePond = (id: string | number, data: any) => request({ url: `/base/pond/${id}`, method: 'put', data })
export const delPond = (ids: string | number) => request({ url: `/base/pond/${ids}`, method: 'delete' })

// ==================== 供应商管理 ====================
export const getSupplierPage = (params: Record<string, any>) => request({ url: '/base/supplier/list', method: 'get', params })
export const addSupplier = (data: any) => request({ url: '/base/supplier', method: 'post', data })
export const updateSupplier = (id: string | number, data: any) => request({ url: `/base/supplier/${id}`, method: 'put', data })
export const delSupplier = (ids: string | number) => request({ url: `/base/supplier/${ids}`, method: 'delete' })
export const getSupplierList = () => request({ url: '/base/supplier/all', method: 'get' })

// ==================== 采购批次入库管理 ====================
export const getPurchasePage = (params: Record<string, any>) => request({ url: '/base/purchase-batch/list', method: 'get', params })
// RESTful: POST
export const addPurchase = (data: any) => request({ url: '/base/purchase-batch', method: 'post', data })
// RESTful: PUT带ID
export const updatePurchase = (id: string | number, data: any) => request({ url: `/base/purchase-batch/${id}`, method: 'put', data })
// RESTful: DELETE带ID列表
export const delPurchase = (ids: string | number) => request({ url: `/base/purchase-batch/${ids}`, method: 'delete' })

// ==================== 苗种字典管理 ====================
export const getSeedlingPage = (params: Record<string, any>) => request({ url: '/base/seedling-dict/list', method: 'get', params })
export const getSeedlingList = () => request({ url: '/base/seedling-dict/all', method: 'get' })
export const getSeedlingById = (id: string | number) => request({ url: `/base/seedling-dict/${id}`, method: 'get' })
export const addSeedling = (data: any) => request({ url: '/base/seedling-dict', method: 'post', data })
export const updateSeedling = (id: string | number, data: any) => request({ url: `/base/seedling-dict/${id}`, method: 'put', data })
export const delSeedling = (ids: string | number) => request({ url: `/base/seedling-dict/${ids}`, method: 'delete' })

// ==================== 投放登记管理 ====================
export const getStockingPage = (params: Record<string, any>) => request({ url: '/base/stocking/list', method: 'get', params })
export const getStockingById = (id: string | number) => request({ url: `/base/stocking/${id}`, method: 'get' })
export const addStocking = (data: any) => request({ url: '/base/stocking', method: 'post', data })
export const updateStocking = (id: string | number, data: any) => request({ url: `/base/stocking/${id}`, method: 'put', data })
export const delStocking = (ids: string | number) => request({ url: `/base/stocking/${ids}`, method: 'delete' })

// ==================== SOP模板管理 ====================
export const getSopTemplatePage = (params: Record<string, any>) => request({ url: '/base/sop-template/list', method: 'get', params })
export const getSopTemplateById = (id: string | number) => request({ url: `/base/sop-template/${id}`, method: 'get' })
export const addSopTemplate = (data: any) => request({ url: '/base/sop-template', method: 'post', data })
export const updateSopTemplate = (id: string | number, data: any) => request({ url: `/base/sop-template/${id}`, method: 'put', data })
export const delSopTemplate = (ids: string | number) => request({ url: `/base/sop-template/${ids}`, method: 'delete' })

// ==================== 日常巡塘台账 ====================
export const getPatrolLogPage = (params: Record<string, any>) => request({ url: '/lifecycle/patrol-log/list', method: 'get', params })
export const getPatrolLogById = (id: string | number) => request({ url: `/lifecycle/patrol-log/${id}`, method: 'get' })
export const addPatrolLog = (data: any) => request({ url: '/lifecycle/patrol-log', method: 'post', data })
export const updatePatrolLog = (id: string | number, data: any) => request({ url: `/lifecycle/patrol-log/${id}`, method: 'put', data })
export const delPatrolLog = (ids: string | number) => request({ url: `/lifecycle/patrol-log/${ids}`, method: 'delete' })

// ==================== SOP待办任务 ====================
export const getPondTaskPage = (params: Record<string, any>) => request({ url: '/lifecycle/pond-task/list', method: 'get', params })
export const getPondTaskById = (id: string | number) => request({ url: `/lifecycle/pond-task/${id}`, method: 'get' })
export const checkOffPondTask = (id: string | number) => request({ url: `/lifecycle/pond-task/${id}/check-off`, method: 'put' })
export const batchCheckOffPondTask = (ids: number[]) => request({ url: '/lifecycle/pond-task/batch-check-off', method: 'put', data: ids })
export const delPondTask = (ids: string | number) => request({ url: `/lifecycle/pond-task/${ids}`, method: 'delete' })

// ==================== 投喂换水日志 ====================
export const getPondFeedLogPage = (params: Record<string, any>) => request({ url: '/log/pond-feed-log/list', method: 'get', params })
export const getPondFeedLogById = (id: string | number) => request({ url: `/log/pond-feed-log/${id}`, method: 'get' })
export const addPondFeedLog = (data: any) => request({ url: '/log/pond-feed-log', method: 'post', data })
export const updatePondFeedLog = (id: string | number, data: any) => request({ url: `/log/pond-feed-log/${id}`, method: 'put', data })
export const delPondFeedLog = (ids: string | number) => request({ url: `/log/pond-feed-log/${ids}`, method: 'delete' })

// ==================== 生长死亡抽测记录 ====================
export const getBatchGrowthLogPage = (params: Record<string, any>) => request({ url: '/lifecycle/batch-growth-log/list', method: 'get', params })
export const getBatchGrowthLogById = (id: string | number) => request({ url: `/lifecycle/batch-growth-log/${id}`, method: 'get' })
export const addBatchGrowthLog = (data: any) => request({ url: '/lifecycle/batch-growth-log', method: 'post', data })
export const updateBatchGrowthLog = (id: string | number, data: any) => request({ url: `/lifecycle/batch-growth-log/${id}`, method: 'put', data })
export const delBatchGrowthLog = (ids: string | number) => request({ url: `/lifecycle/batch-growth-log/${ids}`, method: 'delete' })
export const getGrowthChart = (batchNo: string, pondId: number) => request({ url: '/lifecycle/batch-growth-log/growth-chart', method: 'get', params: { batchNo, pondId } })

// ==================== IoT 传感器数据 ====================
export const getLatestSensorData = (pondId: number) => request({ url: '/iot/sensor-data/latest', method: 'get', params: { pondId } })
export const getLatestAllSensorData = (farmId?: number) => request({ url: '/iot/sensor-data/latest/all', method: 'get', params: { farmId } })
export const getSensorDataHistory = (pondId: number, hours?: number) => request({ url: '/iot/sensor-data/history', method: 'get', params: { pondId, hours: hours || 24 } })

// ==================== 告警记录 ====================
export const getAlarmPage = (params: Record<string, any>) => request({ url: '/log/alarm-record/list', method: 'get', params })
export const acknowledgeAlarm = (id: string | number, remark?: string) => request({ url: `/log/alarm-record/${id}/acknowledge`, method: 'put', data: { remark } })
export const startProcessingAlarm = (id: string | number, remark?: string) => request({ url: `/log/alarm-record/${id}/start-processing`, method: 'put', data: { remark } })
export const resolveAlarm = (id: string | number, remark: string) => request({ url: `/log/alarm-record/${id}/resolve`, method: 'put', data: { remark } })
export const closeAlarm = (id: string | number, remark?: string) => request({ url: `/log/alarm-record/${id}/close`, method: 'put', data: { remark } })
export const reopenAlarm = (id: string | number, remark?: string) => request({ url: `/log/alarm-record/${id}/reopen`, method: 'put', data: { remark } })

// ==================== 出塘结算管理 ====================
export const getHarvestPage = (params: Record<string, any>) => request({ url: '/lifecycle/harvest-record/list', method: 'get', params })
export const getHarvestById = (id: string | number) => request({ url: `/lifecycle/harvest-record/${id}`, method: 'get' })
export const addHarvest = (data: any) => request({ url: '/lifecycle/harvest-record', method: 'post', data })
export const updateHarvest = (id: string | number, data: any) => request({ url: `/lifecycle/harvest-record/${id}`, method: 'put', data })
export const delHarvest = (ids: string | number) => request({ url: `/lifecycle/harvest-record/${ids}`, method: 'delete' })
export const getHarvestPreview = (batchId: number) => request({ url: '/lifecycle/harvest-record/preview', method: 'get', params: { batchId } })
export const getFarmerTraceDetail = (batchNo: string) => request({ url: '/lifecycle/trace/detail', method: 'get', params: { batchNo } })

// ==================== 用户个人主页 ====================
export const getUserProfile = () => request({ url: '/user/profile', method: 'get', silent: true } as any)
export const updateUserProfile = (data: any) => request({ url: '/user/profile', method: 'put', data })
export const uploadAvatar = (formData: FormData) => request({ url: '/user/avatar', method: 'post', data: formData, headers: { 'Content-Type': 'multipart/form-data' } })