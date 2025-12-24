---
id: SPEC-TRYON-001
version: "1.1.0"
status: "completed"
created: "2025-12-23"
updated: "2025-12-24"
author: "MoAI-ADK"
priority: "HIGH"
tags: ["AI", "Virtual Try-On", "FASHN AI", "Image Generation"]
traceability:
  plan: "./plan.md"
  acceptance: "./acceptance.md"
---

# SPEC-TRYON-001: AI 가상 착용 이미지 생성 시스템

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2025-12-23 | MoAI-ADK | 초기 SPEC 작성 |
| 1.1.0 | 2025-12-24 | MoAI-ADK | TDD 구현 완료, 상태를 completed로 변경 |

---

## 개요 (Overview)

### 목적

상품 이미지와 모델 이미지를 입력받아 AI를 통해 모델이 해당 상품을 착용한 이미지를 자동으로 생성하는 시스템을 구축한다. 이를 통해 이커머스 플랫폼에서 고객에게 실제 착용 시 예상 모습을 제공하여 구매 결정을 돕고, 반품률을 감소시킨다.

### 배경

- 온라인 쇼핑에서 의류, 액세서리 등의 제품을 구매할 때 실제 착용 시 모습을 확인하기 어려움
- 실제 모델 촬영에는 높은 비용과 시간이 소요됨
- AI 기반 가상 착용 기술을 통해 비용 효율적이고 빠른 착용 이미지 생성 가능
- FASHN AI의 Virtual Try-On API를 활용하여 고품질 가상 착용 이미지 생성

### 범위

- 상품 이미지 업로드 및 전처리
- 모델 이미지 라이브러리 관리
- FASHN AI API 연동 (Virtual Try-On)
- 생성된 이미지 저장 및 캐싱
- 비동기 작업 큐 처리

### 이해관계자

| 역할 | 책임 |
|------|------|
| 이커머스 운영자 | 상품 이미지 업로드, 가상 착용 이미지 관리 |
| 콘텐츠 관리자 | 모델 이미지 라이브러리 관리 |
| 개발팀 | 시스템 구현 및 유지보수 |
| 최종 사용자 | 가상 착용 이미지 조회 |

---

## EARS 요구사항 (EARS Requirements)

### Ubiquitous Requirements (보편적 요구사항)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| UR-001 | 시스템은 모든 의류 상품 이미지에 대해 가상 착용 이미지 생성을 지원해야 한다. | HIGH |
| UR-002 | 시스템은 생성된 모든 가상 착용 이미지를 클라우드 스토리지에 영구 저장해야 한다. | HIGH |
| UR-003 | 시스템은 모든 API 요청에 대해 인증 토큰을 검증해야 한다. | HIGH |
| UR-004 | 시스템은 모든 이미지 처리 작업에 대해 감사 로그를 기록해야 한다. | MEDIUM |
| UR-005 | 시스템은 지원되는 모든 이미지 형식(JPEG, PNG, WebP)을 처리할 수 있어야 한다. | HIGH |

### Event-driven Requirements (이벤트 기반 요구사항)

| ID | 트리거 | 응답 | 우선순위 |
|----|--------|------|----------|
| ER-001 | 사용자가 상품 이미지를 업로드하면 | 시스템은 자동으로 AI 가상 착용 처리 큐에 작업을 추가해야 한다. | HIGH |
| ER-002 | AI 가상 착용 이미지 생성이 완료되면 | 시스템은 결과 이미지를 S3/R2 스토리지에 저장하고 데이터베이스에 메타데이터를 기록해야 한다. | HIGH |
| ER-003 | 작업 큐에 새로운 작업이 추가되면 | 시스템은 워커 프로세스를 통해 해당 작업을 처리해야 한다. | HIGH |
| ER-004 | 사용자가 모델 이미지를 선택하면 | 시스템은 해당 모델 이미지와 상품 이미지를 조합하여 가상 착용 요청을 생성해야 한다. | HIGH |
| ER-005 | 동일한 상품-모델 조합에 대한 요청이 들어오면 | 시스템은 캐시된 이미지를 반환해야 한다. | MEDIUM |

### Unwanted Behavior Requirements (예외 처리 요구사항)

| ID | 조건 | 대응 | 우선순위 |
|----|------|------|----------|
| UB-001 | 만약 FASHN AI API 호출이 실패하면 | 시스템은 최대 3회까지 지수 백오프로 재시도하고, 실패 시 관리자에게 알림을 전송해야 한다. | HIGH |
| UB-002 | 만약 업로드된 이미지가 지원하지 않는 형식이면 | 시스템은 사용자에게 명확한 오류 메시지와 지원 형식 목록을 반환해야 한다. | HIGH |
| UB-003 | 만약 이미지 파일 크기가 10MB를 초과하면 | 시스템은 업로드를 거부하고 파일 크기 제한에 대한 안내를 제공해야 한다. | HIGH |
| UB-004 | 만약 Redis 연결이 실패하면 | 시스템은 동기 처리 모드로 폴백하고, 운영팀에 경고를 전송해야 한다. | HIGH |
| UB-005 | 만약 스토리지 업로드가 실패하면 | 시스템은 재시도 후 실패 시 로컬 임시 저장소에 백업하고 복구 작업을 예약해야 한다. | MEDIUM |
| UB-006 | 만약 작업 처리 시간이 5분을 초과하면 | 시스템은 작업을 타임아웃 처리하고 사용자에게 알림을 전송해야 한다. | MEDIUM |

### State-driven Requirements (상태 기반 요구사항)

| ID | 상태 | 동작 | 우선순위 |
|----|------|------|----------|
| SR-001 | 작업이 "대기 중(queued)" 상태인 동안 | 시스템은 대기열 위치를 사용자에게 표시해야 한다. | MEDIUM |
| SR-002 | 작업이 "처리 중(processing)" 상태인 동안 | 시스템은 진행률(0-100%)을 실시간으로 업데이트해야 한다. | HIGH |
| SR-003 | 작업이 "완료(completed)" 상태가 되면 | 시스템은 결과 이미지 URL을 사용자에게 제공해야 한다. | HIGH |
| SR-004 | 작업이 "실패(failed)" 상태가 되면 | 시스템은 오류 원인과 재시도 옵션을 사용자에게 제공해야 한다. | HIGH |
| SR-005 | 시스템이 "유지보수(maintenance)" 모드인 동안 | 시스템은 새로운 작업 요청을 거부하고 예상 복구 시간을 표시해야 한다. | LOW |

### Optional Requirements (선택적 요구사항)

| ID | 조건 | 기능 | 우선순위 |
|----|------|------|----------|
| OR-001 | 관리자 설정에 따라 | 시스템은 생성된 이미지에 워터마크를 추가할 수 있어야 한다. | LOW |
| OR-002 | 사용자 요청에 따라 | 시스템은 다양한 배경색 옵션을 제공할 수 있어야 한다. | LOW |
| OR-003 | 프리미엄 사용자의 경우 | 시스템은 고해상도(4K) 이미지 생성을 지원할 수 있어야 한다. | LOW |
| OR-004 | 배치 처리 요청 시 | 시스템은 여러 상품에 대한 일괄 가상 착용 이미지 생성을 지원할 수 있어야 한다. | MEDIUM |
| OR-005 | A/B 테스트 모드에서 | 시스템은 다양한 AI 모델 버전을 비교 테스트할 수 있어야 한다. | LOW |

---

## 기술 사양 (Technical Specifications)

### 시스템 아키텍처

```
[Client Browser]
       |
       v
[Next.js 15 Frontend]
       |
       v
[Next.js API Routes] <---> [Bull Queue + Redis]
       |                           |
       v                           v
[FASHN AI API]              [Worker Process]
       |                           |
       v                           v
[Image Result] ------> [AWS S3 / CloudFlare R2]
                              |
                              v
                       [PostgreSQL]
                       (Metadata Storage)
```

### 기술 스택

| 계층 | 기술 | 버전 | 용도 |
|------|------|------|------|
| Frontend | Next.js | 15.x | 풀스택 프레임워크 |
| Backend | Next.js API Routes | - | REST API 엔드포인트 |
| AI Service | FASHN AI API | Latest | 가상 착용 이미지 생성 |
| Queue | Bull | 4.x | 작업 큐 관리 |
| Cache/Queue Backend | Redis | 7.x | 큐 백엔드 및 캐싱 |
| Storage | AWS S3 / CloudFlare R2 | - | 이미지 파일 저장 |
| Database | PostgreSQL | 16.x | 메타데이터 저장 |
| ORM | Prisma | 5.x | 데이터베이스 접근 |

### API 엔드포인트 설계

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| POST | /api/tryon/upload | 상품 이미지 업로드 |
| GET | /api/tryon/models | 모델 이미지 목록 조회 |
| POST | /api/tryon/models | 모델 이미지 등록 |
| POST | /api/tryon/generate | 가상 착용 이미지 생성 요청 |
| GET | /api/tryon/jobs/:jobId | 작업 상태 조회 |
| GET | /api/tryon/results/:resultId | 생성된 이미지 조회 |
| DELETE | /api/tryon/results/:resultId | 생성된 이미지 삭제 |

### 데이터 모델

#### TryOnJob (작업)

```
- id: UUID (PK)
- productImageId: UUID (FK)
- modelImageId: UUID (FK)
- status: ENUM (queued, processing, completed, failed)
- progress: INTEGER (0-100)
- resultImageUrl: STRING (nullable)
- errorMessage: STRING (nullable)
- retryCount: INTEGER
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
- completedAt: TIMESTAMP (nullable)
```

#### ProductImage (상품 이미지)

```
- id: UUID (PK)
- originalUrl: STRING
- processedUrl: STRING
- productId: STRING (외부 상품 ID)
- metadata: JSON
- createdAt: TIMESTAMP
```

#### ModelImage (모델 이미지)

```
- id: UUID (PK)
- name: STRING
- imageUrl: STRING
- category: STRING (full-body, upper-body, etc.)
- isActive: BOOLEAN
- createdAt: TIMESTAMP
```

#### TryOnResult (결과 이미지)

```
- id: UUID (PK)
- jobId: UUID (FK)
- imageUrl: STRING
- thumbnailUrl: STRING
- cacheKey: STRING (unique)
- expiresAt: TIMESTAMP
- createdAt: TIMESTAMP
```

---

## 의존성 (Dependencies)

### 외부 서비스

| 서비스 | 용도 | 중요도 |
|--------|------|--------|
| FASHN AI API | 가상 착용 이미지 생성 | Critical |
| AWS S3 / CloudFlare R2 | 이미지 스토리지 | Critical |
| Redis Cloud | 작업 큐 백엔드 | Critical |

### NPM 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| bull | ^4.12.0 | 작업 큐 관리 |
| ioredis | ^5.3.0 | Redis 클라이언트 |
| @aws-sdk/client-s3 | ^3.x | S3 연동 |
| sharp | ^0.33.x | 이미지 전처리 |
| axios | ^1.6.x | HTTP 클라이언트 |
| uuid | ^9.0.x | UUID 생성 |

### 내부 의존성

| SPEC ID | 제목 | 관계 |
|---------|------|------|
| SPEC-PRODUCT-001 | 상품 관리 시스템 | 상품 이미지 참조 |
| SPEC-VIDEO-DATA-001 | 비디오 데이터 관리 | 스토리지 인프라 공유 |

---

## 제약사항 (Constraints)

### 기술적 제약사항

| ID | 제약사항 | 근거 |
|----|----------|------|
| TC-001 | FASHN AI API 호출당 최대 처리 시간 60초 | API 제한사항 |
| TC-002 | 입력 이미지 최대 크기 10MB | 성능 및 비용 최적화 |
| TC-003 | 지원 이미지 형식: JPEG, PNG, WebP | FASHN AI API 지원 형식 |
| TC-004 | 최소 이미지 해상도 512x512 | AI 모델 요구사항 |
| TC-005 | 동시 처리 작업 수 최대 10개 | API Rate Limit 준수 |

### 비즈니스 제약사항

| ID | 제약사항 | 근거 |
|----|----------|------|
| BC-001 | 생성된 이미지 보관 기간 90일 | 스토리지 비용 최적화 |
| BC-002 | 일일 API 호출 제한 1000회 | FASHN AI 요금제 제한 |
| BC-003 | 캐시 유효 기간 7일 | 최신성과 비용의 균형 |

### 보안 제약사항

| ID | 제약사항 | 근거 |
|----|----------|------|
| SC-001 | 모든 API 요청에 JWT 인증 필수 | 접근 제어 |
| SC-002 | 이미지 URL은 서명된 URL 사용 | 무단 접근 방지 |
| SC-003 | API 키는 환경 변수로만 관리 | 보안 표준 준수 |

---

## 비기능적 요구사항 (Non-Functional Requirements)

### 성능

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 이미지 업로드 응답 시간 | < 2초 | API 응답 시간 |
| 가상 착용 생성 시간 | < 60초 | 작업 완료 시간 |
| 캐시 히트율 | > 30% | Redis 통계 |
| API 가용성 | 99.5% | 업타임 모니터링 |

### 확장성

- 수평 확장 가능한 워커 아키텍처
- 작업 큐 기반 비동기 처리로 부하 분산
- 스토리지 용량 자동 확장

### 모니터링

- 작업 상태별 메트릭 수집
- API 호출 성공/실패율 추적
- 큐 길이 및 처리 시간 모니터링
- 스토리지 사용량 알림

---

## 참고 자료

- [FASHN AI Documentation](https://docs.fashn.ai/)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [AWS S3 SDK Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Shopping Video Preview - Tech Document](../../project/tech.md)

---

**Document Version**: 1.1.0
**Last Updated**: 2025-12-24
**Status**: Completed
**Traceability**: plan.md, acceptance.md
