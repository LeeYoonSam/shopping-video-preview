# SPEC-VIDEO-DATA-001: 인수 기준

---
spec_id: SPEC-VIDEO-DATA-001
document: acceptance
version: 1.0.0
---

## 인수 기준 개요

다양한 테스트 비디오가 products.ts에 올바르게 적용되었는지 검증합니다.

## 테스트 시나리오

### AC-001: 비디오 URL 다양성 확인

**Given** products.ts 파일이 업데이트된 상태에서
**When** videoUrl 필드가 있는 모든 상품을 확인하면
**Then** 각 상품은 서로 다른 비디오 URL을 가져야 한다
**And** 모든 URL은 유효한 MP4 비디오를 가리켜야 한다

**검증 방법**:
```bash
# products.ts에서 videoUrl 추출 및 중복 확인
grep "videoUrl:" src/data/products.ts | sort | uniq -c
```

**성공 기준**:
- 중복된 URL 없음 (각 URL이 1회만 나타남)
- 최소 10개의 서로 다른 URL

---

### AC-002: 비디오 재생 가능 확인

**Given** 새로운 비디오 URL이 설정된 상태에서
**When** 각 비디오 URL을 브라우저에서 열면
**Then** 비디오가 2초 이내에 로딩을 시작해야 한다
**And** 비디오가 정상적으로 재생되어야 한다

**검증 방법**:
1. 각 비디오 URL을 새 브라우저 탭에서 열기
2. 로딩 시간 측정
3. 재생 여부 확인

**성공 기준**:
- 모든 비디오 정상 로딩 (HTTP 200)
- 로딩 시작 2초 이내
- 오디오/비디오 재생 정상

---

### AC-003: CORS 호환성 확인

**Given** 새로운 비디오 URL이 설정된 상태에서
**When** JavaScript fetch API로 비디오 URL에 접근하면
**Then** CORS 에러 없이 응답을 받아야 한다

**검증 방법**:
```javascript
// 브라우저 콘솔에서 테스트
const urls = [
  // 각 비디오 URL 목록
];

urls.forEach(async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log(`${url}: ${response.ok ? 'OK' : 'FAIL'}`);
  } catch (e) {
    console.log(`${url}: CORS ERROR`);
  }
});
```

**성공 기준**:
- 모든 URL에서 CORS 에러 없음
- 또는 video 태그에서 직접 재생 가능

---

### AC-004: VideoPlayer 컴포넌트 통합 테스트

**Given** 개발 서버가 실행 중인 상태에서
**When** 상품 리스트 페이지에서 videoUrl이 있는 상품 카드에 마우스를 올리면
**Then** 해당 상품의 고유한 비디오가 팝업에서 재생되어야 한다

**검증 방법**:
1. `npm run dev` 실행
2. http://localhost:3000/products 접속
3. 각 상품 카드에 마우스 호버
4. 비디오 팝업 확인

**성공 기준**:
- 모든 비디오 팝업 정상 표시
- 각 상품별로 다른 비디오 재생
- 자동 재생, 음소거, 루프 동작 정상

---

### AC-005: 기존 테스트 통과 확인

**Given** products.ts가 업데이트된 상태에서
**When** 전체 테스트를 실행하면
**Then** 74개의 모든 테스트가 통과해야 한다

**검증 방법**:
```bash
npm run test
```

**성공 기준**:
- 74개 테스트 모두 통과 (PASS)
- 실패한 테스트 0개
- 스킵된 테스트 0개

---

### AC-006: TypeScript 타입 호환성 확인

**Given** products.ts가 업데이트된 상태에서
**When** TypeScript 컴파일을 실행하면
**Then** 타입 에러가 발생하지 않아야 한다

**검증 방법**:
```bash
npx tsc --noEmit
```

**성공 기준**:
- TypeScript 컴파일 에러 0개
- 경고 메시지 0개

---

### AC-007: 비디오 콘텐츠 다양성 확인

**Given** 새로운 비디오 URL이 설정된 상태에서
**When** 모든 비디오를 시각적으로 확인하면
**Then** 비디오 콘텐츠가 시각적으로 구분 가능해야 한다

**검증 방법**:
1. 각 비디오를 순차적으로 재생
2. 콘텐츠 내용 시각적 확인
3. 서로 다른 비디오인지 확인

**성공 기준**:
- 모든 비디오가 서로 다른 콘텐츠
- 테스트 시 상품 구분 가능

---

## 품질 게이트 체크리스트

### 코드 품질

- [ ] products.ts 파일 수정 완료
- [ ] 모든 videoUrl이 유효한 URL 형식
- [ ] 중복 URL 없음
- [ ] TypeScript 컴파일 에러 없음

### 기능 검증

- [ ] 모든 비디오 브라우저에서 재생 가능
- [ ] VideoPopup에서 정상 표시
- [ ] 자동 재생 동작 정상
- [ ] 음소거 상태 정상
- [ ] 루프 재생 정상

### 테스트 검증

- [ ] 74개 기존 테스트 모두 통과
- [ ] 추가 테스트 필요 없음 (데이터만 변경)

### 호환성 검증

- [ ] Chrome 브라우저 테스트 통과
- [ ] Safari 브라우저 테스트 통과 (가능한 경우)
- [ ] 모바일 뷰 테스트 통과

## Definition of Done (완료 정의)

다음 조건을 모두 만족할 때 SPEC을 완료로 간주합니다:

1. **비디오 다양성**: 10개 상품에 각각 다른 비디오 URL 할당
2. **재생 가능성**: 모든 비디오가 브라우저에서 정상 재생
3. **통합 테스트**: VideoPopup에서 모든 비디오 정상 표시
4. **테스트 통과**: 74개 기존 테스트 모두 통과
5. **타입 안전성**: TypeScript 컴파일 에러 없음

---

Document Version: 1.0.0
Last Updated: 2025-12-22
Related: [SPEC-VIDEO-DATA-001](spec.md), [plan.md](plan.md)
