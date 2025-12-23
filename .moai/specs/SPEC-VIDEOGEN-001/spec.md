---
id: SPEC-VIDEOGEN-001
version: "1.0.0"
status: "draft"
created: "2025-12-23"
updated: "2025-12-23"
author: "MoAI-ADK"
priority: "HIGH"
tags:
  - AI
  - video-generation
  - fal-ai
  - stable-video-diffusion
dependencies:
  - SPEC-TRYON-001
---

# SPEC-VIDEOGEN-001: AI Image-to-Video 변환 시스템

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2025-12-23 | MoAI-ADK | 초기 버전 작성 |

---

## 개요 (Overview)

### 목적

SPEC-TRYON-001에서 생성된 가상 착용 이미지를 입력받아 AI 기반 비디오 생성 기술을 활용하여 3-5초 길이의 동적 미리보기 영상을 생성하는 시스템을 구축한다.

### 배경

- 정적 이미지보다 동영상 콘텐츠가 사용자 engagement를 40% 이상 증가시킴
- 가상 착용 이미지의 동적 표현을 통해 상품 이해도 향상
- fal.ai Stable Video Diffusion API를 활용한 비용 효율적인 비디오 생성 ($0.075/video)

### 범위

- 착용 이미지 입력 및 전처리
- fal.ai API 연동을 통한 비디오 생성
- 비디오 후처리 및 인코딩 (FFmpeg)
- 스토리지 업로드 및 CDN 배포
- 비동기 작업 큐 관리

### 의존성

- **SPEC-TRYON-001**: 가상 착용 이미지 생성 시스템
  - 본 SPEC은 SPEC-TRYON-001에서 생성된 착용 이미지를 입력으로 사용
  - SPEC-TRYON-001의 완료가 선행 조건

---

## EARS 요구사항

### 1. Ubiquitous Requirements (보편적 요구사항)

**[REQ-U-001]** 시스템은 모든 착용 이미지에 대해 3-5초 길이의 비디오를 생성할 수 있어야 한다.

**[REQ-U-002]** 생성된 모든 비디오는 최소 720p 해상도를 지원해야 한다.

**[REQ-U-003]** 시스템은 MP4(H.264) 및 WebM 형식의 비디오 출력을 지원해야 한다.

**[REQ-U-004]** 모든 비디오 생성 요청은 고유한 작업 ID를 부여받아야 한다.

**[REQ-U-005]** 시스템은 비디오 생성 진행 상태를 실시간으로 조회할 수 있어야 한다.

### 2. Event-Driven Requirements (이벤트 기반 요구사항)

**[REQ-E-001]** 착용 이미지 생성이 완료되면, 시스템은 자동으로 비디오 생성 작업을 큐에 등록해야 한다.

**[REQ-E-002]** fal.ai API에서 비디오 생성 완료 콜백을 수신하면, 시스템은 즉시 후처리 파이프라인을 시작해야 한다.

**[REQ-E-003]** 비디오 인코딩이 완료되면, 시스템은 자동으로 스토리지에 업로드하고 CDN URL을 생성해야 한다.

**[REQ-E-004]** 사용자가 비디오 재생을 요청하면, 시스템은 적절한 품질의 스트리밍 URL을 반환해야 한다.

### 3. Unwanted Behavior Requirements (예외 처리 요구사항)

**[REQ-UW-001]** 만약 비디오 생성이 60초 이내에 완료되지 않으면, 시스템은 작업을 타임아웃 처리하고 최대 3회까지 재시도해야 한다.

**[REQ-UW-002]** 만약 fal.ai API가 오류를 반환하면, 시스템은 오류 내용을 로깅하고 사용자에게 적절한 오류 메시지를 표시해야 한다.

**[REQ-UW-003]** 만약 입력 이미지가 지원되지 않는 형식이면, 시스템은 자동으로 지원 형식으로 변환하거나 명확한 오류를 반환해야 한다.

**[REQ-UW-004]** 만약 스토리지 업로드가 실패하면, 시스템은 로컬에 임시 저장하고 백그라운드에서 재시도해야 한다.

**[REQ-UW-005]** 만약 큐 처리 용량이 임계치(100개)를 초과하면, 시스템은 새 요청을 거부하고 대기 상태를 알려야 한다.

### 4. State-Driven Requirements (상태 기반 요구사항)

**[REQ-S-001]** 비디오가 "생성 중" 상태인 동안, 시스템은 fal.ai API 호출 상태를 5초마다 폴링해야 한다.

**[REQ-S-002]** 비디오가 "인코딩 중" 상태인 동안, 시스템은 원본 파일을 임시 스토리지에 유지해야 한다.

**[REQ-S-003]** 비디오가 "완료" 상태인 경우에만, 시스템은 CDN URL을 클라이언트에 반환해야 한다.

**[REQ-S-004]** 비디오가 "실패" 상태인 경우, 시스템은 관련 임시 파일을 24시간 후 자동 삭제해야 한다.

### 5. Optional Features (선택적 기능)

**[REQ-O-001]** 관리자 설정에 따라, 시스템은 비디오에 브랜드 인트로/아웃트로를 추가할 수 있어야 한다.

**[REQ-O-002]** 사용자 선호에 따라, 시스템은 1080p 고화질 비디오 생성 옵션을 제공할 수 있어야 한다.

**[REQ-O-003]** CDN 설정에 따라, 시스템은 HLS 포맷으로 적응형 스트리밍을 지원할 수 있어야 한다.

**[REQ-O-004]** 분석 설정이 활성화된 경우, 시스템은 비디오 재생 통계를 수집할 수 있어야 한다.

---

## 기술 사양 (Technical Specifications)

### API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/video/generate` | POST | 비디오 생성 요청 |
| `/api/video/status/:jobId` | GET | 작업 상태 조회 |
| `/api/video/:videoId` | GET | 비디오 정보 조회 |
| `/api/video/:videoId/stream` | GET | 스트리밍 URL 반환 |
| `/api/video/webhook` | POST | fal.ai 콜백 수신 |

### 비디오 사양

| 항목 | 기본값 | 범위 |
|------|--------|------|
| 길이 | 4초 | 3-5초 |
| 해상도 | 720p | 720p / 1080p |
| FPS | 24 | 24-30 |
| 비트레이트 | 2Mbps | 1-5Mbps |
| 포맷 | MP4 (H.264) | MP4, WebM |
| 스트리밍 | HLS (선택) | m3u8 |

### 데이터 모델

```typescript
interface VideoGenerationJob {
  id: string;
  tryonImageId: string;
  status: 'pending' | 'generating' | 'encoding' | 'uploading' | 'completed' | 'failed';
  progress: number;
  settings: VideoSettings;
  result?: VideoResult;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface VideoSettings {
  duration: number;        // 3-5초
  resolution: '720p' | '1080p';
  fps: number;             // 24-30
  format: 'mp4' | 'webm';
  enableHLS: boolean;
  enableBranding: boolean;
}

interface VideoResult {
  videoId: string;
  urls: {
    mp4: string;
    webm?: string;
    hls?: string;
    thumbnail: string;
  };
  metadata: {
    duration: number;
    size: number;
    width: number;
    height: number;
  };
}
```

### 기술 스택

| 구성요소 | 기술 | 버전 |
|----------|------|------|
| 프레임워크 | Next.js | 15.x |
| API 라우트 | Next.js API Routes | - |
| 비디오 생성 | fal.ai Stable Video Diffusion | Latest |
| 비디오 처리 | FFmpeg | 6.x |
| 작업 큐 | Bull Queue | 5.x |
| 캐시/큐 | Redis | 7.x |
| 스토리지 | AWS S3 / CloudFlare R2 | - |
| 스트리밍 | HLS.js | 1.x |

### fal.ai API 연동

```typescript
// fal.ai Stable Video Diffusion 호출 예시
const response = await fal.subscribe("fal-ai/stable-video-diffusion", {
  input: {
    image_url: tryonImageUrl,
    motion_bucket_id: 127,
    fps: 24,
    num_frames: 25, // ~4초 at 24fps
  },
  webhookUrl: `${process.env.BASE_URL}/api/video/webhook`,
});
```

---

## 의존성 (Dependencies)

### 내부 의존성

| SPEC ID | 관계 | 설명 |
|---------|------|------|
| SPEC-TRYON-001 | 선행 조건 | 착용 이미지 생성 시스템 |

### 외부 의존성

| 서비스 | 용도 | 비용 |
|--------|------|------|
| fal.ai | Stable Video Diffusion API | $0.075/video |
| AWS S3 / R2 | 비디오 스토리지 | 사용량 기반 |
| Redis | 작업 큐 관리 | 인스턴스 기반 |

---

## 제약사항 (Constraints)

### 기술적 제약

- 입력 이미지 최대 크기: 4MB
- 입력 이미지 형식: JPEG, PNG, WebP
- 동시 처리 작업 수: 최대 10개
- API 요청 제한: 분당 60회
- 비디오 생성 타임아웃: 60초

### 비용 제약

- 비디오당 생성 비용: $0.075
- 월간 예상 비용 상한: $750 (10,000 비디오 기준)
- 스토리지 비용 최적화를 위한 30일 보관 정책

### 성능 요구사항

- 비디오 생성 완료 시간: 60초 이내
- API 응답 시간: 200ms 이내
- CDN 배포 후 첫 프레임 로딩: 500ms 이내
- 스트리밍 버퍼링 최소화: 2초 이내 재생 시작

---

## 추적성 태그

```
[SPEC-VIDEOGEN-001] -> [SPEC-TRYON-001]
[REQ-U-001] -> 비디오 생성 기본 기능
[REQ-E-001] -> 자동 큐 등록
[REQ-UW-001] -> 타임아웃 처리
[REQ-S-001] -> 상태 폴링
[REQ-O-001] -> 브랜딩 기능
```
