'use client'

import Image from 'next/image'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCart } from '@/hooks/use-cart'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  return (
    <Card className="p-4">
      <div className="relative w-full h-48 mb-4">
        <Image
          src={product.imageUrl || '/images/placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <h3 className="font-semibold text-lg">{product.name}</h3>
      <p className="text-gray-600 mb-2">{product.description}</p>
      <p className="text-xl font-bold text-green-600">${product.price}</p>
      <Button
        onClick={() => addToCart(product)}
        className="w-full mt-4"
      >
        Add to Cart
      </Button>
    </Card>
  )
}