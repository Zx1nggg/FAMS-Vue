<template>
  <div class="flex h-screen overflow-hidden bg-slate-100 font-sans">
    <aside class="flex w-64 shrink-0 flex-col bg-slate-950 text-slate-300 shadow-xl">
      <div class="flex h-16 items-center border-b border-slate-800 px-6">
        <span class="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white">
          <img src="/智渔-logo-removebg.png" alt="智渔FAMS" class="h-full w-full object-contain p-1" />
        </span>
        <div>
          <p class="text-sm font-bold text-white">智渔 FAMS</p>
          <p class="text-xs text-slate-500">中枢与运维端</p>
        </div>
      </div>

      <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div v-for="group in menuGroups" :key="group.title">
          <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{{ group.title }}</p>
          <div class="space-y-1">
            <router-link
              v-for="item in group.items"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
              :class="$route.path === item.path ? 'bg-cyan-500/10 text-cyan-300' : 'hover:bg-slate-900 hover:text-white'"
            >
              <component :is="item.icon" class="h-5 w-5" />
              {{ item.name }}
            </router-link>
          </div>
        </div>
      </nav>

      <div class="border-t border-slate-800 bg-slate-950 p-4 text-xs text-slate-500">
        <div class="flex items-center justify-between">
          <span>Admin Console</span>
          <span class="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400">Online</span>
        </div>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div>
          <h1 class="text-lg font-bold text-slate-900">{{ $route.meta.title || '中枢控制台' }}</h1>
          <p class="text-xs text-slate-500">系统账号、入驻流程与基础运行状态统一管理</p>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          @click="handleLogout"
        >
          <LogOut class="h-4 w-4" />
          退出
        </button>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { clearUserCache } from '@/utils/storage'
import { ClipboardCheck, Gauge, LogOut, UsersRound } from 'lucide-vue-next'

const router = useRouter()

const menuGroups = [
  {
    title: '中枢运维',
    items: [
      { name: '运维总览', path: '/admin/dashboard', icon: Gauge },
      { name: '账号运维', path: '/admin/users', icon: UsersRound },
      { name: '入驻审批', path: '/admin/registrations', icon: ClipboardCheck },
    ],
  },
]

async function handleLogout() {
  try {
    await request.post('/auth/logout')
  } catch {
    // ignore
  } finally {
    clearUserCache()
    sessionStorage.removeItem('aqua_user')
    sessionStorage.removeItem('current_farm_id')
    router.push('/login')
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
