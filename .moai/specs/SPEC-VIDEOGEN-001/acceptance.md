---
id: SPEC-VIDEOGEN-001
document: acceptance
version: "1.0.0"
created: "2025-12-23"
updated: "2025-12-23"
tags:
  - acceptance-criteria
  - testing
  - quality-gate
---

# SPEC-VIDEOGEN-001: 수락 기준서

## 추적성

- **SPEC 참조**: [SPEC-VIDEOGEN-001](./spec.md)
- **구현 계획**: [plan.md](./plan.md)

---

## 테스트 시나리오

### 시나리오 1: 기본 비디오 생성 성공

**Given** (전제 조건):
- SPEC-TRYON-001에서 생성된 유효한 착용 이미지 ID가 존재한다
- 착용 이미지가 스토리지에 정상적으로 저장되어 있다
- fal.ai API 크레딧이 충분하다
- Redis 큐 시스템이 정상 작동 중이다

**When** (실행):
- 사용자가 `/api/video/generate` 엔드포인트에 POST 요청을 보낸다
- 요청 본문에 `tryonImageId`와 기본 설정을 포함한다

**Then** (기대 결과):
- 시스템은 202 Accepted 응답과 함께 `jobId`를 반환한다
- 작업이 Bull Queue에 등록된다
- 60초 이내에 비디오 생성이 완료된다
- 생성된 비디오는 3-5초 길이이다
- 비디오 해상도는 최소 720p이다
- MP4 형식의 CDN URL이 제공된다

**검증 코드**:
```typescript
describe('비디오 생성 API', () => {
  it('유효한 착용 이미지로 비디오를 생성해야 한다', async () => {
    // Given
    const tryonImageId = 'valid-tryon-image-id';

    // When
    const response = await fetch('/api/video/generate', {
      method: 'POST',
      body: JSON.stringify({ tryonImageId }),
    });

    // Then
    expect(response.status).toBe(202);
    const { jobId } = await response.json();
    expect(jobId).toBeDefined();

    // 완료 대기 (최대 60초)
    const result = await waitForCompletion(jobId, 60000);
    expect(result.status).toBe('completed');
    expect(result.result.urls.mp4).toMatch(/^https:\/\//);
  });
});
```

---

### 시나리오 2: 비디오 생성 상태 조회

**Given** (전제 조건):
- 비디오 생성 요청이 성공적으로 접수되었다
- 유효한 `jobId`가 존재한다

**When** (실행):
- 사용자가 `/api/video/status/{jobId}` 엔드포인트에 GET 요청을 보낸다

**Then** (기대 결과):
- 시스템은 200 OK 응답을 반환한다
- 응답에 현재 작업 상태가 포함된다 (`pending`, `generating`, `encoding`, `uploading`, `completed`, `failed`)
- 진행률(0-100%)이 포함된다
- 작업 완료 시 결과 URL이 포함된다

**검증 코드**:
```typescript
describe('작업 상태 조회 API', () => {
  it('진행 중인 작업의 상태를 반환해야 한다', async () => {
    // Given
    const jobId = 'existing-job-id';

    // When
    const response = await fetch(`/api/video/status/${jobId}`);

    // Then
    expect(response.status).toBe(200);
    const status = await response.json();
    expect(['pending', 'generating', 'encoding', 'uploading', 'completed', 'failed'])
      .toContain(status.status);
    expect(status.progress).toBeGreaterThanOrEqual(0);
    expect(status.progress).toBeLessThanOrEqual(100);
  });
});
```

---

### 시나리오 3: 타임아웃 및 재시도 처리

**Given** (전제 조건):
- 비디오 생성 요청이 접수되었다
- fal.ai API 응답이 60초를 초과한다

**When** (실행):
- 시스템이 타임아웃을 감지한다

**Then** (기대 결과):
- 시스템은 자동으로 작업을 재시도한다
- 최대 3회까지 재시도를 수행한다
- 각 재시도 사이에 지수 백오프가 적용된다
- 3회 실패 후 작업 상태가 `failed`로 변경된다
- 실패 원인이 로깅된다
- 사용자에게 적절한 오류 메시지가 전달된다

**검증 코드**:
```typescript
describe('타임아웃 처리', () => {
  it('타임아웃 시 최대 3회 재시도해야 한다', async () => {
    // Given
    jest.spyOn(falApi, 'generateVideo').mockImplementation(
      () => new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 61000)
      )
    );

    // When
    const jobId = await createVideoJob('tryon-image-id');
    await waitForJobEnd(jobId, 300000); // 5분 대기

    // Then
    expect(falApi.generateVideo).toHaveBeenCalledTimes(3);
    const status = await getJobStatus(jobId);
    expect(status.status).toBe('failed');
    expect(status.error).toContain('timeout');
  });
});
```

---

### 시나리오 4: 잘못된 이미지 형식 처리

**Given** (전제 조건):
- 지원되지 않는 형식(GIF, BMP 등)의 이미지가 입력된다

**When** (실행):
- 사용자가 비디오 생성을 요청한다

**Then** (기대 결과):
- 시스템은 이미지 형식을 검증한다
- 지원 형식(JPEG, PNG, WebP)으로 변환을 시도한다
- 변환 불가 시 400 Bad Request를 반환한다
- 명확한 오류 메시지를 포함한다

**검증 코드**:
```typescript
describe('이미지 형식 검증', () => {
  it('지원되지 않는 형식에 대해 오류를 반환해야 한다', async () => {
    // Given
    const unsupportedImageId = 'gif-image-id';

    // When
    const response = await fetch('/api/video/generate', {
      method: 'POST',
      body: JSON.stringify({ tryonImageId: unsupportedImageId }),
    });

    // Then
    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.message).toContain('지원되지 않는 이미지 형식');
  });
});
```

---

### 시나리오 5: 고화질 비디오 생성 (선택적)

**Given** (전제 조건):
- 1080p 고화질 옵션이 활성화되어 있다
- 유효한 착용 이미지가 존재한다

**When** (실행):
- 사용자가 `resolution: '1080p'` 설정으로 비디오 생성을 요청한다

**Then** (기대 결과):
- 시스템은 1080p 해상도의 비디오를 생성한다
- 비디오 비트레이트가 4Mbps 이상이다
- 파일 크기가 720p 대비 증가한다
- CDN URL이 정상적으로 제공된다

**검증 코드**:
```typescript
describe('고화질 비디오 생성', () => {
  it('1080p 해상도의 비디오를 생성해야 한다', async () => {
    // Given
    const settings = { resolution: '1080p' };

    // When
    const response = await fetch('/api/video/generate', {
      method: 'POST',
      body: JSON.stringify({
        tryonImageId: 'valid-image-id',
        settings
      }),
    });

    const { jobId } = await response.json();
    const result = await waitForCompletion(jobId);

    // Then
    expect(result.result.metadata.width).toBe(1920);
    expect(result.result.metadata.height).toBe(1080);
  });
});
```

---

### 시나리오 6: HLS 스트리밍 변환 (선택적)

**Given** (전제 조건):
- HLS 스트리밍 옵션이 활성화되어 있다
- 비디오 생성이 완료되었다

**When** (실행):
- 사용자가 `enableHLS: true` 설정으로 비디오 생성을 요청한다

**Then** (기대 결과):
- 시스템은 MP4와 함께 HLS 형식으로 변환한다
- m3u8 플레이리스트 URL이 제공된다
- HLS.js 호환 스트리밍이 가능하다
- 적응형 비트레이트가 적용된다

**검증 코드**:
```typescript
describe('HLS 스트리밍', () => {
  it('HLS 형식의 스트리밍 URL을 제공해야 한다', async () => {
    // Given
    const settings = { enableHLS: true };

    // When
    const response = await fetch('/api/video/generate', {
      method: 'POST',
      body: JSON.stringify({
        tryonImageId: 'valid-image-id',
        settings
      }),
    });

    const { jobId } = await response.json();
    const result = await waitForCompletion(jobId);

    // Then
    expect(result.result.urls.hls).toMatch(/\.m3u8$/);

    // HLS 플레이리스트 검증
    const playlist = await fetch(result.result.urls.hls);
    expect(playlist.status).toBe(200);
    const content = await playlist.text();
    expect(content).toContain('#EXTM3U');
  });
});
```

---

## 비디오 품질 검증

### 화질 기준

| 항목 | 720p 기준 | 1080p 기준 |
|------|-----------|------------|
| 해상도 | 1280x720 | 1920x1080 |
| 비트레이트 | 2Mbps 이상 | 4Mbps 이상 |
| 프레임레이트 | 24fps 이상 | 24fps 이상 |
| 코덱 | H.264 | H.264 |
| 컨테이너 | MP4 | MP4 |

### 품질 검증 테스트

```typescript
describe('비디오 품질 검증', () => {
  it('720p 비디오 품질 기준을 충족해야 한다', async () => {
    const videoPath = await downloadVideo(videoUrl);
    const metadata = await getVideoMetadata(videoPath);

    expect(metadata.width).toBeGreaterThanOrEqual(1280);
    expect(metadata.height).toBeGreaterThanOrEqual(720);
    expect(metadata.bitrate).toBeGreaterThanOrEqual(2000000);
    expect(metadata.fps).toBeGreaterThanOrEqual(24);
    expect(metadata.codec).toBe('h264');
  });
});
```

---

## 성능 기준

### 응답 시간

| 작업 | 기준 | 임계치 |
|------|------|--------|
| API 응답 (생성 요청) | 200ms | 500ms |
| 상태 조회 | 100ms | 300ms |
| 비디오 생성 완료 | 45초 | 60초 |
| CDN 첫 프레임 로딩 | 500ms | 1000ms |

### 파일 크기

| 해상도 | 4초 기준 예상 크기 |
|--------|-------------------|
| 720p | 1-2MB |
| 1080p | 2-4MB |

### 성능 테스트

```typescript
describe('성능 기준', () => {
  it('API 응답 시간이 200ms 이내여야 한다', async () => {
    const start = Date.now();
    await fetch('/api/video/generate', {
      method: 'POST',
      body: JSON.stringify({ tryonImageId: 'valid-id' }),
    });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(200);
  });

  it('비디오 생성이 60초 이내에 완료되어야 한다', async () => {
    const { jobId } = await createVideoJob('valid-id');
    const start = Date.now();

    await waitForCompletion(jobId);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(60000);
  });
});
```

---

## 품질 게이트

### 코드 품질

| 항목 | 기준 |
|------|------|
| 테스트 커버리지 | 80% 이상 |
| TypeScript strict 모드 | 활성화 |
| ESLint 에러 | 0개 |
| 빌드 성공 | 필수 |

### 기능 완성도

| 기능 | 상태 | 필수 여부 |
|------|------|-----------|
| 비디오 생성 API | 미완료 | 필수 |
| 상태 조회 API | 미완료 | 필수 |
| fal.ai 연동 | 미완료 | 필수 |
| FFmpeg 인코딩 | 미완료 | 필수 |
| 스토리지 업로드 | 미완료 | 필수 |
| HLS 변환 | 미완료 | 선택 |
| 브랜딩 기능 | 미완료 | 선택 |

### 통과 조건

모든 필수 기능이 구현되고 다음 조건을 충족해야 한다:

- 모든 필수 테스트 시나리오 통과
- 성능 기준 충족
- 코드 품질 기준 충족
- 문서화 완료

---

## Definition of Done

### 기능 완료 정의

다음 조건이 모두 충족되면 SPEC-VIDEOGEN-001이 완료된 것으로 간주한다:

1. **코드 구현**
   - 모든 API 엔드포인트 구현 완료
   - fal.ai 연동 동작 확인
   - FFmpeg 인코딩 파이프라인 동작 확인
   - 스토리지 업로드 및 CDN URL 생성 확인

2. **테스트**
   - 모든 필수 시나리오 테스트 통과
   - 테스트 커버리지 80% 이상
   - E2E 테스트 통과

3. **문서화**
   - API 문서 작성 완료
   - 환경 변수 문서화
   - 배포 가이드 작성

4. **배포 준비**
   - 스테이징 환경 테스트 완료
   - 성능 테스트 통과
   - 보안 검토 완료

---

## 추적성 태그

```
[SPEC-VIDEOGEN-001] -> [acceptance.md]
[ACC-SCENARIO-1] -> 기본 비디오 생성
[ACC-SCENARIO-2] -> 상태 조회
[ACC-SCENARIO-3] -> 타임아웃 처리
[ACC-SCENARIO-4] -> 형식 검증
[ACC-SCENARIO-5] -> 고화질 옵션
[ACC-SCENARIO-6] -> HLS 스트리밍
[QUALITY-GATE] -> 품질 기준
```
