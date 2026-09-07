<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div><h2 class="text-2xl font-bold text-slate-800">线下抽检档案</h2><p class="mt-1 text-sm text-slate-500">记录实地抽检结果，跟踪整改与验收。</p></div>
      <el-button type="primary" @click="edit()">新增抽检</el-button>
    </div>
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div v-for="item in cards" :key="item.label" class="rounded-xl bg-white p-5 shadow-sm">
        <div class="text-sm text-slate-500">{{ item.label }}</div><div class="mt-2 text-2xl font-bold">{{ item.value }}</div>
      </div>
    </div>
    <div class="rounded-xl bg-white p-5 shadow-sm">
      <div class="mb-4 flex flex-wrap gap-3">
        <el-select v-model="query.farmId" placeholder="养殖场" clearable filterable class="!w-48"><el-option v-for="farm in farms" :key="farm.id" :label="farm.farmName" :value="farm.id" /></el-select>
        <el-select v-model="query.result" placeholder="抽检结果" clearable class="!w-36"><el-option label="合格" value="qualified" /><el-option label="不合格" value="unqualified" /></el-select>
        <el-select v-model="query.rectifyStatus" placeholder="整改状态" clearable class="!w-36"><el-option v-for="(label, value) in statusLabels" :key="value" :label="label" :value="value" /></el-select>
        <el-date-picker v-model="dates" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" />
        <el-button @click="query.pageNum = 1; load()">查询</el-button>
      </div>
      <el-table :data="rows" v-loading="loading">
        <el-table-column prop="farmName" label="养殖场" min-width="130" />
        <el-table-column prop="pondName" label="池塘" width="110"><template #default="{ row }">{{ row.pondName || '全场抽检' }}</template></el-table-column>
        <el-table-column prop="inspectionDate" label="日期" width="115" />
        <el-table-column label="类型" width="110"><template #default="{ row }">{{ typeLabels[row.inspectionType] }}</template></el-table-column>
        <el-table-column prop="inspectionItem" label="抽检项目" min-width="140" />
        <el-table-column label="结果" width="90"><template #default="{ row }"><el-tag :type="row.result === 'qualified' ? 'success' : 'danger'">{{ row.result === 'qualified' ? '合格' : '不合格' }}</el-tag></template></el-table-column>
        <el-table-column label="整改" width="105"><template #default="{ row }">{{ statusLabels[row.rectifyStatus] }}</template></el-table-column>
        <el-table-column prop="rectifyDeadline" label="整改截止" width="115" />
        <el-table-column label="操作" width="205" fixed="right"><template #default="{ row }">
          <el-button link type="primary" @click="edit(row)">详情</el-button>
          <el-button v-if="nextStatus[row.rectifyStatus]" link type="warning" @click="openRectify(row)">整改</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template></el-table-column>
      </el-table>
      <el-pagination class="mt-5 justify-end" v-model:current-page="query.pageNum" :page-size="query.pageSize" :total="total" layout="total, prev, pager, next" @current-change="load" />
    </div>
    <el-dialog v-model="visible" :title="form.id ? '抽检档案详情' : '新增抽检'" width="720px">
      <el-alert v-if="locked" title="整改已开始，原始档案已锁定；请通过整改流程更新进度。" type="info" :closable="false" class="mb-4" />
      <el-form :model="form" label-width="110px" :disabled="locked">
        <el-form-item label="养殖场" required><el-select v-model="form.farmId" filterable class="w-full" @change="form.pondId = null; loadPonds()"><el-option v-for="farm in farms" :key="farm.id" :label="farm.farmName" :value="farm.id" /></el-select></el-form-item>
        <el-form-item label="池塘"><el-select v-model="form.pondId" clearable placeholder="不选表示全场抽检" class="w-full"><el-option v-for="pond in ponds" :key="pond.id" :label="pond.pondName" :value="pond.id" /></el-select></el-form-item>
        <el-form-item label="抽检日期" required><el-date-picker v-model="form.inspectionDate" type="date" value-format="YYYY-MM-DD" /></el-form-item>
        <el-form-item label="抽检类型" required><el-select v-model="form.inspectionType"><el-option v-for="(label, value) in typeLabels" :key="value" :label="label" :value="value" /></el-select></el-form-item>
        <el-form-item label="抽检项目"><el-input v-model="form.inspectionItem" maxlength="200" /></el-form-item>
        <el-form-item label="抽检人员"><el-input v-model="form.inspectorName" maxlength="50" /></el-form-item>
        <el-form-item label="抽检结果" required><el-radio-group v-model="form.result"><el-radio value="qualified">合格</el-radio><el-radio value="unqualified">不合格</el-radio></el-radio-group></el-form-item>
        <el-form-item v-if="form.result === 'unqualified'" label="不合格原因" required><el-input v-model="form.unqualifiedReason" type="textarea" maxlength="500" /></el-form-item>
        <el-form-item label="情况描述"><el-input v-model="form.description" type="textarea" maxlength="10000" /></el-form-item>
        <el-form-item label="附件"><input type="file" accept="image/png,image/jpeg,application/pdf" :disabled="locked || uploading || attachments.length >= 10" @change="upload" /><span class="text-xs text-slate-500">最多 10 个，每个不超过 5 MB</span></el-form-item>
      </el-form>
      <div class="ml-28 space-y-1"><div v-for="(url, index) in attachments" :key="url"><a :href="url" target="_blank" rel="noopener" class="text-blue-600">附件 {{ index + 1 }}</a><el-button v-if="!locked" link type="danger" @click="attachments.splice(index, 1)">移除</el-button></div></div>
      <div v-if="form.rectifyRemark" class="mt-4 rounded bg-slate-50 p-3 text-sm">整改说明：{{ form.rectifyRemark }}</div>
      <template #footer><el-button @click="visible = false">关闭</el-button><el-button v-if="!locked" type="primary" :loading="saving" :disabled="uploading" @click="save">保存</el-button></template>
    </el-dialog>
    <el-dialog v-model="rectifyVisible" title="推进整改" width="500px">
      <el-form label-width="100px">
        <el-form-item label="下一状态">{{ statusLabels[rectifyForm.rectifyStatus] }}</el-form-item>
        <el-form-item label="截止日期"><el-date-picker v-model="rectifyForm.rectifyDeadline" type="date" value-format="YYYY-MM-DD" /></el-form-item>
        <el-form-item label="整改说明" required><el-input v-model="rectifyForm.rectifyRemark" type="textarea" maxlength="500" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="rectifyVisible = false">取消</el-button><el-button type="primary" :loading="saving" @click="rectify">确认</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { loadAllPages } from '@/utils/pagination'
const base = '/regulator/inspections'
const rows = ref([]), total = ref(0), farms = ref([]), ponds = ref([]), dates = ref([]), stats = ref({})
const loading = ref(false), saving = ref(false), uploading = ref(false), visible = ref(false), rectifyVisible = ref(false)
const query = ref({ pageNum: 1, pageSize: 10 }), form = ref({}), attachments = ref([]), rectifyForm = ref({})
const typeLabels = { water_quality: '水质', drug_residue: '药残', seedling: '苗种', feed: '饲料', other: '其他' }
const statusLabels = { none: '无需整改', pending: '待整改', rectifying: '整改中', rectified: '已整改', accepted: '已验收' }
const nextStatus = { none: 'pending', pending: 'rectifying', rectifying: 'rectified', rectified: 'accepted' }
const locked = computed(() => form.value.id && !['none', 'pending'].includes(form.value.rectifyStatus))
const cards = computed(() => [
  { label: '本月抽检', value: stats.value.totalThisMonth ?? 0 }, { label: '本月合格率', value: `${stats.value.qualifiedRate ?? 0}%` },
  { label: '待完成整改', value: stats.value.pendingRectify ?? 0 }, { label: '已整改 / 验收', value: stats.value.completedRectify ?? 0 },
])
async function load() {
  loading.value = true
  try {
    const [list, summary] = await Promise.all([request.get(`${base}/list`, { params: { ...query.value, startDate: dates.value?.[0], endDate: dates.value?.[1] } }), request.get(`${base}/stats`)])
    rows.value = list.data.records; total.value = list.data.total; stats.value = summary.data
  } finally { loading.value = false }
}
async function loadPonds() {
  ponds.value = []
  if (form.value.farmId) ponds.value = (await loadAllPages(params => request.get('/base/pond/list', { params }), { farmId: form.value.farmId })).data.records
}
async function edit(row) {
  form.value = row ? { ...(await request.get(`${base}/${row.id}`)).data } : { inspectionType: 'water_quality', result: 'qualified' }
  try { attachments.value = JSON.parse(form.value.attachmentUrls || '[]') } catch { attachments.value = [] }
  await loadPonds(); visible.value = true
}
async function save() {
  if (!form.value.farmId || !form.value.inspectionDate || (form.value.result === 'unqualified' && !form.value.unqualifiedReason?.trim())) { ElMessage.warning('请填写养殖场、日期和不合格原因'); return }
  saving.value = true
  try {
    const data = { ...form.value, attachmentUrls: JSON.stringify(attachments.value), pondId: form.value.pondId || null }
    if (form.value.id) await request.put(`${base}/${form.value.id}`, data); else await request.post(base, data)
    visible.value = false; ElMessage.success('抽检档案已保存'); await load()
  } finally { saving.value = false }
}
async function upload(event) {
  const file = event.target.files?.[0]; if (!file) return
  if (file.size > 5 * 1024 * 1024) { ElMessage.warning('附件不能超过 5 MB'); return }
  uploading.value = true
  try { const data = new FormData(); data.append('file', file); attachments.value.push((await request.post(`${base}/attachments`, data)).data) }
  finally { uploading.value = false; event.target.value = '' }
}
function openRectify(row) { rectifyForm.value = { id: row.id, rectifyStatus: nextStatus[row.rectifyStatus], rectifyDeadline: row.rectifyDeadline, rectifyRemark: '' }; rectifyVisible.value = true }
async function rectify() {
  if (!rectifyForm.value.rectifyRemark.trim()) { ElMessage.warning('请填写整改说明'); return }
  saving.value = true
  try { await request.put(`${base}/${rectifyForm.value.id}/rectify`, rectifyForm.value); rectifyVisible.value = false; await load() }
  finally { saving.value = false }
}
async function remove(row) {
  try { await ElMessageBox.confirm('确认删除该抽检档案？记录将被逻辑删除。', '删除确认') } catch { return }
  await request.delete(`${base}/${row.id}`); await load()
}
onMounted(async () => { await load(); farms.value = (await loadAllPages(params => request.get('/base/farm/list', { params }))).data.records })
</script>
