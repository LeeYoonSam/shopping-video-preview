# SPEC-VIDEO-AI-002: 구현 계획

---
spec_id: SPEC-VIDEO-AI-002
title: AI 기반 상품 비디오 생성 시스템 - 구현 계획
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

## 구현 개요

이 SPEC은 관리자가 상품 등록 시 AI를 활용하여 자동으로 상품 비디오를 생성하는 시스템을 구현합니다. Nano Banana로 착용 이미지를 생성하고, Pika Labs로 이미지 간 전환 비디오를 만듭니다.

## 워크플로우 다이어그램

```
[관리자]
    |
    v
[상품 등록/편집 페이지]
    |
    +-- "비디오 생성" 버튼 클릭
    |
    v
[API: POST /api/admin/video-generation]
    |
    +-- 작업 생성 (Bull Queue)
    |
    v
[Worker: 비동기 처리]
    |
    +-- Step 1: Nano Banana API 호출
    |   └── 착용 이미지 2장 생성 (시작/끝 프레임)
    |
    +-- Step 2: Pika Labs API 호출
    |   └── 이미지 간 전환 비디오 생성
    |
    +-- Step 3: S3/R2 업로드
    |   └── 비디오 파일 저장
    |
    +-- Step 4: DB 업데이트
    |   └── Product.videoUrl 저장
    |
    v
[완료: 관리자에게 알림]
```

## 마일스톤

### 마일스톤 1: 인프라 설정 (Primary Goal)

**목표**: Redis, Bull Queue, S3 클라이언트 설정

**작업 항목**:
1. Redis 연결 설정
2. Bull Queue 초기화
3. S3/R2 클라이언트 설정
4. 환경 변수 구성
5. Prisma 스키마 업데이트

**결과물**:
- `lib/queue/index.ts` - Bull Queue 설정
- `lib/storage/s3-client.ts` - S3 클라이언트
- `prisma/schema.prisma` - VideoGenerationJob 모델
- `.env.example` - 환경 변수 템플릿

### 마일스톤 2: Nano Banana AI 연동 (Primary Goal)

**목표**: Nano Banana API 클라이언트 구현

**작업 항목**:
1. API 클라이언트 인터페이스 정의
2. 테스트 작성 (RED)
3. API 호출 로직 구현 (GREEN)
4. 에러 처리 구현
5. 비용 계산 로직 추가
6. Mock 클라이언트 구현 (개발용)
7. 리팩토링 (REFACTOR)

**결과물**:
- `lib/ai/nano-banana.ts`
- `lib/ai/nano-banana.test.ts`
- `lib/ai/nano-banana.mock.ts`

### 마일스톤 3: Pika Labs API 연동 (Primary Goal)

**목표**: Pika Labs Image-to-Video API 클라이언트 구현

**작업 항목**:
1. API 클라이언트 인터페이스 정의
2. 테스트 작성 (RED)
3. Image-to-Video API 호출 구현 (GREEN)
4. 비디오 다운로드 로직 구현
5. 에러 처리 구현
6. 비용 계산 로직 추가
7. Mock 클라이언트 구현 (개발용)
8. 리팩토링 (REFACTOR)

**결과물**:
- `lib/ai/pika-labs.ts`
- `lib/ai/pika-labs.test.ts`
- `lib/ai/pika-labs.mock.ts`

### 마일스톤 4: 작업 큐 워커 (Secondary Goal)

**목표**: Bull Worker로 비디오 생성 파이프라인 구현

**작업 항목**:
1. 워커 인터페이스 정의
2. 테스트 작성 (RED)
3. 상태 전이 로직 구현 (GREEN)
4. Nano Banana 호출 단계 구현
5. Pika Labs 호출 단계 구현
6. S3 업로드 단계 구현
7. DB 업데이트 단계 구현
8. 재시도 로직 구현
9. 에러 처리 및 알림
10. 리팩토링 (REFACTOR)

**결과물**:
- `lib/queue/video-generation.queue.ts`
- `lib/queue/video-generation.worker.ts`
- `lib/queue/video-generation.test.ts`

### 마일스톤 5: API 엔드포인트 (Secondary Goal)

**목표**: 비디오 생성 API 구현

**작업 항목**:
1. POST /api/admin/video-generation 구현
2. GET /api/admin/video-generation/[jobId] 구현
3. GET /api/admin/video-generation/stats 구현
4. 인증/권한 미들웨어 적용
5. 입력 검증 (Zod)
6. 테스트 작성

**결과물**:
- `app/api/admin/video-generation/route.ts`
- `app/api/admin/video-generation/[jobId]/route.ts`
- `app/api/admin/video-generation/stats/route.ts`

### 마일스톤 6: 관리자 대시보드 UI (Secondary Goal)

**목표**: 비디오 생성 관리 UI 구현

**작업 항목**:
1. 상품 목록 + 비디오 상태 표시
2. "비디오 생성" 버튼 컴포넌트
3. 진행 상태 표시 컴포넌트
4. 비용 통계 대시보드
5. 작업 이력 테이블
6. 테스트 작성

**결과물**:
- `app/admin/video-generation/page.tsx`
- `app/admin/video-generation/[productId]/page.tsx`
- `components/admin/VideoGenerationButton.tsx`
- `components/admin/VideoGenerationProgress.tsx`
- `components/admin/VideoGenerationStats.tsx`

### 마일스톤 7: 비용 추적 및 알림 (Final Goal)

**목표**: 비용 모니터링 및 알림 시스템 구현

**작업 항목**:
1. 비용 계산 유틸리티 구현
2. 일일 한도 체크 로직
3. 임계값 초과 알림
4. 비용 보고서 생성
5. 테스트 작성

**결과물**:
- `lib/cost/calculator.ts`
- `lib/cost/alerts.ts`
- `lib/cost/reports.ts`

### 마일스톤 8: 통합 테스트 및 문서화 (Optional Goal)

**목표**: E2E 테스트 및 운영 문서 작성

**작업 항목**:
1. E2E 테스트 시나리오 작성
2. 통합 테스트 구현
3. 운영 가이드 문서 작성
4. API 문서 작성

**결과물**:
- `tests/e2e/video-generation.spec.ts`
- `docs/admin/video-generation.md`

## 기술적 접근 방식

### Bull Queue 설정

```typescript
// lib/queue/index.ts
import Bull from 'bull';

export const videoGenerationQueue = new Bull('video-generation', {
  redis: process.env.REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    timeout: 600000, // 10분
  },
});
```

### 워커 처리 파이프라인

```typescript
// lib/queue/video-generation.worker.ts
videoGenerationQueue.process(async (job) => {
  const { productId, options } = job.data;

  // Step 1: 상태 업데이트
  await updateJobStatus(job.id, 'GENERATING_IMAGES');

  // Step 2: Nano Banana 이미지 생성
  const images = await nanoBananaClient.generateWearingImages(productId);
  job.progress(33);

  // Step 3: 상태 업데이트
  await updateJobStatus(job.id, 'GENERATING_VIDEO');

  // Step 4: Pika Labs 비디오 생성
  const video = await pikaLabsClient.generateVideo(images);
  job.progress(66);

  // Step 5: 상태 업데이트
  await updateJobStatus(job.id, 'UPLOADING');

  // Step 6: S3 업로드
  const videoUrl = await s3Client.uploadVideo(video);
  job.progress(90);

  // Step 7: DB 업데이트
  await prisma.product.update({
    where: { id: productId },
    data: { videoUrl },
  });

  // Step 8: 완료
  await updateJobStatus(job.id, 'COMPLETED');
  job.progress(100);

  return { videoUrl };
});
```

### Nano Banana API 통합

```typescript
// lib/ai/nano-banana.ts
export class NanoBananaClient {
  async generateWearingImage(params: {
    productImageUrl: string;
    modelType: 'female' | 'male';
  }): Promise<{ imageUrl: string; cost: number }> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: params.productImageUrl,
        model_type: params.modelType,
      }),
    });

    if (!response.ok) {
      throw new NanoBananaError(await response.text());
    }

    const result = await response.json();
    return {
      imageUrl: result.output_url,
      cost: result.cost || 0.05, // 기본 비용 추정
    };
  }
}
```

### Pika Labs API 통합

```typescript
// lib/ai/pika-labs.ts
export class PikaLabsClient {
  async generateVideo(params: {
    startImageUrl: string;
    endImageUrl: string;
    duration?: number;
  }): Promise<{ videoUrl: string; cost: number }> {
    // 1. 비디오 생성 요청
    const createResponse = await this.createVideoJob(params);

    // 2. 완료 대기 (폴링)
    const result = await this.waitForCompletion(createResponse.jobId);

    return {
      videoUrl: result.output_url,
      cost: result.cost || 0.10, // 기본 비용 추정
    };
  }

  private async waitForCompletion(jobId: string): Promise<any> {
    const maxAttempts = 60; // 5분 (5초 간격)

    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getJobStatus(jobId);

      if (status.state === 'completed') {
        return status;
      }

      if (status.state === 'failed') {
        throw new PikaLabsError(status.error);
      }

      await sleep(5000);
    }

    throw new PikaLabsError('Timeout waiting for video generation');
  }
}
```

### S3 업로드

```typescript
// lib/storage/s3-client.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class VideoStorageClient {
  private s3: S3Client;

  async uploadVideo(videoBuffer: Buffer, productId: string): Promise<string> {
    const key = `videos/${productId}/${Date.now()}.mp4`;

    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: videoBuffer,
      ContentType: 'video/mp4',
    }));

    return `${process.env.S3_BASE_URL}/${key}`;
  }
}
```

## 위험 요소 및 대응 방안

### 위험 1: AI API 응답 시간

**위험**: Nano Banana 또는 Pika Labs API 응답이 매우 느릴 수 있음

**대응**:
- Bull Queue로 비동기 처리
- 긴 타임아웃 설정 (10분)
- 진행 상태 실시간 표시
- 폴링 방식으로 완료 대기

### 위험 2: API 비용 급증

**위험**: 대량의 비디오 생성 요청으로 비용 급증

**대응**:
- 일일 생성 한도 설정
- 비용 임계값 경고 알림
- 비용 대시보드로 모니터링
- 관리자 승인 필요 옵션

### 위험 3: 저장소 용량

**위험**: 비디오 파일로 인한 저장소 비용 증가

**대응**:
- 비디오 압축 최적화
- 오래된 비디오 자동 정리 정책
- CloudFlare R2로 비용 절감

### 위험 4: Redis 장애

**위험**: Redis 서버 장애 시 작업 손실

**대응**:
- Redis 클러스터 구성
- 작업 상태 DB 백업
- 재시작 시 미완료 작업 복구

### 위험 5: AI API 변경

**위험**: Nano Banana 또는 Pika Labs API 스펙 변경

**대응**:
- 클라이언트 추상화 레이어
- 버전 관리
- Mock 클라이언트로 테스트 독립성

## 테스트 전략

### 단위 테스트

```
nano-banana.test.ts
- API 호출 성공 테스트
- API 에러 처리 테스트
- 비용 계산 테스트

pika-labs.test.ts
- 비디오 생성 요청 테스트
- 폴링 로직 테스트
- 타임아웃 처리 테스트

video-generation.worker.test.ts
- 전체 파이프라인 테스트
- 단계별 실패 처리 테스트
- 재시도 로직 테스트
```

### 통합 테스트

```
video-generation.integration.ts
- 실제 API 연동 테스트 (staging)
- E2E 워크플로우 테스트
```

### Mock 전략

개발 환경에서는 실제 AI API 대신 Mock 클라이언트 사용:

```typescript
// lib/ai/nano-banana.mock.ts
export class MockNanoBananaClient {
  async generateWearingImage(params: any) {
    await sleep(2000); // 지연 시뮬레이션
    return {
      imageUrl: 'https://example.com/mock-image.jpg',
      cost: 0.05,
    };
  }
}
```

## 의존성 설치

```bash
# 작업 큐
pnpm add bull ioredis

# AWS S3
pnpm add @aws-sdk/client-s3

# 스키마 검증
pnpm add zod

# Prisma (이미 설치된 경우 생략)
pnpm add @prisma/client
pnpm add -D prisma
```

## 구현 순서 권장

1. 인프라 설정 (Redis, Bull, S3)
2. Prisma 스키마 업데이트
3. Nano Banana 클라이언트
4. Pika Labs 클라이언트
5. 작업 큐 워커
6. API 엔드포인트
7. 관리자 UI
8. 비용 추적
9. 통합 테스트

## 환경별 설정

### Development

- Mock AI 클라이언트 사용
- 로컬 Redis (Docker)
- 로컬 MinIO (S3 호환)

### Staging

- 실제 AI API (제한된 사용)
- Redis 클라우드
- S3/R2 테스트 버킷

### Production

- 실제 AI API
- Redis 클러스터
- S3/R2 프로덕션 버킷
- 비용 한도 적용

---

Document Version: 1.0.0
Last Updated: 2025-12-18
Status: Draft
