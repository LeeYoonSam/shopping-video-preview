---
id: SPEC-TRYON-001
type: plan
version: "1.0.0"
created: "2025-12-23"
updated: "2025-12-23"
traceability:
  spec: "./spec.md"
  acceptance: "./acceptance.md"
---

# SPEC-TRYON-001: 구현 계획서

## 개요

이 문서는 AI 가상 착용 이미지 생성 시스템의 구현 계획을 정의합니다.

---

## 구현 단계 (Implementation Steps)

### Phase 1: 인프라 및 기반 구축 (Primary Goal)

**목표**: 프로젝트 기반 인프라 구성 및 핵심 의존성 설정

#### 작업 목록

1. **프로젝트 환경 설정**
   - Bull Queue 및 Redis 의존성 설치
   - AWS S3 SDK 설치 및 구성
   - 환경 변수 설정 (FASHN AI API Key, S3 Credentials, Redis URL)

2. **데이터베이스 스키마 설계**
   - Prisma 스키마 정의 (TryOnJob, ProductImage, ModelImage, TryOnResult)
   - 마이그레이션 생성 및 실행
   - 인덱스 최적화

3. **Redis 및 Bull Queue 설정**
   - Redis 연결 설정
   - Bull Queue 인스턴스 생성
   - 재시도 정책 및 타임아웃 구성

#### 산출물

- Prisma 스키마 파일
- Redis 연결 유틸리티
- Bull Queue 설정 파일
- 환경 변수 문서

---

### Phase 2: 이미지 관리 시스템 (Primary Goal)

**목표**: 상품 이미지 및 모델 이미지 업로드/관리 기능 구현

#### 작업 목록

1. **이미지 업로드 API**
   - POST /api/tryon/upload 엔드포인트 구현
   - 이미지 유효성 검사 (형식, 크기, 해상도)
   - Sharp를 이용한 이미지 전처리 (리사이징, 형식 변환)
   - S3/R2 업로드 로직

2. **모델 이미지 라이브러리**
   - GET /api/tryon/models 엔드포인트 구현
   - POST /api/tryon/models 엔드포인트 구현
   - 모델 이미지 카테고리 관리 (전신, 상반신 등)
   - 활성화/비활성화 토글

3. **스토리지 관리**
   - S3/R2 클라이언트 유틸리티
   - 서명된 URL 생성 로직
   - 이미지 삭제 및 정리 로직

#### 산출물

- 이미지 업로드 API
- 모델 이미지 관리 API
- 스토리지 유틸리티 모듈
- 이미지 검증 미들웨어

---

### Phase 3: FASHN AI 연동 (Primary Goal)

**목표**: FASHN AI Virtual Try-On API 통합

#### 작업 목록

1. **FASHN AI 클라이언트**
   - API 클라이언트 클래스 구현
   - 인증 헤더 관리
   - 요청/응답 타입 정의
   - 에러 핸들링

2. **가상 착용 요청 처리**
   - POST /api/tryon/generate 엔드포인트 구현
   - 요청 파라미터 검증
   - 캐시 키 생성 및 중복 체크
   - 작업 큐 등록

3. **API 응답 처리**
   - 결과 이미지 다운로드
   - S3/R2 저장
   - 메타데이터 기록

#### 산출물

- FASHN AI 클라이언트 모듈
- 가상 착용 생성 API
- 타입 정의 파일
- API 에러 핸들러

---

### Phase 4: 비동기 작업 처리 (Secondary Goal)

**목표**: Bull Queue 기반 비동기 작업 처리 시스템 구현

#### 작업 목록

1. **작업 큐 프로세서**
   - Bull Worker 구현
   - 작업 상태 관리 (queued, processing, completed, failed)
   - 진행률 업데이트 로직
   - 재시도 로직 (지수 백오프)

2. **작업 상태 API**
   - GET /api/tryon/jobs/:jobId 엔드포인트 구현
   - 실시간 상태 조회
   - 대기열 위치 계산

3. **에러 복구**
   - 실패 작업 재시도 메커니즘
   - Dead Letter Queue 설정
   - 알림 시스템 연동

#### 산출물

- Bull Worker 모듈
- 작업 상태 API
- 재시도 정책 설정
- 에러 복구 유틸리티

---

### Phase 5: 결과 관리 및 캐싱 (Secondary Goal)

**목표**: 생성된 이미지 관리 및 캐싱 시스템 구현

#### 작업 목록

1. **결과 이미지 API**
   - GET /api/tryon/results/:resultId 엔드포인트 구현
   - DELETE /api/tryon/results/:resultId 엔드포인트 구현
   - 썸네일 생성

2. **캐싱 시스템**
   - Redis 기반 캐시 레이어
   - 캐시 키 전략 (상품ID + 모델ID 해시)
   - 캐시 무효화 로직
   - TTL 관리

3. **정리 작업**
   - 만료된 이미지 자동 삭제
   - 스토리지 사용량 모니터링
   - 정리 스케줄러

#### 산출물

- 결과 이미지 API
- 캐시 레이어 모듈
- 정리 스케줄러
- 캐시 통계 유틸리티

---

### Phase 6: 모니터링 및 최적화 (Final Goal)

**목표**: 운영 모니터링 및 성능 최적화

#### 작업 목록

1. **모니터링 대시보드**
   - Bull Board 통합
   - 작업 통계 API
   - 에러율 추적

2. **성능 최적화**
   - 쿼리 최적화
   - 이미지 처리 파이프라인 최적화
   - 메모리 사용량 최적화

3. **로깅 및 알림**
   - 구조화된 로깅
   - 에러 알림 설정
   - 성능 메트릭 수집

#### 산출물

- 모니터링 대시보드
- 성능 최적화 리포트
- 로깅 설정
- 알림 구성

---

## 작업 분해 (Task Decomposition)

### 핵심 모듈

| 모듈 | 파일 경로 | 책임 |
|------|-----------|------|
| TryOn Service | `src/services/tryon/` | 가상 착용 비즈니스 로직 |
| FASHN Client | `src/lib/fashn/` | FASHN AI API 클라이언트 |
| Queue Manager | `src/lib/queue/` | Bull Queue 관리 |
| Storage Service | `src/lib/storage/` | S3/R2 스토리지 관리 |
| Image Processor | `src/lib/image/` | 이미지 전처리 |
| Cache Layer | `src/lib/cache/` | Redis 캐싱 |

### API 라우트 구조

```
src/app/api/tryon/
├── upload/
│   └── route.ts          # POST: 상품 이미지 업로드
├── models/
│   └── route.ts          # GET, POST: 모델 이미지 관리
├── generate/
│   └── route.ts          # POST: 가상 착용 생성 요청
├── jobs/
│   └── [jobId]/
│       └── route.ts      # GET: 작업 상태 조회
└── results/
    └── [resultId]/
        └── route.ts      # GET, DELETE: 결과 이미지 관리
```

### 데이터베이스 스키마

```
prisma/schema.prisma

model TryOnJob {
  id              String    @id @default(uuid())
  productImageId  String
  modelImageId    String
  status          JobStatus @default(QUEUED)
  progress        Int       @default(0)
  resultImageUrl  String?
  errorMessage    String?
  retryCount      Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  completedAt     DateTime?

  productImage    ProductImage @relation(fields: [productImageId], references: [id])
  modelImage      ModelImage   @relation(fields: [modelImageId], references: [id])
  result          TryOnResult?
}

model ProductImage {
  id            String   @id @default(uuid())
  originalUrl   String
  processedUrl  String
  productId     String
  metadata      Json?
  createdAt     DateTime @default(now())

  jobs          TryOnJob[]
}

model ModelImage {
  id        String   @id @default(uuid())
  name      String
  imageUrl  String
  category  String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  jobs      TryOnJob[]
}

model TryOnResult {
  id           String   @id @default(uuid())
  jobId        String   @unique
  imageUrl     String
  thumbnailUrl String
  cacheKey     String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  job          TryOnJob @relation(fields: [jobId], references: [id])
}

enum JobStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## 기술 스택 상세

### 핵심 라이브러리

| 라이브러리 | 용도 | 선정 이유 |
|------------|------|-----------|
| Bull | 작업 큐 | Redis 기반, 안정성, 재시도 지원 |
| ioredis | Redis 클라이언트 | 성능, 클러스터 지원 |
| @aws-sdk/client-s3 | 스토리지 | AWS 공식 SDK, R2 호환 |
| sharp | 이미지 처리 | 고성능, 다양한 형식 지원 |
| axios | HTTP 클라이언트 | 인터셉터, 타임아웃 지원 |
| zod | 스키마 검증 | 타입 안전성, Next.js 호환 |

### 환경 변수

```bash
# FASHN AI
FASHN_API_KEY=your_api_key
FASHN_API_URL=https://api.fashn.ai/v1

# Redis
REDIS_URL=redis://localhost:6379

# Storage (S3/R2)
S3_BUCKET=tryon-images
S3_REGION=us-east-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_ENDPOINT=https://s3.amazonaws.com  # or R2 endpoint

# Queue
QUEUE_CONCURRENCY=5
QUEUE_MAX_RETRIES=3
QUEUE_RETRY_DELAY=5000
```

---

## API 설계 상세

### POST /api/tryon/upload

**요청**
```typescript
// Content-Type: multipart/form-data
{
  file: File,           // 이미지 파일
  productId: string,    // 상품 ID
  metadata?: object     // 추가 메타데이터
}
```

**응답**
```typescript
{
  success: true,
  data: {
    id: string,
    originalUrl: string,
    processedUrl: string,
    productId: string
  }
}
```

### POST /api/tryon/generate

**요청**
```typescript
{
  productImageId: string,  // 상품 이미지 ID
  modelImageId: string,    // 모델 이미지 ID
  options?: {
    background?: string,   // 배경색 (선택)
    resolution?: string    // 해상도 (선택)
  }
}
```

**응답**
```typescript
{
  success: true,
  data: {
    jobId: string,
    status: "queued",
    estimatedWaitTime: number  // 예상 대기 시간 (초)
  }
}
```

### GET /api/tryon/jobs/:jobId

**응답**
```typescript
{
  success: true,
  data: {
    id: string,
    status: "queued" | "processing" | "completed" | "failed",
    progress: number,      // 0-100
    queuePosition?: number, // 대기 중일 때만
    resultImageUrl?: string, // 완료 시만
    errorMessage?: string   // 실패 시만
  }
}
```

---

## 위험 요소 및 대응 계획

### 기술적 위험

| 위험 | 영향 | 대응 방안 |
|------|------|-----------|
| FASHN AI API 장애 | 서비스 중단 | 재시도 로직, 폴백 UI, 알림 |
| Redis 연결 실패 | 큐 처리 중단 | 동기 처리 폴백, 클러스터 구성 |
| 스토리지 용량 초과 | 새 이미지 저장 불가 | 자동 정리, 용량 알림 |
| API Rate Limit | 처리 지연 | 요청 큐잉, 동시성 제한 |

### 비즈니스 위험

| 위험 | 영향 | 대응 방안 |
|------|------|-----------|
| API 비용 초과 | 예산 초과 | 일일 제한, 캐싱 최적화 |
| 이미지 품질 불만 | 사용자 이탈 | A/B 테스트, 피드백 수집 |
| 처리 시간 지연 | 사용자 경험 저하 | 진행률 표시, 알림 기능 |

---

## 일정 계획

### 마일스톤

| 마일스톤 | 우선순위 | 주요 산출물 |
|----------|----------|-------------|
| M1: 인프라 구축 | Primary | DB 스키마, Redis 설정, 환경 구성 |
| M2: 이미지 관리 | Primary | 업로드 API, 모델 관리 API |
| M3: AI 연동 | Primary | FASHN 클라이언트, 생성 API |
| M4: 비동기 처리 | Secondary | Bull Worker, 상태 API |
| M5: 캐싱/정리 | Secondary | 캐시 레이어, 정리 스케줄러 |
| M6: 모니터링 | Final | 대시보드, 알림, 로깅 |

### 의존성 관계

```
M1 (인프라)
    ↓
M2 (이미지 관리) ←→ M3 (AI 연동)
    ↓                   ↓
    └───────┬───────────┘
            ↓
        M4 (비동기 처리)
            ↓
        M5 (캐싱/정리)
            ↓
        M6 (모니터링)
```

---

## 검토 체크리스트

- [ ] 모든 API 엔드포인트 구현 완료
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] 통합 테스트 시나리오 완료
- [ ] 에러 핸들링 및 재시도 로직 검증
- [ ] 성능 테스트 (목표 응답 시간 충족)
- [ ] 보안 검토 (인증, 서명 URL)
- [ ] 문서화 완료 (API 문서, 운영 가이드)

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-23
**Status**: Draft
**Traceability**: spec.md, acceptance.md
