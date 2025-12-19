# SPEC-VIDEO-AI-002: AI 기반 상품 비디오 생성 시스템

---
spec_id: SPEC-VIDEO-AI-002
title: AI 기반 상품 비디오 생성 시스템
version: 1.0.0
status: draft
priority: medium
domain: ai-integration
created: 2025-12-18
updated: 2025-12-18
tags:
  - ai
  - video-generation
  - admin
  - nano-banana
  - pika-labs
  - async-job
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

## Environment (환경)

### 운영 환경

- **플랫폼**: 관리자 웹 대시보드
- **프레임워크**: Next.js 15.x (App Router)
- **백엔드**: Next.js API Routes
- **작업 큐**: Bull + Redis
- **스토리지**: AWS S3 또는 CloudFlare R2
- **데이터베이스**: PostgreSQL + Prisma

### 기술 스택

| 카테고리 | 기술 | 버전 | 용도 |
|----------|------|------|------|
| 메타 프레임워크 | Next.js | 15.x | 풀스택 프레임워크 |
| 작업 큐 | Bull | 4.x | Redis 기반 작업 큐 |
| 캐시/큐 | Redis | 7.x | 작업 큐 백엔드 |
| ORM | Prisma | 5.x | 데이터베이스 접근 |
| 스토리지 SDK | @aws-sdk/client-s3 | latest | S3/R2 파일 업로드 |
| AI 이미지 생성 | Nano Banana API | - | 착용 이미지 생성 |
| 비디오 생성 | Pika Labs API | - | Image-to-Video |

### 외부 서비스 의존성

| 서비스 | 용도 | 통신 방식 |
|--------|------|----------|
| Nano Banana | 상품 착용 이미지 생성 | REST API / MCP |
| Pika Labs | 이미지 간 전환 비디오 생성 | REST API |
| AWS S3 / CloudFlare R2 | 비디오 저장 | SDK |
| Redis | 작업 큐 저장소 | TCP |

## Assumptions (가정)

### 비즈니스 가정

1. 비디오 생성은 상품 등록 시점에 관리자가 수동으로 트리거함
2. 실시간 생성이 아닌 배치 처리 방식
3. 생성된 비디오는 상품 데이터베이스에 영구 저장됨
4. 비디오 생성 비용을 추적하여 예산 관리 가능해야 함

### 기술 가정

1. Nano Banana API가 MCP 서버로 제공되거나 REST API로 접근 가능함
2. Pika Labs API가 Image-to-Video 기능을 제공함
3. Redis 서버가 운영 환경에서 사용 가능함
4. S3/R2 버킷이 설정되어 있음

### 데이터 가정

1. 상품에는 최소 1개 이상의 이미지가 있음
2. 생성된 비디오 URL은 Product 테이블의 videoUrl 필드에 저장됨
3. 작업 상태는 별도 테이블에서 관리됨

## Requirements (요구사항)

### 기능 요구사항 (EARS 형식)

#### REQ-001: 관리자 비디오 생성 대시보드

**THE SYSTEM SHALL** 관리자가 상품별로 비디오 생성을 요청할 수 있는 대시보드를 제공해야 한다
**SO THAT** 관리자가 원하는 상품에 대해 비디오를 생성할 수 있다

#### REQ-002: 비디오 생성 버튼

**WHEN** 관리자가 상품 상세 페이지에서 "비디오 생성" 버튼을 클릭하면
**THE SYSTEM SHALL** 비디오 생성 작업을 큐에 추가해야 한다
**AND** 작업 ID를 반환해야 한다

#### REQ-003: Nano Banana 착용 이미지 생성

**WHEN** 비디오 생성 작업이 시작되면
**THE SYSTEM SHALL** Nano Banana AI에 상품 이미지를 전송해야 한다
**AND** 모델이 상품을 착용한 이미지를 생성해야 한다
**SO THAT** 비디오의 시작/종료 프레임으로 사용할 수 있다

#### REQ-004: Pika Labs Image-to-Video

**WHEN** Nano Banana에서 착용 이미지가 생성되면
**THE SYSTEM SHALL** Pika Labs API에 시작 이미지와 종료 이미지를 전송해야 한다
**AND** 두 이미지 간 전환 비디오를 생성해야 한다

#### REQ-005: 비동기 작업 처리

**THE SYSTEM SHALL** Bull + Redis를 사용하여 비디오 생성 작업을 비동기로 처리해야 한다
**SO THAT** 긴 처리 시간이 API 응답을 차단하지 않는다

#### REQ-006: 진행 상태 추적

**WHILE** 비디오 생성 작업이 진행 중일 때
**THE SYSTEM SHALL** 작업 상태(대기, 이미지 생성 중, 비디오 생성 중, 완료, 실패)를 추적해야 한다
**AND** 관리자가 실시간으로 진행 상태를 확인할 수 있어야 한다

#### REQ-007: S3/R2 비디오 저장

**WHEN** 비디오 생성이 완료되면
**THE SYSTEM SHALL** 비디오 파일을 S3/R2에 업로드해야 한다
**AND** 업로드된 비디오 URL을 상품 데이터베이스에 저장해야 한다

#### REQ-008: 비용 추적

**THE SYSTEM SHALL** 각 비디오 생성 요청의 비용을 기록해야 한다
**SO THAT** 관리자가 AI 서비스 사용 비용을 모니터링할 수 있다

#### REQ-009: 에러 처리 및 재시도

**IF** 비디오 생성 중 에러가 발생하면
**THE SYSTEM SHALL** 자동으로 최대 3회까지 재시도해야 한다
**AND** 최종 실패 시 관리자에게 알림을 제공해야 한다

#### REQ-010: 기존 비디오 교체

**IF** 상품에 이미 비디오가 있을 때
**WHEN** 관리자가 새로운 비디오 생성을 요청하면
**THE SYSTEM SHALL** 기존 비디오를 새 비디오로 교체해야 한다
**AND** 이전 비디오 파일을 삭제해야 한다

### 비기능 요구사항

#### NFR-001: 성능

- 작업 큐 처리량: 동시 10개 작업 처리
- 비디오 생성 타임아웃: 최대 10분
- API 응답 시간: 작업 제출 후 1초 이내

#### NFR-002: 안정성

- 작업 재시도: 실패 시 최대 3회
- 작업 상태 영속성: Redis 장애 시에도 복구 가능
- 부분 실패 처리: 개별 작업 실패가 다른 작업에 영향 없음

#### NFR-003: 보안

- API 인증: 관리자 인증 필수
- API 키 보안: 환경 변수로 관리
- 비디오 URL: Signed URL 사용 (선택적)

#### NFR-004: 비용 관리

- 일일 생성 한도: 설정 가능
- 비용 경고: 임계값 초과 시 알림
- 상세 비용 로그: 서비스별 비용 추적

## Specifications (명세)

### 디렉토리 구조

```
src/
├── app/
│   ├── admin/
│   │   └── video-generation/
│   │       ├── page.tsx              # 관리자 대시보드
│   │       └── [productId]/
│   │           └── page.tsx          # 상품별 비디오 생성
│   └── api/
│       └── admin/
│           └── video-generation/
│               ├── route.ts          # POST: 생성 요청
│               ├── [jobId]/
│               │   └── route.ts      # GET: 작업 상태
│               └── stats/
│                   └── route.ts      # GET: 비용 통계
├── lib/
│   ├── ai/
│   │   ├── nano-banana.ts           # Nano Banana 클라이언트
│   │   └── pika-labs.ts             # Pika Labs 클라이언트
│   ├── queue/
│   │   ├── video-generation.queue.ts  # Bull 큐 정의
│   │   └── video-generation.worker.ts # 워커 프로세서
│   └── storage/
│       └── s3-client.ts             # S3/R2 클라이언트
└── prisma/
    └── schema.prisma                # 데이터베이스 스키마
```

### 데이터베이스 스키마

```prisma
model VideoGenerationJob {
  id          String   @id @default(cuid())
  productId   String
  status      JobStatus @default(PENDING)
  progress    Int      @default(0)

  // AI 서비스 응답
  nanoBananaImageUrls String[]
  pikaLabsVideoUrl    String?
  finalVideoUrl       String?

  // 비용 추적
  nanoBananaCost      Float?
  pikaLabsCost        Float?
  totalCost           Float?

  // 에러 처리
  errorMessage        String?
  retryCount          Int      @default(0)

  // 타임스탬프
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  completedAt DateTime?

  product     Product  @relation(fields: [productId], references: [id])
}

enum JobStatus {
  PENDING
  GENERATING_IMAGES
  GENERATING_VIDEO
  UPLOADING
  COMPLETED
  FAILED
}
```

### API 엔드포인트

#### POST /api/admin/video-generation

비디오 생성 작업 요청

```typescript
// Request
interface CreateVideoJobRequest {
  productId: string;
  options?: {
    modelType?: 'female' | 'male';
    videoStyle?: 'smooth' | 'dynamic';
  };
}

// Response
interface CreateVideoJobResponse {
  jobId: string;
  status: JobStatus;
  estimatedTime: number; // seconds
}
```

#### GET /api/admin/video-generation/[jobId]

작업 상태 조회

```typescript
// Response
interface GetJobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress: number; // 0-100
  currentStep: string;
  estimatedTimeRemaining: number;
  result?: {
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
  };
  error?: string;
  cost?: {
    nanoBanana: number;
    pikaLabs: number;
    total: number;
  };
}
```

#### GET /api/admin/video-generation/stats

비용 통계 조회

```typescript
// Response
interface GetStatsResponse {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalCost: number;
  costByService: {
    nanoBanana: number;
    pikaLabs: number;
  };
  costByDate: Array<{
    date: string;
    cost: number;
  }>;
}
```

### AI 서비스 통합

#### Nano Banana 클라이언트

```typescript
interface NanoBananaClient {
  generateWearingImage(params: {
    productImageUrl: string;
    modelType: 'female' | 'male';
    poseType?: string;
  }): Promise<{
    imageUrl: string;
    cost: number;
  }>;
}
```

#### Pika Labs 클라이언트

```typescript
interface PikaLabsClient {
  generateVideo(params: {
    startImageUrl: string;
    endImageUrl: string;
    duration?: number;
    style?: 'smooth' | 'dynamic';
  }): Promise<{
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    cost: number;
  }>;
}
```

### 작업 흐름

```
[관리자] --(1. 생성 요청)--> [API Route]
                               |
                               v
                         [Bull Queue]
                               |
                               v
                         [Worker]
                               |
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
[Nano Banana]           [Pika Labs]              [S3/R2]
(착용 이미지 생성)       (비디오 생성)           (업로드)
        |                      |                      |
        +----------------------+----------------------+
                               |
                               v
                         [DB 업데이트]
                               |
                               v
                         [완료 알림]
```

### 상태 전이도

```
[PENDING]
    |
    v
[GENERATING_IMAGES] ---(실패)--> [재시도 or FAILED]
    |
    v
[GENERATING_VIDEO] ---(실패)--> [재시도 or FAILED]
    |
    v
[UPLOADING] ---(실패)--> [재시도 or FAILED]
    |
    v
[COMPLETED]
```

## Dependencies (의존성)

### 외부 의존성

- bull: Redis 기반 작업 큐
- ioredis: Redis 클라이언트
- @aws-sdk/client-s3: S3 SDK
- @prisma/client: 데이터베이스 ORM

### 내부 의존성

- src/types/product.ts: Product 타입
- prisma/schema.prisma: 데이터베이스 스키마

### 환경 변수

```
# Redis
REDIS_URL=redis://localhost:6379

# AWS S3 / CloudFlare R2
S3_BUCKET=video-storage
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# AI Services
NANO_BANANA_API_KEY=...
NANO_BANANA_API_URL=https://api.nanobanana.ai
PIKA_LABS_API_KEY=...
PIKA_LABS_API_URL=https://api.pika.art

# Cost Limits
DAILY_GENERATION_LIMIT=100
COST_ALERT_THRESHOLD=1000
```

## Traceability (추적성)

| 요구사항 | 구현 파일 | 테스트 파일 |
|----------|-----------|-------------|
| REQ-001 | app/admin/video-generation/page.tsx | page.test.tsx |
| REQ-002 | api/admin/video-generation/route.ts | route.test.ts |
| REQ-003 | lib/ai/nano-banana.ts | nano-banana.test.ts |
| REQ-004 | lib/ai/pika-labs.ts | pika-labs.test.ts |
| REQ-005 | lib/queue/video-generation.*.ts | queue.test.ts |
| REQ-006 | api/admin/video-generation/[jobId]/route.ts | route.test.ts |
| REQ-007 | lib/storage/s3-client.ts | s3-client.test.ts |
| REQ-008 | api/admin/video-generation/stats/route.ts | stats.test.ts |
| REQ-009 | lib/queue/video-generation.worker.ts | worker.test.ts |
| REQ-010 | lib/queue/video-generation.worker.ts | worker.test.ts |

---

Document Version: 1.0.0
Last Updated: 2025-12-18
Status: Draft
