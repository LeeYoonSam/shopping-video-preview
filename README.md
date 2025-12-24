# Shopping Video Preview

E-commerce video preview solution for fashion retail. This project implements a product listing page with video hover preview functionality, built with modern web technologies.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Image Source**: picsum.photos (placeholder images)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd shopping-video-preview

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
shopping-video-preview/
|
+-- src/
|   +-- app/                    # Next.js App Router
|   |   +-- products/           # Products list page
|   |   +-- layout.tsx          # Root layout
|   |
|   +-- components/             # React components
|   |   +-- product/            # Product related components
|   |       +-- ProductCard.tsx     # Individual product card
|   |       +-- ProductGrid.tsx     # Product grid container
|   |       +-- ProductSkeleton.tsx # Loading skeleton
|   |
|   +-- data/                   # Static data
|   |   +-- products.ts         # Dummy product data (20 items)
|   |
|   +-- lib/                    # Utility libraries
|   |   +-- utils.ts            # Utility functions (formatPrice, cn)
|   |   +-- utils.test.ts       # Utility tests
|   |
|   +-- types/                  # TypeScript type definitions
|   |   +-- product.ts          # Product type definition
|   |
|   +-- test/                   # Test configuration
|       +-- setup.ts            # Test setup
|
+-- .moai/                      # MoAI-ADK configuration
|   +-- specs/                  # SPEC documents
|   +-- project/                # Project documentation
|
+-- public/                     # Static files
```

## SPEC Documents

This project uses SPEC-driven development with MoAI-ADK. Current specifications:

| SPEC ID | Title | Status | Description |
|---------|-------|--------|-------------|
| SPEC-PRODUCT-001 | Product List Page | **Completed** | Product grid with responsive layout and monochrome design |
| SPEC-VIDEO-DATA-001 | Test Video Data | **Completed** | 다양한 테스트 비디오 URL 추가 및 비디오 재생 버그 수정 |
| SPEC-VIDEO-PREVIEW-001 | Video Hover Preview UI | Draft | Video popup on product card hover |
| SPEC-VIDEO-AI-002 | AI Video Generation System | Draft | Admin dashboard for AI-powered video generation |
| SPEC-TRYON-001 | AI Virtual Try-On | **Completed** | FASHN AI 기반 가상 착용 이미지 생성 시스템 |

### SPEC-PRODUCT-001 (Completed)

Implements the product listing page with:

- Responsive grid layout (2/3/4 columns)
- Product cards with image, name, price
- NEW and SALE badges
- Monochrome design theme
- Loading skeletons
- Hover effects with shadow

### SPEC-VIDEO-PREVIEW-001 (Draft)

Planned features:

- Video popup on hover (desktop)
- Full-screen modal (mobile)
- Auto-play with mute
- Loading skeleton for video

### SPEC-VIDEO-AI-002 (Draft)

Planned features:

- Admin dashboard for video generation
- Nano Banana AI integration for wearing images
- Pika Labs integration for image-to-video
- Async job processing with Bull + Redis
- Cost tracking and management

### SPEC-TRYON-001 (Completed)

AI-powered virtual try-on image generation system:

- FASHN AI API integration for virtual try-on
- Bull Queue for async job processing
- Redis caching for results
- S3/R2 storage for images
- API endpoints: /api/tryon/upload, /models, /generate, /jobs, /results

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Write tests for all components and utilities

### Component Development

1. Create component in appropriate directory
2. Write tests first (TDD approach)
3. Implement component
4. Ensure test coverage >= 85%

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:ui

# Check coverage
npm run test:coverage
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Private project. All rights reserved.

---

Document Version: 1.2.0
Last Updated: 2025-12-24
