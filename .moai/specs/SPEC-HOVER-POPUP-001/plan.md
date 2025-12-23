---
id: SPEC-HOVER-POPUP-001
type: implementation-plan
version: "1.0.0"
created: "2025-12-23"
updated: "2025-12-23"
spec_ref: "./spec.md"
---

# SPEC-HOVER-POPUP-001: 구현 계획서

## 태그 참조

```
[SPEC-HOVER-POPUP-001] > [PLAN]
├── [PLAN-DESIGN]: 컴포넌트 설계
├── [PLAN-STATE]: 상태 관리
├── [PLAN-ANIMATION]: 애니메이션 구현
├── [PLAN-VIDEO]: 비디오 플레이어 통합
├── [PLAN-RESPONSIVE]: 반응형 디자인
└── [PLAN-PERF]: 성능 최적화
```

---

## 마일스톤 개요

### Priority High (최우선)

| 마일스톤 | 목표 | 관련 요구사항 |
|----------|------|---------------|
| M1: 기본 컴포넌트 구조 | 핵심 컴포넌트 스캐폴딩 | U-001, U-005 |
| M2: 호버 감지 및 팝업 | 호버 이벤트 처리 및 기본 팝업 | E-001, E-002 |
| M3: 비디오 플레이어 통합 | HLS.js 기반 비디오 재생 | U-002, S-002 |

### Priority Medium (중요)

| 마일스톤 | 목표 | 관련 요구사항 |
|----------|------|---------------|
| M4: 애니메이션 구현 | Framer Motion 애니메이션 | E-001, E-002 |
| M5: 위치 자동 조정 | 뷰포트 경계 감지 및 조정 | U-003, UW-005 |
| M6: 에러 처리 및 폴백 | 로딩 실패 시 대체 UI | UW-001, UW-002, UW-003 |

### Priority Low (기본)

| 마일스톤 | 목표 | 관련 요구사항 |
|----------|------|---------------|
| M7: 반응형 디자인 | 모바일/태블릿 대응 | E-004 |
| M8: 접근성 구현 | 키보드/스크린리더 지원 | E-005, E-006 |
| M9: 성능 최적화 | 메모리 관리 및 lazy loading | S-005, 성능 요구사항 |

### Optional (선택적)

| 마일스톤 | 목표 | 관련 요구사항 |
|----------|------|---------------|
| M10: 사용자 설정 | 음소거 해제, 자동 재생 설정 | O-001 ~ O-005 |

---

## 상세 구현 계획

### M1: 기본 컴포넌트 구조 [PLAN-DESIGN]

#### 디렉토리 구조

```
src/components/
├── product/
│   ├── ProductCard/
│   │   ├── ProductCard.tsx
│   │   ├── ProductCard.test.tsx
│   │   └── index.ts
│   └── VideoPopup/
│       ├── VideoPopup.tsx
│       ├── VideoPopup.test.tsx
│       ├── VideoPlayer.tsx
│       ├── VideoPlayer.test.tsx
│       ├── PopupPortal.tsx
│       ├── PopupPortal.test.tsx
│       ├── useVideoPopup.ts
│       ├── useVideoPopup.test.ts
│       ├── usePopupPosition.ts
│       ├── usePopupPosition.test.ts
│       └── index.ts
├── ui/
│   ├── Skeleton/
│   └── LoadingSpinner/
└── hooks/
    ├── useHover.ts
    ├── useHover.test.ts
    ├── useVideoPlayer.ts
    └── useVideoPlayer.test.ts
```

#### 작업 항목

| 작업 | 설명 | 우선순위 |
|------|------|----------|
| 컴포넌트 스캐폴딩 | 기본 파일 구조 생성 | High |
| 타입 정의 | Props 및 상태 인터페이스 정의 | High |
| Portal 구현 | React Portal 기반 팝업 렌더링 | High |
| 기본 스타일링 | Tailwind CSS 기본 스타일 | High |

---

### M2: 호버 감지 및 팝업 [PLAN-STATE]

#### 상태 관리 전략

```typescript
// useVideoPopup 훅 상태
interface PopupState {
  isHovering: boolean;
  isPopupVisible: boolean;
  popupPosition: Position | null;
  hoverTimerId: NodeJS.Timeout | null;
  activeProductId: string | null;
}

// 상태 전이
// IDLE -> HOVERING (mouseenter) -> VISIBLE (300ms delay) -> IDLE (mouseleave)
```

#### 구현 세부사항

| 기능 | 구현 방법 | 관련 요구사항 |
|------|-----------|---------------|
| 호버 감지 | useHover 커스텀 훅 | E-001 |
| 딜레이 처리 | setTimeout with cleanup | E-001 (300ms) |
| 빠른 호버 방지 | debounce 로직 | UW-004 |
| 단일 팝업 정책 | Context 또는 전역 상태 | S-001 |

#### 훅 설계

```typescript
// useHover.ts
export function useHover(delay: number = 300) {
  // mouseenter/mouseleave 이벤트 핸들링
  // 딜레이 후 콜백 실행
  // cleanup 로직 포함
}

// useVideoPopup.ts
export function useVideoPopup(productId: string) {
  // 팝업 표시/숨김 로직
  // 위치 계산
  // 비디오 상태 관리
}
```

---

### M3: 비디오 플레이어 통합 [PLAN-VIDEO]

#### HLS.js 통합

| 항목 | 구현 방법 |
|------|-----------|
| HLS 지원 확인 | Hls.isSupported() 체크 |
| 네이티브 HLS | Safari/iOS에서 video.src 직접 할당 |
| 폴백 | MP4 직접 재생 |
| 에러 처리 | Hls 에러 이벤트 핸들링 |

#### 비디오 플레이어 기능

| 기능 | 구현 | 우선순위 |
|------|------|----------|
| 자동 재생 | muted + autoPlay 속성 | High |
| 반복 재생 | loop 속성 | High |
| 음소거 토글 | muted 상태 제어 | Medium |
| 진행 표시줄 | timeupdate 이벤트 | Medium |
| 버퍼링 표시 | waiting/playing 이벤트 | Medium |

#### 메모리 관리

| 상황 | 처리 방법 |
|------|-----------|
| 팝업 닫힘 | HLS 인스턴스 destroy |
| 다른 팝업 열림 | 이전 비디오 정리 |
| 컴포넌트 언마운트 | useEffect cleanup |

---

### M4: 애니메이션 구현 [PLAN-ANIMATION]

#### Framer Motion 설정

```typescript
// 팝업 애니메이션 variants
const popupVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};
```

#### 애니메이션 고려사항

| 항목 | 처리 방법 |
|------|-----------|
| AnimatePresence | exit 애니메이션 활성화 |
| reduced-motion | useReducedMotion 훅으로 감지 |
| 성능 | will-change, GPU 가속 활용 |

---

### M5: 위치 자동 조정 [PLAN-RESPONSIVE]

#### 위치 계산 알고리즘

```
1. 상품 카드의 getBoundingClientRect() 획득
2. 기본 위치 설정 (카드 우측)
3. 뷰포트 경계 체크:
   - 우측 경계 초과 시 -> 좌측 배치
   - 상단 경계 초과 시 -> 하단 정렬
   - 하단 경계 초과 시 -> 상단 정렬
4. 최종 위치 반환 { x, y, placement }
```

#### usePopupPosition 훅

| 입력 | 출력 |
|------|------|
| triggerRef: RefObject | position: { x, y } |
| popupSize: { width, height } | placement: 'left' \| 'right' |
| viewport padding | isVisible: boolean |

---

### M6: 에러 처리 및 폴백

#### 에러 상태 처리

| 에러 유형 | 감지 방법 | 폴백 처리 |
|-----------|-----------|-----------|
| 비디오 로드 실패 | error 이벤트 | 정적 이미지 표시 |
| 타임아웃 (3초) | setTimeout | 로딩 스켈레톤 -> 이미지 |
| 네트워크 오류 | HLS 에러 이벤트 | 재시도 버튼 표시 |
| URL 무효 | URL 검증 | 기본 상품 이미지 |

#### 로딩 상태 UI

| 상태 | UI 표시 |
|------|---------|
| 로딩 중 | 스켈레톤 애니메이션 |
| 버퍼링 | 스피너 오버레이 |
| 에러 | 에러 메시지 + 폴백 이미지 |
| 완료 | 비디오 재생 |

---

### M7: 반응형 디자인 [PLAN-RESPONSIVE]

#### 브레이크포인트 전략

| 브레이크포인트 | 팝업 동작 | 인터랙션 |
|----------------|-----------|----------|
| < 640px (sm) | 280x497px | 탭으로 토글 |
| 640-1024px (md) | 300x533px | 호버 + 탭 |
| > 1024px (lg) | 320x568px | 호버 |

#### 모바일 구현

| 기능 | 구현 방법 |
|------|-----------|
| 탭 감지 | onClick 이벤트 |
| 토글 동작 | isOpen 상태 토글 |
| 외부 클릭 닫기 | useClickOutside 훅 |
| 터치 최적화 | touch-action CSS |

---

### M8: 접근성 구현

#### ARIA 구현

| 요소 | ARIA 속성 |
|------|-----------|
| 팝업 | role="dialog", aria-modal="true" |
| 비디오 | aria-label="{상품명} 미리보기" |
| 닫기 버튼 | aria-label="닫기" |
| 음소거 버튼 | aria-pressed, aria-label |

#### 키보드 네비게이션

| 키 | 기능 | 구현 |
|----|------|------|
| Enter | 팝업 열기 | onKeyDown 핸들러 |
| Escape | 팝업 닫기 | useEffect 키 리스너 |
| Tab | 포커스 이동 | 자연스러운 탭 순서 |
| Space | 재생/일시정지 | 비디오 제어 |

#### 포커스 관리

| 상황 | 동작 |
|------|------|
| 팝업 열림 | 팝업 내부로 포커스 이동 |
| 팝업 닫힘 | 원래 트리거로 포커스 복원 |
| 포커스 트랩 | 팝업 내에서만 순환 |

---

### M9: 성능 최적화 [PLAN-PERF]

#### Lazy Loading

| 대상 | 전략 |
|------|------|
| VideoPopup | React.lazy + Suspense |
| HLS.js | dynamic import |
| 이미지 | next/image 최적화 |

#### 메모리 관리

| 상황 | 처리 |
|------|------|
| 팝업 닫힘 | 비디오 리소스 해제 |
| 화면 이탈 | IntersectionObserver로 정리 |
| 다중 팝업 방지 | 단일 인스턴스 유지 |

#### 렌더링 최적화

| 기법 | 적용 대상 |
|------|-----------|
| React.memo | 정적 컴포넌트 |
| useMemo | 위치 계산 |
| useCallback | 이벤트 핸들러 |
| 가상화 | 대량 상품 목록 |

---

### M10: 사용자 설정 (선택적)

#### 설정 항목

| 설정 | 기본값 | 저장 위치 |
|------|--------|-----------|
| 자동 재생 | true | localStorage |
| 음소거 해제 버튼 | false | localStorage |
| 호버 딜레이 | 300ms | localStorage |
| 데이터 절약 모드 | false | localStorage |
| reduced-motion | 시스템 설정 | 시스템 |

---

## 기술적 접근 방법

### 아키텍처 설계 원칙

| 원칙 | 적용 |
|------|------|
| 단일 책임 | 컴포넌트별 명확한 역할 분리 |
| 합성 | 작은 컴포넌트 조합으로 복잡한 UI 구성 |
| 커스텀 훅 | 재사용 가능한 로직 추출 |
| 선언적 UI | 상태 기반 렌더링 |

### 테스트 전략

| 테스트 유형 | 도구 | 대상 |
|------------|------|------|
| 단위 테스트 | Vitest | 훅, 유틸리티 함수 |
| 컴포넌트 테스트 | Testing Library | UI 컴포넌트 |
| E2E 테스트 | Playwright | 전체 흐름 |
| 접근성 테스트 | axe-core | WCAG 준수 |

---

## 리스크 및 대응 방안

| 리스크 | 가능성 | 영향 | 대응 방안 |
|--------|--------|------|-----------|
| HLS.js 브라우저 호환성 | 중간 | 높음 | MP4 폴백 구현 |
| 자동 재생 정책 | 높음 | 중간 | 음소거 필수, 사용자 인터랙션 후 음소거 해제 |
| 성능 저하 (대량 상품) | 중간 | 높음 | 가상화, lazy loading |
| 모바일 터치 충돌 | 중간 | 중간 | 터치 이벤트 분리 처리 |
| 메모리 누수 | 낮음 | 높음 | cleanup 로직 철저히 구현 |

---

## 의존성 설치

```bash
# 필수 패키지
npm install framer-motion hls.js

# 개발 의존성 (테스트)
npm install -D @testing-library/react vitest @axe-core/react
```

---

## 완료 기준

| 마일스톤 | 완료 조건 |
|----------|-----------|
| M1 | 모든 컴포넌트 파일 생성, 타입 정의 완료 |
| M2 | 호버 시 팝업 표시/숨김 동작 |
| M3 | HLS 비디오 자동 재생 |
| M4 | 부드러운 애니메이션 동작 |
| M5 | 뷰포트 경계에서 자동 위치 조정 |
| M6 | 에러 시 적절한 폴백 표시 |
| M7 | 모바일에서 탭 동작 |
| M8 | 키보드로 전체 기능 사용 가능 |
| M9 | 성능 메트릭 목표 달성 |
| M10 | 사용자 설정 저장/불러오기 |
