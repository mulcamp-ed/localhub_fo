<script setup>
import { RouterLink } from 'vue-router'
import { usePostStore } from '@/stores/posts'
import { regionName } from '@/constants/regions'

const store = usePostStore()

function fmt(ts) {
  return new Date(ts).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="container section">
    <h1 class="page-title">🔖 북마크</h1>
    <p class="page-sub">이 브라우저에서 북마크한 게시글</p>

    <div v-if="store.bookmarkedPosts.length" class="grid">
      <RouterLink
        v-for="p in store.bookmarkedPosts"
        :key="p.id"
        :to="`/post/${p.id}`"
        class="post-card card"
      >
        <span class="badge">{{ regionName(p.region) }}</span>
        <h4>{{ p.title }}</h4>
        <p class="excerpt muted">{{ p.content }}</p>
        <div class="row between meta">
          <span class="muted">{{ p.author }}</span>
          <span class="muted">👁 {{ p.views }} · ❤ {{ p.likes }} · {{ fmt(p.createdAt) }}</span>
        </div>
      </RouterLink>
    </div>
    <div v-else class="empty card">
      <p>북마크한 게시글이 없어요. 글 상세에서 🔖 버튼을 눌러 저장해보세요.</p>
      <RouterLink to="/" class="btn btn-primary">홈으로</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.post-card { padding: 18px; transition: transform 0.15s, box-shadow 0.15s; }
.post-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.post-card h4 { margin: 10px 0 6px; font-size: 16px; }
.excerpt { font-size: 14px; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.meta { font-size: 12px; }
.empty { display: flex; flex-direction: column; align-items: center; gap: 14px; }
</style>
