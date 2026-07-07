<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import { CATEGORIES, CATEGORY_MAP } from '@/constants/categories'
import { loadCategory, toGeoPoints } from '@/services/dataLoader'

const route = useRoute()
const MARKER_CAP = 800 // 성능 보호용 상한 (쇼핑 4천여건 대비)
const SEOUL = [37.5665, 126.978]

const mapEl = ref(null)
const activeCat = ref(route.query.category || 'attraction')
const loading = ref(false)
const shownCount = ref(0)
const totalCount = ref(0)
const error = ref('')

let map = null
let layer = null

async function render(catKey) {
  if (!map) return
  loading.value = true
  error.value = ''
  try {
    const items = await loadCategory(catKey)
    const points = toGeoPoints(items)
    totalCount.value = points.length
    const shown = points.slice(0, MARKER_CAP)
    shownCount.value = shown.length

    if (layer) layer.remove()
    layer = L.layerGroup().addTo(map)
    const color = CATEGORY_MAP[catKey]?.color || '#2563eb'

    for (const p of shown) {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 6, color, weight: 1.5, fillColor: color, fillOpacity: 0.6
      })
      const img = p.firstimage
        ? `<img src="${p.firstimage}" alt="" style="width:100%;max-height:110px;object-fit:cover;border-radius:6px;margin-bottom:6px" loading="lazy"/>`
        : ''
      marker.bindPopup(
        `<div style="min-width:170px">${img}<b>${p.title}</b>` +
          (p.addr1 ? `<br><span style="color:#666;font-size:12px">📍 ${p.addr1}</span>` : '') +
          (p.tel ? `<br><span style="color:#666;font-size:12px">☎ ${p.tel}</span>` : '') +
          `</div>`
      )
      layer.addLayer(marker)
    }
  } catch (e) {
    console.error('지도 데이터 로드 실패', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function selectCat(key) {
  activeCat.value = key
}

watch(activeCat, (k) => render(k))

onMounted(() => {
  map = L.map(mapEl.value, { center: SEOUL, zoom: 12, scrollWheelZoom: true })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)
  render(activeCat.value)
})

onUnmounted(() => {
  if (map) map.remove()
})
</script>

<template>
  <div class="container section">
    <h1 class="page-title">🗺️ 관광 지도</h1>
    <p class="page-sub">서울 권역 관광 데이터를 지도에 표시합니다. 카테고리를 선택하세요.</p>

    <div class="cat-filter">
      <button
        v-for="c in CATEGORIES"
        :key="c.key"
        class="chip"
        :class="{ active: c.key === activeCat }"
        :style="c.key === activeCat ? { background: c.color, borderColor: c.color } : {}"
        @click="selectCat(c.key)"
      >
        {{ c.emoji }} {{ c.label }}
      </button>
    </div>

    <div class="map-info muted">
      <span v-if="loading">데이터 불러오는 중…</span>
      <span v-else-if="error" class="err">⚠️ {{ error }}</span>
      <span v-else>
        {{ CATEGORY_MAP[activeCat]?.label }} · 총 {{ totalCount.toLocaleString() }}곳
        <template v-if="shownCount < totalCount">
          (성능을 위해 {{ shownCount.toLocaleString() }}곳만 표시)
        </template>
      </span>
    </div>

    <div ref="mapEl" class="map"></div>
  </div>
</template>

<style scoped>
.cat-filter { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.chip {
  padding: 7px 13px; border-radius: 999px; border: 1px solid var(--border);
  background: #fff; font-size: 13px; font-weight: 600; color: var(--text-muted);
}
.chip.active { color: #fff; }
.chip:hover { border-color: var(--primary); }
.map-info { margin-bottom: 10px; font-size: 14px; }
.map-info .err { color: var(--danger); }
.map { height: 62vh; min-height: 420px; border-radius: var(--radius); border: 1px solid var(--border); z-index: 1; }
</style>
