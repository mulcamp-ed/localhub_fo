<script setup>
import { onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import ChatWidget from '@/components/ChatWidget.vue'
import NewPostNotifier from '@/components/NewPostNotifier.vue'
import { usePostStore } from '@/stores/posts'

// 최초 진입 시 데모 게시글 시드 (localStorage 비어있을 때만)
const store = usePostStore()
onMounted(() => store.seedIfEmpty())
</script>

<template>
  <AppHeader />
  <main>
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </main>

  <footer class="site-footer">
    <div class="container">
      <p class="muted">
        이 서비스는 한국관광공사 Tour API(TourAPI 4.0)의 데이터를 활용하였습니다.
        출처: 한국관광공사 (data.go.kr) · 라이선스: 공공누리 제3유형(출처표시·변경금지)
      </p>
      <p class="muted">© 2026 LocalHub · 교육용 프로젝트 (백엔드 없는 정적 SPA)</p>
    </div>
  </footer>

  <!-- 선택기능: 실시간 알림 (localStorage polling) -->
  <NewPostNotifier />
  <!-- 필수: 챗봇 플로팅 위젯 -->
  <ChatWidget />
</template>

<style scoped>
main { min-height: calc(100vh - 220px); }
.site-footer {
  border-top: 1px solid var(--border);
  padding: 24px 0;
  margin-top: 40px;
  background: #fff;
}
.site-footer p { margin: 4px 0; font-size: 13px; }
</style>
