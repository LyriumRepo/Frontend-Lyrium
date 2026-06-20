'use client';

import ProductCard, { fromApiProduct, type ProductCardData } from '@/features/public/productos/components/ProductCard';
import type { ApiProduct } from '@/modules/cart/utils';

interface Props {
  product: ApiProduct;
  onAdd: (id: number | string) => void;
  onView: (id: number | string) => void;
}

export default function CartProductCard({ product, onAdd, onView }: Props) {
  const data: ProductCardData = fromApiProduct(product);
  return <ProductCard product={data} onAdd={onAdd} onView={onView} />;
}
