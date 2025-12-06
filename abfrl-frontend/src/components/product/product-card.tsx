'use client'

import Image from 'next/image'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCart } from '@/hooks/use-cart'
import { ShoppingCart } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onAction?: (action: string, product: Product) => void
}

export function ProductCard({ product, onAction }: ProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product)
    if (onAction) {
      onAction('add_to_cart', product)
    }
  }

  return (
    <Card className="overflow-hidden max-w-sm bg-card border-2 border-border shadow-retro hover:shadow-retro-hover transition-all duration-300">
      <div className="relative w-full aspect-square border-b-2 border-border bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg leading-tight font-mono uppercase">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold font-mono">${product.price.toFixed(2)}</p>
          {product.sizes && (
            <div className="flex gap-1">
              {product.sizes.slice(0, 3).map((size) => (
                <span key={size} className="text-xs border border-border px-1.5 py-0.5 font-mono">
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={handleAddToCart}
          className="w-full gap-2 font-bold uppercase tracking-wide"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </div>
    </Card>
  )
}