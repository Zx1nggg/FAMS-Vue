<template>
  <div class="min-h-screen bg-slate-100 flex flex-col font-sans">
    
    <!-- 顶部导航栏 (监管端采用沉稳的深石板色系) -->
    <header class="bg-slate-800 text-white h-14 flex items-center justify-between px-6 shadow-md sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <ShieldCheck class="w-5 h-5 text-amber-400" />
        <span class="font-bold text-lg tracking-wide">智渔 FAMS <span class="text-slate-400 text-xs font-normal ml-2">| 政府监管平台</span></span>
      </div>
      
      <div class="flex items-center gap-6 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center font-bold text-xs">王</div>
          <span>农业局王科长</span>
        </div>
        <button @click="handleLogout" class="text-slate-300 hover:text-white transition-colors" title="退出">
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </header>

    <!-- 主体内容区 -->
    <main class="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      <div class="flex justify-between items-end mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 tracking-tight">全区水产养殖宏观态势</h1>
          <p class="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            数据实时同步中 | 截至今日 08:00，已接入全区 128 家标准化养殖场数据。
          </p>
        </div>
        <div class="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
          系统运行状态：<span class="text-emerald-600 font-medium">良好</span>
        </div>
      </div>

      <!-- 宏观统计卡片 (更严谨的边框和布局) -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">入网养殖企业</p>
            <h3 class="text-2xl font-bold text-slate-800">128 <span class="text-xs font-normal text-slate-500">家</span></h3>
          </div>
          <div class="p-2 bg-blue-50 text-blue-600 rounded-md"><Building2 class="w-5 h-5" /></div>
        </div>
        <div class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">当前存栏活体总量</p>
            <h3 class="text-2xl font-bold text-slate-800">1,450 <span class="text-xs font-normal text-slate-500">万尾</span></h3>
          </div>
          <div class="p-2 bg-emerald-50 text-emerald-600 rounded-md"><Fish class="w-5 h-5" /></div>
        </div>
        <div class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">本月下发检疫证明</p>
            <h3 class="text-2xl font-bold text-slate-800">45 <span class="text-xs font-normal text-slate-500">张</span></h3>
          </div>
          <div class="p-2 bg-indigo-50 text-indigo-600 rounded-md"><FileCheck class="w-5 h-5" /></div>
        </div>
        <div class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex items-center justify-between border-b-4 border-b-red-500">
          <div>
            <p class="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">未处理水质预警场区</p>
            <h3 class="text-2xl font-bold text-red-600">3 <span class="text-xs font-normal text-red-400">家</span></h3>
          </div>
          <div class="p-2 bg-red-50 text-red-600 rounded-md"><AlertTriangle class="w-5 h-5" /></div>
        </div>
      </div>

      <!-- 核心功能区 (左侧GIS地图，右侧功能面板) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- 左侧：GIS地图监控 (视觉重心，真实感来源) -->
        <div class="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Map class="w-4 h-4 text-blue-600" />
              辖区水产养殖基地 GIS 态势与物联网地图
            </h2>
            <div class="flex gap-4 text-xs font-medium">
              <span class="flex items-center gap-1.5 text-emerald-600">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> 正常运行: 125
              </span>
              <span class="flex items-center gap-1.5 text-red-500">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> 告警中: 3
              </span>
            </div>
          </div>
          
          <!-- 地图/监控占位区 -->
          <div class="relative w-full h-[500px] bg-slate-200 flex items-center justify-center overflow-hidden">
            <!-- 网格线背景增加科技地图感 -->
            <div class="absolute inset-0" style="background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 20px 20px;"></div>
            
            <!-- 真实图片加载位 -->
            <div class="relative z-10 bg-white/90 backdrop-blur border border-slate-300 px-6 py-4 rounded shadow-sm flex flex-col items-center">
              <Camera class="w-8 h-8 text-slate-400 mb-2" />
              <span class="text-slate-600 font-bold tracking-wide"></span>
              <span class="text-xs text-slate-400 mt-1">此处可在开发时替换为真实百度/高德地图 API 或无人机航拍全景图</span>
            </div>

            <!-- 模拟地图上的预警标 -->
            <div class="absolute top-1/4 left-1/3 flex flex-col items-center animate-bounce">
              <div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
              <div class="mt-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow">高明第三养殖场: 缺氧</div>
            </div>
          </div>
        </div>

        <!-- 右侧：功能与告警面板 -->
        <div class="space-y-6">
          
          <!-- 溯源搜索引擎 -->
          <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div class="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Search class="w-4 h-4 text-amber-500" />
                EPCIS 溯源核查终端
              </h2>
            </div>
            <div class="p-4">
              <p class="text-slate-500 text-xs mb-4">输入批次溯源码，调取其供应商资质、水质历史、检疫证明与合规用药流水账。</p>
              <div class="flex gap-2">
                <input type="text" class="flex-1 pl-3 pr-3 py-2 rounded-md border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm transition-colors bg-slate-50 focus:bg-white" placeholder="批次号 / 溯源码" />
                <button class="bg-slate-800 hover:bg-slate-700 text-white rounded-md px-4 text-sm font-medium transition-colors shadow-sm">
                  查询
                </button>
              </div>
            </div>
          </div>

          <!-- 高风险异常企业列表 -->
          <div class="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col flex-1">
            <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertOctagon class="w-4 h-4 text-red-500" />
                重点监管督办名单
              </h2>
              <span class="text-xs text-slate-400 cursor-pointer hover:text-slate-600">查看全部</span>
            </div>
            
            <div class="p-4 space-y-3">
              <!-- 异常条目 -->
              <div class="border-l-2 border-red-500 bg-red-50/30 p-3 rounded-r-md flex flex-col gap-2">
                <div class="flex justify-between items-start">
                  <h4 class="font-bold text-sm text-slate-800">高明区第三养殖场</h4>
                  <span class="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">环境异常</span>
                </div>
                <p class="text-xs text-slate-600">本周内累计发生 15 次缺氧告警，近期死亡率曲线呈异常上升波动。</p>
                <div class="flex justify-end">
                  <button class="text-xs text-slate-700 font-medium hover:text-blue-600 bg-white px-2 py-1 rounded border border-slate-300 shadow-sm">调阅台账</button>
                </div>
              </div>

              <!-- 异常条目 -->
              <div class="border-l-2 border-amber-500 bg-amber-50/30 p-3 rounded-r-md flex flex-col gap-2">
                <div class="flex justify-between items-start">
                  <h4 class="font-bold text-sm text-slate-800">顺德联丰水产合作社</h4>
                  <span class="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded border border-amber-200">违规操作</span>
                </div>
                <p class="text-xs text-slate-600">昨日入库的南美白对虾批次未上传《产地检疫合格证明》附件。</p>
                <div class="flex justify-end">
                  <button class="text-xs text-slate-700 font-medium hover:text-blue-600 bg-white px-2 py-1 rounded border border-slate-300 shadow-sm">下发整改</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { 
  ShieldCheck, LogOut, Search, AlertOctagon, 
  Map, Building2, Fish, FileCheck, AlertTriangle, Camera
} from 'lucide-vue-next'

const router = useRouter()

const handleLogout = async () => {
  try {
    // 1. 真正通知后端：我要退出了！
    // 这一步会触发后端的拉黑逻辑，并且后端会通过 Response Header 销毁 Cookie
    await axios.post('/auth/logout'); 
    
  } catch (error) {
    console.error('退出请求失败', error);
  } finally {
    // 2. 清理前端自己存的非敏感用户信息（比如昵称、头像）
    sessionStorage.removeItem('aqua_user'); 
    // 注意：不要再去 removeItem('aqua_token') 了，因为你根本摸不到它，交由后端销毁
    
    // 3. 跳转回登录页
    router.push('/login');
  }
}
</script>