<script setup>
import { onMounted, ref, nextTick } from 'vue'
import {
  Chart, BarController, BarElement, DoughnutController, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend
} from 'chart.js'
import { loadManifest, loadCategory } from '@/services/dataLoader'
import { CATEGORY_MAP } from '@/constants/categories'
import { usePostStore } from '@/stores/posts'

Chart.register(BarController, BarElement, DoughnutController, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

const store = usePostStore()
const manifest = ref(null)
const loading = ref(true)
const topGu = ref([])
const hasTags = ref(false)

const catCanvas = ref(null)
const postCanvas = ref(null)
const guCanvas = ref(null)
const charts = []

// 서울 자치구 코드(lDongSignguCd) → 구 이름 (대표 매핑)
const GU_NAMES = {
  '110': '종로구', '140': '중구', '170': '용산구', '200': '성동구', '215': '광진구',
  '230': '동대문구', '260': '중랑구', '290': '성북구', '305': '강북구', '320': '도봉구',
  '350': '노원구', '380': '은평구', '410': '서대문구', '440': '마포구', '470': '양천구',
  '500': '강서구', '530': '구로구', '545': '금천구', '560': '영등포구', '590': '동작구',
  '620': '관악구', '650': '서초구', '680': '강남구', '710': '송파구', '740': '강동구'
}

onMounted(async () => {
  try {
    manifest.value = await loadManifest()
    await nextTick()
    renderCategoryChart()
    renderPostChart()
    // 자치구별 관광지+음식점 분포 (인기 지역 통계)
    const items = [...(await loadCategory('attraction')), ...(await loadCategory('restaurant'))]
    const guCount = {}
    for (const it of items) {
      const gu = GU_NAMES[it.lDongSignguCd]
      if (gu) guCount[gu] = (guCount[gu] || 0) + 1
    }
    topGu.value = Object.entries(guCount).sort((a, b) => b[1] - a[1]).slice(0, 10)
    await nextTick()
    renderGuChart()
  } catch (e) {
    console.error('대시보드 로드 실패', e)
  } finally {
    loading.value = false
  }
})

function renderCategoryChart() {
  const cats = manifest.value.categories
  charts.push(new Chart(catCanvas.value, {
    type: 'doughnut',
    data: {
      labels: cats.map((c) => c.label),
      datasets: [{
        data: cats.map((c) => c.total),
        backgroundColor: cats.map((c) => CATEGORY_MAP[c.key]?.color || '#999'),
        borderWidth: 2, borderColor: '#fff'
      }]
    },
    options: { plugins: { legend: { position: 'right', labels: { boxWidth: 14, font: { size: 12 } } } } }
  }))
}

function renderPostChart() {
  // 게시글에서 많이 쓰인 태그 TOP 8 (커뮤니티 관심사)
  const tagCount = {}
  for (const p of store.posts) for (const t of p.tags || []) tagCount[t] = (tagCount[t] || 0) + 1
  const top = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 8)
  hasTags.value = top.length > 0
  if (!top.length) return

  charts.push(new Chart(postCanvas.value, {
    type: 'bar',
    data: {
      labels: top.map((t) => `#${t[0]}`),
      datasets: [{
        label: '게시글 수',
        data: top.map((t) => t[1]),
        backgroundColor: '#2563eb', borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  }))
}

function renderGuChart() {
  charts.push(new Chart(guCanvas.value, {
    type: 'bar',
    data: {
      labels: topGu.value.map((g) => g[0]),
      datasets: [{
        label: '관광지·음식점 수',
        data: topGu.value.map((g) => g[1]),
        backgroundColor: '#dc2626', borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } }
    }
  }))
}
</script>

<template>
  <div class="container section">
    <h1 class="page-title">📊 데이터 대시보드</h1>
    <p class="page-sub">서울 관광 데이터 & 커뮤니티 현황 통계</p>

    <!-- KPI -->
    <div class="kpis">
      <div class="kpi card">
        <span class="kpi-label">전체 관광 데이터</span>
        <b class="kpi-num">{{ manifest ? manifest.grandTotal.toLocaleString() : '…' }}</b>
        <span class="muted">건 (서울)</span>
      </div>
      <div class="kpi card">
        <span class="kpi-label">전체 게시글</span>
        <b class="kpi-num">{{ store.posts.length }}</b>
        <span class="muted">개</span>
      </div>
      <div class="kpi card">
        <span class="kpi-label">누적 좋아요</span>
        <b class="kpi-num">{{ store.posts.reduce((s, p) => s + (p.likes || 0), 0) }}</b>
        <span class="muted">개</span>
      </div>
      <div class="kpi card">
        <span class="kpi-label">데이터 카테고리</span>
        <b class="kpi-num">{{ manifest ? manifest.categories.length : '…' }}</b>
        <span class="muted">종</span>
      </div>
    </div>

    <div class="charts">
      <div class="chart-box card">
        <h3>카테고리별 관광 데이터 비중</h3>
        <div class="canvas-wrap"><canvas ref="catCanvas"></canvas></div>
      </div>
      <div class="chart-box card">
        <h3>게시글 인기 태그 TOP</h3>
        <div class="canvas-wrap">
          <canvas v-show="hasTags" ref="postCanvas"></canvas>
          <p v-if="!hasTags && !loading" class="muted no-data">아직 태그가 있는 게시글이 없어요.</p>
        </div>
      </div>
      <div class="chart-box card wide">
        <h3>자치구별 관광지·음식점 TOP 10 (인기 지역)</h3>
        <div class="canvas-wrap tall"><canvas ref="guCanvas"></canvas></div>
      </div>
    </div>

    <p v-if="loading" class="muted" style="text-align: center">차트 생성 중…</p>
  </div>
</template>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 22px; }
.kpi { padding: 18px; display: flex; flex-direction: column; gap: 2px; }
.kpi-label { font-size: 13px; color: var(--text-muted); }
.kpi-num { font-size: 30px; font-weight: 800; color: var(--primary); line-height: 1.2; }

.charts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart-box { padding: 20px; }
.chart-box.wide { grid-column: 1 / -1; }
.chart-box h3 { margin: 0 0 16px; font-size: 16px; }
.canvas-wrap { position: relative; height: 300px; }
.canvas-wrap.tall { height: 380px; }
.no-data { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
@media (max-width: 720px) { .charts { grid-template-columns: 1fr; } }
</style>
