<template>
  <div class="max-w-6xl mx-auto w-full pb-10">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">监管中心设置</h1>
      <p class="text-sm text-gray-500 mt-1">管理您的安全凭证、执法信息与监管预警通知。</p>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      
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
            @click="activeTab = 'agency'"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold text-left"
            :class="activeTab === 'agency' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'"
          >
            <Building class="w-5 h-5" :class="activeTab === 'agency' ? 'text-indigo-600' : 'text-gray-400'" />
            监管机构信息
          </button>

          <button 
            @click="activeTab = 'notifications'"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold text-left mt-2 border-t border-gray-100"
            :class="activeTab === 'notifications' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'"
          >
            <BellRing class="w-5 h-5" :class="activeTab === 'notifications' ? 'text-amber-600' : 'text-gray-400'" />
            预警通知设置
          </button>
        </div>
      </div>

      <div class="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        
        <div v-show="activeTab === 'security'" class="animate-in fade-in duration-300">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ShieldCheck class="w-6 h-6 text-teal-500" /> 安全与凭证
          </h2>

          <div class="space-y-6">
            <div class="border border-gray-100 rounded-xl p-5 hover:border-teal-100 transition-colors">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-50 rounded-lg"><Key class="w-5 h-5 text-slate-600" /></div>
                  <div>
                    <h3 class="font-bold text-gray-800">账户密码</h3>
                    <p class="text-xs text-gray-500 mt-0.5">建议您定期更改密码，确保监管数据安全</p>
                  </div>
                </div>
                <el-button type="primary" plain class="!bg-teal-50 !text-teal-700 !border-teal-200 hover:!bg-teal-600 hover:!text-white" @click="dialogs.password = true">修改密码</el-button>
              </div>
            </div>

            <div class="border border-gray-100 rounded-xl p-5 hover:border-teal-100 transition-colors">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-50 rounded-lg"><Smartphone class="w-5 h-5 text-slate-600" /></div>
                  <div>
                    <h3 class="font-bold text-gray-800">工作手机</h3>
                    <p class="text-xs text-gray-500 mt-0.5">当前手机: <span class="font-mono text-gray-800 font-medium">{{ maskedPhone }}</span> <span class="text-amber-500 ml-1">(短信服务未接入)</span></p>
                  </div>
                </div>
                <el-button type="primary" plain class="!bg-teal-50 !text-teal-700 !border-teal-200 hover:!bg-teal-600 hover:!text-white" disabled title="短信换绑尚未接入">更换手机</el-button>
              </div>
            </div>

            <div class="border border-gray-100 rounded-xl p-5 hover:border-teal-100 transition-colors">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-50 rounded-lg"><Mail class="w-5 h-5 text-slate-600" /></div>
                  <div>
                    <h3 class="font-bold text-gray-800">政务/工作邮箱</h3>
                    <p class="text-xs text-gray-500 mt-0.5">{{ profile.email || '未填写邮箱' }}。邮件报告服务尚未接入。</p>
                  </div>
                </div>
                <el-button type="primary" plain class="!bg-teal-50 !text-teal-700 !border-teal-200 hover:!bg-teal-600 hover:!text-white" @click="$router.push('/regulator/profile')">维护邮箱</el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'agency'" class="animate-in fade-in duration-300">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Building class="w-6 h-6 text-indigo-500" /> 机构与职权信息
          </h2>

          <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-6 relative overflow-hidden">
            <div class="absolute right-0 top-0 w-32 h-32 bg-indigo-100/50 rounded-bl-full pointer-events-none"></div>
            
            <div class="relative z-10 flex flex-col gap-5">
              <div>
                <p class="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-2">当前执法官身份</p>
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">
                    {{ profile.realName?.slice(0, 1) || '监' }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-indigo-900 font-bold text-lg">{{ profile.realName || '未填写姓名' }}</span>
                      <span class="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1 font-bold shadow-sm">
                        <ShieldCheck class="w-3 h-3" /> {{ profile.userType === 'REGULATOR' ? '监管账号' : '当前账号' }}
                      </span>
                    </div>
                    <p class="text-sm text-indigo-700 mt-0.5">执法资质信息尚未接入</p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div class="bg-white/70 p-4 rounded-lg border border-indigo-100/50">
                  <p class="text-xs text-gray-500 mb-1">所属单位</p>
                  <p class="text-sm font-bold text-gray-800">尚未配置</p>
                </div>
                <div class="bg-white/70 p-4 rounded-lg border border-indigo-100/50">
                  <p class="text-xs text-gray-500 mb-1">管辖范围</p>
                  <p class="text-sm font-bold text-gray-800">尚未配置地域范围</p>
                </div>
              </div>
              
              <div class="mt-2">
                <p class="text-sm text-gray-600 mb-3">如遇岗位调动或管辖区域变更，请向系统中心提交权限移交或变更申请。</p>
                <el-button type="primary" class="!bg-indigo-600 !border-none hover:!bg-indigo-700 !rounded-lg" disabled title="机构审批流程尚未配置">
                  申请机构/权限变更
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'notifications'" class="animate-in fade-in duration-300">
          <h2 class="text-xl font-bold text-amber-800 mb-6 flex items-center gap-2">
            <BellRing class="w-6 h-6 text-amber-500" /> 预警订阅设置
          </h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 class="font-bold text-gray-800">产地检疫违规告警</h3>
                <p class="text-xs text-gray-500 mt-1">当辖区内养殖场未开具产地检疫证明直接进行苗种销售时，发送短信和系统通知。</p>
              </div>
              <el-switch disabled title="通知推送服务尚未接入" v-model="notifySettings.quarantine" active-color="#f59e0b" />
            </div>

            <div class="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 class="font-bold text-gray-800">苗种异常高死亡率告警</h3>
                <p class="text-xs text-gray-500 mt-1">当辖区内某一批次苗种连续3天死亡率异常（高于设定阈值）时推送预警，防范重大疫病。</p>
              </div>
              <el-switch disabled title="通知推送服务尚未接入" v-model="notifySettings.mortality" active-color="#f59e0b" />
            </div>

            <div class="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 class="font-bold text-gray-800">跨省违规调拨追踪</h3>
                <p class="text-xs text-gray-500 mt-1">辖区内苗种跨省调运未进行系统备案时的实时拦截与告警通知。</p>
              </div>
              <el-switch disabled title="通知推送服务尚未接入" v-model="notifySettings.transport" active-color="#f59e0b" />
            </div>

            <div class="flex items-center justify-between pb-2">
              <div>
                <h3 class="font-bold text-gray-800">周度监管数据简报</h3>
                <p class="text-xs text-gray-500 mt-1">每周五下午汇总辖区内苗种生产、抽检合格率及违规情况，推送到工作箱。</p>
              </div>
              <el-switch disabled title="通知推送服务尚未接入" v-model="notifySettings.weeklyReport" active-color="#f59e0b" />
            </div>
          </div>
        </div>

      </div>
    </div>

    <el-dialog v-model="dialogs.password" title="修改密码" width="400px" append-to-body class="!rounded-2xl">
      <el-form label-position="top" class="mt-2">
        <el-form-item label="当前密码">
          <el-input type="password" v-model="pwdForm.old" placeholder="请输入原密码" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input type="password" v-model="pwdForm.new" placeholder="要求：8位以上，包含大小写及数字" show-password />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input type="password" v-model="pwdForm.confirm" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogs.password = false" class="!rounded-lg">取消</el-button>
        <el-button type="primary" @click="submitPassword" class="!bg-teal-600 !border-none !rounded-lg" :loading="loadings.password">保存修改</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogs.phone" title="更换工作手机" width="400px" append-to-body class="!rounded-2xl">
      <div class="bg-blue-50 text-blue-600 text-xs p-3 rounded-lg mb-4 flex gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        更换后，所有紧急监管预警短信将发送至新手机号。
      </div>
      <el-form label-position="top">
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
        <el-button type="primary" @click="submitPhone" class="!bg-teal-600 !border-none !rounded-lg" :loading="loadings.phone">确认换绑</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogs.agency" title="申请调动/权限变更" width="450px" append-to-body class="!rounded-2xl">
      <div class="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs p-3 rounded-lg mb-4 flex gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        辖区权限变更涉及监管数据隔离，需由省级/市级系统管理员人工审批核实。
      </div>
      <el-form label-position="top">
        <el-form-item label="拟调入机构/新辖区">
          <el-input v-model="agencyForm.target" placeholder="例如：厦门市翔安区农业农村局" />
        </el-form-item>
        <el-form-item label="申请说明及调动文号">
          <el-input v-model="agencyForm.reason" type="textarea" :rows="3" placeholder="请简述理由并提供相关调令文号..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogs.agency = false" class="!rounded-lg">取消</el-button>
        <el-button type="primary" @click="submitAgency" class="!bg-indigo-600 !border-none hover:!bg-indigo-700 !rounded-lg" :loading="loadings.agency">提交审批</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import request from '@/utils/request'
import { clearUserCache } from '@/utils/storage'
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
const profile = ref({})
const maskedPhone = computed(() => profile.value.phone?.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') || '未填写')
onMounted(async () => { profile.value = (await request.get('/user/profile')).data })
import { 
  ShieldCheck, Building, Key, Smartphone, Mail, BellRing, CheckCircle2, AlertCircle
} from 'lucide-vue-next'

const activeTab = ref('security')

// 控制各个弹窗的显示
const dialogs = reactive({
  password: false,
  phone: false,
  agency: false
})

// 控制按钮 Loading 状态
const loadings = reactive({
  password: false,
  phone: false,
  agency: false
})

// 预警通知开关状态配置 (监管端独有)
const notifySettings = reactive({
  quarantine: true,    // 产地检疫
  mortality: true,     // 异常死亡
  transport: false,    // 跨区调拨
  weeklyReport: true   // 周报推送
})

// 表单数据
const pwdForm = reactive({ old: '', new: '', confirm: '' })
const phoneForm = reactive({ phone: '', code: '' })
const agencyForm = reactive({ target: '', reason: '' })

// 尚未配置短信、实名认证审批或机构调动服务；不得展示虚假成功。
const countdown = ref(0)
const sendCode = () => ElMessage.info('短信服务尚未接入')
const submitPhone = () => ElMessage.info('短信换绑尚未接入，请在个人资料中维护联系电话')
const submitIdentity = () => ElMessage.info('实名认证审批流程尚未配置')
const submitAgency = () => ElMessage.info('机构调动审批流程尚未配置')
const submitPassword = async () => {
  if (!pwdForm.old || pwdForm.new.length < 6) return ElMessage.warning('请输入原密码和至少 6 位的新密码')
  if (pwdForm.new !== pwdForm.confirm) return ElMessage.error('两次新密码不一致')
  loadings.password = true
  try {
    await request.put('/user/password', { oldPassword: pwdForm.old, newPassword: pwdForm.new })
    clearUserCache(); sessionStorage.removeItem('aqua_user'); sessionStorage.removeItem('current_farm_id')
    ElMessage.success('密码已修改，请重新登录')
    window.location.href = '/login'
  } finally { loadings.password = false; pwdForm.old = ''; pwdForm.new = ''; pwdForm.confirm = '' }
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
