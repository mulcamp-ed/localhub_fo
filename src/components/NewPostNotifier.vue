<script setup>
// 선택기능: 실시간 알림 — 서버 없이 일정 주기(polling)로 localStorage 를 확인해
// 다른 탭/창에서 작성된 새 게시글이 있으면 토스트로 알림 (WebSocket 미사용)
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storage } from '@/services/storage'
import { usePostStore } from '@/stores/posts'
import { regionName } from '@/constants/regions'

const store = usePostStore()
const toast = ref(null)
let timer = null

function check() {
  const posts = storage.getPosts()
  if (!posts.length) return
  const latest = posts.reduce((a, b) => (a.createdAt > b.createdAt ? a : b))
  const lastSeen = storage.getLastSeen()

  if (lastSeen === null) {
    storage.saveLastSeen(latest.id)
    return
  }
  if (latest.id !== lastSeen) {
    // 현재 스토어에 없던(다른 탭에서 추가된) 글이면 스토어에 반영
    if (!store.getById(latest.id)) store.posts = posts
    toast.value = latest
    storage.saveLastSeen(latest.id)
    setTimeout(() => (toast.value = null), 6000)
  }
}

onMounted(() => {
  storage.saveLastSeen(
    storage.getPosts().length
      ? storage.getPosts().reduce((a, b) => (a.createdAt > b.createdAt ? a : b)).id
      : null
  )
  timer = setInterval(check, 4000) // 4초 주기 polling
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <Transition name="slide">
    <RouterLink v-if="toast" :to="`/post/${toast.id}`" class="toast card" @click="toast = null">
      <span class="dot"></span>
      <div>
        <b>🔔 새 게시글</b>
        <p>[{{ regionName(toast.region) }}] {{ toast.title }}</p>
      </div>
    </RouterLink>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed; left: 22px; bottom: 22px; z-index: 160;
  display: flex; align-items: center; gap: 12px; padding: 14px 18px;
  max-width: 320px; box-shadow: var(--shadow-lg);
}
.toast p { margin: 2px 0 0; font-size: 13px; color: var(--text-muted);
  display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; flex-shrink: 0; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-120%); opacity: 0; }
</style>
