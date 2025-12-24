'use client';

import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export default function ProductGrid({
  products,
  className,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-custom-text-secondary text-center">
          등록된 상품이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid',
        'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        'gap-4 sm:gap-5 lg:gap-6',
        'w-full',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
