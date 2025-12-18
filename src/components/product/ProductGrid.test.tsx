import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductGrid from './ProductGrid';
import { Product } from '@/src/types/product';

describe('ProductGrid', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      name: '상품 1',
      price: 29000,
      imageUrl: 'https://picsum.photos/seed/product-1/400/500',
      category: '상의',
    },
    {
      id: '2',
      name: '상품 2',
      price: 49000,
      imageUrl: 'https://picsum.photos/seed/product-2/400/500',
      category: '상의',
    },
  ];

  it('should render all products', () => {
    render(<ProductGrid products={mockProducts} />);
    expect(screen.getByText('상품 1')).toBeInTheDocument();
    expect(screen.getByText('상품 2')).toBeInTheDocument();
  });

  it('should render empty state when products array is empty', () => {
    render(<ProductGrid products={[]} />);
    expect(
      screen.getByText('등록된 상품이 없습니다.')
    ).toBeInTheDocument();
  });

  it('should render correct number of product items', () => {
    const { container } = render(<ProductGrid products={mockProducts} />);
    const productCards = container.querySelectorAll('[class*="group"]');
    expect(productCards.length).toBeGreaterThanOrEqual(2);
  });

  it('should apply grid layout classes', () => {
    const { container } = render(<ProductGrid products={mockProducts} />);
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('grid');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ProductGrid products={mockProducts} className="custom-grid" />
    );
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('custom-grid');
  });
});
