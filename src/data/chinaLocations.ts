type City = {
  name: string
  longitude: number
  latitude: number
}

type Province = {
  name: string
  cities: City[]
}

export const CHINA_LOCATION_TREE: Province[] = [
  { name: '北京市', cities: [{ name: '北京市', longitude: 116.4074, latitude: 39.9042 }] },
  { name: '天津市', cities: [{ name: '天津市', longitude: 117.2000, latitude: 39.1333 }] },
  { name: '上海市', cities: [{ name: '上海市', longitude: 121.4737, latitude: 31.2304 }] },
  { name: '重庆市', cities: [{ name: '重庆市', longitude: 106.5516, latitude: 29.5630 }] },
  { name: '河北省', cities: [
    { name: '石家庄市', longitude: 114.5149, latitude: 38.0428 },
    { name: '唐山市', longitude: 118.1802, latitude: 39.6309 },
    { name: '秦皇岛市', longitude: 119.6005, latitude: 39.9354 },
    { name: '沧州市', longitude: 116.8388, latitude: 38.3044 },
    { name: '邯郸市', longitude: 114.5391, latitude: 36.6256 },
    { name: '保定市', longitude: 115.4646, latitude: 38.8739 },
  ] },
  { name: '山西省', cities: [
    { name: '太原市', longitude: 112.5492, latitude: 37.8706 },
    { name: '大同市', longitude: 113.3000, latitude: 40.0768 },
    { name: '长治市', longitude: 113.1163, latitude: 36.1954 },
    { name: '运城市', longitude: 111.0075, latitude: 35.0264 },
    { name: '临汾市', longitude: 111.5190, latitude: 36.0880 },
  ] },
  { name: '内蒙古自治区', cities: [
    { name: '呼和浩特市', longitude: 111.7492, latitude: 40.8426 },
    { name: '包头市', longitude: 109.8403, latitude: 40.6574 },
    { name: '赤峰市', longitude: 118.8876, latitude: 42.2569 },
    { name: '通辽市', longitude: 122.2434, latitude: 43.6529 },
    { name: '鄂尔多斯市', longitude: 109.7813, latitude: 39.6083 },
    { name: '呼伦贝尔市', longitude: 119.7658, latitude: 49.2116 },
  ] },
  { name: '辽宁省', cities: [
    { name: '沈阳市', longitude: 123.4315, latitude: 41.8057 },
    { name: '大连市', longitude: 121.6147, latitude: 38.9140 },
    { name: '丹东市', longitude: 124.3547, latitude: 40.0005 },
    { name: '锦州市', longitude: 121.1269, latitude: 41.0951 },
    { name: '营口市', longitude: 122.2354, latitude: 40.6674 },
  ] },
  { name: '吉林省', cities: [
    { name: '长春市', longitude: 125.3235, latitude: 43.8171 },
    { name: '吉林市', longitude: 126.5494, latitude: 43.8378 },
    { name: '四平市', longitude: 124.3504, latitude: 43.1664 },
    { name: '通化市', longitude: 125.9399, latitude: 41.7283 },
    { name: '延边朝鲜族自治州', longitude: 129.5091, latitude: 42.8912 },
  ] },
  { name: '黑龙江省', cities: [
    { name: '哈尔滨市', longitude: 126.5349, latitude: 45.8038 },
    { name: '齐齐哈尔市', longitude: 123.9182, latitude: 47.3543 },
    { name: '牡丹江市', longitude: 129.6332, latitude: 44.5517 },
    { name: '佳木斯市', longitude: 130.3189, latitude: 46.7999 },
    { name: '大庆市', longitude: 125.1038, latitude: 46.5893 },
  ] },
  { name: '江苏省', cities: [
    { name: '南京市', longitude: 118.7969, latitude: 32.0603 },
    { name: '苏州市', longitude: 120.5853, latitude: 31.2989 },
    { name: '无锡市', longitude: 120.3119, latitude: 31.4912 },
    { name: '常州市', longitude: 119.9741, latitude: 31.8112 },
    { name: '南通市', longitude: 120.8943, latitude: 31.9802 },
    { name: '盐城市', longitude: 120.1626, latitude: 33.3482 },
    { name: '连云港市', longitude: 119.2216, latitude: 34.5967 },
  ] },
  { name: '浙江省', cities: [
    { name: '杭州市', longitude: 120.1551, latitude: 30.2741 },
    { name: '宁波市', longitude: 121.5503, latitude: 29.8746 },
    { name: '温州市', longitude: 120.6994, latitude: 27.9949 },
    { name: '嘉兴市', longitude: 120.7555, latitude: 30.7461 },
    { name: '湖州市', longitude: 120.1024, latitude: 30.8672 },
    { name: '舟山市', longitude: 122.2072, latitude: 29.9853 },
    { name: '台州市', longitude: 121.4208, latitude: 28.6564 },
  ] },
  { name: '安徽省', cities: [
    { name: '合肥市', longitude: 117.2272, latitude: 31.8206 },
    { name: '芜湖市', longitude: 118.4331, latitude: 31.3525 },
    { name: '蚌埠市', longitude: 117.3897, latitude: 32.9163 },
    { name: '安庆市', longitude: 117.0638, latitude: 30.5435 },
    { name: '黄山市', longitude: 118.3376, latitude: 29.7147 },
  ] },
  { name: '福建省', cities: [
    { name: '福州市', longitude: 119.2965, latitude: 26.0745 },
    { name: '厦门市', longitude: 118.0894, latitude: 24.4798 },
    { name: '泉州市', longitude: 118.6759, latitude: 24.8741 },
    { name: '漳州市', longitude: 117.6471, latitude: 24.5130 },
    { name: '莆田市', longitude: 119.0077, latitude: 25.4540 },
    { name: '宁德市', longitude: 119.5482, latitude: 26.6656 },
  ] },
  { name: '江西省', cities: [
    { name: '南昌市', longitude: 115.8582, latitude: 28.6829 },
    { name: '九江市', longitude: 115.9928, latitude: 29.7120 },
    { name: '赣州市', longitude: 114.9350, latitude: 25.8311 },
    { name: '上饶市', longitude: 117.9434, latitude: 28.4549 },
    { name: '宜春市', longitude: 114.4161, latitude: 27.8157 },
  ] },
  { name: '山东省', cities: [
    { name: '济南市', longitude: 117.1201, latitude: 36.6512 },
    { name: '青岛市', longitude: 120.3826, latitude: 36.0671 },
    { name: '烟台市', longitude: 121.4479, latitude: 37.4638 },
    { name: '威海市', longitude: 122.1204, latitude: 37.5131 },
    { name: '潍坊市', longitude: 119.1618, latitude: 36.7068 },
    { name: '日照市', longitude: 119.5269, latitude: 35.4164 },
  ] },
  { name: '河南省', cities: [
    { name: '郑州市', longitude: 113.6254, latitude: 34.7466 },
    { name: '洛阳市', longitude: 112.4536, latitude: 34.6197 },
    { name: '开封市', longitude: 114.3076, latitude: 34.7972 },
    { name: '南阳市', longitude: 112.5283, latitude: 32.9908 },
    { name: '信阳市', longitude: 114.0913, latitude: 32.1470 },
  ] },
  { name: '湖北省', cities: [
    { name: '武汉市', longitude: 114.3054, latitude: 30.5931 },
    { name: '宜昌市', longitude: 111.2865, latitude: 30.6919 },
    { name: '襄阳市', longitude: 112.1224, latitude: 32.0090 },
    { name: '荆州市', longitude: 112.2397, latitude: 30.3352 },
    { name: '黄冈市', longitude: 114.8724, latitude: 30.4537 },
  ] },
  { name: '湖南省', cities: [
    { name: '长沙市', longitude: 112.9388, latitude: 28.2282 },
    { name: '株洲市', longitude: 113.1340, latitude: 27.8274 },
    { name: '湘潭市', longitude: 112.9454, latitude: 27.8313 },
    { name: '岳阳市', longitude: 113.1289, latitude: 29.3571 },
    { name: '常德市', longitude: 111.6985, latitude: 29.0316 },
  ] },
  { name: '广东省', cities: [
    { name: '广州市', longitude: 113.2644, latitude: 23.1291 },
    { name: '深圳市', longitude: 114.0579, latitude: 22.5431 },
    { name: '珠海市', longitude: 113.5767, latitude: 22.2707 },
    { name: '汕头市', longitude: 116.6819, latitude: 23.3541 },
    { name: '佛山市', longitude: 113.1214, latitude: 23.0215 },
    { name: '江门市', longitude: 113.0819, latitude: 22.5787 },
    { name: '湛江市', longitude: 110.3594, latitude: 21.2707 },
    { name: '茂名市', longitude: 110.9255, latitude: 21.6627 },
    { name: '肇庆市', longitude: 112.4651, latitude: 23.0472 },
    { name: '惠州市', longitude: 114.4168, latitude: 23.1115 },
    { name: '东莞市', longitude: 113.7518, latitude: 23.0207 },
    { name: '中山市', longitude: 113.3926, latitude: 22.5176 },
    { name: '阳江市', longitude: 111.9822, latitude: 21.8579 },
    { name: '清远市', longitude: 113.0560, latitude: 23.6820 },
  ] },
  { name: '广西壮族自治区', cities: [
    { name: '南宁市', longitude: 108.3669, latitude: 22.8170 },
    { name: '柳州市', longitude: 109.4281, latitude: 24.3264 },
    { name: '桂林市', longitude: 110.2900, latitude: 25.2736 },
    { name: '北海市', longitude: 109.1201, latitude: 21.4813 },
    { name: '钦州市', longitude: 108.6543, latitude: 21.9809 },
    { name: '防城港市', longitude: 108.3547, latitude: 21.6867 },
  ] },
  { name: '海南省', cities: [
    { name: '海口市', longitude: 110.1983, latitude: 20.0440 },
    { name: '三亚市', longitude: 109.5119, latitude: 18.2528 },
    { name: '儋州市', longitude: 109.5808, latitude: 19.5209 },
    { name: '文昌市', longitude: 110.7977, latitude: 19.5433 },
    { name: '琼海市', longitude: 110.4745, latitude: 19.2591 },
  ] },
  { name: '四川省', cities: [
    { name: '成都市', longitude: 104.0665, latitude: 30.5723 },
    { name: '绵阳市', longitude: 104.6791, latitude: 31.4675 },
    { name: '德阳市', longitude: 104.3978, latitude: 31.1268 },
    { name: '乐山市', longitude: 103.7656, latitude: 29.5521 },
    { name: '南充市', longitude: 106.1107, latitude: 30.8378 },
  ] },
  { name: '贵州省', cities: [
    { name: '贵阳市', longitude: 106.6302, latitude: 26.6470 },
    { name: '遵义市', longitude: 106.9274, latitude: 27.7257 },
    { name: '六盘水市', longitude: 104.8304, latitude: 26.5927 },
    { name: '安顺市', longitude: 105.9476, latitude: 26.2531 },
    { name: '毕节市', longitude: 105.2850, latitude: 27.3017 },
  ] },
  { name: '云南省', cities: [
    { name: '昆明市', longitude: 102.8329, latitude: 24.8801 },
    { name: '曲靖市', longitude: 103.7962, latitude: 25.4900 },
    { name: '玉溪市', longitude: 102.5465, latitude: 24.3520 },
    { name: '大理白族自治州', longitude: 100.2676, latitude: 25.6065 },
    { name: '红河哈尼族彝族自治州', longitude: 103.3748, latitude: 23.3631 },
    { name: '西双版纳傣族自治州', longitude: 100.7979, latitude: 22.0094 },
  ] },
  { name: '西藏自治区', cities: [
    { name: '拉萨市', longitude: 91.1409, latitude: 29.6456 },
    { name: '日喀则市', longitude: 88.8851, latitude: 29.2675 },
    { name: '昌都市', longitude: 97.1720, latitude: 31.1406 },
    { name: '林芝市', longitude: 94.3615, latitude: 29.6489 },
  ] },
  { name: '陕西省', cities: [
    { name: '西安市', longitude: 108.9398, latitude: 34.3416 },
    { name: '宝鸡市', longitude: 107.2377, latitude: 34.3619 },
    { name: '咸阳市', longitude: 108.7088, latitude: 34.3299 },
    { name: '渭南市', longitude: 109.4709, latitude: 34.5206 },
    { name: '汉中市', longitude: 107.0231, latitude: 33.0676 },
  ] },
  { name: '甘肃省', cities: [
    { name: '兰州市', longitude: 103.8343, latitude: 36.0611 },
    { name: '天水市', longitude: 105.7249, latitude: 34.5809 },
    { name: '酒泉市', longitude: 98.4939, latitude: 39.7328 },
    { name: '张掖市', longitude: 100.4498, latitude: 38.9259 },
    { name: '庆阳市', longitude: 107.6384, latitude: 35.7342 },
  ] },
  { name: '青海省', cities: [
    { name: '西宁市', longitude: 101.7782, latitude: 36.6171 },
    { name: '海东市', longitude: 102.1033, latitude: 36.5029 },
    { name: '海西蒙古族藏族自治州', longitude: 97.3708, latitude: 37.3747 },
    { name: '海南藏族自治州', longitude: 100.6204, latitude: 36.2864 },
  ] },
  { name: '宁夏回族自治区', cities: [
    { name: '银川市', longitude: 106.2309, latitude: 38.4872 },
    { name: '石嘴山市', longitude: 106.3833, latitude: 38.9833 },
    { name: '吴忠市', longitude: 106.1988, latitude: 37.9976 },
    { name: '固原市', longitude: 106.2426, latitude: 36.0163 },
    { name: '中卫市', longitude: 105.1968, latitude: 37.5002 },
  ] },
  { name: '新疆维吾尔自治区', cities: [
    { name: '乌鲁木齐市', longitude: 87.6168, latitude: 43.8256 },
    { name: '克拉玛依市', longitude: 84.8892, latitude: 45.5799 },
    { name: '吐鲁番市', longitude: 89.1895, latitude: 42.9513 },
    { name: '哈密市', longitude: 93.5150, latitude: 42.8193 },
    { name: '喀什地区', longitude: 75.9898, latitude: 39.4704 },
    { name: '伊犁哈萨克自治州', longitude: 81.3241, latitude: 43.9169 },
  ] },
  { name: '台湾省', cities: [
    { name: '台北市', longitude: 121.5654, latitude: 25.0330 },
    { name: '高雄市', longitude: 120.3014, latitude: 22.6273 },
    { name: '台中市', longitude: 120.6736, latitude: 24.1477 },
    { name: '台南市', longitude: 120.2270, latitude: 22.9999 },
  ] },
  { name: '香港特别行政区', cities: [{ name: '香港特别行政区', longitude: 114.1694, latitude: 22.3193 }] },
  { name: '澳门特别行政区', cities: [{ name: '澳门特别行政区', longitude: 113.5439, latitude: 22.1987 }] },
]

export function resolveApproxFarmCoordinate(provinceName: string, cityName: string, seedText: string) {
  const city = CHINA_LOCATION_TREE
    .find(province => province.name === provinceName)
    ?.cities.find(item => item.name === cityName)

  if (!city) return { longitude: null, latitude: null }

  const seed = Array.from(seedText || `${provinceName}${cityName}`).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const lngOffset = (((seed % 21) - 10) / 1000)
  const latOffset = ((((seed * 7) % 21) - 10) / 1000)

  return {
    longitude: Number((city.longitude + lngOffset).toFixed(7)),
    latitude: Number((city.latitude + latOffset).toFixed(7)),
  }
}
