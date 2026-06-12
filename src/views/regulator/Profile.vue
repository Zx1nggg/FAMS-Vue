<template>
  <div class="max-w-4xl mx-auto w-full pb-10">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">监管专员档案</h1>
      <p class="text-sm text-gray-500 mt-1">展示您的监管身份凭证、联系方式与基础工作资料。</p>
    </div>

    <!-- 加载中骨架屏 -->
    <div v-if="loading" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-3">
        <RefreshCw class="w-8 h-8 text-indigo-500 animate-spin" />
        <span class="text-gray-400 text-sm">正在读取安全档案...</span>
      </div>
    </div>

    <!-- 主内容 -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
      
      <!-- ==================== 1. 封面横幅与摘要区 ==================== -->
      <div class="h-40 sm:h-48 bg-gradient-to-r from-blue-500 to-indigo-700 relative flex items-end">
        <!-- 装饰图案 (微调为更具科技感/秩序感的网格点) -->
        <div class="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] pointer-events-none"></div>

        <!-- 姓名与操作按钮 -->
        <div class="w-full px-6 sm:px-10 pb-5 sm:pb-6 flex justify-between items-end relative z-10">
          
          <!-- 左侧：为悬浮头像留出空间，展示姓名/工作称呼 -->
          <div class="ml-[108px] sm:ml-[148px]">
            <h2 class="text-2xl sm:text-3xl font-serif text-white tracking-wide flex items-center gap-3 drop-shadow-md">
              {{ form.username || '未设置姓名' }}
              <span v-if="!form.username" class="text-xs font-sans text-white/80 tracking-normal bg-black/20 px-2.5 py-0.5 rounded-md border border-white/10 backdrop-blur-sm shadow-inner">
                监管专员
              </span>
            </h2>
          </div>

          <!-- 右侧：桌面端操作按钮 -->
          <div class="hidden sm:block mb-1">
            <el-button class="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20 hover:!border-white/40 !rounded-xl !px-5 shadow-sm backdrop-blur-md transition-all" @click="openEditDialog">
              <Edit3 class="w-4 h-4 mr-1.5" /> 完善档案
            </el-button>
          </div>
          <!-- 移动端右上角操作按钮 -->
          <div class="sm:hidden absolute top-4 right-4">
             <el-button circle class="!bg-white/20 !border-white/30 !text-white backdrop-blur-md hover:!bg-white/30 transition-all" @click="openEditDialog">
               <Edit3 class="w-4 h-4" />
             </el-button>
          </div>

        </div>
      </div>

      <!-- ==================== 2. 独立悬浮头像区 & 白底身份标签 ==================== -->
      <div class="px-6 sm:px-10 relative z-20 -mt-12 sm:-mt-16 mb-8 pointer-events-none flex items-end">
        
        <!-- 防盗头像容器 -->
        <div 
          class="pointer-events-auto relative group cursor-pointer shrink-0 rounded-full ring-4 ring-white bg-white w-24 h-24 sm:w-32 sm:h-32 shadow-md overflow-hidden" 
          @click="triggerUpload"
          @contextmenu.prevent
        >
          <img
            v-if="form.avatar"
            :src="avatarUrl"
            draggable="false"
            class="w-full h-full rounded-full object-cover select-none pointer-events-none"
            alt="用户头像"
          />
          <div
            v-else
            class="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-sm select-none"
          >
            {{ userInitial }}
          </div>

          <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Camera class="w-6 h-6 text-white mb-1" />
            <span class="text-[10px] text-white font-medium">更新照片</span>
          </div>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
        </div>

        <!-- 身份与性别标签 -->
        <div class="pointer-events-auto ml-4 sm:ml-5 mb-1 sm:mb-2 flex items-center gap-2.5 font-sans">
          <span class="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-100 shadow-sm">
            <ShieldCheck class="w-3.5 h-3.5" /> {{ roleLabel }}
          </span>
          <span v-if="form.gender !== 0" class="inline-flex items-center gap-1.5 bg-white text-slate-600 px-3 py-1 rounded-lg text-xs font-medium border border-slate-200 shadow-sm">
            <User class="w-3.5 h-3.5 text-slate-400" /> {{ genderLabel }}
          </span>
        </div>

      </div>

      <!-- ==================== 3. 结构化信息区 ==================== -->
      <div class="px-6 sm:px-10 pb-10 space-y-8">
        
        <!-- 模块 A: 账号凭证 (不可改) -->
        <section>
          <h3 class="text-sm font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
            <Fingerprint class="w-4 h-4" /> 授权凭证
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-gray-50/70 border border-gray-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-500 mb-1">工号 / 登录手机号</p>
                <p class="font-bold text-gray-700 font-mono">{{ form.phone || '未绑定' }}</p>
              </div>
              <CheckCircle2 class="w-5 h-5 text-blue-500 opacity-50" />
            </div>
            <div class="bg-gray-50/70 border border-gray-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-500 mb-1">系统涉密等级</p>
                <p class="font-bold text-gray-700">{{ roleLabel }}</p>
              </div>
              <Shield class="w-5 h-5 text-indigo-500 opacity-50" />
            </div>
          </div>
        </section>

        <!-- 模块 B: 基础资料 -->
        <section>
          <h3 class="text-sm font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
            <UserSquare class="w-4 h-4" /> 身份信息
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div class="flex flex-col">
              <label class="text-xs font-bold text-gray-600 mb-1.5 pl-1">真实姓名</label>
              <div class="px-3 py-2.5 bg-white border border-transparent text-gray-800 font-medium min-h-[40px] flex items-center">
                {{ form.realName || '未调取实名信息' }}
              </div>
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-bold text-gray-600 mb-1.5 pl-1">性别</label>
              <div class="px-3 py-2.5 bg-white border border-transparent text-gray-800 font-medium min-h-[40px] flex items-center">
                {{ genderLabel }}
              </div>
            </div>
          </div>
        </section>

        <!-- 模块 C: 联系方式 -->
        <section>
          <h3 class="text-sm font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
            <Building2 class="w-4 h-4" /> 通讯与办公地址
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div class="flex flex-col">
              <label class="text-xs font-bold text-gray-600 mb-1.5 pl-1 flex items-center gap-1.5"><Phone class="w-3.5 h-3.5" /> 办公/联系电话</label>
              <div class="px-3 py-2.5 bg-white border border-transparent text-gray-800 font-medium font-mono min-h-[40px] flex items-center">
                {{ form.phone || '未填写' }}
              </div>
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-bold text-gray-600 mb-1.5 pl-1 flex items-center gap-1.5"><Mail class="w-3.5 h-3.5" /> 工作邮箱</label>
              <div class="px-3 py-2.5 bg-white border border-transparent text-gray-800 font-medium min-h-[40px] flex items-center">
                {{ form.email || '未填写' }}
              </div>
            </div>
            <div class="flex flex-col col-span-1 sm:col-span-2">
              <label class="text-xs font-bold text-gray-600 mb-1.5 pl-1 flex items-center gap-1.5"><MapPin class="w-3.5 h-3.5" /> 监管机构/办公地址</label>
              <div class="px-3 py-2.5 bg-white border border-transparent text-gray-800 font-medium min-h-[40px] flex items-center">
                {{ form.address || '未填写' }}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>

    <!-- ==================== 4. 主页编辑专属弹窗 ==================== -->
    <el-dialog v-model="dialogVisible" title="完善监管档案" width="450px" append-to-body class="!rounded-2xl" @close="resetForm">
      <div class="px-2 pt-2">
        <el-form ref="editFormRef" :model="editForm" :rules="rules" label-position="top" class="pr-2">
          
          <el-form-item label="姓名 / 内部称呼" prop="username">
            <el-input v-model="editForm.username" placeholder="请输入用于系统内流转展示的姓名" clearable />
          </el-form-item>

          <el-form-item label="性别" prop="gender" class="mt-2">
            <el-select v-model="editForm.gender" class="w-full">
              <el-option :value="0" label="保密/未设" />
              <el-option :value="1" label="男" />
              <el-option :value="2" label="女" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="办公/单位地址" prop="address" class="mt-2">
            <el-input v-model="editForm.address" type="textarea" :rows="2" placeholder="请输入办公地址或所属监管机构所在地" maxlength="100" show-word-limit />
          </el-form-item>
        </el-form>
        
        <div class="mt-4 text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 flex gap-2">
          <AlertTriangle class="w-4 h-4 shrink-0 text-indigo-500" />
          注：实名认证、手机号换绑及涉密权限调整，请联系上级系统管理员进行集中变更。
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="!rounded-lg">取 消</el-button>
          <el-button type="primary" @click="submitEdit" class="!bg-indigo-600 !border-none hover:!bg-indigo-700 !rounded-lg" :loading="saving">
            保存档案
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Camera, Edit3, Shield, User, Fingerprint, 
  CheckCircle2, UserSquare, Phone, Mail, MapPin, 
  RefreshCw, AlertTriangle, ShieldCheck, Building2
} from 'lucide-vue-next'
import { getUserProfile, updateUserProfile, uploadAvatar } from '@/api/base'
import { getCachedAvatar, setCachedAvatar, getCachedProfile, setCachedProfile } from '@/utils/storage'

const loading = ref(true)
const fileInput = ref(null)
const cachedAvatarBase64 = ref(getCachedAvatar())

// 页面展示的主数据源
const form = ref({
  username: '', // 网名/姓名/称呼
  realName: '',
  phone: '',    
  email: '',
  gender: 0,
  address: '',
  avatar: '',
  userType: ''
})

const dialogVisible = ref(false)
const saving = ref(false)
const editFormRef = ref(null)
const editForm = ref({})

// 校验规则精简
const rules = {
  username: [
    { required: true, message: '姓名/称呼不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// === 计算属性 ===
const avatarUrl = computed(() => {
  if (cachedAvatarBase64.value) return cachedAvatarBase64.value
  if (!form.value.avatar) return ''
  return '/api/' + form.value.avatar
})

// 取首字作为默认头像
const userInitial = computed(() => {
  return form.value.username ? form.value.username.charAt(0) : '监'
})

const genderLabel = computed(() => {
  const map = { 0: '保密/未设', 1: '男', 2: '女' }
  return map[form.value.gender] || '保密/未设'
})

const roleLabel = computed(() => {
  const map = { ADMIN: '系统管理员', REGULATOR: '监管专员', FARMER: '养殖户' }
  return map[form.value.userType] || '监管部门'
})

// === 方法与逻辑 ===
const cacheAvatarAsBase64 = (avatarPath) => {
  if (!avatarPath) return
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        const base64 = canvas.toDataURL('image/jpeg', 0.85)
        cachedAvatarBase64.value = base64
        setCachedAvatar(base64)
      }
    } catch { /* ignore */ }
  }
  img.src = '/api/' + avatarPath
}

const loadProfile = async () => {
  loading.value = true

  const cachedProfile = getCachedProfile()
  if (cachedProfile) {
    try { form.value = JSON.parse(cachedProfile) } catch { /* ignore */ }
  }

  if (!cachedProfile) {
    const userStr = sessionStorage.getItem('aqua_user')
    if (userStr) {
      try {
        const cacheUser = JSON.parse(userStr)
        form.value.username = cacheUser.name || ''
        form.value.userType = cacheUser.role || ''
        form.value.avatar = cacheUser.avatar || ''
      } catch { /* ignore */ }
    }
  }

  try {
    const res = await getUserProfile()
    if (res.code === 200 && res.data) {
      form.value = res.data
      setCachedProfile(JSON.stringify(res.data))
      if (res.data.avatar) cacheAvatarAsBase64(res.data.avatar)
    }
  } catch (e) {
    console.warn('无法连接到服务器，已降级使用本地缓存数据展示')
  }
  finally { loading.value = false }
}

const openEditDialog = () => {
  editForm.value = { ...form.value }
  dialogVisible.value = true
}

const resetForm = () => {
  if (editFormRef.value) editFormRef.value.clearValidate()
}

const submitEdit = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const res = await updateUserProfile({
          username: editForm.value.username,
          gender: editForm.value.gender,
          address: editForm.value.address
        })
        
        if (res.code === 200) {
          ElMessage.success('监管档案更新成功')
          dialogVisible.value = false
          form.value = { ...form.value, ...editForm.value }
          setCachedProfile(JSON.stringify(form.value))

          const userStr = sessionStorage.getItem('aqua_user')
          if (userStr) {
            const user = JSON.parse(userStr)
            user.name = editForm.value.username
            sessionStorage.setItem('aqua_user', JSON.stringify(user))
          }
        }
      } catch (e) { /* ignore */ }
      finally { saving.value = false }
    }
  })
}

const triggerUpload = () => { fileInput.value?.click() }

const onFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    return ElMessage.warning('请选择图片文件')
  }
  if (file.size > 5 * 1024 * 1024) {
    return ElMessage.warning('图片大小不能超过 5MB')
  }

  const reader = new FileReader()
  reader.onload = () => {
    cachedAvatarBase64.value = reader.result
    setCachedAvatar(reader.result)
  }
  reader.readAsDataURL(file)

  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await uploadAvatar(fd)
    if (res.code === 200 && res.data) {
      form.value.avatar = res.data
      ElMessage.success('工作照片已更新')
      setCachedProfile(JSON.stringify(form.value))
      
      const userStr = sessionStorage.getItem('aqua_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        user.avatar = res.data
        sessionStorage.setItem('aqua_user', JSON.stringify(user))
      }
    }
  } catch (e) { /* ignore */ }
  finally {
    e.target.value = ''
  }
}

onMounted(() => { loadProfile() })
</script>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>