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