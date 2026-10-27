# ⛅ SkyPulse Weather (스카이펄스 실시간 날씨 앱)

> **전 세계 도시 및 지역의 실시간 날씨와 랜드마크 비주얼 테마를 제공하는 모던 반응형 웹 애플리케이션**

별도의 유료 구독이나 API 키 발급 없이 무료로 자유롭게 사용할 수 있는 **Open-Meteo 오픈 기상 API**를 기반으로 제작되었습니다.

---

## ✨ 핵심 기능

1. **실시간 기상 데이터 조회**
   - 전 세계 도시/지역 검색 (한글/영문 모두 지원)
   - 현재 기온(°C), 체감 온도, 일일 최고/최저 기온
   - 상세 기상 지표: 습도(%), 풍속(m/s 및 km/h 병기), 강수량(mm), 기압(hPa)
   - 오늘의 24시간 시간별 기온 예보 슬라이더 & 주간 7일 날씨 예보

2. **동적 랜드마크 & 도시 비주얼 테마**
   - 검색된 도시/국가에 따라 대표 랜드마크(N서울타워, 광안대교, 성산일출봉, 도쿄타워, 에펠탑, 자유의 여신상, 빅벤 등)와 맞춤 컬러 테마 자동 적용
   - 랜드마크 데이터가 없는 일반 지역은 3단계 Fallback으로 날씨 상태(맑음, 비, 눈 등)에 맞는 깔끔한 테마 적용

3. **고신뢰성 및 오타 예외 처리**
   - 연속 검색 시 이전 요청을 즉시 중단하는 `AbortController` 및 요청 ID 관리로 데이터 충돌(Race Condition) 원천 차단
   - 완성되지 않은 한글 자모 단독 입력(`ㅋㅋ`, `ㄱㄱ`)이나 특수문자, 존재하지 않는 지역 입력 시 친절한 안내 메시지 표시

4. **모던 글래스모피즘 & 완전 반응형 UI**
   - Glassmorphism & 부드러운 전환 애니메이션
   - 모바일, 태블릿, 데스크톱 완벽 지원

---

## 🛠️ 기술 스택

- **Frontend**: HTML5, Vanilla CSS3 (Custom Properties & Glassmorphism), Vanilla JavaScript (ES6+)
- **Icons & Fonts**: Lucide Icons, Google Fonts (Pretendard & Outfit)
- **API**: [Open-Meteo API](https://open-meteo.com/) (No API Key Required)
- **Deployment**: Vercel & GitHub

---

## 🚀 로컬 실행 방법

```bash
# 로컬 정적 서버 실행
node server.js
```
브라우저에서 `http://localhost:3000` 접속
