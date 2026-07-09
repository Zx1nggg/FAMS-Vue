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
  riskType: string
  riskDescription: string
  alarmCount: number
  riskMetric: string
}

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
  stockCount?: number
  stockAmount: number
}

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

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
}

export interface AlertStats {
  totalCount: number
  activeCount: number
  pendingCount: number
  processingCount: number
  resolvedCount: number
  criticalCount: number
  todayNewCount: number
  byType: Record<string, number>
  byLevel: Record<string, number>
}

export interface AlertItem {
  id: number
  farmId: number
  farmName?: string
  pondId?: number | null
  pondName?: string
  alarmCode: string
  title: string
  message: string
  sourceType: string
  severity: number
  status: number
  metricCode?: string
  triggerValue?: number
  thresholdOperator?: string
  thresholdValue?: number
  thresholdValueHigh?: number
  metricUnit?: string
  occurrenceCount: number
  firstOccurredAt?: string
  lastOccurredAt?: string
  createdAt?: string
  resolutionRemark?: string
}

export interface AlertTrend {
  date: string
  totalCount: number
  criticalCount: number
  warningCount: number
  infoCount: number
}

export interface IotRealtimeAlert {
  pondId: number
  pondName: string
  farmId: number
  farmName: string
  waterTemp?: number
  doLevel?: number
  phLevel?: number
  alertField: 'waterTemp' | 'doLevel' | 'phLevel'
  currentValue: number
  thresholdMin?: number
  thresholdMax?: number
  dataTime: string
}