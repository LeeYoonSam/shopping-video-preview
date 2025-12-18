export function formatPrice(price: number): string {
  const roundedPrice = Math.floor(price);
  return `${roundedPrice.toLocaleString('ko-KR')}원`;
}

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes
    .filter((cls) => typeof cls === 'string' && cls.length > 0)
    .join(' ');
}
