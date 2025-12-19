---
id: SPEC-PRODUCT-001
version: "1.0.0"
status: "completed"
created: "2025-12-18"
updated: "2025-12-19"
author: "MoAI-ADK"
priority: "high"
---

# SPEC-PRODUCT-001: 상품 리스트 페이지 구현

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2025-12-18 | MoAI-ADK | 초기 명세서 작성 |

---

## 1. 개요

의류 쇼핑몰의 상품 리스트 페이지를 구현합니다. 사용자가 상품을 탐색할 수 있도록 썸네일 이미지, 상품명, 가격 등을 그리드 형태로 표시합니다. 모던하고 미니멀한 흑백(monochrome) 디자인을 적용하며, 반응형 레이아웃을 지원합니다.

---

## 2. Environment (환경)

### 2.1 기술 스택

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **Image Source**: picsum.photos (실제 이미지 활용)

### 2.2 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 2.3 디바이스 지원

- Desktop: 1280px 이상
- Tablet: 768px ~ 1279px
- Mobile: 320px ~ 767px

---

## 3. Assumptions (가정)

### 3.1 데이터 가정

- 상품 데이터는 더미 데이터 20개로 구성됩니다.
- 각 상품은 고유 ID, 상품명, 가격, 썸네일 이미지 URL을 포함합니다.
- 이미지는 picsum.photos에서 제공하는 실제 이미지를 사용합니다.
- 가격은 한국 원화(KRW) 단위로 표시됩니다.

### 3.2 디자인 가정

- 디자인 테마는 흰색 배경에 검은색 텍스트를 기본으로 합니다.
- 호버 효과 및 상호작용 시 미묘한 그레이 톤을 사용합니다.
- 미니멀하고 모던한 타이포그래피를 적용합니다.

### 3.3 기능 가정

- 상품 상세 페이지 연결은 본 SPEC 범위에 포함되지 않습니다.
- 필터링 및 정렬 기능은 본 SPEC 범위에 포함되지 않습니다.
- 페이지네이션은 본 SPEC 범위에 포함되지 않습니다.

---

## 4. Requirements (요구사항)

### 4.1 Ubiquitous Requirements (시스템 기본 요구사항)

[REQ-U-001] 시스템은 항상 TypeScript 엄격 모드(strict mode)로 타입 안전성을 보장해야 한다.

[REQ-U-002] 시스템은 항상 반응형 레이아웃을 제공해야 한다.
- Mobile (320px~767px): 2열 그리드
- Tablet (768px~1279px): 3열 그리드
- Desktop (1280px+): 4열 그리드

[REQ-U-003] 시스템은 항상 접근성 표준(WCAG 2.1 AA)을 준수해야 한다.

[REQ-U-004] 시스템은 항상 Next.js Image 컴포넌트를 사용하여 이미지 최적화를 수행해야 한다.

### 4.2 Event-Driven Requirements (이벤트 기반 요구사항)

[REQ-E-001] 사용자가 상품 카드에 마우스를 올리면(hover), 시스템은 카드에 미묘한 그림자 효과를 표시해야 한다.

[REQ-E-002] 페이지가 로드될 때, 시스템은 20개의 상품 데이터를 화면에 렌더링해야 한다.

[REQ-E-003] 이미지 로딩이 완료되기 전까지, 시스템은 스켈레톤 UI 또는 placeholder를 표시해야 한다.

### 4.3 Unwanted Behavior Requirements (예외 처리)

[REQ-W-001] 이미지 로드 실패 시, 시스템은 기본 placeholder 이미지를 표시해야 한다.

[REQ-W-002] 상품 데이터가 없는 경우, 시스템은 "상품이 없습니다" 메시지를 표시해야 한다.

[REQ-W-003] 가격 데이터가 유효하지 않은 경우, 시스템은 "가격 정보 없음"을 표시해야 한다.

### 4.4 State-Driven Requirements (상태 기반)

[REQ-S-001] 시스템이 로딩 상태일 때, 스켈레톤 카드 그리드를 표시해야 한다.

[REQ-S-002] 시스템이 에러 상태일 때, 에러 메시지와 재시도 버튼을 표시해야 한다.

[REQ-S-003] 시스템이 정상 상태일 때, 상품 그리드를 표시해야 한다.

### 4.5 Optional Feature Requirements (선택적 기능)

[REQ-O-001] 상품 카드에 "NEW" 또는 "SALE" 배지를 표시할 수 있다.

[REQ-O-002] 상품 카드에 원가와 할인가를 함께 표시할 수 있다.

---

## 5. Specifications (명세)

### 5.1 데이터 모델

#### Product Interface (TypeScript)

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
}
```

#### 더미 데이터 구조

- 총 20개 상품
- 카테고리: 상의(Tops), 하의(Bottoms), 아우터(Outerwear), 액세서리(Accessories)
- 이미지: picsum.photos에서 400x500 크기의 실제 이미지 사용
- 가격 범위: 29,000원 ~ 299,000원

### 5.2 컴포넌트 구조

#### ProductCard 컴포넌트

```
ProductCard
├── ImageWrapper (aspect-ratio: 4/5)
│   ├── Image (Next.js Image)
│   └── Badge (optional: NEW, SALE)
├── ProductInfo
│   ├── ProductName
│   └── PriceWrapper
│       ├── CurrentPrice
│       └── OriginalPrice (optional, strikethrough)
```

Props:
- product: Product (필수)
- className?: string (선택)

#### ProductGrid 컴포넌트

```
ProductGrid
├── GridContainer (responsive columns)
│   └── ProductCard[] (mapped from products)
```

Props:
- products: Product[] (필수)
- className?: string (선택)

### 5.3 스타일 명세

#### 색상 팔레트 (Monochrome)

| 용도 | 색상 코드 |
|------|-----------|
| 배경색 | #FFFFFF |
| 주 텍스트 | #000000 |
| 보조 텍스트 | #666666 |
| 테두리 | #E5E5E5 |
| 호버 배경 | #F5F5F5 |
| 할인가 강조 | #000000 |
| 원가 (취소선) | #999999 |

#### 타이포그래피

| 요소 | 크기 | 굵기 |
|------|------|------|
| 상품명 | 14px | 400 (normal) |
| 현재가 | 16px | 600 (semibold) |
| 원가 | 14px | 400 (normal) |
| 배지 | 12px | 500 (medium) |

#### 간격 (Spacing)

| 요소 | 값 |
|------|-----|
| 그리드 간격 | 16px (mobile), 24px (tablet+) |
| 카드 내부 패딩 | 12px |
| 이미지-텍스트 간격 | 12px |

### 5.4 파일 구조

```
src/
├── types/
│   └── product.ts              # Product 타입 정의
├── data/
│   └── products.ts             # 더미 상품 데이터 (20개)
├── components/
│   └── product/
│       ├── ProductCard.tsx     # 개별 상품 카드
│       ├── ProductGrid.tsx     # 상품 그리드 컨테이너
│       └── ProductSkeleton.tsx # 로딩 스켈레톤
└── app/
    └── products/
        └── page.tsx            # 상품 리스트 페이지
```

---

## 6. Traceability (추적성)

### 요구사항-구현 매핑

| 요구사항 ID | 구현 파일 | 설명 |
|-------------|-----------|------|
| REQ-U-001 | tsconfig.json | strict 모드 설정 |
| REQ-U-002 | ProductGrid.tsx | 반응형 그리드 클래스 |
| REQ-U-003 | ProductCard.tsx | alt 텍스트, 시맨틱 HTML |
| REQ-U-004 | ProductCard.tsx | Next.js Image 컴포넌트 |
| REQ-E-001 | ProductCard.tsx | hover 스타일 적용 |
| REQ-E-002 | page.tsx | 데이터 렌더링 |
| REQ-E-003 | ProductCard.tsx | placeholder 속성 |
| REQ-W-001 | ProductCard.tsx | onError 핸들러 |
| REQ-W-002 | ProductGrid.tsx | 빈 상태 처리 |
| REQ-W-003 | ProductCard.tsx | 가격 유효성 검사 |
| REQ-S-001 | ProductSkeleton.tsx | 스켈레톤 UI |
| REQ-S-002 | page.tsx | 에러 상태 UI |
| REQ-S-003 | page.tsx | 정상 상태 렌더링 |

---

## 7. 관련 문서

- plan.md: 구현 계획 및 마일스톤
- acceptance.md: 인수 기준 및 테스트 시나리오
