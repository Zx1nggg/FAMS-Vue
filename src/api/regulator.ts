import request from '@/utils/request'
import type {
  DashboardStats, DashboardAlert, DashboardWatchlist, FarmGeo, TraceChain
} from '@/types/regulator'

// ==================== Dashboard ====================
export const getDashboardStats    = ()                        => request({ url: '/regulator/dashboard/stats', method: 'get' })
export const getDashboardAlerts   = (limit?: number)          => request({ url: '/regulator/dashboard/alerts', method: 'get', params: { limit } })
export const getDashboardWatchlist= (limit?: number)          => request({ url: '/regulator/dashboard/watchlist', method: 'get', params: { limit } })

// ==================== GIS ====================
export const getFarmsGeo = ()                                 => request({ url: '/regulator/farms/geo', method: 'get' })

// ==================== Trace ====================
export const quickTrace  = (keyword: string)                  => request({ url: '/regulator/trace/quick', method: 'get', params: { keyword } })
export const getTraceDetail = (batchNo: string)               => request({ url: '/regulator/trace/detail', method: 'get', params: { batchNo } })
