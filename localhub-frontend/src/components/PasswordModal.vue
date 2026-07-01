<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '비밀번호 확인' },
  action: { type: String, default: '확인' } // '수정' | '삭제' 등
})
const emit = defineEmits(['submit', 'close'])

const pw = ref('')
const error = ref('')
const inputEl = ref(null)

watch(
  () => props.open,
  async (v) => {
    if (v) {
      pw.value = ''
      error.value = ''
      await nextTick()
      inputEl.value?.focus()
    }
  }
)

function submit() {
  if (!pw.value) {
    error.value = '비밀번호를 입력하세요.'
    return
  }
  // 부모가 일치 여부를 판단 → 실패 시 setError 로 되돌려받음
  emit('submit', pw.value, (msg) => (error.value = msg))
}

defineExpose({ setError: (m) => (error.value = m) })
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="emit('close')">
      <div class="modal card" role="dialog" aria-modal="true">
        <h3>{{ title }}</h3>
        <p class="muted hint">작성 시 입력한 수정용 비밀번호를 입력하세요.</p>
        <input
          ref="inputEl"
          v-model="pw"
          type="password"
          class="input"
          placeholder="비밀번호"
          @keyup.enter="submit"
        />
        <p v-if="error" class="err">{{ error }}</p>
        <div class="row gap-8" style="justify-content: flex-end; margin-top: 16px">
          <button class="btn" @click="emit('close')">취소</button>
          <button class="btn btn-primary" @click="submit">{{ action }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px;
}
.modal { padding: 24px; width: 100%; max-width: 380px; }
.modal h3 { margin: 0 0 4px; }
.hint { font-size: 13px; margin: 0 0 14px; }
.err { color: var(--danger); font-size: 13px; margin: 8px 0 0; }
</style>
