---
id: SPEC-ADMIN-VIDEO-001
document_type: implementation-plan
version: "1.0.0"
created: "2025-12-23"
updated: "2025-12-23"
---

# SPEC-ADMIN-VIDEO-001: 구현 계획서

## TAG: SPEC-ADMIN-VIDEO-001

---

## 페이지별 구현 계획

### Phase 1: 기반 구조 및 레이아웃 (Priority: High)

#### 1.1 관리자 레이아웃 구조

**구현 파일:**
- `app/(admin)/admin/layout.tsx` - 관리자 기본 레이아웃
- `app/(admin)/admin/video/layout.tsx` - 비디오 관리 레이아웃
- `components/admin/sidebar.tsx` - 사이드바 네비게이션
- `components/admin/header.tsx` - 상단 헤더

**구현 내용:**
- Next.js 15 App Router 기반 중첩 레이아웃
- shadcn/ui 컴포넌트를 활용한 일관된 UI
- 반응형 사이드바 (모바일: 드로어, 데스크톱: 고정)
- 권한 기반 메뉴 표시/숨김

#### 1.2 인증 및 권한 미들웨어

**구현 파일:**
- `middleware.ts` - Next.js 미들웨어 (인증 체크)
- `lib/auth/admin-guard.tsx` - 관리자 권한 가드 컴포넌트
- `lib/auth/permissions.ts` - 권한 상수 및 유틸리티

**구현 내용:**
- 관리자 세션 검증
- 역할 기반 라우트 보호
- 권한 없는 접근 시 리다이렉트

---

### Phase 2: 메인 대시보드 (Priority: High)

#### 2.1 대시보드 메인 페이지

**구현 파일:**
- `app/(admin)/admin/video/dashboard/page.tsx` - 대시보드 페이지
- `components/admin/dashboard/stat-cards.tsx` - 통계 카드
- `components/admin/dashboard/job-trend-chart.tsx` - 작업 추이 차트
- `components/admin/dashboard/recent-jobs.tsx` - 최근 작업 목록
- `components/admin/dashboard/storage-gauge.tsx` - 스토리지 게이지

**구현 내용:**
- 서버 컴포넌트로 초기 데이터 로딩
- React Query를 활용한 실시간 데이터 갱신
- Recharts 기반 차트 시각화
- 반응형 그리드 레이아웃

---

### Phase 3: 작업 큐 관리 (Priority: High)

#### 3.1 작업 목록 페이지

**구현 파일:**
- `app/(admin)/admin/video/jobs/page.tsx` - 작업 목록 페이지
- `components/admin/jobs/job-table.tsx` - 작업 테이블 (TanStack Table)
- `components/admin/jobs/job-filters.tsx` - 필터 UI
- `components/admin/jobs/batch-actions.tsx` - 일괄 작업 도구
- `components/admin/jobs/job-detail-panel.tsx` - 작업 상세 패널

**구현 내용:**
- TanStack Table v8 기반 고성능 데이터 테이블
- 가상화(Virtualization)를 통한 대량 데이터 처리
- 다중 필터 및 정렬 기능
- 선택된 항목 일괄 처리

#### 3.2 작업 상세 및 액션

**구현 파일:**
- `app/(admin)/admin/video/jobs/[id]/page.tsx` - 작업 상세 페이지
- `components/admin/jobs/job-timeline.tsx` - 작업 진행 타임라인
- `components/admin/jobs/job-actions.tsx` - 작업 액션 버튼
- `hooks/use-job-mutation.ts` - 작업 상태 변경 훅

**구현 내용:**
- 작업 상세 정보 표시
- 재시도/취소 기능
- 작업 로그 및 오류 정보

---

### Phase 4: 비디오 관리 (Priority: Medium)

#### 4.1 비디오 목록 및 관리

**구현 파일:**
- `app/(admin)/admin/video/videos/page.tsx` - 비디오 목록 페이지
- `components/admin/videos/video-grid.tsx` - 비디오 그리드
- `components/admin/videos/video-card.tsx` - 비디오 카드
- `components/admin/videos/video-player-modal.tsx` - 비디오 재생 모달
- `components/admin/videos/upload-dialog.tsx` - 업로드 다이얼로그

**구현 내용:**
- 상품별 비디오 그리드 표시
- 인라인 비디오 미리보기
- 드래그 앤 드롭 업로드

#### 4.2 비디오 업로드 및 교체

**구현 파일:**
- `app/(admin)/admin/video/videos/upload/page.tsx` - 수동 업로드 페이지
- `components/admin/videos/upload-dropzone.tsx` - 업로드 드롭존
- `hooks/use-video-upload.ts` - 비디오 업로드 훅
- `lib/upload/video-validator.ts` - 비디오 유효성 검증

**구현 내용:**
- 청크 업로드 지원 (대용량 파일)
- 업로드 진행률 표시
- 파일 형식/크기 검증

---

### Phase 5: 모델 이미지 라이브러리 (Priority: Medium)

#### 5.1 모델 이미지 관리

**구현 파일:**
- `app/(admin)/admin/video/models/page.tsx` - 모델 목록 페이지
- `components/admin/models/model-grid.tsx` - 모델 그리드
- `components/admin/models/model-card.tsx` - 모델 카드
- `components/admin/models/category-tabs.tsx` - 카테고리 탭
- `components/admin/models/model-upload-dialog.tsx` - 모델 업로드

**구현 내용:**
- 카테고리별 필터링 (남성/여성/중성)
- 이미지 업로드 및 검증
- 기본 모델 설정/해제
- 이미지 상세 정보 편집

---

### Phase 6: 통계 및 분석 (Priority: Low)

#### 6.1 사용량 및 비용 통계

**구현 파일:**
- `app/(admin)/admin/video/analytics/page.tsx` - 분석 대시보드
- `components/admin/analytics/usage-chart.tsx` - 사용량 차트
- `components/admin/analytics/cost-chart.tsx` - 비용 차트
- `components/admin/analytics/storage-chart.tsx` - 스토리지 차트
- `components/admin/analytics/date-range-picker.tsx` - 기간 선택
- `components/admin/analytics/report-download.tsx` - 리포트 다운로드

**구현 내용:**
- 다양한 차트 시각화 (Line, Bar, Pie)
- 기간별 필터링
- CSV/PDF 리포트 다운로드

---

### Phase 7: 설정 관리 (Priority: Low)

#### 7.1 시스템 설정

**구현 파일:**
- `app/(admin)/admin/video/settings/page.tsx` - 설정 메인 페이지
- `components/admin/settings/api-settings.tsx` - API 설정
- `components/admin/settings/quality-settings.tsx` - 품질 설정
- `components/admin/settings/notification-settings.tsx` - 알림 설정
- `hooks/use-settings.ts` - 설정 관리 훅

**구현 내용:**
- API 키 관리 (마스킹 표시)
- 비디오 품질 기본값 설정
- 알림 채널 설정 (이메일/슬랙)

---

## API 엔드포인트 설계

### 작업 관리 API

| 엔드포인트 | 메서드 | 설명 | 요청 바디 | 응답 |
|-----------|--------|------|-----------|------|
| `/api/admin/jobs` | GET | 작업 목록 조회 | Query: status, page, limit | `{ jobs: Job[], total: number }` |
| `/api/admin/jobs/:id` | GET | 작업 상세 조회 | - | `Job` |
| `/api/admin/jobs/:id` | PATCH | 작업 수정 | `{ priority?: number }` | `Job` |
| `/api/admin/jobs/:id` | DELETE | 작업 취소 | - | `{ success: boolean }` |
| `/api/admin/jobs/:id/retry` | POST | 작업 재시도 | - | `Job` |
| `/api/admin/jobs/batch` | POST | 일괄 작업 | `{ ids: string[], action: string }` | `{ results: Result[] }` |

### 비디오 관리 API

| 엔드포인트 | 메서드 | 설명 | 요청 바디 | 응답 |
|-----------|--------|------|-----------|------|
| `/api/admin/videos` | GET | 비디오 목록 | Query: productId, page, limit | `{ videos: Video[], total: number }` |
| `/api/admin/videos` | POST | 비디오 업로드 | FormData | `Video` |
| `/api/admin/videos/:id` | GET | 비디오 상세 | - | `Video` |
| `/api/admin/videos/:id` | PATCH | 비디오 수정 | `{ productId?: string }` | `Video` |
| `/api/admin/videos/:id` | DELETE | 비디오 삭제 | - | `{ success: boolean }` |
| `/api/admin/videos/:id/replace` | POST | 비디오 교체 | FormData | `Video` |

### 모델 이미지 API

| 엔드포인트 | 메서드 | 설명 | 요청 바디 | 응답 |
|-----------|--------|------|-----------|------|
| `/api/admin/models` | GET | 모델 목록 | Query: category, page, limit | `{ models: Model[], total: number }` |
| `/api/admin/models` | POST | 모델 업로드 | FormData | `Model` |
| `/api/admin/models/:id` | GET | 모델 상세 | - | `Model` |
| `/api/admin/models/:id` | PATCH | 모델 수정 | `{ name?, category?, isDefault? }` | `Model` |
| `/api/admin/models/:id` | DELETE | 모델 삭제 | - | `{ success: boolean }` |
| `/api/admin/models/:id/set-default` | POST | 기본 모델 설정 | - | `Model` |

### 분석 및 설정 API

| 엔드포인트 | 메서드 | 설명 | 요청 바디 | 응답 |
|-----------|--------|------|-----------|------|
| `/api/admin/analytics/usage` | GET | 사용량 통계 | Query: startDate, endDate, interval | `UsageStats` |
| `/api/admin/analytics/costs` | GET | 비용 통계 | Query: startDate, endDate | `CostStats` |
| `/api/admin/analytics/report` | GET | 리포트 생성 | Query: type, format | File (CSV/PDF) |
| `/api/admin/settings` | GET | 설정 조회 | - | `Settings` |
| `/api/admin/settings` | PATCH | 설정 수정 | `Partial<Settings>` | `Settings` |

---

## 상태 관리 전략

### 서버 상태 관리 (React Query)

**쿼리 키 구조:**
```typescript
// 작업 관련
['admin', 'jobs', { status, page, limit }]
['admin', 'jobs', jobId]

// 비디오 관련
['admin', 'videos', { productId, page, limit }]
['admin', 'videos', videoId]

// 모델 관련
['admin', 'models', { category, page, limit }]
['admin', 'models', modelId]

// 분석 관련
['admin', 'analytics', 'usage', { startDate, endDate }]
['admin', 'analytics', 'costs', { startDate, endDate }]

// 설정
['admin', 'settings']
```

**캐싱 전략:**
- 작업 목록: staleTime 5초 (실시간 성격)
- 비디오/모델 목록: staleTime 30초
- 분석 데이터: staleTime 5분
- 설정: staleTime 무한 (수동 무효화)

### 클라이언트 상태 관리 (Zustand)

**전역 상태:**
```typescript
interface AdminVideoStore {
  // 필터 상태
  jobFilters: JobFilters;
  setJobFilters: (filters: JobFilters) => void;

  // 선택 상태
  selectedJobs: Set<string>;
  toggleJobSelection: (id: string) => void;
  clearSelection: () => void;

  // UI 상태
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // 실시간 모드
  isRealtimeMode: boolean;
  toggleRealtimeMode: () => void;
}
```

---

## UI 컴포넌트 구조

### 컴포넌트 계층

```
components/admin/
├── layout/
│   ├── admin-sidebar.tsx
│   ├── admin-header.tsx
│   └── admin-breadcrumb.tsx
├── dashboard/
│   ├── stat-card.tsx
│   ├── job-trend-chart.tsx
│   ├── recent-jobs.tsx
│   └── storage-gauge.tsx
├── jobs/
│   ├── job-table.tsx
│   ├── job-table-columns.tsx
│   ├── job-filters.tsx
│   ├── job-status-badge.tsx
│   ├── job-progress-bar.tsx
│   ├── job-detail-panel.tsx
│   └── batch-action-bar.tsx
├── videos/
│   ├── video-grid.tsx
│   ├── video-card.tsx
│   ├── video-player-modal.tsx
│   ├── upload-dropzone.tsx
│   └── upload-progress.tsx
├── models/
│   ├── model-grid.tsx
│   ├── model-card.tsx
│   ├── category-tabs.tsx
│   ├── model-upload-dialog.tsx
│   └── default-badge.tsx
├── analytics/
│   ├── usage-chart.tsx
│   ├── cost-chart.tsx
│   ├── storage-chart.tsx
│   ├── date-range-picker.tsx
│   └── report-download.tsx
├── settings/
│   ├── api-settings-form.tsx
│   ├── quality-settings-form.tsx
│   ├── notification-settings-form.tsx
│   └── secret-input.tsx
└── shared/
    ├── confirm-dialog.tsx
    ├── empty-state.tsx
    ├── loading-skeleton.tsx
    └── error-boundary.tsx
```

### shadcn/ui 컴포넌트 활용

**필수 컴포넌트:**
- Button, Card, Badge - 기본 UI 요소
- Table - TanStack Table과 함께 사용
- Dialog, AlertDialog - 모달/확인 다이얼로그
- Tabs - 카테고리 탭
- Input, Select, Switch - 폼 요소
- DropdownMenu - 액션 메뉴
- Progress - 진행률 표시
- Skeleton - 로딩 상태
- Toast - 알림 메시지

---

## 실시간 업데이트 구현

### WebSocket 연결 설계

**연결 관리:**
```typescript
// hooks/use-realtime-jobs.ts
export function useRealtimeJobs() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io('/admin/jobs', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 3,
    });

    socket.on('job:updated', (job: Job) => {
      queryClient.setQueryData(['admin', 'jobs', job.id], job);
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    });

    socket.on('job:created', () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
}
```

**이벤트 타입:**
- `job:created` - 새 작업 생성
- `job:updated` - 작업 상태 변경
- `job:completed` - 작업 완료
- `job:failed` - 작업 실패

### SSE (Server-Sent Events) 대안

**폴백 구현:**
```typescript
// 실시간 모니터링 모드일 때 폴링 간격 조정
const { data } = useQuery({
  queryKey: ['admin', 'jobs'],
  queryFn: fetchJobs,
  refetchInterval: isRealtimeMode ? 5000 : false,
});
```

---

## 마일스톤

### Milestone 1: Primary Goal (기반 구조)
- 관리자 레이아웃 및 인증 구조
- 네비게이션 및 권한 시스템
- 기본 컴포넌트 라이브러리 설정

### Milestone 2: Primary Goal (핵심 기능)
- 메인 대시보드 구현
- 작업 큐 관리 (목록, 상세, 액션)
- 실시간 업데이트 연동

### Milestone 3: Secondary Goal (비디오 관리)
- 비디오 목록 및 상세
- 비디오 업로드/교체/삭제
- 상품-비디오 매핑

### Milestone 4: Secondary Goal (모델 관리)
- 모델 이미지 라이브러리
- 카테고리 관리
- 기본 모델 설정

### Milestone 5: Final Goal (분석 및 설정)
- 통계 대시보드
- 리포트 다운로드
- 시스템 설정 관리

### Milestone 6: Optional Goal (고급 기능)
- 대시보드 커스터마이징
- 자동 리포트 생성
- 다크 모드 지원

---

## 리스크 및 대응 계획

### 기술적 리스크

| 리스크 | 영향도 | 발생 가능성 | 대응 방안 |
|--------|--------|-------------|-----------|
| 실시간 연결 불안정 | 높음 | 중간 | 폴링 폴백, 재연결 로직 |
| 대용량 테이블 성능 | 높음 | 중간 | 가상화, 페이지네이션 최적화 |
| 파일 업로드 실패 | 중간 | 낮음 | 청크 업로드, 재시도 로직 |
| 권한 우회 시도 | 높음 | 낮음 | 서버 측 검증 강화 |

### 의존성 리스크

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| SPEC-TRYON-001 미완료 | 높음 | Mock API로 개발 진행, 추후 연동 |
| SPEC-VIDEOGEN-001 미완료 | 높음 | Mock API로 개발 진행, 추후 연동 |

---

## 태그 (Traceability Tags)

- TAG: SPEC-ADMIN-VIDEO-001
- DOCUMENT: implementation-plan
- PHASE: planning
