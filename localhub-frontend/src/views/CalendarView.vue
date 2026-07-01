<script setup>
// 선택기능: 축제 캘린더
// ⚠️ 제공 목록 데이터에는 실제 행사 시작/종료일 필드가 없어, '정보 갱신일(modifiedtime)' 기준으로 배치합니다.
import { computed, onMounted, ref } from 'vue'
import { loadCategory } from '@/services/dataLoader'

const festivals = ref([])
const loading = ref(true)
const cursor = ref(new Date(2026, 6, 1)) // 기본 2026-07
const selectedDay = ref(null)

function parseDate(s) {
  // YYYYMMDDHHmmss
  if (!s || s.length < 8) return null
  return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8))
}

onMounted(async () => {
  try {
    const items = await loadCategory('festival')
    festivals.value = items
      .map((it) => ({ ...it, date: parseDate(it.modifiedtime) }))
      .filter((it) => it.date)
  } catch (e) {
    console.error('축제 데이터 로드 실패', e)
  } finally {
    loading.value = false
  }
})

const byDay = computed(() => {
  const map = {}
  const y = cursor.value.getFullYear()
  const m = cursor.value.getMonth()
  for (const f of festivals.value) {
    if (f.date.getFullYear() === y && f.date.getMonth() === m) {
      const d = f.date.getDate()
      ;(map[d] ||= []).push(f)
    }
  }
  return map
})

const monthLabel = computed(() =>
  cursor.value.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
)

const cells = computed(() => {
  const y = cursor.value.getFullYear()
  const m = cursor.value.getMonth()
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const arr = []
  for (let i = 0; i < firstDay; i++) arr.push(null)
  for (let d = 1; d <= daysInMonth; d++) arr.push(d)
  return arr
})

const monthTotal = computed(() =>
  Object.values(byDay.value).reduce((s, a) => s + a.length, 0)
)

function move(delta) {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + delta, 1)
  selectedDay.value = null
}
const weekdays = ['일', '월', '화', '수', '목', '금', '토']
</script>

<template>
  <div class="container section">
    <h1 class="page-title">📅 축제·행사 캘린더</h1>
    <p class="page-sub">
      서울 권역 축제·공연·행사 · <b>정보 갱신일 기준</b> 배치
      <span class="muted">(제공 데이터에 행사 일정 필드가 없어 갱신일로 표시)</span>
    </p>

    <div class="cal-hd card">
      <button class="btn btn-sm" @click="move(-1)">‹ 이전달</button>
      <div class="month">
        <b>{{ monthLabel }}</b>
        <span class="badge">{{ monthTotal }}건</span>
      </div>
      <button class="btn btn-sm" @click="move(1)">다음달 ›</button>
    </div>

    <div v-if="loading" class="empty card">데이터 불러오는 중…</div>

    <div v-else class="cal card">
      <div class="weekday" v-for="(w, i) in weekdays" :key="w" :class="{ sun: i === 0, sat: i === 6 }">
        {{ w }}
      </div>
      <div
        v-for="(d, i) in cells"
        :key="i"
        class="cell"
        :class="{ empty: !d, has: d && byDay[d], active: d === selectedDay }"
        @click="d && byDay[d] && (selectedDay = d)"
      >
        <template v-if="d">
          <span class="daynum">{{ d }}</span>
          <div v-if="byDay[d]" class="events">
            <span class="ev-dot">🎉 {{ byDay[d].length }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- 선택한 날짜 상세 -->
    <div v-if="selectedDay && byDay[selectedDay]" class="day-detail card">
      <h3>{{ monthLabel }} {{ selectedDay }}일 · {{ byDay[selectedDay].length }}건</h3>
      <ul>
        <li v-for="f in byDay[selectedDay]" :key="f.contentid">
          <b>{{ f.title }}</b>
          <span v-if="f.addr1" class="muted"> · 📍 {{ f.addr1 }}</span>
          <span v-if="f.tel" class="muted"> · ☎ {{ f.tel }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.cal-hd { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; margin-bottom: 14px; }
.month { display: flex; align-items: center; gap: 10px; font-size: 17px; }

.cal { display: grid; grid-template-columns: repeat(7, 1fr); padding: 8px; gap: 4px; }
.weekday { text-align: center; font-size: 13px; font-weight: 700; padding: 8px 0; color: var(--text-muted); }
.weekday.sun { color: #dc2626; }
.weekday.sat { color: #2563eb; }
.cell {
  min-height: 78px; border: 1px solid var(--border); border-radius: 8px; padding: 6px;
  display: flex; flex-direction: column; gap: 4px;
}
.cell.empty { border: none; background: transparent; }
.cell.has { cursor: pointer; background: #fffbeb; border-color: #fde68a; }
.cell.has:hover { background: #fef3c7; }
.cell.active { outline: 2px solid var(--primary); }
.daynum { font-size: 13px; font-weight: 600; }
.ev-dot { font-size: 12px; color: #b45309; font-weight: 700; }

.day-detail { margin-top: 16px; padding: 20px; }
.day-detail h3 { margin: 0 0 12px; }
.day-detail ul { margin: 0; padding-left: 18px; }
.day-detail li { padding: 5px 0; font-size: 14px; }

@media (max-width: 560px) { .cell { min-height: 56px; } .ev-dot { font-size: 10px; } }
</style>
