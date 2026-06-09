<template>
  <div class="max-w-4xl mx-auto w-full pb-10">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">账号设置</h1>
      <p class="text-sm text-gray-500 mt-1">管理您的个人基础资料与联系方式。</p>
    </div>

    <!-- 加载中骨架屏 -->
    <div v-if="loading" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-3">
        <RefreshCw class="w-8 h-8 text-teal-500 animate-spin" />
        <span class="text-gray-400 text-sm">正在读取资料...</span>
      </div>
    </div>

    <!-- 主内容 -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
      
      <!-- ==================== 1. 封面横幅与摘要区 ==================== -->
      <div class="h-40 sm:h-48 bg-gradient-to-r from-emerald-400 to-teal-600 relative flex items-end">
        <!-- 装饰图案 -->
        <div class="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] pointer-events-none"></div>

        <!-- 姓名与操作按钮 (位于绿色背景上方) -->
        <div class="w-full px-6 sm:px-10 pb-5 sm:pb-6 flex justify-between items-end relative z-10">
          
          <!-- 左侧：为悬浮头像留出空间，只放名字 -->
          <div class="ml-[108px] sm:ml-[148px]">
            <h2 class="text-2xl sm:text-3xl font-serif text-white tracking-wide flex items-center gap-3 drop-shadow-md">
              {{ form.realName || form.username }}
              <span v-if="!form.realName" class="text-xs font-sans text-white/80 tracking-normal bg-black/20 px-2.5 py-0.5 rounded-md border border-white/10 backdrop-blur-sm shadow-inner">
                未设置姓名
              </span>
            </h2>
          </div>

          <!-- 右侧：桌面端操作按钮 (玻璃拟物态) -->
          <div class="hidden sm:block mb-1">
            <el-button class="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30 hover:!border-white/50 !rounded-xl !px-5 shadow-sm backdrop-blur-md transition-all" @click="openEditDialog">
              <Edit3 class="w-4 h-4 mr-1.5" /> 编辑资料
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
      <!-- 采用 flex items-end 让头像和右侧白底标签底面对齐 -->
      <div class="px-6 sm:px-10 relative z-20 -mt-12 sm:-mt-16 mb-8 pointer-events-none flex items-end">
        
        <!-- 🌟 防盗头像容器 -->
        <!-- @contextmenu.prevent 彻底屏蔽右键菜单 -->
        <div 
          class="pointer-events-auto relative group cursor-pointer shrink-0 rounded-full ring-4 ring-white bg-white w-24 h-24 sm:w-32 sm:h-32 shadow-md overflow-hidden" 
          @click="triggerUpload"
          @contextmenu.prevent
        >
          <!-- 真实图片 (增加 draggable="false" 和 pointer-events-none 防拖拽) -->
          <img
            v-if="form.avatar"
            :src="avatarUrl"
            draggable="false"
            class="w-full h-full rounded-full object-cover select-none pointer-events-none"
            alt="用户头像"
          />
          <!-- 默认文字头像 -->
          <div
            v-else
            class="w-full h-full rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-sm select-none"
          >
            {{ userInitial }}
          </div>

          <!-- 悬浮上传遮罩层 -->
          <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Camera class="w-6 h-6 text-white mb-1" />
            <span class="text-[10px] text-white font-medium">更换头像</span>
          </div>
          
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
        </div>

        <!-- 🌟 身份与性别标签 (放置于头像右侧的白色卡片区域) -->
        <div class="pointer-events-auto ml-4 sm:ml-5 mb-1 sm:mb-2 flex items-center gap-2.5 font-sans">
          <span class="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1 rounded-lg text-xs font-bold border border-teal-100 shadow-sm">
            <Shield class="w-3.5 h-3.5" /> {{ roleLabel }}
          </span>
          <span v-if="form.gender !== 0" class="inline-flex items-center gap-1.5 bg-white text-slate-600 px-3 py-1 rounded-lg text-xs font-medium border border-slate-200 shadow-sm">
            <User class="w-3.5 h-3.5 text-slate-400" /> {{ genderLabel }}
          </span>
        </div>

      </div>

      <!-- ==================== 3. 结构化信息区 (纯只读态) ==================== -->
      <div class="px-6 sm:px-10 pb-10 space-y-8">
        
        <!-- 模块 A: 账号安全信息 (不可改) -->
        <section>
          <h3 class="text-sm font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
            <Fingerprint class="w-4 h-4" /> 账号凭证
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-gray-50/70 border border-gray-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-500 mb-1">登录账号</p>
                <p class="font-bold text-gray-700 font-mono">{{ form.username }}</p>
              </div>
              <CheckCircle2 class="w-5 h-5 text-emerald-400 opacity-50" />
            </div>
            <div class="bg-gray-50/70 border border-gray-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-500 mb-1">系统权限</p>
                <p class="font-bold text-gray-700">{{ roleLabel }}</p>
              </div>
              <Shield class="w-5 h-5 text-teal-400 opacity-50" />
            </div>
          </div>
        </section>

        <!-- 模块 B: 基础资料 -->
        <section>
          <h3 class="text-sm font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
            <UserSquare class="w-4 h-4" /> 基础资料
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div class="flex flex-col">
              <label class="text-xs font-bold text-gray-600 mb-1.5 pl-1">真实姓名</label>
              <div class="px-3 py-2.5 bg-white border border-transparent text-gray-800 font-medium min-h-[40px] flex items-center">
                {{ form.realName || '未填写' }}
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
            <MapPin class="w-4 h-4" /> 联系方式
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div class="flex flex-col">
              <label class="text-xs font-bold text-gray-600 mb-1.5 pl-1 flex items-center gap-1.5"><Phone class="w-3.5 h-3.5" /> 手机号码</label>
              <div class="px-3 py-2.5 bg-white border border-transparent text-gray-800 font-medium font-mono min-h-[40px] flex items-center">
                {{ form.phone || '未填写' }}
              </div>
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-bold text-gray-600 mb-1.5 pl-1 flex items-center gap-1.5"><Mail class="w-3.5 h-3.5" /> 电子邮箱</label>
              <div class="px-3 py-2.5 bg-white border border-transparent text-gray-800 font-medium min-h-[40px] flex items-center">
                {{ form.email || '未填写' }}
              </div>
            </div>
            <div class="flex flex-col col-span-1 sm:col-span-2">
              <label class="text-xs font-bold text-gray-600 mb-1.5 pl-1 flex items-center gap-1.5"><MapPin class="w-3.5 h-3.5" /> 详细地址</label>
              <div class="px-3 py-2.5 bg-white border border-transparent text-gray-800 font-medium min-h-[40px] flex items-center">
                {{ form.address || '未填写' }}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>

    <!-- ==================== 4. 资料编辑专属弹窗 ==================== -->
    <el-dialog v-model="dialogVisible" title="编辑个人资料" width="550px" append-to-body class="!rounded-2xl" @close="resetForm">
      <div class="px-2 pt-2">
        <el-form ref="editFormRef" :model="editForm" :rules="rules" label-width="80px" class="pr-4">
          <div class="mb-4 pb-2 border-b border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-700">
            <UserSquare class="w-4 h-4 text-teal-500"/> 基础资料
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="editForm.realName" placeholder="请输入姓名" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-select v-model="editForm.gender" class="w-full">
                  <el-option :value="0" label="保密/未设" />
                  <el-option :value="1" label="男" />
                  <el-option :value="2" label="女" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="mt-4 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-700">
            <MapPin class="w-4 h-4 text-teal-500"/> 联系方式
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="editForm.phone" placeholder="请输入手机号码" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="电子邮箱" prop="email">
                <el-input v-model="editForm.email" placeholder="请输入常用邮箱" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="详细地址" prop="address" class="mt-2">
            <el-input v-model="editForm.address" type="textarea" :rows="2" placeholder="请输入联系地址或农场所在地" maxlength="100" show-word-limit />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="!rounded-lg">取 消</el-button>
          <el-button type="primary" @click="submitEdit" class="!bg-teal-600 !border-none hover:!bg-teal-700 !rounded-lg" :loading="saving">
            保存更改
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
  CheckCircle2, UserSquare, Phone, Mail, MapPin, RefreshCw, X, Save
} from 'lucide-vue-next'
import { getUserProfile, updateUserProfile, uploadAvatar } from '@/api/base'

const loading = ref(true)
const fileInput = ref(null)

// 头像 base64 缓存（断网时用），从 sessionStorage 恢复
const cachedAvatarBase64 = ref(sessionStorage.getItem('aqua_avatar_base64') || '')

// 页面展示的主数据源
const form = ref({
  username: '',
  realName: '',
  phone: '',
  email: '',
  gender: 0,
  address: '',
  avatar: '',
  userType: ''
})

// === 弹窗与表单编辑状态 ===
const dialogVisible = ref(false)
const saving = ref(false)
const editFormRef = ref(null)
const editForm = ref({})

// 增加基础的格式校验
const rules = {
  realName: [{ required: true, message: '真实姓名不能为空', trigger: 'blur' }],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ]
}

// === 计算属性 ===
const avatarUrl = computed(() => {
  // 断网时优先使用缓存的 base64 头像
  if (cachedAvatarBase64.value) return cachedAvatarBase64.value
  if (!form.value.avatar) return ''
  return '/api/' + form.value.avatar
})

const userInitial = computed(() => {
  return form.value.realName ? form.value.realName.charAt(0) : '?'
})

const genderLabel = computed(() => {
  const map = { 0: '未设置', 1: '男', 2: '女' }
  return map[form.value.gender] || '未设置'
})

const roleLabel = computed(() => {
  const map = { ADMIN: '系统管理员', REGULATOR: '监管方', FARMER: '养殖户' }
  return map[form.value.userType] || form.value.userType
})

// === 方法与逻辑 ===
const PROFILE_CACHE_KEY = 'aqua_profile'
const AVATAR_BASE64_KEY = 'aqua_avatar_base64'

/** 将远程头像图片拉取并转为 base64，缓存到 sessionStorage（断网兜底） */
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
        sessionStorage.setItem(AVATAR_BASE64_KEY, base64)
      }
    } catch { /* canvas tainted or not supported, ignore */ }
  }
  img.src = '/api/' + avatarPath
}

const loadProfile = async () => {
  loading.value = true

  // 🌟 第一步：优先从本地完整 profile 缓存恢复（断网时的核心兜底）
  const cachedProfile = sessionStorage.getItem(PROFILE_CACHE_KEY)
  if (cachedProfile) {
    try {
      form.value = JSON.parse(cachedProfile)
    } catch { /* ignore corrupt cache */ }
  }

  // 🌟 第二步：如果 profile 缓存不存在，退而求其次从 aqua_user 提取基本信息
  if (!cachedProfile) {
    const userStr = sessionStorage.getItem('aqua_user')
    if (userStr) {
      try {
        const cacheUser = JSON.parse(userStr)
        form.value.realName = cacheUser.name || ''
        form.value.userType = cacheUser.role || ''
        form.value.avatar = cacheUser.avatar || ''
      } catch { /* ignore */ }
    }
  }

  // 🌟 第三步：尝试向后端拉取最新完整数据并更新缓存
  try {
    const res = await getUserProfile()
    if (res.code === 200 && res.data) {
      form.value = res.data
      // 成功获取后写入 sessionStorage，供下次断网时使用
      sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(res.data))
      // 同时缓存头像 base64
      if (res.data.avatar) cacheAvatarAsBase64(res.data.avatar)
    }
  } catch (e) {
    // 断网时静默降级，使用已加载的缓存数据展示
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
          realName: editForm.value.realName,
          phone: editForm.value.phone,
          email: editForm.value.email,
          gender: editForm.value.gender,
          address: editForm.value.address
        })
        
        if (res.code === 200) {
          ElMessage.success('个人资料更新成功')
          dialogVisible.value = false
          form.value = { ...form.value, ...editForm.value }
          // 同步更新本地 profile 缓存，断网时也能看到最新数据
          sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(form.value))

          const userStr = sessionStorage.getItem('aqua_user')
          if (userStr) {
            const user = JSON.parse(userStr)
            user.name = editForm.value.realName
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
    ElMessage.warning('请选择图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 5MB')
    return
  }

  // 先把本地文件转成 base64 缓存起来（断网时也能显示）
  const reader = new FileReader()
  reader.onload = () => {
    cachedAvatarBase64.value = reader.result
    sessionStorage.setItem(AVATAR_BASE64_KEY, reader.result)
  }
  reader.readAsDataURL(file)

  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await uploadAvatar(fd)
    if (res.code === 200 && res.data) {
      form.value.avatar = res.data
      ElMessage.success('头像已更新')
      // 同步更新本地 profile 缓存
      sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(form.value))
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