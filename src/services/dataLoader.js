// 제공 JSON(서울 TourAPI) 로더 — public/data/seoul/*.json 을 fetch 하여 메모리 캐시
import { KEYWORD_TO_CATEGORY } from '@/constants/categories'

const BASE = `${import.meta.env.BASE_URL}data/seoul`
const cache = new Map() // key -> items[]
let manifestCache = null

export async function loadManifest() {
  if (manifestCache) return manifestCache
  const res = await fetch(`${BASE}/manifest.json`)
  if (!res.ok) throw new Error(`manifest 로드 실패 (${res.status})`)
  manifestCache = await res.json()
  return manifestCache
}

// 특정 카테고리 items 로드 (캐시됨). 각 item 에 category 키를 부여.
export async function loadCategory(key) {
  if (cache.has(key)) return cache.get(key)
  const res = await fetch(`${BASE}/${key}.json`)
  if (!res.ok) throw new Error(`${key} 데이터 로드 실패 (${res.status})`)
  const json = await res.json()
  const items = (json.items || []).map((it) => ({ ...it, category: key }))
  cache.set(key, items)
  return items
}

export async function loadCategories(keys) {
  const arr = await Promise.all(keys.map((k) => loadCategory(k)))
  return arr.flat()
}

// 좌표를 float 로 변환한 POI 목록 반환 (지도용)
export function toGeoPoints(items) {
  return items
    .map((it) => {
      const lng = parseFloat(it.mapx)
      const lat = parseFloat(it.mapy)
      return { ...it, lat, lng }
    })
    .filter((it) => Number.isFinite(it.lat) && Number.isFinite(it.lng))
}

// 질의문에서 검색 대상 카테고리 추정 (매칭 없으면 대표 4종)
export function inferCategories(query) {
  const q = (query || '').toLowerCase()
  const hit = new Set()
  for (const rule of KEYWORD_TO_CATEGORY) {
    if (rule.words.some((w) => q.includes(w))) rule.keys.forEach((k) => hit.add(k))
  }
  if (hit.size === 0) return ['attraction', 'restaurant', 'festival', 'culture']
  return [...hit]
}

// 키워드 기반 로컬 검색 — 제목/주소 매칭 점수순 상위 N개
export async function searchLocal(query, { limit = 8, categories } = {}) {
  const keys = categories || inferCategories(query)
  const items = await loadCategories(keys)
  const terms = (query || '')
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((t) => t.length > 1)

  const scored = []
  for (const it of items) {
    const title = (it.title || '').toLowerCase()
    const addr = (it.addr1 || '').toLowerCase()
    let score = 0
    for (const t of terms) {
      if (title.includes(t)) score += 3
      if (addr.includes(t)) score += 1
    }
    if (score > 0) scored.push({ item: it, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => s.item)
}
