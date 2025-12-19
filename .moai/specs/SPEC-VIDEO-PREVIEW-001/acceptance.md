# SPEC-VIDEO-PREVIEW-001: 인수 조건

---
spec_id: SPEC-VIDEO-PREVIEW-001
title: 상품 비디오 호버 프리뷰 UI - 인수 조건
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

## 인수 조건 개요

이 문서는 SPEC-VIDEO-PREVIEW-001의 인수 조건을 Given-When-Then 형식으로 정의합니다.

## 시나리오 목록

### AC-001: 데스크탑 호버 비디오 팝업

**Given** 사용자가 데스크탑 브라우저에서 상품 목록 페이지를 보고 있고
**And** 상품에 videoUrl이 설정되어 있을 때
**When** 사용자가 상품 카드 위에 마우스를 올리면
**Then** 200ms 후에 상품 카드 위에 비디오 팝업이 표시되어야 한다
**And** 비디오가 음소거 상태로 자동 재생되어야 한다
**And** 비디오가 반복 재생되어야 한다

### AC-002: 호버 해제 시 팝업 닫힘

**Given** 비디오 팝업이 열려 있고
**And** 비디오가 재생 중일 때
**When** 사용자가 마우스를 상품 카드 영역 밖으로 이동하면
**Then** 비디오 팝업이 즉시 닫혀야 한다
**And** 비디오 재생이 중지되어야 한다

### AC-003: 비디오 URL 없는 상품

**Given** 사용자가 상품 목록 페이지를 보고 있고
**And** 상품에 videoUrl이 설정되어 있지 않을 때
**When** 사용자가 상품 카드 위에 마우스를 올리면
**Then** 비디오 팝업이 표시되지 않아야 한다
**And** 기존 상품 이미지가 그대로 유지되어야 한다

### AC-004: 비디오 로딩 스켈레톤

**Given** 사용자가 상품 카드 위에 마우스를 올렸고
**And** 비디오가 로딩 중일 때
**When** 비디오 팝업이 열리면
**Then** 로딩 스켈레톤 UI가 표시되어야 한다
**And** 스켈레톤에 pulse 애니메이션이 적용되어야 한다

### AC-005: 비디오 로딩 완료

**Given** 로딩 스켈레톤이 표시되고 있고
**And** 비디오 데이터가 충분히 로드되었을 때
**When** 비디오 재생이 가능해지면
**Then** 로딩 스켈레톤이 사라져야 한다
**And** 비디오 플레이어가 표시되어야 한다
**And** 비디오가 자동으로 재생되어야 한다

### AC-006: 비디오 로딩 실패

**Given** 사용자가 상품 카드 위에 마우스를 올렸고
**And** 비디오 URL이 유효하지 않거나 로딩에 실패했을 때
**When** 비디오 로딩 에러가 발생하면
**Then** 비디오 팝업이 닫혀야 한다
**And** 에러 메시지가 콘솔에 기록되어야 한다
**And** 기본 상품 이미지가 유지되어야 한다

### AC-007: 모바일 탭 동작

**Given** 사용자가 모바일 브라우저(화면 너비 768px 미만)에서 상품 목록 페이지를 보고 있고
**And** 상품에 videoUrl이 설정되어 있을 때
**When** 사용자가 상품 카드를 탭하면
**Then** 전체 화면 모달로 비디오가 표시되어야 한다
**And** 모달에 닫기 버튼이 표시되어야 한다
**And** 비디오가 음소거 상태로 자동 재생되어야 한다

### AC-008: 모바일 모달 닫기

**Given** 모바일에서 비디오 모달이 열려 있을 때
**When** 사용자가 닫기 버튼을 탭하면
**Then** 비디오 모달이 닫혀야 한다
**And** 비디오 재생이 중지되어야 한다

### AC-009: 모바일 배경 탭으로 닫기

**Given** 모바일에서 비디오 모달이 열려 있을 때
**When** 사용자가 모달 외부 영역(반투명 배경)을 탭하면
**Then** 비디오 모달이 닫혀야 한다

### AC-010: 키보드 접근성 - 팝업 열기

**Given** 사용자가 키보드로 네비게이션하고 있고
**And** 상품 카드에 포커스가 있을 때
**When** 사용자가 Enter 키를 누르면
**Then** 비디오 팝업/모달이 열려야 한다

### AC-011: 키보드 접근성 - 팝업 닫기

**Given** 비디오 팝업/모달이 열려 있을 때
**When** 사용자가 Escape 키를 누르면
**Then** 비디오 팝업/모달이 닫혀야 한다

### AC-012: 팝업 위치

**Given** 데스크탑에서 비디오 팝업이 열릴 때
**When** 팝업이 렌더링되면
**Then** 팝업이 상품 카드 상단 중앙에 위치해야 한다
**And** 팝업 크기는 320px x 180px (16:9 비율)이어야 한다
**And** 팝업에 그림자(shadow-2xl)가 적용되어야 한다

### AC-013: 디바운스 동작

**Given** 사용자가 빠르게 여러 상품 카드를 훑어볼 때
**When** 마우스가 200ms 이내에 다른 카드로 이동하면
**Then** 이전 카드의 비디오 팝업이 열리지 않아야 한다
**And** 불필요한 비디오 로딩이 발생하지 않아야 한다

### AC-014: Product 타입 확장

**Given** Product 인터페이스가 정의되어 있을 때
**When** 타입 정의를 확인하면
**Then** videoUrl?: string 필드가 존재해야 한다
**And** videoUrl은 선택적(optional) 필드여야 한다

### AC-015: 반응형 브레이크포인트

**Given** 사용자가 브라우저 창 크기를 조절할 때
**When** 화면 너비가 768px 이상이면
**Then** 호버 시 오버레이 팝업이 사용되어야 한다
**When** 화면 너비가 768px 미만이면
**Then** 탭 시 모달이 사용되어야 한다

## 품질 게이트 (Quality Gates)

### 테스트 커버리지

| 항목 | 최소 기준 |
|------|----------|
| 단위 테스트 커버리지 | 80% 이상 |
| 컴포넌트 테스트 커버리지 | 80% 이상 |
| 주요 사용자 시나리오 | 100% 커버 |

### 성능 기준

| 항목 | 최소 기준 |
|------|----------|
| 비디오 로딩 시작 | 300ms 이내 |
| 팝업 애니메이션 | 200ms |
| 호버 디바운스 | 200ms |

### 접근성 기준

| 항목 | 요구사항 |
|------|----------|
| 키보드 네비게이션 | 완전 지원 |
| 스크린 리더 | 호환 |
| ARIA 레이블 | 모든 인터랙티브 요소에 적용 |

### 브라우저 호환성

| 브라우저 | 최소 버전 |
|----------|----------|
| Chrome | 90+ |
| Safari | 14+ |
| Firefox | 90+ |
| Edge | 90+ |
| iOS Safari | 14+ |
| Android Chrome | 10+ |

## 검증 방법

### 자동화 테스트

```typescript
// 예시: useVideoPopup 훅 테스트
describe('useVideoPopup', () => {
  it('should open popup after debounce delay', async () => {
    const { result } = renderHook(() => useVideoPopup());

    act(() => {
      result.current.handleMouseEnter(mockEvent);
    });

    expect(result.current.isOpen).toBe(false);

    await waitFor(() => {
      expect(result.current.isOpen).toBe(true);
    }, { timeout: 250 });
  });
});
```

### 수동 테스트

1. **데스크탑 테스트**
   - Chrome, Safari, Firefox, Edge에서 호버 동작 확인
   - 키보드 네비게이션 테스트

2. **모바일 테스트**
   - iOS Safari에서 탭 동작 확인
   - Android Chrome에서 탭 동작 확인
   - 모달 닫기 동작 확인

3. **성능 테스트**
   - Chrome DevTools로 로딩 시간 측정
   - Memory 탭으로 메모리 누수 확인

4. **접근성 테스트**
   - VoiceOver (iOS/macOS)로 스크린 리더 테스트
   - TalkBack (Android)로 스크린 리더 테스트
   - axe DevTools로 접근성 검사

## Definition of Done (완료 정의)

다음 조건을 모두 만족해야 구현이 완료된 것으로 간주합니다.

- 모든 인수 조건(AC-001 ~ AC-015)이 통과
- 단위 테스트 커버리지 80% 이상
- 모든 테스트가 CI에서 통과
- ESLint/Prettier 검사 통과
- TypeScript 타입 에러 없음
- 크로스 브라우저 테스트 완료
- 접근성 검사 통과
- 코드 리뷰 승인

---

Document Version: 1.0.0
Last Updated: 2025-12-18
Status: Draft
