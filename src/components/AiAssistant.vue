<template>
  <button
    class="fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    :title="statusText"
    @click="open = true"
  >
    <Bot class="h-6 w-6" />
    <span
      class="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white"
      :class="configured ? 'bg-emerald-500' : 'bg-amber-400'"
    />
  </button>

  <Transition name="fade">
    <button v-if="open" class="fixed inset-0 z-[94] bg-slate-950/20" aria-label="关闭智能助手" @click="open = false" />
  </Transition>

  <Transition name="slide">
    <section
      v-if="open"
      class="fixed bottom-0 right-0 top-0 z-[95] flex w-full flex-col border-l border-slate-200 bg-white shadow-2xl sm:w-[440px]"
      aria-label="智渔智能助手"
    >
      <header class="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
        <div class="flex min-w-0 items-center gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Sparkles class="h-5 w-5" />
          </span>
          <div class="min-w-0">
            <h2 class="truncate text-sm font-bold text-slate-900">智渔智能助手</h2>
            <p class="truncate text-xs" :class="configured ? 'text-emerald-600' : 'text-amber-600'">{{ statusText }}</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="新建会话" @click="newConversation">
            <Plus class="h-5 w-5" />
          </button>
          <button class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="关闭" @click="open = false">
            <X class="h-5 w-5" />
          </button>
        </div>
      </header>

      <main ref="messagePane" class="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-5">
        <div v-if="messages.length === 0" class="mx-auto max-w-sm pt-10 text-center">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <Bot class="h-6 w-6" />
          </span>
          <h3 class="mt-4 font-bold text-slate-900">我可以读取 FAMS 数据协助分析</h3>
          <p class="mt-2 text-sm leading-6 text-slate-500">目前仅开放只读能力，不会替你修改、审批或删除业务记录。</p>
          <div class="mt-5 grid gap-2 text-left">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 hover:border-teal-300 hover:text-teal-700"
              :disabled="!configured"
              @click="sendMessage(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <article v-for="(message, index) in messages" :key="index" class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
          <div
            class="max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm"
            :class="message.role === 'user' ? 'bg-slate-900 text-white' : message.role === 'error' ? 'border border-red-200 bg-red-50 text-red-700' : 'border border-slate-200 bg-white text-slate-700'"
          >
            <p class="whitespace-pre-wrap break-words">{{ message.content }}</p>
            <div v-if="message.tools?.length" class="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
              <span v-for="tool in message.tools" :key="tool" class="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                数据工具 · {{ toolLabel(tool) }}
              </span>
            </div>
            <div v-if="message.citations?.length" class="mt-2 space-y-1 border-t border-slate-100 pt-2">
              <p class="text-[11px] font-medium text-slate-400">知识来源</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="citation in message.citations" :key="citation.fileId || citation.filename" class="rounded bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700">
                  {{ citation.filename }}
                </span>
              </div>
            </div>
          </div>
        </article>

        <div v-if="sending" class="flex justify-start">
          <div class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
            <LoaderCircle class="h-4 w-4 animate-spin" />
            {{ activityText }}
          </div>
        </div>
      </main>

      <footer class="shrink-0 border-t border-slate-200 bg-white p-4">
        <div v-if="!configured" class="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700">
          管理员尚未启用模型服务。后端需要配置 AI_ENABLED、AI_API_KEY 和 AI_MODEL。
        </div>
        <div class="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white p-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
          <textarea
            v-model="draft"
            rows="1"
            maxlength="2000"
            class="max-h-32 min-h-10 flex-1 resize-none border-0 px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="询问水质、告警、任务或经营情况…"
            :disabled="sending || !configured"
            @keydown.enter.exact.prevent="sendMessage()"
          />
          <button
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            :disabled="sending || !configured || !draft.trim()"
            title="发送"
            @click="sendMessage()"
          >
            <Send class="h-4 w-4" />
          </button>
        </div>
        <p class="mt-2 text-center text-[11px] text-slate-400">AI 建议仅供辅助判断，关键生产与监管处置请人工确认</p>
      </footer>
    </section>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { Bot, LoaderCircle, Plus, Send, Sparkles, X } from 'lucide-vue-next'
import request from '@/utils/request'

type Citation = { fileId?: string; filename: string }
type ChatMessage = { role: 'user' | 'assistant' | 'error'; content: string; tools?: string[]; citations?: Citation[] }

const open = ref(false)
const sending = ref(false)
const configured = ref(false)
const enabled = ref(false)
const model = ref('')
const knowledgeEnabled = ref(false)
const draft = ref('')
const conversationId = ref<string | null>(null)
const messages = ref<ChatMessage[]>([])
const messagePane = ref<HTMLElement | null>(null)
const activityText = ref('正在连接智能助手…')

const role = computed(() => {
  try { return JSON.parse(sessionStorage.getItem('aqua_user') || '{}').role || 'FARMER' } catch { return 'FARMER' }
})

const suggestions = computed(() => role.value === 'FARMER'
  ? ['分析当前养殖场的整体情况', '哪些池塘的最新水质需要优先关注？', '汇总未处理告警和待办任务']
  : ['总结当前监管态势和重点风险', '汇总全局未处理告警', '列出需要优先督办的养殖场'])

const statusText = computed(() => configured.value
  ? `只读模式${knowledgeEnabled.value ? ' · 知识库' : ''}${model.value ? ` · ${model.value}` : ''}`
  : enabled.value ? '配置不完整' : 'AI 服务未启用')

onMounted(async () => {
  try {
    const response = await request.get('/ai/status', { silent: true } as any)
    enabled.value = Boolean(response.data?.enabled)
    configured.value = Boolean(response.data?.configured)
    model.value = response.data?.model || ''
    knowledgeEnabled.value = Boolean(response.data?.knowledgeEnabled)
  } catch {
    configured.value = false
  }
})

async function sendMessage(suggestion?: string) {
  const content = (suggestion || draft.value).trim()
  if (!content || sending.value || !configured.value) return
  messages.value.push({ role: 'user', content })
  const assistant: ChatMessage = { role: 'assistant', content: '', tools: [], citations: [] }
  messages.value.push(assistant)
  draft.value = ''
  sending.value = true
  activityText.value = '正在连接智能助手…'
  await scrollToBottom()
  try {
    const response = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      credentials: 'include',
      headers: streamHeaders(),
      body: JSON.stringify({
        conversationId: conversationId.value,
        message: content,
      }),
    })
    const contentType = response.headers.get('content-type') || ''
    if (!response.ok || !contentType.includes('text/event-stream')) {
      const payload = await response.json().catch(() => null)
      throw new Error(payload?.message || `智能助手连接失败（HTTP ${response.status}）`)
    }
    if (!response.body) throw new Error('浏览器未收到流式响应体')
    await consumeEventStream(response.body, (event, payload) => {
      if (event === 'status') {
        activityText.value = payload.message || '正在分析…'
      } else if (event === 'delta') {
        assistant.content += payload.delta || ''
        void scrollToBottom()
      } else if (event === 'tool_start') {
        if (payload.tool && !assistant.tools?.includes(payload.tool)) assistant.tools?.push(payload.tool)
        activityText.value = `正在读取${toolLabel(payload.tool)}…`
      } else if (event === 'tool_end') {
        activityText.value = payload.success === false ? '部分数据读取失败，正在调整回答…' : '数据读取完成，正在整理回答…'
      } else if (event === 'done') {
        conversationId.value = payload.conversationId
        if (!assistant.content) assistant.content = payload.message || ''
        assistant.tools = payload.toolsUsed || assistant.tools
        assistant.citations = payload.citations || []
      } else if (event === 'error') {
        throw new Error(payload.message || '智能助手暂时无法回答')
      }
    })
    if (!assistant.content) throw new Error('智能助手未返回可展示内容')
  } catch (error: any) {
    const errorMessage = error?.message || '智能助手暂时无法回答，请稍后重试。'
    if (!assistant.content) {
      assistant.role = 'error'
      assistant.content = errorMessage
    } else {
      messages.value.push({ role: 'error', content: `回答未完整生成：${errorMessage}` })
    }
  } finally {
    sending.value = false
    await scrollToBottom()
  }
}

function newConversation() {
  conversationId.value = null
  messages.value = []
  draft.value = ''
}

function toolLabel(name: string) {
  const labels: Record<string, string> = {
    get_current_farm_overview: '农场概览',
    get_latest_water_quality: '最新水质',
    get_active_alarms: '活动告警',
    get_pending_pond_tasks: '待办任务',
    get_regulator_dashboard: '监管态势',
    file_search: '企业知识库',
  }
  return labels[name] || name
}

function streamHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' }
  const farmId = sessionStorage.getItem('current_farm_id')
  if (role.value === 'FARMER' && farmId) headers['X-Current-Farm-Id'] = farmId
  return headers
}

async function consumeEventStream(stream: ReadableStream<Uint8Array>, onEvent: (event: string, payload: any) => void) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
    buffer = buffer.replace(/\r\n/g, '\n')
    let boundary = buffer.indexOf('\n\n')
    while (boundary >= 0) {
      const block = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      let event = 'message'
      const data: string[] = []
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        if (line.startsWith('data:')) data.push(line.slice(5).trimStart())
      }
      if (data.length) onEvent(event, JSON.parse(data.join('\n')))
      boundary = buffer.indexOf('\n\n')
    }
    if (done) break
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messagePane.value) messagePane.value.scrollTop = messagePane.value.scrollHeight
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.22s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
