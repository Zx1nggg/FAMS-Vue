/** 监管方 TypeScript 类型定义 — 对应后端 regulator 模块 VO */

// ========== Dashboard ==========
export interface DashboardStats {
  totalFarms: number
  totalLiveStock: number
  monthlyCertificates: number
  unhandledAlertFarms: number
}

export interface DashboardAlert {
  alarmId: number
  farmId: number
  farmName: string
  pondId: number | null
  alarmCode: string
  title: string
  message: string
  severity: number
  status: number
  occurrenceCount: number
  lastOccurredAt: string
}

export interface DashboardWatchlist {
  farmId: number
  farmName: string
  riskType: string         // 环境异常 / 违规操作 / 死亡率异常
  riskDescription: string
  alarmCount: number
  riskMetric: string
}

// ========== GIS ==========
export interface FarmGeo {
  farmId: number
  farmName: string
  longitude: number
  latitude: number
  address: string
  province: string | null
  pondCount: number
  alertStatus: 'normal' | 'warning' | 'critical'
  activeAlarmCount: number
  mainSpecies: string
  stockCount?: number // 当前存栏原始尾数
  stockAmount: number // 当前存栏万尾数（兼容旧接口）
}

// ========== Trace ==========
export interface TraceChain {
  batchNo: string
  seedlingName: string
  nodes: TraceNode[]
}

export interface TraceNode {
  nodeType: 'supplier' | 'purchase' | 'stocking' | 'growth' | 'patrol' | 'feed' | 'harvest'
  nodeName: string
  nodeTime: string
  detail: Record<string, any>
}

// ========== 分页通用 ==========
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
}
