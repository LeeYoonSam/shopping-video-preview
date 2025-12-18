import { PRODUCTS } from '@/src/data/products';
import { ProductGrid } from '@/src/components/product';

export const metadata = {
  title: '상품 리스트 | Shopping Video Preview',
  description: '모든 상품을 확인하세요.',
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-custom-bg p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-custom-text-primary mb-2">
            상품
          </h1>
          <p className="text-custom-text-secondary">
            총 {PRODUCTS.length}개의 상품
          </p>
        </div>

        {/* Product Grid */}
        <ProductGrid products={PRODUCTS} />
      </div>
    </main>
  );
}
