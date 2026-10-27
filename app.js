/**
 * SkyPulse Weather App Logic - Robust, Dynamic Landmark & Visual Theming Edition
 * 
 * 1. Dynamic Landmark & Country Visual Theming (Seoul, Tokyo, Paris, New York, London, Rome, Sydney, etc.)
 * 2. Intelligent Geocoding & Korea-first prioritization
 * 3. Race condition elimination with AbortController & Sequential Request ID
 * 4. High-precision meteorological data binding & Comprehensive error handling
 */

// WMO 세계기상기구 기상 코드 매핑
const WMO_CODE_MAP = {
  0: { desc: '맑음', iconDay: '☀️', iconNight: '🌙', theme: 'clear' },
  1: { desc: '대체로 맑음', iconDay: '🌤️', iconNight: '🌤️', theme: 'clear' },
  2: { desc: '구름 조금', iconDay: '⛅', iconNight: '☁️', theme: 'clouds' },
  3: { desc: '흐림', iconDay: '☁️', iconNight: '☁️', theme: 'clouds' },
  45: { desc: '안개', iconDay: '🌫️', iconNight: '🌫️', theme: 'clouds' },
  48: { desc: '서리 안개', iconDay: '🌫️', iconNight: '🌫️', theme: 'clouds' },
  51: { desc: '가벼운 이슬비', iconDay: '🌦️', iconNight: '🌧️', theme: 'rain' },
  53: { desc: '보통 이슬비', iconDay: '🌦️', iconNight: '🌧️', theme: 'rain' },
  55: { desc: '강한 이슬비', iconDay: '🌧️', iconNight: '🌧️', theme: 'rain' },
  56: { desc: '어는 이슬비', iconDay: '🌨️', iconNight: '🌨️', theme: 'rain' },
  57: { desc: '강한 어는 이슬비', iconDay: '🌨️', iconNight: '🌨️', theme: 'rain' },
  61: { desc: '약한 비', iconDay: '🌦️', iconNight: '🌧️', theme: 'rain' },
  63: { desc: '비', iconDay: '🌧️', iconNight: '🌧️', theme: 'rain' },
  65: { desc: '강한 폭우', iconDay: '🌧️', iconNight: '🌧️', theme: 'rain' },
  66: { desc: '진눈깨비', iconDay: '🌨️', iconNight: '🌨️', theme: 'rain' },
  67: { desc: '강한 진눈깨비', iconDay: '🌨️', iconNight: '🌨️', theme: 'rain' },
  71: { desc: '약한 눈', iconDay: '🌨️', iconNight: '🌨️', theme: 'snow' },
  73: { desc: '눈', iconDay: '❄️', iconNight: '❄️', theme: 'snow' },
  75: { desc: '강한 폭설', iconDay: '❄️', iconNight: '❄️', theme: 'snow' },
  77: { desc: '싸락눈', iconDay: '🌨️', iconNight: '🌨️', theme: 'snow' },
  80: { desc: '약한 소나기', iconDay: '🌦️', iconNight: '🌧️', theme: 'rain' },
  81: { desc: '보통 소나기', iconDay: '🌧️', iconNight: '🌧️', theme: 'rain' },
  82: { desc: '강한 소나기', iconDay: '⛈️', iconNight: '⛈️', theme: 'rain' },
  85: { desc: '소낙눈', iconDay: '🌨️', iconNight: '🌨️', theme: 'snow' },
  86: { desc: '강한 소낙눈', iconDay: '❄️', iconNight: '❄️', theme: 'snow' },
  95: { desc: '뇌우', iconDay: '⛈️', iconNight: '⛈️', theme: 'thunder' },
  96: { desc: '우박을 동반한 뇌우', iconDay: '⛈️', iconNight: '⛈️', theme: 'thunder' },
  99: { desc: '강한 우박 뇌우', iconDay: '⛈️', iconNight: '⛈️', theme: 'thunder' }
};

const DEFAULT_WEATHER_INFO = {
  desc: '날씨 정보',
  iconDay: '🌤️',
  iconNight: '🌙',
  theme: 'clouds'
};

// ============================================================================
// 대표 랜드마크 및 국가 비주얼 테마 데이터베이스
// ============================================================================
const LANDMARK_CITY_DATABASE = [
  // 1. 서울 & 수도권
  {
    keys: ['서울', '서울특별시', 'seoul', '종로', '강남', '마포', '용산', '송파'],
    name: 'N서울타워 & 광화문',
    icon: '🗼',
    themeClass: 'landmark-seoul',
    desc: '대한민국의 심장, 유서 깊은 고궁과 찬란한 현대 스카이라인의 조화'
  },
  // 2. 부산
  {
    keys: ['부산', '부산광역시', 'busan', '해운대', '광안리'],
    name: '광안대교 & 해운대',
    icon: '🌉',
    themeClass: 'landmark-busan',
    desc: '푸른 파도와 밤바다의 다이아몬드 브릿지가 빛나는 해양 수도'
  },
  // 3. 제주
  {
    keys: ['제주', '제주시', '서귀포', '서귀포시', 'jeju'],
    name: '성산일출봉 & 한라산',
    icon: '🌋',
    themeClass: 'landmark-jeju',
    desc: '유네스코 세계자연유산의 에메랄드빛 바다와 신비로운 화산섬'
  },
  // 4. 도쿄
  {
    keys: ['도쿄', '도쿄도', 'tokyo', '신주쿠', '시부야'],
    name: '도쿄타워 & 후지산',
    icon: '🗼',
    themeClass: 'landmark-tokyo',
    desc: '화려한 네온빛 스카이라인과 사쿠라 정취가 어우러진 현대 메트로폴리스'
  },
  // 5. 파리
  {
    keys: ['파리', 'paris'],
    name: '에펠탑 & 루브르 박물관',
    icon: '🗼',
    themeClass: 'landmark-paris',
    desc: '예술과 낭만이 흐르는 센강, 영원히 빛나는 낭만의 수도'
  },
  // 6. 뉴욕
  {
    keys: ['뉴욕', '뉴욕시', 'new york', 'newyork', '맨해튼', 'manhattan'],
    name: '자유의 여신상 & 맨해튼',
    icon: '🗽',
    themeClass: 'landmark-newyork',
    desc: '잠들지 않는 브로드웨이와 세계 경제·문화의 중심지'
  },
  // 7. 런던
  {
    keys: ['런던', 'london'],
    name: '빅벤 & 타워브릿지',
    icon: '🕰️',
    themeClass: 'landmark-london',
    desc: '유서 깊은 왕실 역사와 템스강의 낭만이 깃든 클래식 브리티시'
  },
  // 8. 로마
  {
    keys: ['로마', 'rome'],
    name: '콜로세움 & 트레비 분수',
    icon: '🏛️',
    themeClass: 'landmark-rome',
    desc: '고대 제국의 찬란한 숨결과 지중해 햇살이 빛나는 영원의 도시'
  },
  // 9. 시드니
  {
    keys: ['시드니', 'sydney'],
    name: '오페라 하우스 & 하버 브릿지',
    icon: '⛵',
    themeClass: 'landmark-sydney',
    desc: '눈부신 남태평양 하버와 조개껍데기 지붕의 청정 해양 도시'
  }
];

// 국가 단위 대표 랜드마크 Fallback 매핑 (특정 도시 데이터가 없는 경우)
const COUNTRY_LANDMARK_MAP = {
  'KR': {
    name: '경복궁 & 한국의 아름다운 산천',
    icon: '🏯',
    themeClass: 'landmark-seoul',
    desc: '사계절의 수려한 자연과 반만년 역사가 숨쉬는 대한민국'
  },
  'JP': {
    name: '후지산 & 전통 사찰',
    icon: '⛩️',
    themeClass: 'landmark-tokyo',
    desc: '전통과 현대가 조화를 이루는 고즈넉한 열도의 풍경'
  },
  'FR': {
    name: '프랑스 고성과 예술',
    icon: '🏰',
    themeClass: 'landmark-paris',
    desc: '문화와 미식, 로맨틱한 감성이 살아 숨쉬는 프랑스'
  },
  'US': {
    name: '그랜드 캐니언 & 아메리칸 스카이라인',
    icon: '🦅',
    themeClass: 'landmark-newyork',
    desc: '광활한 대자연과 역동적인 에너지가 넘치는 미국'
  },
  'GB': {
    name: '스톤헨지 & 클래식 브리티시',
    icon: '🏰',
    themeClass: 'landmark-london',
    desc: '클래식한 품격과 오랜 헤리티지를 간직한 영국'
  },
  'IT': {
    name: '베네치아 & 르네상스 유산',
    icon: '🎭',
    themeClass: 'landmark-rome',
    desc: '지중해의 햇살과 문화유산이 찬란한 이탈리아'
  },
  'AU': {
    name: '울루루 & 청정 아웃백',
    icon: '🦘',
    themeClass: 'landmark-sydney',
    desc: '광활한 대륙과 대자연의 생명력이 살아있는 호주'
  }
};

// 한국 주요 지명 별칭 사전 (Open-Meteo 지오코딩 DB 명칭 보정)
const KOREAN_CITY_ALIASES = {
  '제주': '제주시',
  '제주도': '제주시',
  '서울': '서울특별시',
  '부산': '부산광역시',
  '대구': '대구광역시',
  '인천': '인천광역시',
  '광주': '광주광역시',
  '대전': '대전광역시',
  '울산': '울산광역시',
  '세종': '세종특별자치시',
  '세종시': '세종특별자치시',
  '서귀포': '서귀포시',
  '수원': '수원시',
  '성남': '성남시',
  '고양': '고양시',
  '용인': '용인시',
  '부천': '부천시',
  '안산': '안산시',
  '남양주': '남양주시',
  '안양': '안양시',
  '화성': '화성시',
  '평택': '평택시',
  '의정부': '의정부시',
  '시흥': '시흥시',
  '파주': '파주시',
  '광명': '광명시',
  '김포': '김포시',
  '군포': '군포시',
  '광주': '광주시',
  '이천': '이천시',
  '양주': '양주시',
  '오산': '오산시',
  '구리': '구리시',
  '안성': '안성시',
  '포천': '포천시',
  '의왕': '의왕시',
  '하남': '하남시',
  '여주': '여주시',
  '양평': '양평군',
  '동두천': '동두천시',
  '가평': '가평군',
  '연천': '연천군',
  '원주': '원주시',
  '춘천': '춘천시',
  '강릉': '강릉시',
  '동해': '동해시',
  '속초': '속초시',
  '삼척': '삼척시',
  '태백': '태백시',
  '청주': '청주시',
  '충주': '충주시',
  '제천': '제천시',
  '천안': '천안시',
  '아산': '아산시',
  '서산': '서산시',
  '당진': '당진시',
  '논산': '논산시',
  '공주': '공주시',
  '보령': '보령시',
  '전주': '전주시',
  '익산': '익산시',
  '군산': '군산시',
  '정읍': '정읍시',
  '남원': '남원시',
  '김제': '김제시',
  '목포': '목포시',
  '여수': '여수시',
  '순천': '순천시',
  '나주': '나주시',
  '광양': '광양시',
  '포항': '포항시',
  '구미': '구미시',
  '경주': '경주시',
  '김천': '김천시',
  '안동': '안동시',
  '영주': '영주시',
  '영천': '영천시',
  '상주': '상주시',
  '문경': '문경시',
  '경산': '경산시',
  '창원': '창원시',
  '김해': '김해시',
  '진주': '진주시',
  '양산': '양산시',
  '거제': '거제시',
  '통영': '통영시',
  '사천': '사천시',
  '밀양': '밀양시'
};

// ============================================================================
// 전역 상태 관리 객체 (Race Condition & 충돌 방지)
// ============================================================================
const AppState = {
  currentRequestId: 0,
  activeAbortController: null,
  isSearching: false
};

// DOM 요소 참조
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const clearInputBtn = document.getElementById('clear-input-btn');
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const retryBtn = document.getElementById('retry-btn');
const quickCityBtns = document.querySelectorAll('.tag-btn');

// 상태 카드 DOM
const initialStateCard = document.getElementById('initial-state');
const loadingStateCard = document.getElementById('loading-state');
const errorStateCard = document.getElementById('error-state');
const weatherCard = document.getElementById('weather-card');

// 에러 메시지 DOM
const errorTitle = document.getElementById('error-title');
const errorMessage = document.getElementById('error-message');

// 날씨 데이터 디스플레이 DOM
const displayCity = document.getElementById('display-city');
const displayCountry = document.getElementById('display-country');
const displayDatetime = document.getElementById('display-datetime');
const conditionTagText = document.getElementById('condition-tag-text');
const weatherEmoji = document.getElementById('weather-emoji');
const currentTemp = document.getElementById('current-temp');
const weatherDescription = document.getElementById('weather-description');
const feelsLikeTemp = document.getElementById('feels-like-temp');
const tempMax = document.getElementById('temp-max');
const tempMin = document.getElementById('temp-min');

// 랜드마크 배너 DOM
const landmarkBanner = document.getElementById('landmark-banner');
const landmarkIcon = document.getElementById('landmark-icon');
const landmarkTitle = document.getElementById('landmark-title');
const landmarkDesc = document.getElementById('landmark-desc');

// 상세 지표 DOM
const metricHumidity = document.getElementById('metric-humidity');
const metricWind = document.getElementById('metric-wind');
const metricPrecipitation = document.getElementById('metric-precipitation');
const metricPressure = document.getElementById('metric-pressure');

// 예보 목록 DOM
const hourlyForecastList = document.getElementById('hourly-forecast-list');
const dailyForecastList = document.getElementById('daily-forecast-list');

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initEventListeners();

  const savedCity = localStorage.getItem('skypulse_last_city');
  if (savedCity && savedCity.trim()) {
    cityInput.value = savedCity;
    clearInputBtn.hidden = false;
    executeCitySearch(savedCity.trim(), false);
  } else {
    executeCitySearch('서울', false);
  }
});

function initEventListeners() {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = cityInput.value.trim();
    executeCitySearch(query, true);
  });

  cityInput.addEventListener('input', () => {
    clearInputBtn.hidden = !cityInput.value.trim();
  });

  clearInputBtn.addEventListener('click', () => {
    cityInput.value = '';
    clearInputBtn.hidden = true;
    cityInput.focus();
  });

  quickCityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const city = btn.getAttribute('data-city');
      cityInput.value = city;
      clearInputBtn.hidden = false;
      executeCitySearch(city, true);
    });
  });

  currentLocationBtn.addEventListener('click', handleCurrentLocation);

  retryBtn.addEventListener('click', () => {
    const query = cityInput.value.trim() || '서울';
    executeCitySearch(query, true);
  });
}

// ============================================================================
// 입력값 유효성 검사 및 오타 예외 처리
// ============================================================================
function validateQuery(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return {
      isValid: false,
      title: '지역명을 입력해주세요',
      message: '날씨를 조회하고 싶은 도시나 지역명을 입력창에 입력해주세요.<br>예시: <strong>서울, 제주, 부산, 도쿄, 뉴욕, 파리</strong>'
    };
  }

  const trimmed = query.trim();

  // 자음/모음 단독 입력 차단
  const onlyKoreanJamoRegex = /^[\u3131-\u318E]+$/;
  if (onlyKoreanJamoRegex.test(trimmed)) {
    return {
      isValid: false,
      title: '존재하는 지역명을 입력해주세요',
      message: `'<strong>${escapeHtml(trimmed)}</strong>'은(는) 온전한 단어가 아닙니다.<br>완성된 도시 이름을 입력해주세요. (예: <strong>서울, 제주, 부산, 도쿄</strong>)`
    };
  }

  // 특수기호만 입력 차단
  const onlySymbolsRegex = /^[^a-zA-Z0-9가-힣]+$/;
  if (onlySymbolsRegex.test(trimmed)) {
    return {
      isValid: false,
      title: '존재하는 지역명을 입력해주세요',
      message: '특수문자만으로는 지역을 검색할 수 없습니다.<br>실제 존재하는 도시 이름을 입력해주세요.'
    };
  }

  // 너무 짧은 1글자 영문 등
  if (trimmed.length === 1 && !/^[가-힣]$/.test(trimmed)) {
    return {
      isValid: false,
      title: '존재하는 지역명을 입력해주세요',
      message: '정확한 검색을 위해 최소 2글자 이상의 지역명을 입력해주세요.'
    };
  }

  return { isValid: true, sanitized: trimmed };
}

// ============================================================================
// 핵심 날씨 검색 로직
// ============================================================================
async function executeCitySearch(rawCityName, shouldUpdateInput = false) {
  const validation = validateQuery(rawCityName);
  if (!validation.isValid) {
    showError(validation.title, validation.message);
    cityInput.focus();
    return;
  }

  const searchQuery = validation.sanitized;
  if (shouldUpdateInput) {
    cityInput.value = searchQuery;
    clearInputBtn.hidden = false;
  }

  // 이전 비동기 작업 취소
  if (AppState.activeAbortController) {
    AppState.activeAbortController.abort();
  }
  const controller = new AbortController();
  AppState.activeAbortController = controller;

  const thisRequestId = ++AppState.currentRequestId;
  AppState.isSearching = true;

  setViewState('loading');
  resetWeatherCardData();

  try {
    const location = await resolveLocation(searchQuery, controller.signal);

    if (thisRequestId !== AppState.currentRequestId) return;

    if (!location) {
      showError(
        '존재하는 지역명을 입력해주세요',
        `입력하신 '<strong>${escapeHtml(searchQuery)}</strong>' 지역을 찾을 수 없습니다.<br>오타가 없는지 확인하시거나, 널리 쓰이는 명칭(예: <strong>서울, 제주, 부산, 도쿄, 파리, 뉴욕</strong>)으로 검색해주세요.`
      );
      return;
    }

    const { latitude, longitude, name, country, country_code, timezone, matchedDisplayName } = location;

    const weatherData = await fetchForecastData(latitude, longitude, timezone || 'auto', controller.signal);

    if (thisRequestId !== AppState.currentRequestId) return;

    renderWeatherData({
      weather: weatherData,
      cityName: matchedDisplayName || name,
      rawSearchQuery: searchQuery,
      countryName: country || '대한민국',
      countryCode: country_code || (country === '대한민국' ? 'KR' : ''),
      targetTimezone: timezone || weatherData.timezone || 'Asia/Seoul'
    });

    localStorage.setItem('skypulse_last_city', searchQuery);

  } catch (error) {
    if (error.name === 'AbortError') return;
    if (thisRequestId !== AppState.currentRequestId) return;

    console.error('날씨 조회 오류:', error);
    showError(
      '날씨 정보를 가져오지 못했습니다',
      `서버와 통신하는 중 문제가 발생했습니다.<br><small style="color:var(--text-dim);">(오류 내용: ${escapeHtml(error.message || '네트워크 연결 실패')})</small><br>잠시 후 다시 시도해 주세요.`
    );
  } finally {
    if (thisRequestId === AppState.currentRequestId) {
      AppState.isSearching = false;
    }
  }
}

// ============================================================================
// 다단계 지오코딩 위치 결정 함수
// ============================================================================
async function resolveLocation(query, signal) {
  const candidates = [];
  
  if (KOREAN_CITY_ALIASES[query]) {
    candidates.push(KOREAN_CITY_ALIASES[query]);
  }
  candidates.push(query);

  if (/^[가-힣]+$/.test(query)) {
    if (!query.endsWith('시') && !query.endsWith('도') && !query.endsWith('군') && !query.endsWith('구')) {
      candidates.push(`${query}시`);
      candidates.push(`${query}도`);
    }
  }

  const uniqueCandidates = [...new Set(candidates)];

  for (const candidateQuery of uniqueCandidates) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(candidateQuery)}&count=10&language=ko&format=json`;
    
    try {
      const res = await fetch(geoUrl, { signal });
      if (!res.ok) continue;
      const data = await res.json();
      
      if (data && Array.isArray(data.results) && data.results.length > 0) {
        const isKoreanQuery = /[가-힣]/.test(query);
        const match = pickBestCandidate(data.results, query, isKoreanQuery);
        if (match) {
          let display = match.name;
          if (match.admin1 && match.admin1 !== match.name && !match.name.includes(match.admin1)) {
            display = `${match.name} (${match.admin1})`;
          }
          return { ...match, matchedDisplayName: display };
        }
      }
    } catch (e) {
      if (e.name === 'AbortError') throw e;
    }
  }

  return null;
}

function pickBestCandidate(results, originalQuery, isKorean) {
  if (!results || results.length === 0) return null;

  const cleanOriginal = originalQuery.toLowerCase().replace(/\s+/g, '');

  if (isKorean) {
    const krMatches = results.filter(r => r.country_code === 'KR' || r.country === '대한민국');
    if (krMatches.length > 0) {
      const exactKr = krMatches.find(r => 
        r.name.toLowerCase().replace(/\s+/g, '') === cleanOriginal ||
        (r.admin1 && r.admin1.toLowerCase().replace(/\s+/g, '') === cleanOriginal)
      );
      if (exactKr) return exactKr;
      return krMatches[0];
    }
  }

  const exact = results.find(r => r.name.toLowerCase().replace(/\s+/g, '') === cleanOriginal);
  if (exact) return exact;

  const sorted = [...results].sort((a, b) => (b.population || 0) - (a.population || 0));
  return sorted[0];
}

// ============================================================================
// Forecast API 호출 함수
// ============================================================================
async function fetchForecastData(lat, lon, timezone, signal) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,weather_code&timezone=${encodeURIComponent(timezone)}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`기상 예보 서버 통신 실패 (HTTP ${response.status})`);
  }

  const data = await response.json();
  if (!data || !data.current) {
    throw new Error('기상 예보 데이터가 유효하지 않습니다.');
  }

  return data;
}

// ============================================================================
// 날씨 데이터 및 랜드마크 테마 렌더링
// ============================================================================
function renderWeatherData({ weather, cityName, rawSearchQuery, countryName, countryCode, targetTimezone }) {
  const current = weather.current;
  const daily = weather.daily;
  const hourly = weather.hourly;

  const isDay = current.is_day === 1;
  const weatherCode = typeof current.weather_code === 'number' ? current.weather_code : 0;
  const weatherMeta = WMO_CODE_MAP[weatherCode] || DEFAULT_WEATHER_INFO;

  // 1. 헤더 (도시명, 국가, 해당 지역 현지 시각)
  displayCity.textContent = cityName;
  displayCountry.textContent = countryName;
  displayDatetime.textContent = formatDateTimeWithTimezone(current.time || new Date(), targetTimezone);

  // 2. 날씨 상태 배지 & 메인 이모지
  conditionTagText.textContent = weatherMeta.desc;
  weatherDescription.textContent = weatherMeta.desc;
  weatherEmoji.textContent = isDay ? weatherMeta.iconDay : weatherMeta.iconNight;

  // 3. 기온 수치
  const tempNum = Math.round(current.temperature_2m * 10) / 10;
  currentTemp.textContent = tempNum % 1 === 0 ? tempNum.toFixed(0) : tempNum.toFixed(1);

  // 체감 온도
  const feelsNum = Math.round(current.apparent_temperature * 10) / 10;
  feelsLikeTemp.textContent = `${feelsNum}°C`;

  // 최고 / 최저 기온
  if (daily && Array.isArray(daily.temperature_2m_max) && daily.temperature_2m_max.length > 0) {
    const maxVal = Math.round(daily.temperature_2m_max[0]);
    const minVal = Math.round(daily.temperature_2m_min[0]);
    tempMax.textContent = `${maxVal}°C`;
    tempMin.textContent = `${minVal}°C`;
  } else {
    tempMax.textContent = '--°C';
    tempMin.textContent = '--°C';
  }

  // 4. 상세 기상 지표
  const humVal = typeof current.relative_humidity_2m === 'number' ? current.relative_humidity_2m : '--';
  metricHumidity.textContent = `${humVal}%`;

  if (typeof current.wind_speed_10m === 'number') {
    const kmh = current.wind_speed_10m;
    const ms = (kmh / 3.6).toFixed(1);
    metricWind.innerHTML = `${ms} <small>m/s (${kmh}km/h)</small>`;
  } else {
    metricWind.textContent = '-- m/s';
  }

  const precipVal = typeof current.precipitation === 'number' ? current.precipitation : 0;
  let rainProbText = '';
  if (daily && Array.isArray(daily.precipitation_probability_max) && typeof daily.precipitation_probability_max[0] === 'number') {
    rainProbText = ` (${daily.precipitation_probability_max[0]}%)`;
  }
  metricPrecipitation.textContent = `${precipVal} mm${rainProbText}`;

  const pressVal = typeof current.surface_pressure === 'number' ? Math.round(current.surface_pressure) : '--';
  metricPressure.textContent = `${pressVal} hPa`;

  // 5. [핵심 기능] 랜드마크 판별 & 동적 비주얼 테마 적용
  updateLandmarkAndVisualTheme({
    cityName,
    rawSearchQuery,
    countryName,
    countryCode,
    weatherTheme: weatherMeta.theme,
    isDay
  });

  // 6. 시간대별 예보 렌더링
  renderHourlyForecast(hourly, current.time);

  // 7. 주간 예보 렌더링
  renderDailyForecast(daily);

  // 8. 뷰 활성화
  setViewState('success');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ============================================================================
// [핵심] 맞춤 랜드마크 및 비주얼 테마 전환 로직 (Fallback 포함)
// ============================================================================
function updateLandmarkAndVisualTheme({ cityName, rawSearchQuery, countryName, countryCode, weatherTheme, isDay }) {
  const landmarkInfo = resolveLandmark({
    cityName,
    rawSearchQuery,
    countryName,
    countryCode,
    weatherTheme,
    isDay
  });

  // 1. 랜드마크 배너 UI 갱신
  if (landmarkIcon) landmarkIcon.textContent = landmarkInfo.icon;
  if (landmarkTitle) landmarkTitle.textContent = landmarkInfo.name;
  if (landmarkDesc) landmarkDesc.textContent = landmarkInfo.desc;

  // 2. 전체 페이지 비주얼 테마 클래스 적용
  document.body.className = ''; // 기존 테마 초기화

  // 랜드마크 전용 테마 클래스가 있으면 우선 적용
  if (landmarkInfo.themeClass) {
    document.body.classList.add(landmarkInfo.themeClass);
  } else {
    // 없으면 날씨 기본 테마로 Fallback
    applyWeatherFallbackTheme(weatherTheme, isDay);
  }
}

// 랜드마크 매칭 알고리즘 (도시 -> 국가 -> 날씨 Fallback 3단계)
function resolveLandmark({ cityName, rawSearchQuery, countryName, countryCode, weatherTheme, isDay }) {
  const searchTargets = [
    (cityName || '').toLowerCase(),
    (rawSearchQuery || '').toLowerCase()
  ];

  // 1단계: 도시별 주요 랜드마크 탐색
  for (const lm of LANDMARK_CITY_DATABASE) {
    const isMatched = lm.keys.some(key => 
      searchTargets.some(target => target.includes(key.toLowerCase()))
    );
    if (isMatched) {
      return lm;
    }
  }

  // 2단계: 국가별 대표 랜드마크 Fallback (KR, JP, FR, US, GB, IT, AU 등)
  const normalizedCountryCode = (countryCode || '').toUpperCase();
  if (COUNTRY_LANDMARK_MAP[normalizedCountryCode]) {
    return COUNTRY_LANDMARK_MAP[normalizedCountryCode];
  }

  // 2단계-2: 대한민국 지역인 경우 한국 기본 랜드마크 적용
  if (normalizedCountryCode === 'KR' || countryName === '대한민국') {
    return COUNTRY_LANDMARK_MAP['KR'];
  }

  // 3단계: 특정 랜드마크 데이터가 없는 일반 지역 Fallback
  // 날씨 상태에 맞춘 감성적인 기본 풍경 테마 적용
  let fallbackIcon = '🏞️';
  if (weatherTheme === 'clear') fallbackIcon = isDay ? '☀️' : '🌌';
  else if (weatherTheme === 'rain') fallbackIcon = '🌧️';
  else if (weatherTheme === 'snow') fallbackIcon = '❄️';
  else if (weatherTheme === 'thunder') fallbackIcon = '⚡';

  const cleanCity = (cityName || '').split('(')[0].trim() || '해당 지역';

  return {
    name: `${cleanCity}의 자연과 도시 풍경`,
    icon: fallbackIcon,
    themeClass: null, // 날씨 기본 테마 적용
    desc: `${countryName || '전세계'}의 고유한 아름다움과 정취를 간직한 지역입니다.`
  };
}

// 날씨 상태 기반 기본 테마 클래스 적용
function applyWeatherFallbackTheme(themeKey, isDay) {
  if (themeKey === 'clear') {
    document.body.classList.add(isDay ? 'theme-clear-day' : 'theme-clear-night');
  } else if (themeKey === 'clouds') {
    document.body.classList.add('theme-clouds');
  } else if (themeKey === 'rain') {
    document.body.classList.add('theme-rain');
  } else if (themeKey === 'snow') {
    document.body.classList.add('theme-snow');
  } else if (themeKey === 'thunder') {
    document.body.classList.add('theme-thunder');
  } else {
    document.body.classList.add(isDay ? 'theme-clear-day' : 'theme-clear-night');
  }
}

// 화면 초기화
function resetWeatherCardData() {
  displayCity.textContent = '...';
  displayCountry.textContent = '';
  displayDatetime.textContent = '데이터 갱신 중...';
  conditionTagText.textContent = '';
  weatherEmoji.textContent = '⏳';
  currentTemp.textContent = '--';
  weatherDescription.textContent = '날씨 정보를 불러오는 중입니다';
  feelsLikeTemp.textContent = '--°C';
  tempMax.textContent = '--°C';
  tempMin.textContent = '--°C';
  metricHumidity.textContent = '--%';
  metricWind.textContent = '-- m/s';
  metricPrecipitation.textContent = '-- mm';
  metricPressure.textContent = '-- hPa';

  if (landmarkIcon) landmarkIcon.textContent = '📍';
  if (landmarkTitle) landmarkTitle.textContent = '랜드마크 탐색 중...';
  if (landmarkDesc) landmarkDesc.textContent = '해당 지역의 상징 비주얼을 불러오고 있습니다.';

  hourlyForecastList.innerHTML = '';
  dailyForecastList.innerHTML = '';
}

// ============================================================================
// 시간별 예보 렌더링
// ============================================================================
function renderHourlyForecast(hourly, currentIsoTime) {
  if (!hourly || !Array.isArray(hourly.time) || hourly.time.length === 0) {
    hourlyForecastList.innerHTML = '<div style="color:var(--text-dim); padding:10px;">시간별 예보 정보가 없습니다.</div>';
    return;
  }

  hourlyForecastList.innerHTML = '';

  const baseHourStr = (currentIsoTime || '').slice(0, 13);
  let startIndex = 0;
  if (baseHourStr) {
    for (let i = 0; i < hourly.time.length; i++) {
      if (hourly.time[i].slice(0, 13) >= baseHourStr) {
        startIndex = i;
        break;
      }
    }
  }

  const count = Math.min(24, hourly.time.length - startIndex);
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const idx = startIndex + i;
    const timeStr = hourly.time[idx];
    const tempVal = Math.round(hourly.temperature_2m[idx]);
    const code = hourly.weather_code[idx];

    const hourPart = parseInt(timeStr.slice(11, 13), 10) || 0;
    const isSlotDay = hourPart >= 6 && hourPart < 19;
    const meta = WMO_CODE_MAP[code] || DEFAULT_WEATHER_INFO;
    const icon = isSlotDay ? meta.iconDay : meta.iconNight;

    const isCurrent = (i === 0);
    const timeDisplay = isCurrent ? '지금' : `${hourPart}시`;

    const item = document.createElement('div');
    item.className = `hourly-item ${isCurrent ? 'now' : ''}`;
    item.innerHTML = `
      <span class="hourly-time">${timeDisplay}</span>
      <span class="hourly-icon">${icon}</span>
      <span class="hourly-temp">${tempVal}°</span>
    `;
    fragment.appendChild(item);
  }

  hourlyForecastList.appendChild(fragment);
}

// ============================================================================
// 주간 7일 예보 렌더링
// ============================================================================
function renderDailyForecast(daily) {
  if (!daily || !Array.isArray(daily.time) || daily.time.length === 0) {
    dailyForecastList.innerHTML = '<div style="color:var(--text-dim); padding:10px;">주간 예보 정보가 없습니다.</div>';
    return;
  }

  dailyForecastList.innerHTML = '';
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const fragment = document.createDocumentFragment();

  const totalDays = Math.min(7, daily.time.length);

  for (let i = 0; i < totalDays; i++) {
    const dateStr = daily.time[i];
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = (i === 0) ? '오늘' : `${daysOfWeek[dateObj.getDay()]}요일`;
    const formattedDate = `${m}.${d}`;

    const code = daily.weather_code[i];
    const meta = WMO_CODE_MAP[code] || DEFAULT_WEATHER_INFO;
    const minTemp = Math.round(daily.temperature_2m_min[i]);
    const maxTemp = Math.round(daily.temperature_2m_max[i]);

    const row = document.createElement('div');
    row.className = 'daily-row';
    row.innerHTML = `
      <div class="daily-day-info">
        <span class="daily-day">${dayName}</span>
        <span class="daily-date">${formattedDate}</span>
      </div>
      <div class="daily-condition">
        <span class="daily-icon">${meta.iconDay}</span>
        <span class="daily-desc">${meta.desc}</span>
      </div>
      <div class="daily-temp-bar">
        <span class="daily-min">${minTemp}°</span>
        <div class="daily-temp-slider" aria-hidden="true">
          <div class="daily-temp-fill"></div>
        </div>
        <span class="daily-max">${maxTemp}°</span>
      </div>
    `;
    fragment.appendChild(row);
  }

  dailyForecastList.appendChild(fragment);
}

// ============================================================================
// 내 위치(Geolocation) 기반 날씨 조회
// ============================================================================
function handleCurrentLocation() {
  if (!navigator.geolocation) {
    showError(
      '위치 정보 미지원',
      '사용 중이신 브라우저가 위치 정보 제공(Geolocation)을 지원하지 않습니다.<br>검색창에 직접 지역명을 입력해주세요.'
    );
    return;
  }

  if (AppState.activeAbortController) {
    AppState.activeAbortController.abort();
  }
  const controller = new AbortController();
  AppState.activeAbortController = controller;
  const thisRequestId = ++AppState.currentRequestId;

  setViewState('loading');
  resetWeatherCardData();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      if (thisRequestId !== AppState.currentRequestId) return;

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        let locName = '현재 위치';
        let countryName = '대한민국';
        let countryCode = 'KR';

        try {
          const revUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ko`;
          const revRes = await fetch(revUrl, { signal: controller.signal });
          if (revRes.ok) {
            const revData = await revRes.json();
            locName = revData.locality || revData.city || revData.principalSubdivision || '현재 위치';
            countryName = revData.countryName || '대한민국';
            countryCode = revData.countryCode || 'KR';
          }
        } catch {
          locName = `내 위치 (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
        }

        const weatherData = await fetchForecastData(lat, lon, 'auto', controller.signal);

        if (thisRequestId !== AppState.currentRequestId) return;

        cityInput.value = locName;
        clearInputBtn.hidden = false;

        renderWeatherData({
          weather: weatherData,
          cityName: locName,
          rawSearchQuery: locName,
          countryName: countryName,
          countryCode: countryCode,
          targetTimezone: weatherData.timezone || 'Asia/Seoul'
        });

      } catch (err) {
        if (err.name === 'AbortError') return;
        if (thisRequestId !== AppState.currentRequestId) return;
        console.error('내 위치 날씨 조회 오류:', err);
        showError('위치 기반 날씨 조회 실패', '현재 위치의 날씨 정보를 가져오지 못했습니다.<br>검색창에 직접 지역명을 입력해주세요.');
      }
    },
    (err) => {
      if (thisRequestId !== AppState.currentRequestId) return;
      let msg = '위치 정보 접근이 차단되었거나 위치를 가져올 수 없습니다.<br>브라우저 설정에서 위치 권한을 허용하시거나 검색창에 지역명을 직접 입력해주세요.';
      if (err.code === 1) {
        msg = '위치 정보 접근 권한이 거부되었습니다.<br>검색창에 원하는 도시 이름을 직접 입력해보세요.';
      }
      showError('위치 정보를 확인할 수 없습니다', msg);
    },
    { timeout: 8000, enableHighAccuracy: false }
  );
}

// ============================================================================
// 유틸리티
// ============================================================================
function setViewState(state) {
  initialStateCard.hidden = (state !== 'initial');
  loadingStateCard.hidden = (state !== 'loading');
  errorStateCard.hidden = (state !== 'error');
  weatherCard.hidden = (state !== 'success');
}

function showError(title, message) {
  setViewState('error');
  errorTitle.textContent = title;
  errorMessage.innerHTML = message;
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function formatDateTimeWithTimezone(isoTimeStr, timeZone) {
  try {
    const date = new Date(isoTimeStr);
    const options = {
      timeZone: timeZone || 'Asia/Seoul',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Intl.DateTimeFormat('ko-KR', options).format(date);
  } catch {
    const now = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}. ${days[now.getDay()]}요일`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
