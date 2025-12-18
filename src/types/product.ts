export type ProductCategory = '상의' | '하의' | '아우터' | '액세서리';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: ProductCategory;
  isNew?: boolean;
  isSale?: boolean;
}
