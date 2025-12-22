# SPEC-VIDEO-DATA-001: 다양한 테스트 비디오 데이터 추가

---
spec_id: SPEC-VIDEO-DATA-001
title: 다양한 테스트 비디오 데이터 추가
version: 1.0.0
status: draft
priority: low
domain: data
created: 2025-12-22
updated: 2025-12-22
tags:
  - video
  - test-data
  - dummy-data
  - products
---

## TAG BLOCK

```
[SPEC-VIDEO-DATA-001]
├── [VIDEO-URLS] 다양한 테스트 비디오 URL 수집
├── [PRODUCTS-UPDATE] products.ts 데이터 업데이트
└── [VIDEO-VALIDATION] 비디오 재생 검증
```

## Environment (환경)

### 운영 환경

- **플랫폼**: 웹 브라우저 (Chrome 90+, Safari 14+, Firefox 90+, Edge 90+)
- **모바일**: iOS Safari 14+, Android Chrome 10+
- **프레임워크**: Next.js 15.x + React 19.x
- **데이터 파일**: `src/data/products.ts`

### 기술 요구사항

| 요구사항 | 상세 |
|----------|------|
| 비디오 형식 | MP4 (HTML5 호환) |
| CORS | 허용 필요 |
| 인증 | 불필요 (공개 URL) |
| CDN 호스팅 | 안정적인 재생 보장 |
| 길이 | 30초 이내 권장 |

## Assumptions (가정)

### 비즈니스 가정

1. 테스트/개발 목적으로 다양한 더미 비디오가 필요함
2. 각 상품별로 시각적으로 구분 가능한 비디오가 할당되어야 함
3. 실제 프로덕션에서는 실제 상품 비디오로 교체될 예정

### 기술 가정

1. 모든 비디오 URL은 HTTPS 프로토콜 사용
2. 비디오는 CDN에서 직접 스트리밍 가능
3. CORS 헤더가 올바르게 설정된 비디오만 사용
4. 무료 라이선스 또는 퍼블릭 도메인 비디오 사용

### 데이터 가정

1. 현재 10개 상품에 videoUrl이 설정되어 있음
2. 모든 상품이 동일한 W3Schools 더미 비디오 사용 중
3. 비디오 URL 변경 시 기존 타입 구조 유지

## Requirements (요구사항)

### 기능 요구사항 (EARS 형식)

#### REQ-001: 다양한 테스트 비디오 수집

**THE SYSTEM SHALL** 최소 10개의 서로 다른 무료 테스트 비디오 URL을 확보해야 한다
**SO THAT** 각 상품에 고유한 비디오를 할당할 수 있다

#### REQ-002: 비디오 URL 유효성

**THE SYSTEM SHALL** 모든 비디오 URL이 다음 조건을 만족해야 한다:
- MP4 형식 (HTML5 video 태그 호환)
- CORS 헤더 허용
- 인증 없이 접근 가능
- 안정적인 CDN 호스팅

#### REQ-003: 상품별 고유 비디오 할당

**WHEN** products.ts 데이터가 업데이트되면
**THE SYSTEM SHALL** 각 상품에 서로 다른 비디오 URL을 할당해야 한다
**SO THAT** 테스트 시 각 상품을 시각적으로 구분할 수 있다

#### REQ-004: 기존 테스트 호환성 유지

**THE SYSTEM SHALL** 기존 74개 테스트가 모두 통과해야 한다
**AND** Product 타입 인터페이스를 변경하지 않아야 한다

#### REQ-005: 비디오 내용 다양성

**THE SYSTEM SHALL** 다양한 카테고리의 비디오를 포함해야 한다
**SO THAT** 테스트 환경에서 풍부한 시각적 경험을 제공할 수 있다

추천 비디오 카테고리:
- 자연 풍경 (바다, 산, 숲)
- 도시 풍경
- 추상적 패턴
- 동물
- 음식

### 비기능 요구사항

#### NFR-001: 성능

- 비디오 로딩 시작: 2초 이내
- 비디오 버퍼링: 최소화
- CDN 응답 시간: 500ms 이내

#### NFR-002: 안정성

- 비디오 URL 가용성: 99% 이상
- 비디오 호스팅 서비스: 신뢰할 수 있는 CDN 사용

#### NFR-003: 라이선스

- 모든 비디오: 무료 사용 가능 (Pexels, Pixabay, Coverr 등)
- 상업적 사용 가능 라이선스 권장

## Specifications (명세)

### 권장 비디오 소스

| 소스 | URL | 특징 |
|------|-----|------|
| Pexels Videos | pexels.com | 고품질, 무료, CORS 지원 |
| Pixabay Videos | pixabay.com | 무료, 다양한 카테고리 |
| Coverr | coverr.co | 무료 비디오 클립 |
| Sample Videos | sample-videos.com | 테스트용 비디오 |
| Vidsplay | vidsplay.com | 무료 스톡 비디오 |

### 비디오 URL 후보 목록

다음은 확인이 필요한 후보 비디오 URL입니다:

1. **자연 - 바다 파도**
   - 출처: Pexels/Pixabay CDN 또는 유사 서비스

2. **자연 - 산 풍경**
   - 출처: 무료 스톡 비디오 CDN

3. **도시 - 야경**
   - 출처: 무료 스톡 비디오 CDN

4. **추상 - 컬러 패턴**
   - 출처: 무료 스톡 비디오 CDN

5. **음식 - 요리 과정**
   - 출처: 무료 스톡 비디오 CDN

6. **동물 - 자연 다큐**
   - 출처: 무료 스톡 비디오 CDN

7. **기술 - 디지털 효과**
   - 출처: 무료 스톡 비디오 CDN

8. **패션 - 런웨이**
   - 출처: 무료 스톡 비디오 CDN

9. **라이프스타일**
   - 출처: 무료 스톡 비디오 CDN

10. **자연 - 꽃/식물**
    - 출처: 무료 스톡 비디오 CDN

### 데이터 업데이트 대상

```typescript
// src/data/products.ts
// videoUrl이 있는 상품 목록 (현재 10개)
// ID: 1, 3, 5, 7, 9, 11, 13, 15, 17, 19

// 변경 전
videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'

// 변경 후
videoUrl: '각 상품별 고유한 비디오 URL'
```

### 상품-비디오 매핑 계획

| 상품 ID | 상품명 | 권장 비디오 테마 |
|---------|--------|-----------------|
| 1 | 베이직 화이트 티셔츠 | 패션/라이프스타일 |
| 3 | 캐주얼 체크 셔츠 | 도시 풍경 |
| 5 | 클래식 청바지 | 자연 풍경 |
| 7 | 와이드 핏 팬츠 | 추상 패턴 |
| 9 | 울 더플 코트 | 겨울 풍경 |
| 11 | 트렌치 코트 | 비 오는 풍경 |
| 13 | 실크 스카프 | 꽃/식물 |
| 15 | 우울 모자 | 하늘/구름 |
| 17 | 미니 핸드백 | 도시 거리 |
| 19 | 미니멀 지갑 | 기술/디지털 |

### 검증 방법

1. **브라우저 테스트**: 각 비디오 URL을 브라우저에서 직접 재생
2. **CORS 테스트**: fetch API로 비디오 URL 접근 테스트
3. **통합 테스트**: VideoPlayer 컴포넌트에서 실제 재생 확인
4. **기존 테스트 실행**: `npm run test` 명령으로 74개 테스트 통과 확인

## Dependencies (의존성)

### 내부 의존성

- `src/data/products.ts`: 상품 데이터 파일
- `src/types/product.ts`: Product 타입 정의
- `src/components/video/VideoPlayer.tsx`: 비디오 플레이어

### 외부 의존성

- 없음 (외부 패키지 추가 불필요)

## Traceability (추적성)

| 요구사항 | 구현 파일 | 테스트 |
|----------|-----------|--------|
| REQ-001 | 비디오 URL 조사 | 수동 검증 |
| REQ-002 | products.ts | 브라우저 테스트 |
| REQ-003 | products.ts | 시각적 확인 |
| REQ-004 | products.ts | npm run test |
| REQ-005 | products.ts | 시각적 확인 |

---

Document Version: 1.0.0
Last Updated: 2025-12-22
Status: Draft
