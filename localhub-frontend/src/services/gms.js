// 챗봇 LLM 호출 (GMS = OpenAI 호환 게이트웨이)
// - VITE_GMS_API_KEY 가 있으면 LLM(RAG) 응답
// - 없으면 호출부(ChatWidget)에서 로컬 검색 결과만 안내 (isLLMEnabled=false)
import { searchLocal } from '@/services/dataLoader'

const API_KEY = import.meta.env.VITE_GMS_API_KEY || ''
const BASE_URL = (import.meta.env.VITE_GMS_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
const MODEL = import.meta.env.VITE_GMS_MODEL || 'gpt-4o-mini'

export const isLLMEnabled = () => Boolean(API_KEY)

const SYSTEM_PROMPT = `당신은 'LocalHub'의 서울 지역 정보 안내 챗봇입니다.
아래 [참고 데이터]는 한국관광공사 TourAPI(공공누리 제3유형)에서 제공된 실제 장소 목록입니다.
- 반드시 [참고 데이터]에 있는 장소만 근거로 답하세요. 목록에 없으면 "제공된 데이터에서 찾지 못했다"고 답하세요.
- 장소명, 주소, 전화번호를 함께 안내하고, 3~5곳 이내로 간결히 정리하세요.
- 한국어로, 친절하고 명확하게 답변하세요.`

function buildContext(items) {
  if (!items.length) return '(관련 장소를 찾지 못함)'
  return items
    .map((it, i) => {
      const parts = [`${i + 1}. ${it.title}`]
      if (it.addr1) parts.push(`주소: ${it.addr1}`)
      if (it.tel) parts.push(`전화: ${it.tel}`)
      return parts.join(' / ')
    })
    .join('\n')
}

/**
 * 사용자 질의 처리.
 * @returns {{ text:string, sources:object[], usedLLM:boolean }}
 */
export async function askChatbot(query, history = []) {
  // 1) 로컬 RAG 검색 (항상 수행)
  const sources = await searchLocal(query, { limit: 8 })

  // 2) 키가 없으면 로컬 검색 결과만 반환
  if (!isLLMEnabled()) {
    return { text: localAnswer(query, sources), sources, usedLLM: false }
  }

  // 3) 키가 있으면 LLM 에 검색결과를 컨텍스트로 전달
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.text })),
    { role: 'user', content: `질문: ${query}\n\n[참고 데이터]\n${buildContext(sources)}` }
  ]

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.3, max_tokens: 700 })
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`LLM 응답 오류 (${res.status}) ${detail.slice(0, 200)}`)
  }
  const json = await res.json()
  const text = json.choices?.[0]?.message?.content?.trim() || '(빈 응답)'
  return { text, sources, usedLLM: true }
}

// 로컬 전용 응답 문안 생성
function localAnswer(query, sources) {
  if (!sources.length) {
    return `"${query}"에 대해 제공된 서울 관광 데이터에서 관련 장소를 찾지 못했어요. 다른 키워드(예: 맛집, 축제, 관광지)로 다시 물어봐 주세요.`
  }
  const lines = sources.slice(0, 5).map((it, i) => {
    const bits = [`${i + 1}. ${it.title}`]
    if (it.addr1) bits.push(`📍 ${it.addr1}`)
    if (it.tel) bits.push(`☎ ${it.tel}`)
    return bits.join('  ')
  })
  return `제공 데이터에서 찾은 관련 장소예요 (로컬 검색 모드):\n\n${lines.join('\n')}`
}
