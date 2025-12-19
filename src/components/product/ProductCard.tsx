'use client';

import Image from 'next/image';
import { Product } from '@/src/types/product';
import { formatPrice, cn } from '@/src/lib/utils';
import { VideoPopup, useVideoPopup } from '@/src/components/video';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({
  product,
  className,
}: ProductCardProps) {
  const {
    isOpen,
    isLoading,
    position,
    handleMouseEnter,
    handleMouseLeave,
    closePopup,
    handleLoadStart,
    handleCanPlay,
    handleError,
  } = useVideoPopup();

  return (
    <div
      className={cn(
        'group relative bg-white hover:shadow-lg transition-shadow duration-300',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] bg-custom-hover overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badge Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <div className="px-2 py-1 bg-black text-white text-xs font-medium">
              NEW
            </div>
          )}
          {product.isSale && (
            <div className="px-2 py-1 bg-black text-white text-xs font-medium">
              SALE
            </div>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-3">
        {/* Product Name */}
        <h3 className="text-sm font-normal text-custom-text-primary line-clamp-2 mb-2">
          {product.name}
        </h3>

        {/* Price Container */}
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-custom-text-primary">
            {formatPrice(product.price)}
          </span>
          {product.isSale && product.originalPrice && (
            <span className="text-xs text-custom-text-secondary line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Video Popup - only show if product has video URL */}
      {product.videoUrl && (
        <VideoPopup
          videoUrl={product.videoUrl}
          isOpen={isOpen}
          isLoading={isLoading}
          position={position}
          onClose={closePopup}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onError={handleError}
        />
      )}
    </div>
  );
}
