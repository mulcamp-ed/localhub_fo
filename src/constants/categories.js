// 관광 데이터 카테고리 메타 (TourAPI contentTypeId 기준)
export const CATEGORIES = [
  { key: 'attraction', label: '관광지', emoji: '🗺️', color: '#2563eb' },
  { key: 'restaurant', label: '음식점', emoji: '🍽️', color: '#dc2626' },
  { key: 'festival', label: '축제·공연·행사', emoji: '🎉', color: '#d97706' },
  { key: 'culture', label: '문화시설', emoji: '🏛️', color: '#7c3aed' },
  { key: 'leisure', label: '레포츠', emoji: '⛹️', color: '#059669' },
  { key: 'lodging', label: '숙박', emoji: '🏨', color: '#0891b2' },
  { key: 'shopping', label: '쇼핑', emoji: '🛍️', color: '#db2777' },
  { key: 'course', label: '여행코스', emoji: '🧭', color: '#65a30d' }
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]))

// 챗봇 질의에서 키워드 → 카테고리 매핑 (로컬 검색 우선순위)
export const KEYWORD_TO_CATEGORY = [
  { words: ['맛집', '음식', '식당', '먹거리', '레스토랑', '카페', '맛있'], keys: ['restaurant'] },
  { words: ['축제', '행사', '공연', '페스티벌', '이벤트'], keys: ['festival'] },
  { words: ['관광', '명소', '가볼', '여행지', '구경', '볼거리', '공원'], keys: ['attraction'] },
  { words: ['문화', '박물관', '미술관', '전시', '공연장', '도서관'], keys: ['culture'] },
  { words: ['레포츠', '스포츠', '운동', '체험', '액티비티'], keys: ['leisure'] },
  { words: ['숙박', '호텔', '모텔', '게스트', '숙소', '펜션'], keys: ['lodging'] },
  { words: ['쇼핑', '시장', '백화점', '아울렛', '매장', '쇼핑몰'], keys: ['shopping'] },
  { words: ['코스', '일정', '루트', '동선'], keys: ['course'] }
]
