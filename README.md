# 📍 LocalHub — 지역 정보 공유 익명 커뮤니티

공공데이터(한국관광공사 TourAPI 4.0)를 활용한 **백엔드 없는 정적 SPA** 지역 정보 커뮤니티입니다.
회원가입 없이 익명으로 지역 정보를 공유하고, 지도·대시보드·챗봇으로 관광 데이터를 소비할 수 있습니다.

> LocalHub 공문(v8) 요구사항 기반 · Vue.js 3 (Vite)

---

## ✨ 주요 기능

### 필수 기능
- **익명 커뮤니티 CRUD** — 서울 게시판(목록·상세·작성·수정·삭제), `localStorage` 저장
- **지역정보 챗봇** — 제공 JSON 기반 자연어 Q&A, 플로팅 위젯, 대화 히스토리, 모바일 대응
  - Netlify Function(`OPENAI_API_KEY`)이 설정되어 있으면 **AI(LLM) 모드**, 없으면 **로컬 검색 모드**로 폴백
- **공공데이터 연동** — 서울 TourAPI 8종(8,150건)을 프론트에서 직접 로드

### 선택 기능 (요구 최소 1개 → **5종 모두 구현**)
- 🗺️ **지도 시각화** (Leaflet) — 카테고리별 관광 POI 핀 + 필터
- 📊 **데이터 대시보드** (Chart.js) — 카테고리 비중·인기 태그·자치구 TOP10 통계
- 📅 **축제 캘린더** — 축제·행사 월별 시각화
- 🔔 **실시간 알림** — 서버 없이 localStorage polling 새 글 토스트
- 🔖 **커뮤니티 부가기능** — 조회수·검색·태그·북마크·좋아요·링크 공유(OG 태그)

---

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Vue.js 3 + Vite |
| 라우팅/상태 | Vue Router 4, Pinia |
| 저장소 | 브라우저 localStorage (백엔드 없음) |
| 시각화 | Leaflet, Chart.js |
| AI | Netlify Functions 프록시를 통한 OpenAI API 호출 |

---

## 🚀 시작하기

```bash
cd localhub-frontend
npm install

# (선택) 챗봇 AI 모드를 쓰려면 환경변수 설정
cp .env.example .env
#  .env 에 OPENAI_API_KEY / OPENAI_BASE_URL / OPENAI_MODEL 입력
#  키를 비워두면 챗봇은 '로컬 검색 전용'으로 동작합니다.

npm run dev       # 개발 서버 http://localhost:5173 (Function 없이 Vite만 실행 → 로컬 검색 모드)
npm run build     # 프로덕션 빌드 → dist/
npm run preview   # 빌드 결과 미리보기

# 챗봇 AI 모드까지 로컬에서 테스트하려면 Netlify CLI 사용
npx netlify dev   # Vite + Netlify Functions(netlify/functions/chat.js) 동시 실행
```

### 🛡️ API 키 보호 (Netlify Functions)
OpenAI API 키는 `OPENAI_API_KEY`(VITE_ 접두사 없음)로 관리되며, 브라우저가 아닌 **Netlify Function**(`netlify/functions/chat.js`)에서만 사용됩니다.
프론트엔드는 `/.netlify/functions/chat`을 호출할 뿐 키를 알지 못하므로 빌드 결과물에도 키가 포함되지 않습니다.
배포 시 Netlify 대시보드 → Site configuration → Environment variables에 `OPENAI_API_KEY`(및 선택적으로 `OPENAI_BASE_URL`, `OPENAI_MODEL`)를 등록하세요.

---

## 📁 프로젝트 구조

```
├─ localhub-frontend/            # Vue3 + Vite SPA
│  ├─ netlify/functions/chat.js  # OpenAI API 프록시 (키는 서버에만 존재)
│  ├─ public/data/seoul/         # 서울 관광 데이터 8종 + manifest.json
│  ├─ src/
│  │  ├─ constants/              # 지역·카테고리 정의
│  │  ├─ services/               # dataLoader / storage / openai(챗봇, Function 호출)
│  │  ├─ stores/                 # posts (Pinia)
│  │  ├─ components/             # 헤더, 챗봇, 모달, 페이지네이션, 알림 …
│  │  ├─ views/                  # 홈/게시판/상세/작성/지도/대시보드/캘린더/북마크
│  │  └─ router/
│  ├─ .env.example  netlify.toml  vite.config.js
├─ docs/
│  ├─ MVP_TEMPLATE.md / MVP_TEMPLATE_간략.docx   # MVP 간략 빈 템플릿 (md/docx)
│  ├─ MVP_LocalHub.md / MVP_LocalHub.docx        # 실제 채운 MVP 정의서 (md/docx)
│  ├─ WBS_Gantt.md / WBS_Gantt_LocalHub.xlsx     # 3일 WBS + 간트 (md/xlsx)
│  ├─ 진행순서.md                 # 개발 진행 순서
│  └─ ERROR_LOG.md               # 에러/트러블슈팅 로그
└─ README.md
```

---

## 🗺 화면(경로)

| 경로 | 화면 |
|------|------|
| `/` | 홈 — 서울 게시판 카드, 카테고리 요약, 최근 게시글 |
| `/board/seoul` | 서울 게시판 목록 |
| `/post/:id` | 게시글 상세 |
| `/board/:region/write`, `/post/:id/edit` | 작성 / 수정 |
| `/map` | 관광 지도 |
| `/dashboard` | 데이터 대시보드 |
| `/calendar` | 축제 캘린더 |
| `/bookmarks` | 북마크 모음 |

---

## 📦 데이터 출처 및 라이선스

이 서비스는 **한국관광공사 Tour API(TourAPI 4.0)** 의 데이터를 활용하였습니다.

| 항목 | 내용 |
|------|------|
| 제공 기관 | 한국관광공사 |
| 데이터명 | 국문 관광정보 서비스 (TourAPI 4.0) |
| 출처 | https://www.data.go.kr/data/15101578/openapi.do |
| 라이선스 | **공공누리 제3유형 (출처표시 + 변경금지)** |
| 수집 지역 / 건수 | 서울(SEL) / 8,150건 (관광지·음식점·축제·문화시설·레포츠·숙박·쇼핑·여행코스) |

> 공공누리 3유형 준수: 출처를 표기(앱 푸터 상시)하며, 원본 데이터 값은 변형하지 않고 필요한 필드만 선택하여 사용합니다.

---

## 📝 참고

- 게시글은 localStorage 특성상 **작성한 브라우저(기기)에만 저장**되며 다른 사용자와 공유되지 않습니다.
- 축제 캘린더는 제공 데이터에 행사 일정 필드가 없어 **정보 갱신일 기준**으로 표시합니다.
- 개발 과정과 트러블슈팅은 [`docs/진행순서.md`](docs/진행순서.md), [`docs/ERROR_LOG.md`](docs/ERROR_LOG.md) 참고.

© 2026 LocalHub · 교육용 프로젝트
