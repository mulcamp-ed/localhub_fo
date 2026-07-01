<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Pagination from '@/components/Pagination.vue'
import { REGIONS, regionName, REGION_MAP } from '@/constants/regions'
import { usePostStore } from '@/stores/posts'

const props = defineProps({ region: { type: String, required: true } })
const store = usePostStore()
const router = useRouter()

const keyword = ref('')
const tagFilter = ref('')
const page = ref(1)
const perPage = 8

const regionInfo = computed(() => REGION_MAP[props.region])

const filtered = computed(() => {
  let list = store.byRegion(props.region)
  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        p.content.toLowerCase().includes(kw) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(kw))
    )
  }
  if (tagFilter.value) {
    list = list.filter((p) => (p.tags || []).includes(tagFilter.value))
  }
  return list
})

const paged = computed(() => {
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

const regionTags = computed(() => {
  const set = new Set()
  store.byRegion(props.region).forEach((p) => (p.tags || []).forEach((t) => set.add(t)))
  return [...set]
})

watch([keyword, tagFilter], () => (page.value = 1))

function fmt(ts) {
  return new Date(ts).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })
}
</script>

<template>
  <div class="container section">
    <!-- 권역 탭 -->
    <div class="tabs">
      <RouterLink
        v-for="r in REGIONS"
        :key="r.key"
        :to="`/board/${r.key}`"
        class="tab"
        :class="{ active: r.key === region }"
      >
        {{ r.emoji }} {{ r.name }}
      </RouterLink>
    </div>

    <div class="row between wrap" style="margin: 20px 0">
      <div>
        <h1 class="page-title">{{ regionInfo?.emoji }} {{ regionName(region) }} 게시판</h1>
        <p class="page-sub" style="margin: 0">총 {{ filtered.length }}개의 글</p>
      </div>
      <RouterLink :to="`/board/${region}/write`" class="btn btn-primary">✏️ 글쓰기</RouterLink>
    </div>

    <!-- 검색 / 태그 필터 -->
    <div class="toolbar card">
      <input v-model="keyword" class="input" placeholder="🔍 제목·내용·태그 검색" />
      <select v-model="tagFilter" class="input tag-select">
        <option value="">전체 태그</option>
        <option v-for="t in regionTags" :key="t" :value="t">#{{ t }}</option>
      </select>
    </div>

    <!-- 목록 -->
    <div v-if="paged.length" class="table-wrap card">
      <table class="post-table">
        <thead>
          <tr>
            <th class="c-title">제목</th>
            <th class="c-author">작성자</th>
            <th class="c-meta">조회</th>
            <th class="c-meta">좋아요</th>
            <th class="c-date">작성일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in paged" :key="p.id" @click="router.push(`/post/${p.id}`)">
            <td class="c-title">
              <span class="t">{{ p.title }}</span>
              <span v-if="store.isBookmarked(p.id)" title="북마크됨">🔖</span>
              <span v-for="t in p.tags" :key="t" class="tag">#{{ t }}</span>
            </td>
            <td class="c-author">{{ p.author }}</td>
            <td class="c-meta">{{ p.views }}</td>
            <td class="c-meta">{{ p.likes }}</td>
            <td class="c-date">{{ fmt(p.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty card">
      <p>{{ keyword || tagFilter ? '검색 결과가 없습니다.' : '아직 게시글이 없어요.' }}</p>
      <RouterLink :to="`/board/${region}/write`" class="btn btn-primary">첫 글 작성하기</RouterLink>
    </div>

    <Pagination v-model:page="page" :total="filtered.length" :per-page="perPage" />
  </div>
</template>

<style scoped>
.tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.tab {
  padding: 8px 14px; border-radius: 999px; border: 1px solid var(--border);
  background: #fff; font-size: 14px; font-weight: 600; color: var(--text-muted);
}
.tab:hover { border-color: var(--primary); color: var(--primary); }
.tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.toolbar { display: flex; gap: 10px; padding: 14px; margin-bottom: 16px; }
.tag-select { max-width: 180px; }

.table-wrap { overflow-x: auto; }
.post-table { width: 100%; border-collapse: collapse; }
.post-table th, .post-table td { padding: 12px 14px; text-align: left; font-size: 14px; border-bottom: 1px solid var(--border); }
.post-table th { background: #fafafa; color: var(--text-muted); font-size: 13px; }
.post-table tbody tr { cursor: pointer; }
.post-table tbody tr:hover { background: var(--primary-soft); }
.post-table tbody tr:last-child td { border-bottom: none; }
.c-title .t { font-weight: 600; margin-right: 6px; }
.c-title .tag { margin-left: 4px; }
.c-author, .c-meta, .c-date { white-space: nowrap; color: var(--text-muted); }
.c-meta { text-align: center; }
.empty { display: flex; flex-direction: column; align-items: center; gap: 14px; }

@media (max-width: 640px) {
  .c-author, .c-meta { display: none; }
}
</style>
