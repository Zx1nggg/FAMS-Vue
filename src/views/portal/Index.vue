<template>
  <div class="min-h-screen flex flex-col font-sans relative bg-slate-900 selection:bg-teal-500 selection:text-white">
    
    <!-- 背景层 -->
    <div class="absolute inset-0 z-0 overflow-hidden">
      <div class="absolute inset-0 flex items-center justify-center bg-slate-800">
         <span class="text-slate-500 font-bold tracking-widest text-xl opacity-50">
          <img src="/background.png" class="w-full h-full object-cover" alt="无人机俯拍图" />
         </span>
      </div>
      
      <div class="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-transparent to-blue-900/40"></div>
      <div class="absolute inset-0" style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 30px 30px;"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 w-full border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-sm text-slate-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-white/20 overflow-hidden p-0.5">
            <img src="/华南农业大学-logo.svg" class="w-full h-full object-contain" alt="华农校徽" />
          </div>
          <div>
            <span class="font-bold tracking-widest text-teal-50 text-base block leading-tight">华南农业大学</span>
            <span class="text-teal-300 font-medium tracking-wider text-xs">软件学院 · 软件工程</span>
          </div>
        </div>
        <div class="hidden md:flex items-center gap-6 font-medium text-xs tracking-wider">
          <a href="#" class="hover:text-teal-300 transition-colors flex items-center gap-1"><BookOpen class="w-3 h-3"/> 项目结题报告</a>
          <a href="#" class="hover:text-blue-300 transition-colors flex items-center gap-1"><Network class="w-3 h-3"/> 物联网节点拓扑</a>
          <div class="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
            系统状态：运行良好
          </div>
        </div>
      </div>
    </header>

    <!-- 门户核心内容区 -->
    <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
      
      <!-- 极具科技感与学术感的标题组 -->
      <div class="text-center mb-16 relative">
        <!-- 标题背后的发光光晕 - 蓝绿融合 -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-40 bg-gradient-to-r from-teal-500/20 to-blue-500/20 blur-[100px] pointer-events-none"></div>
      
        <div class="flex items-center justify-center gap-4 mb-4">
          <!-- 产品Logo占位 (新增) -->
           <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-white/20 p-1">
            <img src="/智渔-logo-removebg.png" class="w-full h-full object-contain" alt="智渔logo" />
          </div>
          <h1 class="text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg flex items-center gap-4">
            智渔 <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">FAMS</span>
          </h1>
        </div>

        <p class="text-xl text-slate-300 font-light tracking-widest drop-shadow-md">
          基于 EPCIS 与数字孪生的水产资产全链路管控系统
        </p>
      </div>

      <!-- 卡片组 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        
        <!-- 养殖/产学研基地端 -->
        <div class="bg-slate-900/60 backdrop-blur-md border border-teal-500/30 rounded-2xl p-8 hover:bg-slate-900/80 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden shadow-2xl">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-teal-600"></div>
          <div class="w-14 h-14 bg-teal-500/20 rounded-xl flex items-center justify-center mb-6 border border-teal-500/30 text-teal-400 group-hover:scale-110 transition-transform">
            <Waves class="w-7 h-7" />
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">生产与示范端</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-8 h-20">
            面向华农校外产学研基地与合作社。接入底层物联网传感器，提供数字化池塘巡检、苗种投放及智慧投喂的边缘计算服务。
          </p>
          <button @click="goToLogin('farmer')" class="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold tracking-wider flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.3)]">
            进入基地控制台 <ArrowRight class="w-4 h-4" />
          </button>
        </div>

        <!-- 监管/科研分析端 -->
        <div class="bg-slate-900/60 backdrop-blur-md border border-blue-500/30 rounded-2xl p-8 hover:bg-slate-900/80 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden shadow-2xl">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          
          <div class="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 border border-blue-500/30 text-blue-400 group-hover:scale-110 transition-transform">
            <Activity class="w-7 h-7" />
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">科研与监管端</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-8 h-20">
            面向校内课题组与农业农村局。汇聚区域养殖大数据，提供生长曲线分析、疾病预测模型以及跨基地的全链路溯源图谱。
          </p>
          <button @click="goToLogin('regulator')" class="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wider flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            进入科研监管大屏 <ArrowRight class="w-4 h-4" />
          </button>
        </div>

        <!-- 系统与设备运维端 -->
        <div class="bg-slate-900/60 backdrop-blur-md border border-slate-500/30 rounded-2xl p-8 hover:bg-slate-900/80 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden shadow-2xl">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-600 to-blue-600"></div>
          <div class="w-14 h-14 bg-slate-500/20 rounded-xl flex items-center justify-center mb-6 border border-slate-500/30 text-slate-300 group-hover:scale-110 transition-transform">
            <Cpu class="w-7 h-7" />
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">中枢与运维端</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-8 h-20">
            面向实验室 IT 团队。管理系统RBAC权限网络、配置生物学阈值字典（温/氧/pH）以及调度底层硬件设备的接入协议。
          </p>
          <button @click="goToLogin('admin')" class="w-full py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg">
            进入底层运维中心 <ArrowRight class="w-4 h-4" />
          </button>
        </div>

      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 w-full py-6 bg-black/40 backdrop-blur-md border-t border-white/10 text-center">
      <p class="text-xs text-slate-400 mb-1 tracking-wider">
        Copyright © 2026 华南农业大学 软件工程学院 研制 | 导师：XXX教授
      </p>
      <p class="text-xs text-slate-500 tracking-wider">
        FAMS (Fishery Asset Management System) v1.0
      </p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Waves, Activity, Cpu, ArrowRight, BookOpen, Network, Radio } from 'lucide-vue-next'

const router = useRouter()

const goToLogin = (roleType) => {
  router.push({ path: '/login', query: { role: roleType } })
}
</script>