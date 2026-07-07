// 챗봇 LLM 호출 (Netlify Function을 통한 OpenAI API 프록시)
// - API 키는 서버(Netlify Function 환경변수)에만 존재, 브라우저 번들에는 노출되지 않음
// - 프록시가 "키 미설정"을 응답하면 로컬 검색 결과만 안내 (usedLLM=false)
import { searchLocal } from '@/services/dataLoader'

const CHAT_ENDPOINT = '/.netlify/functions/chat'

let enabledCache = null

// 인사/잡담만 있는 질의는 장소 검색을 건너뛰고 안내 문구로 응답
const GREETING_RE = /^(하이|안녕|hi|hello|헬로|반가워|ㅎㅇ)[!?.~\s]*$/i

function greetingReply() {
  return {
    text: '안녕하세요! 서울 맛집·관광지·축제 등 궁금한 걸 물어봐 주세요. 예) "한강 근처 관광지 알려줘"',
    sources: [],
    usedLLM: false
  }
}

export async function isLLMEnabled() {
  if (enabledCache !== null) return enabledCache
  try {
    const res = await fetch(CHAT_ENDPOINT)
    const json = await res.json()
    enabledCache = Boolean(json.enabled)
  } catch {
    enabledCache = false
  }
  return enabledCache
}

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
  if (GREETING_RE.test((query || '').trim())) return greetingReply()

  // 1) 로컬 RAG 검색 (항상 수행)
  const sources = await searchLocal(query, { limit: 8 })

  // 2) 프록시에 키가 없으면 로컬 검색 결과만 반환
  if (!(await isLLMEnabled())) {
    return { text: localAnswer(query, sources), sources, usedLLM: false }
  }

  // 3) 키가 있으면 Netlify Function을 통해 LLM에 검색결과를 컨텍스트로 전달
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.text })),
    { role: 'user', content: `질문: ${query}\n\n[참고 데이터]\n${buildContext(sources)}` }
  ]

  const res = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`LLM 응답 오류 (${res.status}) ${detail.slice(0, 200)}`)
  }
  const json = await res.json()
  if (!json.text) return { text: localAnswer(query, sources), sources, usedLLM: false }
  return { text: json.text, sources, usedLLM: true }
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
