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