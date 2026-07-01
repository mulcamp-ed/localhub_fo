// 전국 5개 권역 정의 (LocalHub 공문 III-커뮤니티 기능 기준)
export const REGIONS = [
  { key: 'capital', name: '서울/경기', emoji: '🏙️', hasData: true },
  { key: 'chungcheong', name: '대전/충청', emoji: '🏞️', hasData: false },
  { key: 'gyeongbuk', name: '구미/경북', emoji: '🏔️', hasData: false },
  { key: 'jeolla', name: '광주/전라', emoji: '🌾', hasData: false },
  { key: 'gyeongnam', name: '부울경/경남', emoji: '⚓', hasData: false }
]

export const REGION_MAP = Object.fromEntries(REGIONS.map((r) => [r.key, r]))

export function regionName(key) {
  return REGION_MAP[key]?.name ?? key
}

// 제공 관광 데이터가 존재하는 권역 (현재 서울=capital 권역만 제공됨)
export const DATA_REGION_KEY = 'capital'
