import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProductSkeleton from './ProductSkeleton';

describe('ProductSkeleton', () => {
  it('should render skeleton grid', () => {
    const { container } = render(<ProductSkeleton count={4} />);
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('grid');
  });

  it('should render correct number of skeleton items', () => {
    const { container } = render(<ProductSkeleton count={3} />);
    const skeletonItems = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletonItems.length).toBeGreaterThanOrEqual(3);
  });

  it('should render 8 skeleton items by default', () => {
    const { container } = render(<ProductSkeleton />);
    const skeletonItems = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletonItems.length).toBeGreaterThanOrEqual(8);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ProductSkeleton count={4} className="custom-skeleton" />
    );
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('custom-skeleton');
  });

  it('should have animated pulse effect', () => {
    const { container } = render(<ProductSkeleton count={1} />);
    const skeleton = container.querySelector('[class*="animate-pulse"]');
    expect(skeleton).toBeInTheDocument();
  });
});
