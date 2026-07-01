<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="container section">
    <div class="empty card">
      <h1 style="font-size: 48px; margin: 0">🧭</h1>
      <h2>페이지를 찾을 수 없어요 (404)</h2>
      <p class="muted">요청하신 경로가 존재하지 않습니다.</p>
      <RouterLink to="/" class="btn btn-primary">홈으로 돌아가기</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 20px; }
</style>
