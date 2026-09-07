<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between"><div><h2 class="text-2xl font-bold">SOP 模板管理</h2><p class="mt-1 text-sm text-slate-500">按苗种定义投放后的标准作业；模板用于生成后续新投放池塘的任务。</p></div><el-button type="primary" @click="edit()">新增模板</el-button></div>
    <div class="rounded-xl bg-white p-5 shadow-sm">
      <div class="mb-4 flex gap-3"><el-select v-model="query.categoryId" placeholder="适用苗种" clearable filterable class="!w-52"><el-option v-for="seed in seedlings" :key="seed.id" :label="seed.categoryName" :value="seed.id" /></el-select><el-input v-model="query.stageName" placeholder="养殖阶段" clearable class="!w-40" /><el-button @click="query.pageNum = 1; load()">查询</el-button></div>
      <el-table :data="rows" v-loading="loading">
        <el-table-column label="苗种" min-width="140"><template #default="{ row }">{{ seedlings.find(s => s.id === row.categoryId)?.categoryName || row.categoryId }}</template></el-table-column>
        <el-table-column prop="stageName" label="养殖阶段" width="120" /><el-table-column prop="dayOffset" label="投放后天数" width="120" />
        <el-table-column label="任务类型" width="120"><template #default="{ row }">{{ types[row.taskType] || row.taskType }}</template></el-table-column>
        <el-table-column prop="taskDesc" label="操作指南" min-width="250" />
        <el-table-column label="操作" width="140"><template #default="{ row }"><el-button link type="primary" @click="edit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
      </el-table>
      <el-pagination class="mt-4 justify-end" v-model:current-page="query.pageNum" :page-size="query.pageSize" :total="total" layout="total, prev, pager, next" @current-change="load" />
    </div>
    <el-dialog v-model="visible" :title="form.id ? '编辑 SOP 模板' : '新增 SOP 模板'" width="560px">
      <el-form label-width="110px">
        <el-form-item label="适用苗种" required><el-select v-model="form.categoryId" filterable class="w-full"><el-option v-for="seed in seedlings" :key="seed.id" :label="seed.categoryName" :value="seed.id" /></el-select></el-form-item>
        <el-form-item label="养殖阶段" required><el-input v-model="form.stageName" maxlength="50" /></el-form-item>
        <el-form-item label="投放后天数" required><el-input-number v-model="form.dayOffset" :min="0" :max="3650" :precision="0" /></el-form-item>
        <el-form-item label="任务类型" required><el-select v-model="form.taskType"><el-option v-for="(label, value) in types" :key="value" :label="label" :value="value" /></el-select></el-form-item>
        <el-form-item label="操作指南" required><el-input v-model="form.taskDesc" type="textarea" maxlength="200" :rows="4" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
const rows = ref([]), total = ref(0), seedlings = ref([]), loading = ref(false), saving = ref(false), visible = ref(false), form = ref({})
const query = ref({ pageNum: 1, pageSize: 10 })
const types = { DISINFECT: '消毒', TEST: '抽测', WATER: '换水', FEED: '特殊投喂' }
async function load() { loading.value = true; try { const res = await request.get('/base/sop-template/list', { params: query.value }); rows.value = res.data.records; total.value = res.data.total } finally { loading.value = false } }
function edit(row) { form.value = row ? { ...row } : { dayOffset: 0, taskType: 'TEST' }; visible.value = true }
async function save() {
  if (!form.value.categoryId || !form.value.stageName?.trim() || !form.value.taskDesc?.trim()) { ElMessage.warning('请完整填写模板'); return }
  saving.value = true
  try { if (form.value.id) await request.put(`/base/sop-template/${form.value.id}`, form.value); else await request.post('/base/sop-template', form.value); visible.value = false; await load() } finally { saving.value = false }
}
async function remove(row) { try { await ElMessageBox.confirm('删除模板不会删除已生成的任务，是否继续？', '确认删除') } catch { return }; await request.delete(`/base/sop-template/${row.id}`); await load() }
onMounted(async () => { seedlings.value = (await request.get('/base/seedling-dict/all')).data; await load() })
</script>
