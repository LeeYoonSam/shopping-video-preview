# SPEC-VIDEO-PREVIEW-001: 구현 계획

---
spec_id: SPEC-VIDEO-PREVIEW-001
title: 상품 비디오 호버 프리뷰 UI - 구현 계획
version: 1.0.0
status: draft
created: 2025-12-18
updated: 2025-12-18
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

## 구현 개요

이 SPEC은 상품 카드에 마우스 호버 시 비디오 프리뷰를 표시하는 UI 기능을 구현합니다. TDD 방식으로 테스트를 먼저 작성하고 구현합니다.

## 마일스톤

### 마일스톤 1: Product 타입 확장 (Primary Goal)

**목표**: Product 인터페이스에 videoUrl 필드 추가

**작업 항목**:
1. Product 타입에 videoUrl?: string 필드 추가
2. 더미 데이터에 videoUrl 필드 추가 (일부 상품에만)
3. 타입 정의 테스트

**결과물**:
- `src/types/product.ts` 수정
- `src/data/products.ts` 수정

### 마일스톤 2: useVideoPopup 커스텀 훅 (Primary Goal)

**목표**: 비디오 팝업 상태 관리 훅 구현

**작업 항목**:
1. 테스트 파일 생성 (RED)
2. 훅 인터페이스 정의
3. 상태 관리 로직 구현 (GREEN)
4. 디바운스 로직 구현
5. 에러 처리 로직 구현
6. 리팩토링 (REFACTOR)

**결과물**:
- `src/components/video/useVideoPopup.ts`
- `src/components/video/useVideoPopup.test.ts`

### 마일스톤 3: VideoLoadingSkeleton 컴포넌트 (Primary Goal)

**목표**: 비디오 로딩 중 표시할 스켈레톤 UI 구현

**작업 항목**:
1. 테스트 파일 생성 (RED)
2. 스켈레톤 컴포넌트 구현 (GREEN)
3. 애니메이션 적용
4. 리팩토링 (REFACTOR)

**결과물**:
- `src/components/video/VideoLoadingSkeleton.tsx`
- `src/components/video/VideoLoadingSkeleton.test.tsx`

### 마일스톤 4: VideoPlayer 컴포넌트 (Secondary Goal)

**목표**: 비디오 재생 기능을 담당하는 컴포넌트 구현

**작업 항목**:
1. 테스트 파일 생성 (RED)
2. 비디오 엘리먼트 렌더링 구현
3. 자동 재생, 음소거, 반복 재생 구현 (GREEN)
4. 로딩 상태 콜백 구현
5. 에러 처리 구현
6. 리팩토링 (REFACTOR)

**결과물**:
- `src/components/video/VideoPlayer.tsx`
- `src/components/video/VideoPlayer.test.tsx`

### 마일스톤 5: VideoPopup 컴포넌트 (Secondary Goal)

**목표**: 비디오 팝업 컨테이너 컴포넌트 구현

**작업 항목**:
1. 테스트 파일 생성 (RED)
2. 데스크탑 오버레이 팝업 구현 (GREEN)
3. 모바일 모달 구현 (@radix-ui/react-dialog)
4. 반응형 분기 처리
5. 위치 계산 로직 구현
6. 리팩토링 (REFACTOR)

**결과물**:
- `src/components/video/VideoPopup.tsx`
- `src/components/video/VideoPopup.test.tsx`

### 마일스톤 6: ProductCard 통합 (Final Goal)

**목표**: 기존 ProductCard에 비디오 프리뷰 기능 통합

**작업 항목**:
1. ProductCard 통합 테스트 작성 (RED)
2. 호버 이벤트 핸들러 연결
3. VideoPopup 조건부 렌더링 (GREEN)
4. videoUrl이 없는 경우 처리
5. 통합 테스트 (REFACTOR)

**결과물**:
- `src/components/product/ProductCard.tsx` 수정
- `src/components/product/ProductCard.test.tsx` 수정

### 마일스톤 7: 배럴 익스포트 및 정리 (Optional Goal)

**목표**: 모듈 정리 및 익스포트 설정

**작업 항목**:
1. index.ts 배럴 익스포트 생성
2. 타입 익스포트 정리
3. 문서화 주석 추가

**결과물**:
- `src/components/video/index.ts`

## 기술적 접근 방식

### TDD 워크플로우

모든 컴포넌트와 훅은 TDD 방식으로 구현합니다.

1. **RED**: 실패하는 테스트 작성
2. **GREEN**: 테스트를 통과하는 최소한의 코드 작성
3. **REFACTOR**: 코드 품질 개선

### 반응형 구현 전략

```
데스크탑 (width >= 768px)
- useMediaQuery 훅으로 감지
- 절대 위치 오버레이 팝업
- 마우스 이벤트 기반

모바일 (width < 768px)
- @radix-ui/react-dialog 모달
- 터치 이벤트 기반
- 닫기 버튼 제공
```

### 상태 관리 전략

```
useVideoPopup 훅에서 모든 상태 관리
- isOpen: 팝업 표시 여부
- isLoading: 비디오 로딩 중
- error: 에러 상태
- position: 팝업 위치

디바운스: 200ms (호버 시 즉시 열리지 않도록)
```

### 비디오 재생 정책

```
iOS Safari:
- muted + playsinline 속성 필수
- 사용자 인터랙션 후 자동재생 가능

Android Chrome:
- muted 속성으로 자동재생 가능
- Data Saver 모드 고려

데스크탑:
- muted 속성으로 자동재생 가능
```

## 아키텍처 설계

### 컴포넌트 계층 구조

```
ProductCard
└── VideoPopup (조건부)
    ├── VideoLoadingSkeleton (로딩 중)
    └── VideoPlayer (로딩 완료)
```

### 데이터 흐름

```
ProductCard
│
├── onMouseEnter → useVideoPopup.handleMouseEnter
│                  → 200ms 디바운스
│                  → isOpen = true
│
├── onMouseLeave → useVideoPopup.handleMouseLeave
│                  → isOpen = false
│                  → 비디오 정지
│
└── VideoPopup
    └── VideoPlayer
        ├── onLoadStart → isLoading = true
        ├── onCanPlay → isLoading = false
        └── onError → error 상태 설정
```

### 접근성 고려사항

```
키보드 네비게이션:
- Tab: 상품 카드 포커스
- Enter: 비디오 팝업 열기
- Escape: 비디오 팝업 닫기

ARIA 속성:
- aria-label: 비디오 설명
- aria-hidden: 스켈레톤 숨김
- role="dialog": 모달 역할

스크린 리더:
- "상품명 비디오 프리뷰" 안내
- 비디오 재생 상태 알림
```

## 위험 요소 및 대응 방안

### 위험 1: iOS Safari 자동재생 제한

**위험**: iOS Safari에서 비디오 자동재생이 차단될 수 있음

**대응**:
- muted + playsinline 속성 필수 적용
- 자동재생 실패 시 재생 버튼 표시
- canplay 이벤트로 재생 가능 여부 확인

### 위험 2: 성능 이슈

**위험**: 다수의 상품 카드에서 비디오 프리로드 시 성능 저하

**대응**:
- 호버 시에만 비디오 로드 (lazy loading)
- 비디오 프리로드 최소화
- 메모리 관리 (팝업 닫힐 때 비디오 언로드)

### 위험 3: 네트워크 지연

**위험**: 느린 네트워크에서 비디오 로딩 지연

**대응**:
- 로딩 스켈레톤으로 사용자 피드백 제공
- 로딩 타임아웃 설정 (5초)
- 에러 시 graceful degradation

### 위험 4: 모바일 UX

**위험**: 모바일에서 호버 이벤트가 없어 다른 UX 필요

**대응**:
- 모바일에서는 탭으로 모달 열기
- @radix-ui/react-dialog로 접근성 보장
- 명확한 닫기 버튼 제공

## 테스트 전략

### 단위 테스트

```
useVideoPopup.test.ts
- 초기 상태 테스트
- handleMouseEnter 테스트
- handleMouseLeave 테스트
- 디바운스 동작 테스트
- 에러 상태 테스트

VideoPlayer.test.tsx
- 렌더링 테스트
- 자동재생 속성 테스트
- 음소거 속성 테스트
- 반복 재생 속성 테스트
- 에러 콜백 테스트

VideoLoadingSkeleton.test.tsx
- 렌더링 테스트
- 애니메이션 클래스 테스트

VideoPopup.test.tsx
- 열림/닫힘 테스트
- 위치 계산 테스트
- 반응형 분기 테스트
```

### 통합 테스트

```
ProductCard + VideoPopup 통합
- 호버 시 팝업 표시
- 마우스 아웃 시 팝업 숨김
- videoUrl 없을 때 동작
```

## 의존성 설치

```bash
# 필수 의존성
pnpm add @radix-ui/react-dialog

# 개발 의존성 (이미 설치된 경우 생략)
pnpm add -D vitest @testing-library/react @testing-library/user-event
```

## 구현 순서 권장

1. Product 타입 확장
2. useVideoPopup 훅
3. VideoLoadingSkeleton
4. VideoPlayer
5. VideoPopup
6. ProductCard 통합
7. 배럴 익스포트

각 단계에서 TDD (RED-GREEN-REFACTOR) 사이클을 따릅니다.

---

Document Version: 1.0.0
Last Updated: 2025-12-18
Status: Draft
