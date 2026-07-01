<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  total: { type: Number, required: true }, // 전체 아이템 수
  perPage: { type: Number, default: 10 }
})
const emit = defineEmits(['update:page'])

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const pages = computed(() => {
  const n = pageCount.value
  const cur = props.page
  const start = Math.max(1, Math.min(cur - 2, n - 4))
  const end = Math.min(n, start + 4)
  const arr = []
  for (let i = start; i <= end; i++) arr.push(i)
  return arr
})

function go(p) {
  if (p < 1 || p > pageCount.value || p === props.page) return
  emit('update:page', p)
}
</script>

<template>
  <nav v-if="pageCount > 1" class="pagination">
    <button class="pg" :disabled="page === 1" @click="go(page - 1)">‹</button>
    <button
      v-for="p in pages"
      :key="p"
      class="pg"
      :class="{ active: p === page }"
      @click="go(p)"
    >
      {{ p }}
    </button>
    <button class="pg" :disabled="page === pageCount" @click="go(page + 1)">›</button>
  </nav>
</template>

<style scoped>
.pagination { display: flex; justify-content: center; gap: 6px; margin: 24px 0; }
.pg {
  min-width: 36px; height: 36px; border: 1px solid var(--border);
  background: #fff; border-radius: 8px; font-weight: 600; color: var(--text);
}
.pg:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.pg.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.pg:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
