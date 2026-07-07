<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  region: { type: Object, required: true },
  count: { type: Number, default: 0 }
})
</script>

<template>
  <RouterLink :to="`/board/${region.key}`" class="region-card card">
    <div class="emoji">{{ region.emoji }}</div>
    <div class="info">
      <h3>{{ region.name }}</h3>
      <p class="muted">게시글 {{ count }}개</p>
    </div>
    <span v-if="region.hasData" class="badge">데이터 제공</span>
  </RouterLink>
</template>

<style scoped>
.region-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  position: relative;
}
.region-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.emoji { font-size: 34px; }
.info h3 { margin: 0 0 2px; font-size: 17px; }
.info p { margin: 0; font-size: 13px; }
.badge { position: absolute; top: 12px; right: 12px; }
</style>
