import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';
import { Product } from '@/types/product';

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: '1',
    name: '테스트 상품',
    price: 29000,
    imageUrl: 'https://picsum.photos/seed/product-1/400/500',
    category: '상의',
  };

  it('should render product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('테스트 상품')).toBeInTheDocument();
  });

  it('should render formatted price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('29,000원')).toBeInTheDocument();
  });

  it('should render image with correct alt text', () => {
    render(<ProductCard product={mockProduct} />);
    const image = screen.getByAltText('테스트 상품');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src');
  });

  it('should render NEW badge when isNew is true', () => {
    const productWithNew: Product = { ...mockProduct, isNew: true };
    render(<ProductCard product={productWithNew} />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('should render SALE badge when isSale is true', () => {
    const productWithSale: Product = { ...mockProduct, isSale: true };
    render(<ProductCard product={productWithSale} />);
    expect(screen.getByText('SALE')).toBeInTheDocument();
  });

  it('should render original price when isSale is true', () => {
    const productWithSale: Product = {
      ...mockProduct,
      isSale: true,
      originalPrice: 49000,
    };
    render(<ProductCard product={productWithSale} />);
    expect(screen.getByText('49,000원')).toBeInTheDocument();
  });

  it('should not render NEW badge when isNew is false', () => {
    const productWithoutNew: Product = { ...mockProduct, isNew: false };
    render(<ProductCard product={productWithoutNew} />);
    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
  });

  it('should not render SALE badge when isSale is false', () => {
    const productWithoutSale: Product = { ...mockProduct, isSale: false };
    render(<ProductCard product={productWithoutSale} />);
    expect(screen.queryByText('SALE')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ProductCard product={mockProduct} className="custom-class" />
    );
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('custom-class');
  });
});
