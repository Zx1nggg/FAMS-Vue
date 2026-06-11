<template>
  <div class="max-w-6xl mx-auto w-full pb-10">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">账号设置</h1>
      <p class="text-sm text-gray-500 mt-1">管理您的账号安全、实名认证与联系方式。</p>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      
      <!-- 左侧导航侧边栏 -->
      <div class="w-full md:w-64 shrink-0">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col gap-1">
          <button 
            @click="activeTab = 'security'"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold text-left"
            :class="activeTab === 'security' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'"
          >
            <ShieldCheck class="w-5 h-5" :class="activeTab === 'security' ? 'text-teal-600' : 'text-gray-400'" />
            安全与登录
          </button>
          
          <button 
            @click="activeTab = 'identity'"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold text-left"
            :class="activeTab === 'identity' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
          >
            <UserCheck class="w-5 h-5" :class="activeTab === 'identity' ? 'text-blue-600' : 'text-gray-400'" />
            实名认证信息
          </button>

          <button 
            @click="activeTab = 'danger'"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold text-left mt-2 border-t border-gray-100"
            :class="activeTab === 'danger' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
          >
            <AlertOctagon class="w-5 h-5" :class="activeTab === 'danger' ? 'text-red-600' : 'text-gray-400'" />
            危险操作
          </button>
        </div>
      </div>

      <!-- 右侧内容面板 -->
      <div class="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        
        <!-- ==================== Tab 1: 安全与登录 ==================== -->
        <div v-show="activeTab === 'security'" class="animate-in fade-in duration-300">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ShieldCheck class="w-6 h-6 text-teal-500" /> 登录与安全
          </h2>

          <div class="space-y-6">
            <!-- 修改密码模块 -->
            <div class="border border-gray-100 rounded-xl p-5 hover:border-teal-100 transition-colors">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-50 rounded-lg"><Key class="w-5 h-5 text-slate-600" /></div>
                  <div>
                    <h3 class="font-bold text-gray-800">账户密码</h3>
                    <p class="text-xs text-gray-500 mt-0.5">建议您定期更改密码，确保账号安全</p>
                  </div>
                </div>
                <el-button type="primary" plain class="!bg-teal-50 !text-teal-700 !border-teal-200 hover:!bg-teal-600 hover:!text-white" @click="dialogs.password = true">修改密码</el-button>
              </div>
            </div>

            <!-- 修改手机号模块 -->
            <div class="border border-gray-100 rounded-xl p-5 hover:border-teal-100 transition-colors">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-50 rounded-lg"><Smartphone class="w-5 h-5 text-slate-600" /></div>
                  <div>
                    <h3 class="font-bold text-gray-800">绑定手机</h3>
                    <p class="text-xs text-gray-500 mt-0.5">当前绑定: <span class="font-mono text-gray-800 font-medium">138****5678</span></p>
                  </div>
                </div>
                <el-button type="primary" plain class="!bg-teal-50 !text-teal-700 !border-teal-200 hover:!bg-teal-600 hover:!text-white" @click="dialogs.phone = true">更换手机</el-button>
              </div>
            </div>

            <!-- 绑定邮箱模块 (演示发邮件场景) -->
            <div class="border border-gray-100 rounded-xl p-5 hover:border-teal-100 transition-colors">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-50 rounded-lg"><Mail class="w-5 h-5 text-slate-600" /></div>
                  <div>
                    <h3 class="font-bold text-gray-800">安全邮箱</h3>
                    <p class="text-xs text-gray-500 mt-0.5">未绑定。绑定后可用于接收告警邮件和找回密码。</p>
                  </div>
                </div>
                <el-button type="primary" plain class="!bg-teal-50 !text-teal-700 !border-teal-200 hover:!bg-teal-600 hover:!text-white" @click="dialogs.email = true">立即绑定</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== Tab 2: 实名认证 ==================== -->
        <div v-show="activeTab === 'identity'" class="animate-in fade-in duration-300">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <UserCheck class="w-6 h-6 text-blue-500" /> 实名认证信息
          </h2>

          <div class="bg-blue-50 border border-blue-100 rounded-xl p-6 relative overflow-hidden">
            <div class="absolute right-0 top-0 w-32 h-32 bg-blue-100/50 rounded-bl-full pointer-events-none"></div>
            
            <div class="relative z-10 flex flex-col gap-4">
              <div>
                <p class="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">当前认证状态</p>
                <div class="flex items-center gap-2">
                  <span class="bg-blue-600 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1 font-bold shadow-sm">
                    <CheckCircle2 class="w-3 h-3" /> 已实名
                  </span>
                  <span class="text-blue-800 font-bold text-lg">陈老农</span>
                </div>
              </div>
              
              <div class="bg-white/60 p-4 rounded-lg border border-blue-100/50 w-full sm:w-2/3">
                <p class="text-sm text-gray-700 mb-2">如因企业变更、法人更换等原因需要修改实名信息，请提交申请，由系统管理员人工审核。</p>
                <el-button type="primary" class="!bg-blue-600 !border-none hover:!bg-blue-700 !rounded-lg mt-2" @click="dialogs.identity = true">
                  申请修改实名
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== Tab 3: 危险操作 ==================== -->
        <div v-show="activeTab === 'danger'" class="animate-in fade-in duration-300">
          <h2 class="text-xl font-bold text-red-800 mb-6 flex items-center gap-2">
            <AlertOctagon class="w-6 h-6 text-red-500" /> 危险操作
          </h2>

          <div class="border border-red-200 bg-red-50/30 rounded-xl p-5">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 class="font-bold text-red-800">注销账号</h3>
                <p class="text-xs text-red-600/80 mt-1">账号注销后，您的所有农场、池塘、批次及台账数据将被永久删除，无法恢复。</p>
              </div>
              <el-button type="danger" class="!bg-red-500 !border-none hover:!bg-red-600 shadow-sm">申请注销</el-button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ==================== 各种弹窗组件 ==================== -->

    <!-- 1. 修改密码弹窗 -->
    <el-dialog v-model="dialogs.password" title="修改密码" width="400px" append-to-body class="!rounded-2xl">
      <el-form label-position="top" class="mt-2">
        <el-form-item label="当前密码">
          <el-input type="password" v-model="pwdForm.old" placeholder="请输入原密码" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input type="password" v-model="pwdForm.new" placeholder="请输入新密码（至少6位）" show-password />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input type="password" v-model="pwdForm.confirm" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogs.password = false" class="!rounded-lg">取消</el-button>
        <el-button type="primary" @click="submitPassword" class="!bg-teal-600 !border-none !rounded-lg" :loading="loadings.password">保存</el-button>
      </template>
    </el-dialog>

    <!-- 2. 更换手机号弹窗 (带验证码) -->
    <el-dialog v-model="dialogs.phone" title="更换绑定手机" width="400px" append-to-body class="!rounded-2xl">
      <el-form label-position="top" class="mt-2">
        <el-form-item label="新手机号">
          <el-input v-model="phoneForm.phone" placeholder="请输入新的 11 位手机号码" />
        </el-form-item>
        <el-form-item label="验证码">
          <div class="flex gap-2 w-full">
            <el-input v-model="phoneForm.code" placeholder="6位验证码" class="flex-1" />
            <el-button type="primary" plain class="!bg-teal-50 !text-teal-700 !border-teal-200" :disabled="countdown > 0" @click="sendCode('phone')">
              {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogs.phone = false" class="!rounded-lg">取消</el-button>
        <el-button type="primary" @click="submitPhone" class="!bg-teal-600 !border-none !rounded-lg" :loading="loadings.phone">确认更换</el-button>
      </template>
    </el-dialog>

    <!-- 3. 申请修改实名弹窗 -->
    <el-dialog v-model="dialogs.identity" title="申请修改实名信息" width="450px" append-to-body class="!rounded-2xl">
      <div class="bg-amber-50 border border-amber-100 text-amber-700 text-xs p-3 rounded-lg mb-4 flex gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        实名信息修改需要系统管理员人工审核，提交后请耐心等待，期间不影响系统正常使用。
      </div>
      <el-form label-position="top">
        <el-form-item label="新的真实姓名/法人代表">
          <el-input v-model="identityForm.newName" placeholder="请输入真实的法定名称" />
        </el-form-item>
        <el-form-item label="申请变更理由">
          <el-input v-model="identityForm.reason" type="textarea" :rows="3" placeholder="如：主体变更、填错修改等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogs.identity = false" class="!rounded-lg">取消</el-button>
        <el-button type="primary" @click="submitIdentity" class="!bg-blue-600 !border-none hover:!bg-blue-700 !rounded-lg" :loading="loadings.identity">提交申请</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  ShieldCheck, UserCheck, Key, Smartphone, Mail, AlertOctagon, CheckCircle2, AlertCircle
} from 'lucide-vue-next'

const activeTab = ref('security')

// 控制各个弹窗的显示
const dialogs = reactive({
  password: false,
  phone: false,
  email: false,
  identity: false
})

// 控制按钮 Loading 状态
const loadings = reactive({
  password: false,
  phone: false,
  identity: false
})

// 表单数据
const pwdForm = reactive({ old: '', new: '', confirm: '' })
const phoneForm = reactive({ phone: '', code: '' })
const identityForm = reactive({ newName: '', reason: '' })

// 验证码倒计时逻辑
const countdown = ref(0)
let timer = null

const sendCode = (type) => {
  if (type === 'phone' && !phoneForm.phone) {
    return ElMessage.warning('请先输入手机号码')
  }
  
  // 模拟发送请求
  ElMessage.success('验证码发送成功，请查收')
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

// 模拟提交：修改密码
const submitPassword = () => {
  if (!pwdForm.old || !pwdForm.new) return ElMessage.warning('请完整填写密码信息')
  if (pwdForm.new !== pwdForm.confirm) return ElMessage.error('两次输入的新密码不一致')
  
  loadings.password = true
  setTimeout(() => {
    ElMessage.success('密码修改成功，请妥善保管')
    dialogs.password = false
    loadings.password = false
    pwdForm.old = ''; pwdForm.new = ''; pwdForm.confirm = '';
  }, 800)
}

// 模拟提交：更换手机
const submitPhone = () => {
  if (!phoneForm.phone || !phoneForm.code) return ElMessage.warning('请完整填写手机和验证码')
  
  loadings.phone = true
  setTimeout(() => {
    ElMessage.success('手机号换绑成功！')
    dialogs.phone = false
    loadings.phone = false
    phoneForm.phone = ''; phoneForm.code = '';
    countdown.value = 0; clearInterval(timer);
  }, 800)
}

// 模拟提交：实名认证申请
const submitIdentity = () => {
  if (!identityForm.newName || !identityForm.reason) return ElMessage.warning('请完整填写申请资料')
  
  loadings.identity = true
  setTimeout(() => {
    ElMessage.success('实名修改申请已提交给管理员审核！')
    dialogs.identity = false
    loadings.identity = false
    identityForm.newName = ''; identityForm.reason = '';
  }, 800)
}

</script>

<style scoped>
/* 简单的进场动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>