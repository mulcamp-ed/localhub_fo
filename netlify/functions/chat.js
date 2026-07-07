// OpenAI API 프록시 (Netlify Function)
// - API 키는 서버(Netlify 환경변수)에만 존재, 브라우저에는 노출되지 않음
// - GET  : 키 설정 여부 확인 (isLLMEnabled)
// - POST : { messages } → OpenAI Chat Completions 호출 후 텍스트만 반환
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5-nano'

export const handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: Boolean(OPENAI_API_KEY) })
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  if (!OPENAI_API_KEY) {
    return { statusCode: 503, body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' }) }
  }

  let messages
  try {
    ;({ messages } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid JSON body' }) }
  }
  if (!Array.isArray(messages) || !messages.length) {
    return { statusCode: 400, body: JSON.stringify({ error: 'messages required' }) }
  }

  try {
    const upstream = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({ model: OPENAI_MODEL, messages, max_completion_tokens: 700 })
    })

    const raw = await upstream.text()
    if (!upstream.ok) {
      return { statusCode: upstream.status, body: JSON.stringify({ error: raw.slice(0, 300) }) }
    }

    const json = JSON.parse(raw)
    const text = json.choices?.[0]?.message?.content?.trim() || '(빈 응답)'
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) }
  }
}
