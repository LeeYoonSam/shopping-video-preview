# SPEC-VIDEO-AI-002: 인수 조건

---
spec_id: SPEC-VIDEO-AI-002
title: AI 기반 상품 비디오 생성 시스템 - 인수 조건
version: 1.0.0
status: draft
created: 2025-12-18
updated: 2025-12-18
---

## TAG BLOCK

```
[SPEC-VIDEO-AI-002]
├── [ADMIN-DASHBOARD] 관리자 대시보드
├── [NANO-BANANA] Nano Banana AI 연동
├── [PIKA-LABS] Pika Labs Image-to-Video 연동
├── [JOB-QUEUE] Bull + Redis 비동기 작업 처리
├── [STORAGE] S3/R2 비디오 저장소
└── [COST-TRACKING] 생성 비용 추적
```

## 인수 조건 개요

이 문서는 SPEC-VIDEO-AI-002의 인수 조건을 Given-When-Then 형식으로 정의합니다.

## 시나리오 목록

### AC-001: 비디오 생성 버튼 표시

**Given** 관리자가 로그인하여 상품 관리 페이지에 접근했을 때
**And** 상품에 최소 1개 이상의 이미지가 있을 때
**When** 상품 상세 페이지를 열면
**Then** "비디오 생성" 버튼이 표시되어야 한다

### AC-002: 비디오 생성 작업 시작

**Given** 관리자가 상품 상세 페이지에서 "비디오 생성" 버튼을 보고 있을 때
**When** "비디오 생성" 버튼을 클릭하면
**Then** 비디오 생성 작업이 큐에 추가되어야 한다
**And** 작업 ID가 반환되어야 한다
**And** 버튼이 "생성 중..." 상태로 변경되어야 한다

### AC-003: 진행 상태 표시 - 이미지 생성

**Given** 비디오 생성 작업이 시작되었을 때
**When** Nano Banana AI가 착용 이미지를 생성 중이면
**Then** 진행 상태가 "이미지 생성 중 (33%)"으로 표시되어야 한다
**And** 진행률 바가 33%를 표시해야 한다

### AC-004: 진행 상태 표시 - 비디오 생성

**Given** Nano Banana에서 착용 이미지 생성이 완료되었을 때
**When** Pika Labs가 비디오를 생성 중이면
**Then** 진행 상태가 "비디오 생성 중 (66%)"으로 표시되어야 한다
**And** 진행률 바가 66%를 표시해야 한다

### AC-005: 진행 상태 표시 - 업로드

**Given** Pika Labs에서 비디오 생성이 완료되었을 때
**When** 비디오가 S3/R2에 업로드 중이면
**Then** 진행 상태가 "업로드 중 (90%)"으로 표시되어야 한다
**And** 진행률 바가 90%를 표시해야 한다

### AC-006: 비디오 생성 완료

**Given** 비디오가 S3/R2에 성공적으로 업로드되었을 때
**When** DB에 비디오 URL이 저장되면
**Then** 진행 상태가 "완료"로 표시되어야 한다
**And** 생성된 비디오 미리보기가 표시되어야 한다
**And** 상품의 videoUrl 필드가 업데이트되어야 한다

### AC-007: Nano Banana 이미지 생성 성공

**Given** 상품 이미지 URL이 유효할 때
**When** Nano Banana API에 이미지 생성을 요청하면
**Then** 착용 이미지 2장(시작/끝 프레임)이 생성되어야 한다
**And** 각 이미지의 비용이 기록되어야 한다

### AC-008: Pika Labs 비디오 생성 성공

**Given** Nano Banana에서 착용 이미지 2장이 생성되었을 때
**When** Pika Labs API에 Image-to-Video를 요청하면
**Then** 시작 프레임에서 끝 프레임으로 전환하는 비디오가 생성되어야 한다
**And** 비디오 비용이 기록되어야 한다

### AC-009: S3/R2 업로드 성공

**Given** Pika Labs에서 비디오가 생성되었을 때
**When** S3/R2에 비디오를 업로드하면
**Then** 비디오 파일이 저장되어야 한다
**And** 접근 가능한 URL이 반환되어야 한다

### AC-010: 에러 처리 - Nano Banana 실패

**Given** 비디오 생성 작업이 진행 중일 때
**When** Nano Banana API 호출이 실패하면
**Then** 자동으로 재시도가 수행되어야 한다 (최대 3회)
**And** 3회 실패 후 작업 상태가 "실패"로 변경되어야 한다
**And** 에러 메시지가 기록되어야 한다

### AC-011: 에러 처리 - Pika Labs 실패

**Given** 착용 이미지가 성공적으로 생성되었을 때
**When** Pika Labs API 호출이 실패하면
**Then** 자동으로 재시도가 수행되어야 한다 (최대 3회)
**And** 3회 실패 후 작업 상태가 "실패"로 변경되어야 한다
**And** 에러 메시지가 기록되어야 한다

### AC-012: 에러 처리 - 업로드 실패

**Given** 비디오가 성공적으로 생성되었을 때
**When** S3/R2 업로드가 실패하면
**Then** 자동으로 재시도가 수행되어야 한다 (최대 3회)
**And** 3회 실패 후 작업 상태가 "실패"로 변경되어야 한다

### AC-013: 비용 추적 - 작업별 비용

**Given** 비디오 생성 작업이 완료되었을 때
**When** 작업 상세 정보를 조회하면
**Then** Nano Banana 비용이 표시되어야 한다
**And** Pika Labs 비용이 표시되어야 한다
**And** 총 비용이 표시되어야 한다

### AC-014: 비용 추적 - 통계 대시보드

**Given** 관리자가 비용 통계 페이지에 접근했을 때
**When** 대시보드를 조회하면
**Then** 총 작업 수가 표시되어야 한다
**And** 완료/실패 작업 수가 표시되어야 한다
**And** 총 비용이 표시되어야 한다
**And** 서비스별 비용이 표시되어야 한다
**And** 날짜별 비용 그래프가 표시되어야 한다

### AC-015: 일일 생성 한도

**Given** 일일 비디오 생성 한도가 100건으로 설정되어 있을 때
**When** 당일 100번째 작업이 완료된 후 새로운 생성 요청이 발생하면
**Then** 작업이 거부되어야 한다
**And** "일일 생성 한도 초과" 메시지가 표시되어야 한다

### AC-016: 비용 경고 알림

**Given** 비용 알림 임계값이 $100로 설정되어 있을 때
**When** 누적 비용이 $100을 초과하면
**Then** 관리자에게 알림이 발송되어야 한다
**And** 대시보드에 경고가 표시되어야 한다

### AC-017: 기존 비디오 교체

**Given** 상품에 이미 비디오가 있을 때
**When** 관리자가 새로운 비디오 생성을 요청하면
**Then** 새로운 비디오가 생성되어야 한다
**And** 기존 비디오 URL이 새 비디오 URL로 교체되어야 한다
**And** 이전 비디오 파일은 S3/R2에서 삭제되어야 한다

### AC-018: 작업 이력 조회

**Given** 관리자가 비디오 생성 대시보드에 접근했을 때
**When** 작업 이력 탭을 클릭하면
**Then** 모든 비디오 생성 작업 목록이 표시되어야 한다
**And** 각 작업의 상태, 비용, 생성일이 표시되어야 한다
**And** 페이지네이션이 적용되어야 한다

### AC-019: 작업 상세 조회

**Given** 관리자가 작업 이력에서 특정 작업을 보고 있을 때
**When** 작업 행을 클릭하면
**Then** 작업 상세 정보가 표시되어야 한다
**And** 생성된 이미지 미리보기가 표시되어야 한다
**And** 생성된 비디오 미리보기가 표시되어야 한다
**And** 단계별 처리 시간이 표시되어야 한다

### AC-020: 인증 필수

**Given** 사용자가 로그인하지 않았을 때
**When** 비디오 생성 API를 호출하면
**Then** 401 Unauthorized 응답이 반환되어야 한다

### AC-021: 관리자 권한 필수

**Given** 일반 사용자로 로그인했을 때
**When** 비디오 생성 API를 호출하면
**Then** 403 Forbidden 응답이 반환되어야 한다

### AC-022: 상품 이미지 없음 처리

**Given** 상품에 이미지가 없을 때
**When** "비디오 생성" 버튼 클릭을 시도하면
**Then** 버튼이 비활성화되어 있어야 한다
**And** "상품 이미지가 필요합니다" 툴팁이 표시되어야 한다

### AC-023: 동시 생성 제한

**Given** 같은 상품에 대해 비디오 생성이 진행 중일 때
**When** 동일 상품에 대해 새로운 생성 요청이 발생하면
**Then** 작업이 거부되어야 한다
**And** "이미 생성 중입니다" 메시지가 표시되어야 한다

### AC-024: 모델 타입 선택

**Given** 관리자가 비디오 생성을 요청할 때
**When** 옵션 설정에서 모델 타입을 선택하면
**Then** 선택한 타입(여성/남성)의 모델이 착용한 이미지가 생성되어야 한다

### AC-025: 비디오 스타일 선택

**Given** 관리자가 비디오 생성을 요청할 때
**When** 옵션 설정에서 비디오 스타일을 선택하면
**Then** 선택한 스타일(부드러운/역동적)의 전환 효과가 적용된 비디오가 생성되어야 한다

## 품질 게이트 (Quality Gates)

### 테스트 커버리지

| 항목 | 최소 기준 |
|------|----------|
| 단위 테스트 커버리지 | 80% 이상 |
| API 엔드포인트 테스트 | 100% 커버 |
| 워커 로직 테스트 | 100% 커버 |

### 성능 기준

| 항목 | 최소 기준 |
|------|----------|
| API 응답 시간 | 1초 이내 |
| 동시 작업 처리 | 10개 이상 |
| 작업 타임아웃 | 10분 |

### 안정성 기준

| 항목 | 요구사항 |
|------|----------|
| 재시도 횟수 | 최대 3회 |
| 작업 복구 | Redis 재시작 후 복구 가능 |
| 부분 실패 격리 | 개별 작업 실패가 다른 작업에 영향 없음 |

### 보안 기준

| 항목 | 요구사항 |
|------|----------|
| 인증 | 관리자 인증 필수 |
| API 키 보안 | 환경 변수로 관리 |
| 입력 검증 | Zod 스키마로 검증 |

## 검증 방법

### 자동화 테스트

```typescript
// 예시: 비디오 생성 워커 테스트
describe('VideoGenerationWorker', () => {
  it('should complete full pipeline successfully', async () => {
    const job = await videoGenerationQueue.add({
      productId: 'test-product-123',
      options: { modelType: 'female' },
    });

    await waitForJobCompletion(job.id, 60000);

    const result = await prisma.videoGenerationJob.findUnique({
      where: { id: job.id },
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.finalVideoUrl).toBeTruthy();
    expect(result.totalCost).toBeGreaterThan(0);
  });

  it('should retry on Nano Banana failure', async () => {
    mockNanoBanana.failOnce();

    const job = await videoGenerationQueue.add({
      productId: 'test-product-123',
    });

    await waitForJobCompletion(job.id);

    expect(mockNanoBanana.callCount).toBe(2); // 1 fail + 1 success
  });
});
```

### 수동 테스트

1. **비디오 생성 흐름 테스트**
   - 관리자 로그인
   - 상품 선택 후 "비디오 생성" 클릭
   - 진행 상태 확인
   - 완료 후 비디오 재생 확인

2. **에러 처리 테스트**
   - 네트워크 차단 후 재시도 확인
   - 타임아웃 동작 확인
   - 실패 후 알림 확인

3. **비용 추적 테스트**
   - 작업 완료 후 비용 확인
   - 통계 대시보드 데이터 확인
   - 한도 초과 시 거부 확인

4. **보안 테스트**
   - 비로그인 상태에서 API 호출
   - 일반 사용자 권한으로 API 호출
   - 잘못된 입력 데이터 검증

## Definition of Done (완료 정의)

다음 조건을 모두 만족해야 구현이 완료된 것으로 간주합니다.

- 모든 인수 조건(AC-001 ~ AC-025)이 통과
- 단위 테스트 커버리지 80% 이상
- 모든 테스트가 CI에서 통과
- ESLint/Prettier 검사 통과
- TypeScript 타입 에러 없음
- API 문서 작성 완료
- 관리자 가이드 작성 완료
- 보안 검토 통과
- 코드 리뷰 승인
- Staging 환경에서 E2E 테스트 통과

---

Document Version: 1.0.0
Last Updated: 2025-12-18
Status: Draft
