/**
 * GIS 地图模拟数据 —— 全国主要水产养殖省份及养殖场分布
 *
 * 坐标采用 WGS84 (EPSG:4326)，与 DataV GeoAtlas GeoJSON 坐标系统一致。
 * 省份名称必须与 GeoJSON properties.name 完全匹配，否则 ECharts data 无法关联到地图区块。
 */

// ── 类型定义 ──────────────────────────────────────────────
export interface FarmData {
  id: string
  name: string
  city: string
  province: string
  lng: number
  lat: number
  status: 'normal' | 'alert' | 'warning'
  species: string       // 主要养殖品种
  stock: number         // 存栏量（万尾）
  alertCount?: number   // 本月告警次数
  alertReason?: string  // 告警原因
}

// ── 全国各省养殖场数量（用于省级区块着色） ────────────────
export const provinceFarmCounts: { name: string; value: number; alertCount: number }[] = [
  { name: '广东省',            value: 28, alertCount: 1 },
  { name: '山东省',            value: 32, alertCount: 1 },
  { name: '江苏省',            value: 19, alertCount: 0 },
  { name: '浙江省',            value: 22, alertCount: 1 },
  { name: '福建省',            value: 25, alertCount: 0 },
  { name: '海南省',            value: 16, alertCount: 0 },
  { name: '辽宁省',            value: 11, alertCount: 0 },
  { name: '广西壮族自治区',    value:  7, alertCount: 0 },
]

// ── 全部养殖场明细 ────────────────────────────────────────
export const allFarms: FarmData[] = [
  // ==================== 广东省 (28 家) ====================
  { id: 'GD-01', name: '湛江恒兴对虾养殖基地',    city: '湛江市', province: '广东省', lng: 110.359, lat: 21.271, status: 'normal',  species: '南美白对虾', stock: 180 },
  { id: 'GD-02', name: '湛江国联水产联合养殖场',  city: '湛江市', province: '广东省', lng: 110.382, lat: 21.195, status: 'normal',  species: '南美白对虾', stock: 220 },
  { id: 'GD-03', name: '阳江海陵岛深海网箱基地',  city: '阳江市', province: '广东省', lng: 111.983, lat: 21.858, status: 'normal',  species: '金鲳鱼',     stock:  95 },
  { id: 'GD-04', name: '阳江程村蚝养殖合作社',    city: '阳江市', province: '广东省', lng: 111.724, lat: 21.752, status: 'normal',  species: '近江牡蛎',   stock: 350 },
  { id: 'GD-05', name: '珠海斗门海鲈养殖基地',    city: '珠海市', province: '广东省', lng: 113.577, lat: 22.271, status: 'normal',  species: '加州鲈鱼',   stock: 130 },
  { id: 'GD-06', name: '汕头南澳鲍鱼养殖场',      city: '汕头市', province: '广东省', lng: 116.682, lat: 23.354, status: 'normal',  species: '皱纹盘鲍',   stock:  45 },
  { id: 'GD-07', name: '汕尾马宫港养殖基地',      city: '汕尾市', province: '广东省', lng: 115.375, lat: 22.787, status: 'normal',  species: '石斑鱼',     stock:  72 },
  { id: 'GD-08', name: '惠东巽寮湾海水养殖场',    city: '惠州市', province: '广东省', lng: 114.785, lat: 22.688, status: 'normal',  species: '军曹鱼',     stock:  60 },

  // ==================== 山东省 (32 家) ====================
  { id: 'SD-01', name: '青岛黄岛贝类养殖基地',    city: '青岛市', province: '山东省', lng: 120.039, lat: 35.962, status: 'normal',  species: '蛤蜊',       stock: 400 },
  { id: 'SD-02', name: '青岛即墨海参养殖场',      city: '青岛市', province: '山东省', lng: 120.452, lat: 36.389, status: 'normal',  species: '刺参',       stock:  35 },
  { id: 'SD-03', name: '烟台长岛扇贝养殖基地',    city: '烟台市', province: '山东省', lng: 120.737, lat: 37.921, status: 'normal',  species: '虾夷扇贝',   stock: 280 },
  { id: 'SD-04', name: '烟台莱州大菱鲆养殖场',    city: '烟台市', province: '山东省', lng: 119.942, lat: 37.177, status: 'alert',   species: '大菱鲆',     stock:  28, alertCount: 12, alertReason: '连续 3 日溶解氧低于 4mg/L，幼鱼出现浮头现象' },
  { id: 'SD-05', name: '威海荣成海带养殖联合体',  city: '威海市', province: '山东省', lng: 122.486, lat: 37.165, status: 'normal',  species: '海带',       stock: 600 },
  { id: 'SD-06', name: '威海乳山牡蛎养殖基地',    city: '威海市', province: '山东省', lng: 121.536, lat: 36.920, status: 'normal',  species: '太平洋牡蛎', stock: 320 },
  { id: 'SD-07', name: '日照岚山海产养殖场',      city: '日照市', province: '山东省', lng: 119.319, lat: 35.119, status: 'normal',  species: '中国对虾',   stock: 150 },
  { id: 'SD-08', name: '潍坊滨海现代渔业园区',    city: '潍坊市', province: '山东省', lng: 119.162, lat: 37.026, status: 'normal',  species: '南美白对虾', stock: 200 },

  // ==================== 江苏省 (19 家) ====================
  { id: 'JS-01', name: '连云港赣榆梭子蟹基地',    city: '连云港市', province: '江苏省', lng: 119.178, lat: 34.842, status: 'normal',  species: '三疣梭子蟹', stock:  80 },
  { id: 'JS-02', name: '盐城大丰银鲫养殖场',      city: '盐城市', province: '江苏省', lng: 120.461, lat: 33.249, status: 'normal',  species: '异育银鲫',   stock: 260 },
  { id: 'JS-03', name: '盐城射阳河蟹养殖基地',    city: '盐城市', province: '江苏省', lng: 120.258, lat: 33.776, status: 'normal',  species: '中华绒螯蟹', stock: 110 },
  { id: 'JS-04', name: '南通如东紫菜养殖场',      city: '南通市', province: '江苏省', lng: 121.186, lat: 32.331, status: 'normal',  species: '条斑紫菜',   stock: 420 },
  { id: 'JS-05', name: '苏州阳澄湖大闸蟹基地',    city: '苏州市', province: '江苏省', lng: 120.802, lat: 31.421, status: 'normal',  species: '中华绒螯蟹', stock:  65 },
  { id: 'JS-06', name: '苏州吴江加州鲈基地',      city: '苏州市', province: '江苏省', lng: 120.658, lat: 31.136, status: 'normal',  species: '加州鲈鱼',   stock:  90 },

  // ==================== 浙江省 (22 家) ====================
  { id: 'ZJ-01', name: '宁波象山大黄鱼养殖基地',  city: '宁波市', province: '浙江省', lng: 121.869, lat: 29.475, status: 'normal',  species: '大黄鱼',     stock: 170 },
  { id: 'ZJ-02', name: '宁波宁海青蟹养殖场',      city: '宁波市', province: '浙江省', lng: 121.429, lat: 29.289, status: 'normal',  species: '拟穴青蟹',   stock:  55 },
  { id: 'ZJ-03', name: '舟山普陀贻贝养殖基地',    city: '舟山市', province: '浙江省', lng: 122.304, lat: 29.949, status: 'warning', species: '厚壳贻贝',   stock: 310, alertCount: 3, alertReason: '近期海水温度异常偏高，贻贝附着率下降' },
  { id: 'ZJ-04', name: '舟山嵊泗深海养殖基地',    city: '舟山市', province: '浙江省', lng: 122.451, lat: 30.720, status: 'normal',  species: '大黄鱼',     stock: 200 },
  { id: 'ZJ-05', name: '温州乐清泥蚶养殖合作社',  city: '温州市', province: '浙江省', lng: 120.966, lat: 28.120, status: 'normal',  species: '泥蚶',       stock: 230 },
  { id: 'ZJ-06', name: '温州苍南紫菜养殖基地',    city: '温州市', province: '浙江省', lng: 120.402, lat: 27.325, status: 'alert',   species: '坛紫菜',     stock: 180, alertCount: 8, alertReason: '赤潮预警，藻类毒素检测值接近临界值' },
  { id: 'ZJ-07', name: '台州三门青蟹养殖基地',    city: '台州市', province: '浙江省', lng: 121.586, lat: 29.104, status: 'normal',  species: '拟穴青蟹',   stock:  70 },

  // ==================== 福建省 (25 家) ====================
  { id: 'FJ-01', name: '福州连江鲍鱼养殖基地',    city: '福州市', province: '福建省', lng: 119.539, lat: 26.197, status: 'normal',  species: '皱纹盘鲍',   stock:  50 },
  { id: 'FJ-02', name: '福州福清鳗鱼养殖场',      city: '福州市', province: '福建省', lng: 119.384, lat: 25.723, status: 'normal',  species: '日本鳗鲡',   stock:  38 },
  { id: 'FJ-03', name: '厦门同安对虾养殖基地',    city: '厦门市', province: '福建省', lng: 118.151, lat: 24.727, status: 'normal',  species: '南美白对虾', stock: 120 },
  { id: 'FJ-04', name: '泉州石狮海产养殖场',      city: '泉州市', province: '福建省', lng: 118.716, lat: 24.736, status: 'normal',  species: '花蛤',       stock: 290 },
  { id: 'FJ-05', name: '泉州惠安牡蛎养殖基地',    city: '泉州市', province: '福建省', lng: 118.797, lat: 25.031, status: 'normal',  species: '太平洋牡蛎', stock: 340 },
  { id: 'FJ-06', name: '漳州东山湾巴非蛤基地',    city: '漳州市', province: '福建省', lng: 117.422, lat: 23.698, status: 'normal',  species: '巴非蛤',     stock: 260 },
  { id: 'FJ-07', name: '漳州龙海对虾养殖场',      city: '漳州市', province: '福建省', lng: 117.822, lat: 24.447, status: 'normal',  species: '斑节对虾',   stock:  88 },
  { id: 'FJ-08', name: '宁德霞浦海带养殖合作社',  city: '宁德市', province: '福建省', lng: 120.005, lat: 26.882, status: 'normal',  species: '海带',       stock: 520 },

  // ==================== 海南省 (16 家) ====================
  { id: 'HN-01', name: '海口东寨港虾苗繁育基地',  city: '海口市', province: '海南省', lng: 110.569, lat: 19.981, status: 'normal',  species: '南美白对虾', stock: 45 },
  { id: 'HN-02', name: '三亚崖州湾深海养殖基地',  city: '三亚市', province: '海南省', lng: 109.172, lat: 18.371, status: 'normal',  species: '石斑鱼',     stock: 65 },
  { id: 'HN-03', name: '文昌冯家湾现代渔业园',    city: '文昌市', province: '海南省', lng: 110.797, lat: 19.544, status: 'normal',  species: '东风螺',     stock: 120 },
  { id: 'HN-04', name: '琼海潭门港海水养殖场',    city: '琼海市', province: '海南省', lng: 110.617, lat: 19.243, status: 'normal',  species: '和乐蟹',     stock: 40 },
  { id: 'HN-05', name: '万宁港北海产养殖基地',    city: '万宁市', province: '海南省', lng: 110.397, lat: 18.795, status: 'normal',  species: '石斑鱼',     stock: 55 },
  { id: 'HN-06', name: '陵水新村港网箱养殖场',    city: '陵水黎族自治县', province: '海南省', lng: 110.022, lat: 18.411, status: 'normal', species: '金鲳鱼', stock: 85 },

  // ==================== 辽宁省 (11 家) ====================
  { id: 'LN-01', name: '大连长海县海参养殖基地',  city: '大连市', province: '辽宁省', lng: 122.588, lat: 39.274, status: 'normal',  species: '刺参',       stock: 42 },
  { id: 'LN-02', name: '大连庄河贝类养殖场',      city: '大连市', province: '辽宁省', lng: 122.966, lat: 39.684, status: 'normal',  species: '蛤蜊',       stock: 310 },
  { id: 'LN-03', name: '丹东东港海蜇养殖基地',    city: '丹东市', province: '辽宁省', lng: 124.150, lat: 39.883, status: 'normal',  species: '海蜇',       stock: 180 },
  { id: 'LN-04', name: '营口鲅鱼圈海产养殖场',    city: '营口市', province: '辽宁省', lng: 122.129, lat: 40.229, status: 'normal',  species: '中国对虾',   stock: 95 },
  { id: 'LN-05', name: '葫芦岛兴城多宝鱼基地',    city: '葫芦岛市', province: '辽宁省', lng: 120.760, lat: 40.563, status: 'normal', species: '大菱鲆',   stock: 30 },

  // ==================== 广西壮族自治区 (7 家) ====================
  { id: 'GX-01', name: '北海铁山港对虾养殖基地',  city: '北海市', province: '广西壮族自治区', lng: 109.507, lat: 21.502, status: 'normal', species: '南美白对虾', stock: 135 },
  { id: 'GX-02', name: '北海营盘珍珠养殖基地',    city: '北海市', province: '广西壮族自治区', lng: 109.218, lat: 21.455, status: 'normal', species: '马氏珠母贝', stock: 65 },
  { id: 'GX-03', name: '防城港企沙海产养殖场',    city: '防城港市', province: '广西壮族自治区', lng: 108.477, lat: 21.587, status: 'normal', species: '近江牡蛎', stock: 210 },
  { id: 'GX-04', name: '钦州茅尾海大蚝养殖基地',  city: '钦州市', province: '广西壮族自治区', lng: 108.614, lat: 21.895, status: 'normal', species: '近江牡蛎', stock: 280 },
]

// ── 工具函数 ──────────────────────────────────────────────

/** 按省份筛选养殖场 */
export function getFarmsByProvince(province: string): FarmData[] {
  return allFarms.filter(f => f.province === province)
}

/** 获取某省各状态的养殖场 */
export function getFarmsByStatus(province: string) {
  const farms = getFarmsByProvince(province)
  return {
    normal:  farms.filter(f => f.status === 'normal'),
    warning: farms.filter(f => f.status === 'warning'),
    alert:   farms.filter(f => f.status === 'alert'),
  }
}

/** 全国告警养殖场（用于省级地图的涟漪散点） */
export const nationalAlertFarms = allFarms.filter(f => f.status === 'alert')

/** 属于有养殖场入驻的省份集合 */
export const activeProvinces = new Set(provinceFarmCounts.map(p => p.name))

// ── DataV GeoAtlas adcode 映射 ────────────────────────────
export const PROVINCE_ADCODE: Record<string, string> = {
  '广东省':             '440000',
  '山东省':             '370000',
  '江苏省':             '320000',
  '浙江省':             '330000',
  '福建省':             '350000',
  '海南省':             '460000',
  '辽宁省':             '210000',
  '广西壮族自治区':     '450000',
}
