# 에러 로그 (Error / Trouble-shooting Log)

개발 중 실제로 발생했거나, 사전에 인지하여 회피한 이슈와 그 해결 과정을 기록합니다.

| # | 구분 | 심각도 | 증상 | 원인 | 해결 |
|---|------|--------|------|------|------|
| E1 | 데이터 | 중 | zip 내부 파일명이 `╝¡┐∩_░ⁿ▒ñ┴÷.json` 처럼 깨짐 | zip 헤더가 CP437로 저장된 EUC-KR(CP949) 한글 파일명 | `filename.encode('cp437').decode('cp949')`로 디코딩하여 정상 파일명 복원 |
| E2 | 도구 | 하 | docx 텍스트 추출 시 `UnicodeEncodeError: 'cp949' codec can't encode '—'` | Windows 콘솔 기본 인코딩(cp949)이 em-dash 등 유니코드 미지원 | `sys.stdout`을 UTF-8 `TextIOWrapper`로 감싸고 결과를 파일로 저장 후 확인 |
| E3 | 문서 | 하 | 템플릿 xlsx에서 `xl/sharedStrings.xml` 없음 오류 | 해당 통합문서가 공유문자열 대신 inline string 사용 | 워크시트의 `<is><t>` inline 문자열을 직접 파싱하도록 변경 |
| E4 | 지도 | 중 | (사전 회피) Leaflet 기본 마커 아이콘이 Vite 번들에서 깨지는 알려진 버그 | 번들러가 마커 PNG 상대경로를 해석하지 못함(`_getIconUrl`) | 아이콘 에셋 대신 `L.circleMarker`(카테고리 색상)로 렌더링하여 원천 차단 |
| E5 | 환경 | 하 | `preview_start`가 vite 서버를 찾지 못함 | Vite 앱이 `localhub-frontend` 하위폴더인데 `launch.json`을 하위에 둠 | 루트 `.claude/launch.json`에서 `npm --prefix localhub-frontend run dev`로 실행 |
| E6 | 성능 | 중 | 쇼핑 데이터(4,368건) 전량 마커 렌더 시 지도 버벅임 우려 | 대용량 POI 동시 렌더 | 카테고리별 지연 로드 + 메모리 캐시, 지도 마커 상한 `MARKER_CAP=800` + 초과 시 안내 |
| E7 | 시각화 | 하 | Chart.js `"category" is not a registered scale` 류 오류 가능성 | Chart.js v4 트리셰이킹으로 컨트롤러/스케일 수동 등록 필요 | `Chart.register(BarController, ArcElement, CategoryScale, LinearScale, ...)` 명시 등록 |
| E8 | 데이터 | 하 | 축제 캘린더에 배치할 행사 시작/종료일이 없음 | TourAPI 목록 응답에 `eventstartdate` 미포함(상세 API 전용) | `modifiedtime`(정보 갱신일) 기준으로 배치하고 UI·문서에 한계 명시 |
| E9 | 보안 | 상 | (설계 반영) `VITE_` 환경변수 API 키가 빌드 산출물에 노출 | Vite는 `VITE_` 값을 클라이언트 번들에 인라인 | 키 없을 시 로컬 검색 폴백, `.env` gitignore, 사용량·결제 한도 낮은 키만 사용 안내(README/.env.example) |
| E10 | UX | 하 | 다른 브라우저에서 작성한 글이 상세에서 "찾을 수 없음" | localStorage는 작성 기기·브라우저에만 저장(공유 안 됨) | 의도된 한계 — 상세/작성 화면 및 문서에 안내 문구 표기 |

---

## 상세 노트

### E1. zip 한글 파일명 깨짐 (해결)
```python
# 잘못된 출력: '╝¡┐∩_░ⁿ▒ñ┴÷.json'
name = info.filename.encode('cp437').decode('cp949')  # -> '서울_관광지.json'
```
zip 스펙상 언어 인코딩 플래그가 없으면 아카이버가 로컬 인코딩으로 파일명을 저장한다. Windows에서 만든 한글 zip은 CP949로 저장되지만 파이썬은 CP437로 읽어 깨진다. 재인코딩으로 해결.

### E4. Leaflet 마커 아이콘 번들 이슈 (사전 회피)
`new L.Marker()` 사용 시 Vite/Webpack 환경에서 마커 이미지가 404가 되는 것은 매우 흔한 함정이다. 본 프로젝트는 이미지 마커 대신 카테고리 색상 `circleMarker`를 사용해 아이콘 경로 문제를 원천적으로 없앴고, POI 밀집 시 시인성도 개선했다.

### E9. 클라이언트 API 키 노출 (설계로 완화)
공문에도 명시된 리스크. `import.meta.env.VITE_GMS_API_KEY`는 빌드 시 문자열로 인라인되어 브라우저에서 확인 가능하다. 따라서:
- 키가 없으면 챗봇은 **로컬 검색 전용**으로 안전하게 동작(데모 가능).
- `.gitignore`에 `.env` 포함, 산출물 제출 시 미포함 확인.
- README/.env.example에 "사용량 제한·결제 한도 낮은 키만 사용" 경고 명시.

---

## 빌드 검증 결과
```
vite v6.4.3 building for production...
✓ 75 modules transformed.
✓ built in ~1.6s   (오류 0 / 경고 0)
```
개발 서버·브라우저 프리뷰에서 홈·지도(783 마커)·대시보드(3 차트)·챗봇(로컬 검색)·게시글 CRUD·새 글 알림 토스트까지 정상 동작 확인.
