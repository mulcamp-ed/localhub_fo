<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import RegionCard from '@/components/RegionCard.vue'
import { REGIONS, regionName } from '@/constants/regions'
import { CATEGORIES } from '@/constants/categories'
import { usePostStore } from '@/stores/posts'
import { loadManifest } from '@/services/dataLoader'

const store = usePostStore()
const manifest = ref(null)

const recentPosts = computed(() =>
  [...store.posts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6)
)

onMounted(async () => {
  try {
    manifest.value = await loadManifest()
  } catch (e) {
    console.error('manifest 로드 실패', e)
  }
})

function fmt(ts) {
  return new Date(ts).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <!-- 히어로 -->
  <section class="hero">
    <div class="container">
      <h1>📍 LocalHub</h1>
      <p class="lead">공공데이터로 만나는 우리 동네 — 익명으로 자유롭게 지역 정보를 나눠요.</p>
      <div class="row gap-8 wrap">
        <RouterLink to="/map" class="btn btn-primary">🗺️ 지도로 둘러보기</RouterLink>
        <RouterLink to="/dashboard" class="btn">📊 데이터 대시보드</RouterLink>
      </div>
      <p v-if="manifest" class="hero-stat">
        서울 권역 <b>{{ manifest.grandTotal.toLocaleString() }}</b>건의 관광 데이터 제공 중
        · 출처 {{ manifest.source }}
      </p>
    </div>
  </section>

  <div class="container">
    <!-- 서울 게시판 -->
    <section class="section">
      <h2 class="page-title">서울 게시판</h2>
      <p class="page-sub">서울의 지역 정보를 익명으로 자유롭게 공유하세요.</p>
      <div class="grid regions">
        <RegionCard
          v-for="r in REGIONS"
          :key="r.key"
          :region="r"
          :count="store.countByRegion[r.key] || 0"
        />
      </div>
    </section>

    <!-- 데이터 카테고리 요약 -->
    <section v-if="manifest" class="section">
      <h2 class="page-title">서울 관광 데이터</h2>
      <p class="page-sub">한국관광공사 TourAPI 제공 · 카테고리별 건수</p>
      <div class="grid cats">
        <RouterLink
          v-for="c in manifest.categories"
          :key="c.key"
          :to="`/map?category=${c.key}`"
          class="cat-chip card"
        >
          <span class="cat-emoji">{{ CATEGORIES.find((x) => x.key === c.key)?.emoji }}</span>
          <span class="cat-label">{{ c.label }}</span>
          <b class="cat-count">{{ c.total.toLocaleString() }}</b>
        </RouterLink>
      </div>
    </section>

    <!-- 최근 게시글 -->
    <section class="section">
      <h2 class="page-title">최근 게시글</h2>
      <p class="page-sub">방금 올라온 이야기</p>
      <div v-if="recentPosts.length" class="grid posts">
        <RouterLink
          v-for="p in recentPosts"
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
      <div v-else class="empty">아직 게시글이 없어요. 첫 글을 남겨보세요!</div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: #fff;
  padding: 56px 0;
}
.hero h1 { font-size: 40px; margin: 0 0 8px; }
.hero .lead { font-size: 18px; opacity: 0.95; margin: 0 0 22px; }
.hero .btn { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.4); color: #fff; }
.hero .btn:hover { background: rgba(255,255,255,0.28); }
.hero .btn-primary { background: #fff; color: var(--primary); border-color: #fff; }
.hero-stat { margin-top: 18px; font-size: 14px; opacity: 0.9; }

.grid { display: grid; gap: 14px; }
.regions { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.cats { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.posts { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }

.cat-chip {
  display: flex; align-items: center; gap: 8px; padding: 14px 16px;
  transition: border-color 0.15s;
}
.cat-chip:hover { border-color: var(--primary); }
.cat-emoji { font-size: 22px; }
.cat-label { font-size: 14px; font-weight: 600; }
.cat-count { margin-left: auto; color: var(--primary); }

.post-card { padding: 18px; transition: transform 0.15s, box-shadow 0.15s; }
.post-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.post-card h4 { margin: 10px 0 6px; font-size: 16px; }
.excerpt {
  font-size: 14px; margin: 0 0 12px;
  display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.meta { font-size: 12px; }
</style>
