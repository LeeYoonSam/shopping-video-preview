# SPEC-VIDEO-DATA-001: 구현 계획

---
spec_id: SPEC-VIDEO-DATA-001
document: plan
version: 1.0.0
---

## 구현 개요

비디오 팝업 기능 테스트를 위해 다양한 무료 테스트 비디오를 수집하고 products.ts의 더미 데이터를 업데이트합니다.

## 마일스톤

### Primary Goal: 무료 테스트 비디오 URL 수집

**목표**: HTML5 호환 무료 비디오 URL 10개 이상 확보

**작업 내용**:
1. 무료 비디오 제공 사이트 조사
   - Pexels Videos (videos.pexels.com)
   - Pixabay Videos (pixabay.com/videos)
   - Coverr (coverr.co)
   - Sample-videos.com
   - Mixkit (mixkit.co)

2. 각 사이트에서 직접 스트리밍 가능한 MP4 URL 확인
   - CDN URL 직접 접근 가능 여부
   - CORS 헤더 설정 확인
   - 인증 없이 재생 가능 여부

3. 비디오 카테고리 다양성 확보
   - 자연 풍경 (2-3개)
   - 도시/라이프스타일 (2-3개)
   - 추상/패턴 (1-2개)
   - 기타 (2-3개)

**완료 조건**:
- 최소 10개의 유효한 비디오 URL 확보
- 모든 URL이 브라우저에서 직접 재생 가능

### Secondary Goal: products.ts 데이터 업데이트

**목표**: 각 상품에 고유한 테스트 비디오 할당

**작업 내용**:
1. 현재 videoUrl 필드가 있는 상품 확인
   - ID: 1, 3, 5, 7, 9, 11, 13, 15, 17, 19 (총 10개)

2. 각 상품에 적절한 비디오 매핑
   - 상품 카테고리와 비디오 테마 고려
   - 시각적 다양성 보장

3. products.ts 파일 수정
   - 기존 더미 URL을 새로운 URL로 교체
   - 타입 호환성 유지

**완료 조건**:
- 10개 상품에 각각 다른 비디오 URL 할당
- TypeScript 컴파일 오류 없음

### Final Goal: 검증 및 테스트

**목표**: 변경 사항 검증 및 기존 테스트 통과 확인

**작업 내용**:
1. 비디오 재생 테스트
   - 각 비디오 URL 브라우저 직접 테스트
   - VideoPlayer 컴포넌트에서 재생 확인
   - VideoPopup에서 호버 프리뷰 동작 확인

2. 기존 테스트 실행
   - `npm run test` 실행
   - 74개 테스트 모두 통과 확인

3. 개발 서버 확인
   - `npm run dev` 실행
   - 상품 리스트 페이지에서 비디오 프리뷰 확인
   - 각 상품별 다른 비디오 재생 확인

**완료 조건**:
- 모든 비디오 정상 재생
- 74개 테스트 모두 통과
- 개발 서버에서 시각적 확인 완료

## 기술적 접근 방식

### 비디오 URL 검증 방법

1. **브라우저 직접 테스트**
   - 새 탭에서 URL 열어 재생 확인
   - 로딩 시간 확인 (2초 이내)

2. **CORS 테스트**
   - 개발자 도구 Console에서 fetch 테스트
   - CORS 에러 발생 여부 확인

3. **통합 테스트**
   - VideoPlayer 컴포넌트에서 실제 재생
   - 자동 재생, 음소거, 루프 기능 확인

### 권장 비디오 소스

| 우선순위 | 소스 | 특징 | 제한 사항 |
|----------|------|------|----------|
| 1 | Pexels CDN | 고품질, CORS 지원, 무료 | API 필요할 수 있음 |
| 2 | Pixabay CDN | 무료, 다양한 콘텐츠 | 직접 URL 접근 제한 가능 |
| 3 | Mixkit | 무료 비디오 클립 | CDN URL 확인 필요 |
| 4 | Sample-videos | 테스트용 표준 비디오 | 콘텐츠 다양성 낮음 |
| 5 | Archive.org | 퍼블릭 도메인 | 품질 일정하지 않음 |

### 대안 전략

직접 CDN URL 획득이 어려운 경우:

1. **공개 테스트 비디오 사용**
   - W3Schools 샘플 비디오 (현재 사용 중)
   - HTML5 테스트 비디오
   - WebM 테스트 비디오

2. **GitHub Raw URL 사용**
   - 작은 MP4 파일을 저장소에 포함
   - GitHub raw URL로 접근

3. **CDN 서비스 활용**
   - Cloudinary 무료 티어
   - ImgBB 비디오 업로드

## 위험 요소 및 대응

### Risk 1: CORS 제한

**문제**: 많은 비디오 호스팅 서비스가 CORS를 제한함

**대응**:
- CORS가 허용된 CDN 우선 선택
- 대안으로 공개 테스트 비디오 사용
- 필요시 자체 CDN에 비디오 업로드

### Risk 2: URL 가용성

**문제**: 외부 비디오 URL이 변경되거나 삭제될 수 있음

**대응**:
- 안정적인 CDN 서비스 선택 (Pexels, Pixabay)
- 백업 URL 목록 준비
- 개발 환경용이므로 장기 안정성은 낮은 우선순위

### Risk 3: 로딩 성능

**문제**: 일부 비디오가 로딩이 느릴 수 있음

**대응**:
- 짧은 비디오 선택 (15-30초)
- 낮은 해상도 버전 사용 (720p 이하)
- CDN 지역 고려

## 의존성

### 영향받는 파일

- `src/data/products.ts` - 직접 수정

### 영향받지 않는 파일

- `src/types/product.ts` - 변경 없음
- `src/components/video/*` - 변경 없음
- 테스트 파일 - 변경 없음

## 예상 작업 범위

- 파일 수정: 1개 (`products.ts`)
- 새로운 코드 라인: 약 10줄 (URL 변경)
- 삭제 코드 라인: 약 10줄 (기존 URL)
- 테스트 영향: 없음 (URL만 변경)

---

Document Version: 1.0.0
Last Updated: 2025-12-22
Related: [SPEC-VIDEO-DATA-001](spec.md)
