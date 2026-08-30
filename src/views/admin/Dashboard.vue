<template>
  <div class="space-y-5">
    <section class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div v-for="card in cards" :key="card.label" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-slate-500">{{ card.label }}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ card.value }}</p>
          </div>
          <component :is="card.icon" :class="['h-6 w-6', card.color]" />
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">账号结构</h2>
          <button class="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50" @click="loadData">刷新</button>
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div v-for="item in roleStats" :key="item.type" class="rounded-md border border-slate-100 bg-slate-50 p-4">
            <p class="text-xs text-slate-500">{{ item.label }}</p>
            <p class="mt-2 text-xl font-bold text-slate-900">{{ item.count }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="mb-4 text-sm font-bold text-slate-800">待办提醒</h2>
        <div class="space-y-3 text-sm">
          <router-link to="/admin/registrations" class="flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 text-amber-800 hover:bg-amber-100">
            <span>待审批入驻申请</span>
            <span class="font-bold">{{ pendingRegistrations }}</span>
          </router-link>
          <router-link to="/admin/users" class="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-slate-700 hover:bg-slate-100">
            <span>账号状态巡检</span>
            <span class="font-bold">{{ disabledUsers }} 停用</span>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CheckCircle2, Clock3, Shield, UsersRound } from 'lucide-vue-next'
import { getAdminRegistrations, getAdminUsers } from '@/api/admin'

const users = ref<any[]>([])
const totalUsers = ref(0)
const pendingRegistrations = ref(0)

const disabledUsers = computed(() => users.value.filter(item => item.status === 0).length)
const roleStats = computed(() => [
  { type: 'ADMIN', label: '管理员', count: users.value.filter(item => item.userType === 'ADMIN').length },
  { type: 'REGULATOR', label: '监管方', count: users.value.filter(item => item.userType === 'REGULATOR').length },
  { type: 'FARMER', label: '养殖户', count: users.value.filter(item => item.userType === 'FARMER').length },
])

const cards = computed(() => [
  { label: '系统账号', value: totalUsers.value, icon: UsersRound, color: 'text-cyan-600' },
  { label: '待审批申请', value: pendingRegistrations.value, icon: Clock3, color: 'text-amber-600' },
  { label: '启用账号', value: users.value.filter(item => item.status === 1).length, icon: CheckCircle2, color: 'text-emerald-600' },
  { label: '管理角色', value: roleStats.value.filter(item => item.count > 0).length, icon: Shield, color: 'text-slate-600' },
])

async function loadData() {
  const [userRes, pendingRes] = await Promise.all([
    getAdminUsers({ pageNum: 1, pageSize: 100 }),
    getAdminRegistrations({ pageNum: 1, pageSize: 1, status: 0 }),
  ])
  users.value = userRes.data.records || []
  totalUsers.value = userRes.data.total || 0
  pendingRegistrations.value = pendingRes.data.total || 0
}

onMounted(loadData)
</script>
