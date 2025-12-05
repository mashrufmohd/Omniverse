'use client'

import { Product } from '@/types'
import { ProductCard } from './product-card'

interface ProductCarouselProps {
  products: Product[]
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {products.map((product) => (
        <div key={product.id} className="flex-shrink-0 w-64">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}