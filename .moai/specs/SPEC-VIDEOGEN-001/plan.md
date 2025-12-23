---
id: SPEC-VIDEOGEN-001
document: plan
version: "1.0.0"
created: "2025-12-23"
updated: "2025-12-23"
tags:
  - implementation-plan
  - video-generation
  - fal-ai
---

# SPEC-VIDEOGEN-001: 구현 계획서

## 추적성

- **SPEC 참조**: [SPEC-VIDEOGEN-001](./spec.md)
- **수락 기준**: [acceptance.md](./acceptance.md)

---

## 구현 단계

### 1단계: 기반 인프라 구축 (Primary Goal)

#### 1.1 Redis 및 Bull Queue 설정

작업 내용:
- Redis 연결 설정 및 환경 변수 구성
- Bull Queue 인스턴스 생성
- 작업 프로세서 기본 구조 정의
- 작업 상태 관리 유틸리티 구현

파일 구조:
```
src/
  lib/
    redis/
      client.ts          # Redis 클라이언트 설정
      config.ts          # Redis 설정 옵션
    queue/
      videoQueue.ts      # 비디오 생성 큐
      processors/
        videoProcessor.ts # 비디오 처리 워커
```

#### 1.2 스토리지 설정

작업 내용:
- AWS S3 또는 CloudFlare R2 클라이언트 설정
- 업로드/다운로드 유틸리티 함수 구현
- 임시 파일 관리 시스템 구축
- CDN URL 생성 로직 구현

---

### 2단계: fal.ai API 연동 (Primary Goal)

#### 2.1 fal.ai 클라이언트 구현

작업 내용:
- fal.ai SDK 설치 및 초기화
- Stable Video Diffusion API 래퍼 함수 작성
- 웹훅 수신 엔드포인트 구현
- 에러 핸들링 및 재시도 로직 구현

API 연동 설계:
```typescript
// lib/fal/client.ts
import * as fal from "@fal-ai/serverless-client";

export interface VideoGenerationInput {
  imageUrl: string;
  duration: number;
  fps: number;
  motionBucketId?: number;
}

export interface VideoGenerationOutput {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
}

export async function generateVideo(
  input: VideoGenerationInput
): Promise<string> {
  // 작업 ID 반환, 웹훅으로 결과 수신
}
```

#### 2.2 웹훅 핸들러 구현

작업 내용:
- `/api/video/webhook` 엔드포인트 생성
- fal.ai 콜백 검증 및 파싱
- 작업 상태 업데이트 로직
- 후처리 파이프라인 트리거

---

### 3단계: 비디오 처리 파이프라인 (Secondary Goal)

#### 3.1 FFmpeg 변환 설정

작업 내용:
- FFmpeg 바이너리 설정 (서버리스 환경 고려)
- 비디오 인코딩 프리셋 정의
- 해상도별 변환 설정
- 썸네일 추출 로직 구현

FFmpeg 설정 예시:
```typescript
// lib/ffmpeg/presets.ts
export const videoPresets = {
  '720p': {
    resolution: '1280x720',
    bitrate: '2M',
    crf: 23,
    preset: 'medium',
  },
  '1080p': {
    resolution: '1920x1080',
    bitrate: '4M',
    crf: 21,
    preset: 'medium',
  },
};

export const encodingCommand = (input: string, output: string, preset: string) => [
  '-i', input,
  '-c:v', 'libx264',
  '-preset', videoPresets[preset].preset,
  '-crf', videoPresets[preset].crf.toString(),
  '-s', videoPresets[preset].resolution,
  '-b:v', videoPresets[preset].bitrate,
  '-movflags', '+faststart',
  output
];
```

#### 3.2 HLS 변환 (선택적)

작업 내용:
- HLS 세그먼트 생성 설정
- m3u8 플레이리스트 생성
- 적응형 비트레이트 스트리밍 설정
- HLS.js 클라이언트 통합

---

### 4단계: API 엔드포인트 구현 (Secondary Goal)

#### 4.1 비디오 생성 API

엔드포인트 구조:
```
app/
  api/
    video/
      generate/
        route.ts         # POST - 비디오 생성 요청
      status/
        [jobId]/
          route.ts       # GET - 작업 상태 조회
      [videoId]/
        route.ts         # GET - 비디오 정보
        stream/
          route.ts       # GET - 스트리밍 URL
      webhook/
        route.ts         # POST - fal.ai 콜백
```

#### 4.2 API 스키마 정의

요청/응답 스키마:
```typescript
// schemas/video.ts
import { z } from 'zod';

export const generateVideoSchema = z.object({
  tryonImageId: z.string().uuid(),
  settings: z.object({
    duration: z.number().min(3).max(5).default(4),
    resolution: z.enum(['720p', '1080p']).default('720p'),
    fps: z.number().min(24).max(30).default(24),
    format: z.enum(['mp4', 'webm']).default('mp4'),
    enableHLS: z.boolean().default(false),
    enableBranding: z.boolean().default(false),
  }).optional(),
});

export const videoStatusSchema = z.object({
  jobId: z.string(),
  status: z.enum(['pending', 'generating', 'encoding', 'uploading', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  result: z.object({
    videoId: z.string(),
    urls: z.object({
      mp4: z.string().url(),
      webm: z.string().url().optional(),
      hls: z.string().url().optional(),
      thumbnail: z.string().url(),
    }),
  }).optional(),
  error: z.string().optional(),
});
```

---

### 5단계: 에러 처리 및 모니터링 (Final Goal)

#### 5.1 에러 핸들링

작업 내용:
- 커스텀 에러 클래스 정의
- 재시도 로직 구현 (지수 백오프)
- 실패 작업 알림 시스템
- 에러 로깅 및 추적

#### 5.2 모니터링

작업 내용:
- 작업 큐 상태 대시보드
- 비용 추적 메트릭
- 성능 모니터링 설정
- 알림 임계치 설정

---

## 비용 분석

### fal.ai API 비용

| 항목 | 단가 | 예상 사용량 (월) | 예상 비용 |
|------|------|------------------|-----------|
| Stable Video Diffusion | $0.075/video | 10,000 | $750 |
| 추가 해상도 옵션 | +$0.025/video | 1,000 (1080p) | $25 |
| **합계** | | | **$775** |

### 인프라 비용

| 항목 | 예상 비용 (월) |
|------|----------------|
| Redis (AWS ElastiCache) | $50-100 |
| S3 스토리지 (100GB) | $2.30 |
| S3 데이터 전송 | $10-50 |
| CloudFront CDN | $20-100 |
| **합계** | **$82-252** |

### 총 예상 비용

- 최소: $857/월 (10,000 비디오 기준)
- 최대: $1,027/월 (고사용량 시나리오)

---

## 스토리지 전략

### 파일 구조

```
videos/
  {videoId}/
    original/
      video.mp4          # 원본 (fal.ai 출력)
    encoded/
      720p.mp4           # 인코딩된 720p
      1080p.mp4          # 인코딩된 1080p (선택)
      720p.webm          # WebM 버전
    hls/                 # HLS 세그먼트 (선택)
      playlist.m3u8
      segment_0.ts
      segment_1.ts
    thumbnails/
      thumb.jpg          # 미리보기 이미지
```

### 보관 정책

| 파일 유형 | 보관 기간 | 스토리지 클래스 |
|-----------|-----------|-----------------|
| 원본 비디오 | 7일 | Standard |
| 인코딩 비디오 | 30일 | Standard |
| HLS 세그먼트 | 30일 | Standard |
| 썸네일 | 90일 | Intelligent-Tiering |

---

## 아키텍처 다이어그램

```
[사용자 요청]
      |
      v
[Next.js API Route] --> [Bull Queue (Redis)]
      |                        |
      v                        v
[fal.ai API] <-------- [Video Processor Worker]
      |                        |
      v                        v
[Webhook 수신] ---------> [FFmpeg 인코딩]
                               |
                               v
                         [S3/R2 업로드]
                               |
                               v
                         [CDN URL 생성]
                               |
                               v
                         [클라이언트 응답]
```

---

## 마일스톤 요약

| 단계 | 목표 | 우선순위 |
|------|------|----------|
| 1단계 | 기반 인프라 (Redis, Queue, Storage) | Primary |
| 2단계 | fal.ai API 연동 | Primary |
| 3단계 | FFmpeg 비디오 처리 | Secondary |
| 4단계 | API 엔드포인트 구현 | Secondary |
| 5단계 | 에러 처리 및 모니터링 | Final |
| 선택 | HLS 스트리밍, 브랜딩 | Optional |

---

## 위험 요소 및 대응

### 기술적 위험

| 위험 | 영향도 | 대응 방안 |
|------|--------|-----------|
| fal.ai API 지연 | 높음 | 타임아웃 설정, 재시도 로직 |
| FFmpeg 서버리스 제한 | 중간 | Lambda Layer 또는 전용 서버 |
| 동시 처리 병목 | 중간 | 큐 분산, 워커 스케일링 |

### 비용 위험

| 위험 | 영향도 | 대응 방안 |
|------|--------|-----------|
| 예상 초과 사용량 | 높음 | 일일 한도 설정, 알림 |
| 스토리지 비용 증가 | 중간 | 보관 정책 자동화 |

---

## 추적성 태그

```
[SPEC-VIDEOGEN-001] -> [plan.md]
[PLAN-PHASE-1] -> 기반 인프라
[PLAN-PHASE-2] -> fal.ai 연동
[PLAN-PHASE-3] -> 비디오 처리
[PLAN-PHASE-4] -> API 구현
[PLAN-PHASE-5] -> 모니터링
```
