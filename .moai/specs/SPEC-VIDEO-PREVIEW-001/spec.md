# SPEC-VIDEO-PREVIEW-001: 상품 비디오 호버 프리뷰 UI

---
spec_id: SPEC-VIDEO-PREVIEW-001
title: 상품 비디오 호버 프리뷰 UI
version: 1.0.0
status: draft
priority: high
domain: frontend
created: 2025-12-18
updated: 2025-12-18
tags:
  - video
  - preview
  - hover
  - ui
  - responsive
---

## TAG BLOCK

```
[SPEC-VIDEO-PREVIEW-001]
├── [VIDEO-POPUP] 비디오 팝업 컴포넌트
├── [VIDEO-PLAYER] 비디오 플레이어 컴포넌트
├── [VIDEO-SKELETON] 로딩 스켈레톤 컴포넌트
├── [VIDEO-HOOK] useVideoPopup 커스텀 훅
└── [PRODUCT-TYPE] Product 타입 확장
```

## Environment (환경)

### 운영 환경

- **플랫폼**: 웹 브라우저 (Chrome 90+, Safari 14+, Firefox 90+, Edge 90+)
- **모바일**: iOS Safari 14+, Android Chrome 10+
- **프레임워크**: Next.js 15.x + React 19.x
- **스타일링**: Tailwind CSS 3.4+
- **접근성**: @radix-ui/react-dialog
- **테스트**: Vitest + React Testing Library

### 기술 스택

| 카테고리 | 기술 | 버전 | 용도 |
|----------|------|------|------|
| UI 프레임워크 | React | 19.x | 컴포넌트 라이브러리 |
| 메타 프레임워크 | Next.js | 15.x | 풀스택 프레임워크 |
| 모달/다이얼로그 | @radix-ui/react-dialog | latest | 접근성 준수 모달 |
| 스타일링 | Tailwind CSS | 3.4+ | 유틸리티 CSS |
| 테스트 | Vitest | latest | 단위 테스트 |
| 컴포넌트 테스트 | React Testing Library | latest | 컴포넌트 테스트 |

## Assumptions (가정)

### 비즈니스 가정

1. 사용자는 상품 카드 위에 마우스를 올려 비디오 프리뷰를 기대함
2. 모바일 사용자는 탭하여 비디오를 볼 수 있음
3. 비디오는 자동 재생되어야 하지만 음소거 상태여야 함
4. 비디오 로딩 시간은 2초 이내여야 함

### 기술 가정

1. 모든 상품에 비디오가 있는 것은 아님 (videoUrl은 선택적 필드)
2. 비디오 파일은 CDN에서 제공됨
3. 비디오 형식은 MP4 또는 HLS 스트림
4. 최대 비디오 길이는 30초

### 데이터 가정

1. Product 인터페이스에 videoUrl 필드 추가 필요
2. 비디오 메타데이터 (duration, thumbnail)는 별도 API에서 제공 가능

## Requirements (요구사항)

### 기능 요구사항 (EARS 형식)

#### REQ-001: 호버 비디오 팝업

**WHEN** 사용자가 데스크탑에서 상품 카드 위에 마우스를 올리면
**THE SYSTEM SHALL** 상품 카드 위에 비디오 팝업을 표시해야 한다
**SO THAT** 사용자가 상품 비디오를 빠르게 미리볼 수 있다

#### REQ-002: 비디오 자동 재생

**WHEN** 비디오 팝업이 표시되면
**THE SYSTEM SHALL** 비디오를 음소거 상태로 자동 재생해야 한다
**AND** 비디오를 반복 재생해야 한다

#### REQ-003: 팝업 사라짐

**WHEN** 사용자가 마우스를 상품 카드 영역 밖으로 이동하면
**THE SYSTEM SHALL** 비디오 팝업을 숨겨야 한다
**AND** 비디오 재생을 중지해야 한다

#### REQ-004: 반응형 디자인 - 데스크탑

**WHERE** 화면 너비가 768px 이상인 데스크탑 환경에서
**THE SYSTEM SHALL** 상품 카드 위에 오버레이 팝업으로 비디오를 표시해야 한다

#### REQ-005: 반응형 디자인 - 모바일

**WHERE** 화면 너비가 768px 미만인 모바일 환경에서
**WHEN** 사용자가 상품 카드를 탭하면
**THE SYSTEM SHALL** 전체 화면 모달로 비디오를 표시해야 한다

#### REQ-006: 로딩 스켈레톤

**WHILE** 비디오가 로딩 중일 때
**THE SYSTEM SHALL** 로딩 스켈레톤 UI를 표시해야 한다
**SO THAT** 사용자가 비디오가 로딩 중임을 알 수 있다

#### REQ-007: 에러 처리

**IF** 비디오 URL이 없거나 비디오 로딩에 실패하면
**THE SYSTEM SHALL** 비디오 팝업을 표시하지 않아야 한다
**AND** 기본 상품 이미지를 유지해야 한다

#### REQ-008: Product 타입 확장

**THE SYSTEM SHALL** Product 인터페이스에 선택적 videoUrl 필드를 추가해야 한다
**SO THAT** 상품별로 비디오 URL을 저장할 수 있다

### 비기능 요구사항

#### NFR-001: 성능

- 비디오 로딩 시작: 300ms 이내
- 팝업 표시 지연: 200ms (호버 디바운스)
- 메모리 사용: 비디오당 50MB 이내

#### NFR-002: 접근성

- 키보드 네비게이션 지원 (Tab, Enter, Escape)
- 스크린 리더 호환
- ARIA 레이블 제공

#### NFR-003: 호환성

- 모든 모던 브라우저 지원
- iOS Safari 비디오 자동재생 정책 준수
- Android Chrome 비디오 정책 준수

## Specifications (명세)

### 컴포넌트 구조

```
src/components/video/
├── VideoPopup.tsx          # 메인 팝업 컨테이너
├── VideoPopup.test.tsx     # 팝업 테스트
├── VideoPlayer.tsx         # 비디오 플레이어
├── VideoPlayer.test.tsx    # 플레이어 테스트
├── VideoLoadingSkeleton.tsx    # 로딩 스켈레톤
├── VideoLoadingSkeleton.test.tsx
├── useVideoPopup.ts        # 커스텀 훅
├── useVideoPopup.test.ts   # 훅 테스트
└── index.ts                # 배럴 익스포트
```

### 인터페이스 설계

#### VideoPopup Props

```typescript
interface VideoPopupProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  className?: string;
}
```

#### VideoPlayer Props

```typescript
interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

#### useVideoPopup Hook

```typescript
interface UseVideoPopupReturn {
  isOpen: boolean;
  isLoading: boolean;
  error: Error | null;
  position: { x: number; y: number };
  openPopup: (event: MouseEvent) => void;
  closePopup: () => void;
  handleMouseEnter: (event: MouseEvent) => void;
  handleMouseLeave: () => void;
}
```

#### Product 타입 확장

```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: ProductCategory;
  isNew?: boolean;
  isSale?: boolean;
  videoUrl?: string;  // 추가
}
```

### UI/UX 명세

#### 데스크탑 팝업

- 위치: 상품 카드 상단 중앙
- 크기: 320px x 180px (16:9 비율)
- 애니메이션: fade-in (200ms)
- 그림자: shadow-2xl
- 테두리: rounded-lg

#### 모바일 모달

- 위치: 화면 중앙
- 크기: 전체 화면의 90% 너비
- 닫기 버튼: 우측 상단
- 배경: 반투명 오버레이 (bg-black/50)

#### 로딩 스켈레톤

- 배경: animate-pulse bg-gray-200
- 아이콘: 재생 버튼 실루엣
- 크기: 비디오 영역과 동일

### 상태 관리

```
[idle] ---(mouseEnter)--> [debouncing] ---(200ms)--> [loading]
[loading] ---(canPlay)--> [playing]
[loading] ---(error)--> [error]
[playing] ---(mouseLeave)--> [idle]
[error] ---(mouseLeave)--> [idle]
```

## Dependencies (의존성)

### 외부 의존성

- @radix-ui/react-dialog: 접근성 준수 모달
- tailwindcss: 스타일링
- vitest: 테스트 프레임워크
- @testing-library/react: 컴포넌트 테스트

### 내부 의존성

- src/types/product.ts: Product 타입
- src/components/product/ProductCard.tsx: 기존 상품 카드

## Traceability (추적성)

| 요구사항 | 구현 파일 | 테스트 파일 |
|----------|-----------|-------------|
| REQ-001 | VideoPopup.tsx | VideoPopup.test.tsx |
| REQ-002 | VideoPlayer.tsx | VideoPlayer.test.tsx |
| REQ-003 | useVideoPopup.ts | useVideoPopup.test.ts |
| REQ-004 | VideoPopup.tsx | VideoPopup.test.tsx |
| REQ-005 | VideoPopup.tsx | VideoPopup.test.tsx |
| REQ-006 | VideoLoadingSkeleton.tsx | VideoLoadingSkeleton.test.tsx |
| REQ-007 | useVideoPopup.ts | useVideoPopup.test.ts |
| REQ-008 | src/types/product.ts | - |

---

Document Version: 1.0.0
Last Updated: 2025-12-18
Status: Draft
