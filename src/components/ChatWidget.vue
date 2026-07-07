<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { askChatbot, isLLMEnabled } from '@/services/openai'

const open = ref(false)
const input = ref('')
const loading = ref(false)
const llm = ref(false)
const bodyEl = ref(null)

const messages = ref([
  {
    role: 'assistant',
    text: '안녕하세요! 서울 지역 정보를 도와드리는 LocalHub 챗봇이에요. 맛집·관광지·축제 등 무엇이든 물어보세요.'
  }
])

onMounted(async () => {
  llm.value = await isLLMEnabled()
  messages.value[0].text = llm.value
    ? '안녕하세요! 서울 지역 정보를 도와드리는 LocalHub 챗봇이에요. 맛집·관광지·축제 등 무엇이든 물어보세요. 🤖'
    : '안녕하세요! (로컬 검색 모드) 맛집·관광지·축제 키워드로 물어보면 제공 데이터에서 찾아드려요. 🔍'
})

const examples = ['한강 근처 관광지 알려줘', '서울 맛집 추천', '요즘 축제 뭐 있어?']

async function send(text) {
  const q = (text ?? input.value).trim()
  if (!q || loading.value) return
  input.value = ''
  messages.value.push({ role: 'user', text: q })
  loading.value = true
  await scrollDown()

  try {
    const { text: answer, sources, usedLLM } = await askChatbot(
      q,
      messages.value.filter((m) => m.role !== 'system')
    )
    messages.value.push({ role: 'assistant', text: answer, sources, usedLLM })
  } catch (e) {
    console.error('[chatbot] 오류', e)
    messages.value.push({
      role: 'assistant',
      text: `죄송해요, 답변 중 오류가 발생했어요.\n(${e.message})\n로컬 검색 키워드(맛집/관광지/축제)로 다시 시도해 주세요.`,
      error: true
    })
  } finally {
    loading.value = false
    await scrollDown()
  }
}

async function scrollDown() {
  await nextTick()
  if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight
}
</script>

<template>
  <!-- 플로팅 버튼 -->
  <button v-if="!open" class="fab" @click="open = true" aria-label="챗봇 열기">
    💬
    <span class="fab-label">지역정보 챗봇</span>
  </button>

  <!-- 대화창 -->
  <div v-if="open" class="chat card">
    <header class="chat-hd">
      <div>
        <b>🤖 LocalHub 챗봇</b>
        <span class="mode" :class="{ off: !llm }">{{ llm ? 'AI 모드' : '로컬 검색' }}</span>
      </div>
      <button class="x" @click="open = false" aria-label="닫기">✕</button>
    </header>

    <div ref="bodyEl" class="chat-body">
      <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
        <div class="bubble" :class="{ err: m.error }">
          <span v-if="m.role === 'assistant'" class="mode-icon">{{ m.usedLLM ? '🤖' : '💬' }}</span>
          <span class="text">{{ m.text }}</span>
          <!-- 근거 데이터 출처 -->
          <div v-if="m.sources?.length && m.usedLLM" class="sources">
            <span class="src-title">📌 참고한 장소</span>
            <span v-for="s in m.sources.slice(0, 4)" :key="s.contentid" class="src">{{ s.title }}</span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="msg assistant">
        <div class="bubble typing"><span></span><span></span><span></span></div>
      </div>

      <!-- 예시 질문 -->
      <div v-if="messages.length === 1" class="examples">
        <button v-for="ex in examples" :key="ex" class="ex" @click="send(ex)">{{ ex }}</button>
      </div>
    </div>

    <footer class="chat-ft">
      <input
        v-model="input"
        class="chat-input"
        placeholder="메시지를 입력하세요…"
        :disabled="loading"
        @keyup.enter="send()"
      />
      <button class="send" :disabled="loading || !input.trim()" @click="send()">➤</button>
    </footer>
  </div>
</template>

<style scoped>
.fab {
  position: fixed; right: 22px; bottom: 22px; z-index: 150;
  display: flex; align-items: center; gap: 8px;
  height: 56px; padding: 0 20px 0 16px; border: none; border-radius: 999px;
  background: var(--primary); color: #fff; font-size: 24px; box-shadow: var(--shadow-lg);
  transition: transform 0.15s;
}
.fab:hover { transform: scale(1.05); }
.fab-label { font-size: 14px; font-weight: 700; }

.chat {
  position: fixed; right: 22px; bottom: 22px; z-index: 150;
  width: 380px; max-width: calc(100vw - 20px); height: 560px; max-height: calc(100vh - 40px);
  display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-lg);
}
.chat-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; background: var(--primary); color: #fff;
}
.mode { font-size: 11px; margin-left: 8px; background: rgba(255,255,255,0.25); padding: 2px 8px; border-radius: 999px; }
.mode.off { background: rgba(0,0,0,0.2); }
.x { background: none; border: none; color: #fff; font-size: 16px; }

.chat-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: var(--bg); }
.msg { display: flex; }
.msg.user { justify-content: flex-end; }
.bubble {
  max-width: 82%; padding: 10px 14px; border-radius: 14px; font-size: 14px;
  white-space: pre-wrap; line-height: 1.55; box-shadow: var(--shadow-sm);
}
.msg.assistant .bubble { background: #fff; border-bottom-left-radius: 4px; }
.mode-icon { margin-right: 4px; }
.msg.user .bubble { background: var(--primary); color: #fff; border-bottom-right-radius: 4px; }
.bubble.err { background: #fef2f2; color: var(--danger); }

.sources { margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border); display: flex; flex-wrap: wrap; gap: 5px; }
.src-title { font-size: 11px; color: var(--text-muted); width: 100%; }
.src { font-size: 11px; background: var(--primary-soft); color: var(--primary); padding: 2px 7px; border-radius: 6px; }

.examples { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.ex { text-align: left; padding: 9px 12px; border: 1px solid var(--border); border-radius: 10px; background: #fff; font-size: 13px; color: var(--primary); }
.ex:hover { background: var(--primary-soft); }

.typing { display: inline-flex; gap: 4px; }
.typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--text-muted); animation: blink 1.2s infinite; }
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 60%, 100% { opacity: 0.3; } 30% { opacity: 1; } }

.chat-ft { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--border); background: #fff; }
.chat-input { flex: 1; padding: 10px 12px; border: 1px solid var(--border); border-radius: 999px; font-size: 14px; }
.chat-input:focus { outline: none; border-color: var(--primary); }
.send { width: 42px; border: none; border-radius: 50%; background: var(--primary); color: #fff; font-size: 15px; }
.send:disabled { opacity: 0.4; }

/* 모바일: 전체 화면 */
@media (max-width: 480px) {
  .chat { right: 0; bottom: 0; width: 100vw; max-width: 100vw; height: 100dvh; max-height: 100dvh; border-radius: 0; }
  .fab-label { display: none; }
  .fab { padding: 0; width: 56px; justify-content: center; }
}
</style>
