// 서비스 대상 지역 — 서울 단일 권역 (제공 데이터가 서울만 존재)
export const REGIONS = [
  { key: 'seoul', name: '서울', emoji: '🏙️', hasData: true }
]

export const REGION_MAP = Object.fromEntries(REGIONS.map((r) => [r.key, r]))

export function regionName(key) {
  return REGION_MAP[key]?.name ?? key
}

// 관광 데이터가 존재하는 기본 권역
export const DATA_REGION_KEY = 'seoul'

// 다중 권역 여부 (탭/드롭다운 표시 제어용)
export const IS_MULTI_REGION = REGIONS.length > 1
