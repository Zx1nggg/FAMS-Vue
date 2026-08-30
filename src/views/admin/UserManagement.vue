<template>
  <div class="space-y-4">
    <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
        <input
          v-model="query.keyword"
          class="h-9 rounded-md border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-cyan-600 focus:bg-white"
          placeholder="账号 / 姓名 / 手机"
          @keyup.enter="handleQuery"
        />
        <select v-model="query.userType" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
          <option value="">全部角色</option>
          <option value="ADMIN">管理员</option>
          <option value="REGULATOR">监管方</option>
          <option value="FARMER">养殖户</option>
        </select>
        <select v-model="query.status" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
          <option value="">全部状态</option>
          <option value="1">启用</option>
          <option value="0">停用</option>
        </select>
        <button class="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800" @click="handleQuery">
          <Search class="h-4 w-4" />
          搜索
        </button>
        <button class="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-50" @click="resetQuery">
          <RefreshCw class="h-4 w-4" />
          重置
        </button>
      </div>
    </section>

    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[960px] text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th class="px-4 py-3">ID</th>
              <th class="px-4 py-3">账号</th>
              <th class="px-4 py-3">姓名</th>
              <th class="px-4 py-3">手机</th>
              <th class="px-4 py-3">角色</th>
              <th class="px-4 py-3">状态</th>
              <th class="px-4 py-3">养殖场ID</th>
              <th class="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="rows.length === 0">
              <td colspan="8" class="px-4 py-12 text-center text-slate-400">{{ loading ? '加载中...' : '暂无用户数据' }}</td>
            </tr>
            <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-mono text-xs text-slate-500">{{ row.id }}</td>
              <td class="px-4 py-3 font-medium text-slate-900">{{ row.username }}</td>
              <td class="px-4 py-3 text-slate-700">{{ row.realName || '-' }}</td>
              <td class="px-4 py-3 text-slate-600">{{ row.phone || '-' }}</td>
              <td class="px-4 py-3">
                <span :class="['rounded-full px-2 py-1 text-xs font-medium', roleClass(row.userType)]">{{ roleLabel(row.userType) }}</span>
              </td>
              <td class="px-4 py-3">
                <span :class="['rounded-full px-2 py-1 text-xs font-medium', row.status === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600']">
                  {{ row.status === 1 ? '启用' : '停用' }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-500">{{ row.farmId || '-' }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    :disabled="isSelf(row)"
                    @click="toggleStatus(row)"
                  >
                    {{ row.status === 1 ? '停用' : '启用' }}
                  </button>
                  <button
                    class="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40"
                    :disabled="isSelf(row)"
                    @click="deleteUser(row)"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
        <span>共 {{ pagination.total }} 条</span>
        <div class="flex items-center gap-2">
          <button class="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50" :disabled="pagination.current <= 1" @click="changePage(pagination.current - 1)">上一页</button>
          <span>{{ pagination.current }} / {{ totalPages }}</span>
          <button class="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50" :disabled="pagination.current >= totalPages" @click="changePage(pagination.current + 1)">下一页</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshCw, Search } from 'lucide-vue-next'
import { deleteAdminUsers, getAdminUsers, updateAdminUserStatus } from '@/api/admin'

const loading = ref(false)
const rows = ref<any[]>([])
const pagination = reactive({ current: 1, size: 10, total: 0 })
const query = reactive({ keyword: '', userType: '', status: '' })

const currentUserId = computed(() => {
  try {
    const user = JSON.parse(sessionStorage.getItem('aqua_user') || '{}')
    return user.id
  } catch {
    return null
  }
})
const totalPages = computed(() => Math.max(1, Math.ceil(pagination.total / pagination.size)))

onMounted(loadUsers)

async function loadUsers() {
  loading.value = true
  try {
    const res = await getAdminUsers({
      pageNum: pagination.current,
      pageSize: pagination.size,
      keyword: query.keyword || undefined,
      userType: query.userType || undefined,
      status: query.status === '' ? undefined : query.status,
    })
    const page = res.data
    rows.value = page.records || []
    pagination.total = page.total || 0
    pagination.current = page.current || pagination.current
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  pagination.current = 1
  loadUsers()
}

function resetQuery() {
  query.keyword = ''
  query.userType = ''
  query.status = ''
  handleQuery()
}

function changePage(page: number) {
  pagination.current = page
  loadUsers()
}

function isSelf(row: any) {
  return currentUserId.value && row.id === currentUserId.value
}

async function toggleStatus(row: any) {
  const nextStatus = row.status === 1 ? 0 : 1
  await updateAdminUserStatus(row.id, nextStatus)
  ElMessage.success(nextStatus === 1 ? '账号已启用' : '账号已停用')
  loadUsers()
}

async function deleteUser(row: any) {
  await ElMessageBox.confirm(`确认删除账号 "${row.username}" 吗？`, '删除用户', { type: 'warning' })
  await deleteAdminUsers(row.id)
  ElMessage.success('删除成功')
  loadUsers()
}

function roleLabel(value?: string) {
  const map: Record<string, string> = { ADMIN: '管理员', REGULATOR: '监管方', FARMER: '养殖户' }
  return value ? map[value] || value : '未知'
}

function roleClass(value?: string) {
  if (value === 'ADMIN') return 'bg-slate-900 text-white'
  if (value === 'REGULATOR') return 'bg-blue-50 text-blue-700'
  return 'bg-teal-50 text-teal-700'
}
</script>
