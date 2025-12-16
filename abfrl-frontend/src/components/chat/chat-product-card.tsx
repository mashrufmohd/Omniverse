'use client'

import Image from 'next/image'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { ShoppingCart, Plus } from 'lucide-react'

interface ChatProductCardProps {
  product: Product
  onAction?: (action: string, product: Product) => void
}

export function ChatProductCard({ product, onAction }: ChatProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product)
    if (onAction) {
      onAction('add_to_cart', product)
    }
  }

  return (
    <div className="group relative bg-white border-2 border-black shadow-retro hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 h-full flex flex-col">
      <div className="relative w-full aspect-[4/3] overflow-hidden border-b-2 border-black bg-gray-100">
        {product.image_url || product.imageUrl ? (
          <Image
            src={product.image_url || product.imageUrl || ''}
            alt={product.name}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-black font-mono text-xs uppercase tracking-widest">
            [NO IMAGE]
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-xs font-bold font-mono border border-white">
          ₹{product.price.toFixed(0)}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="space-y-1">
          <h3 className="font-bold text-black font-mono uppercase tracking-tight line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-600 font-mono line-clamp-2 h-8 leading-relaxed">
            {product.description || "PREMIUM QUALITY ITEM DETECTED."}
          </p>
        </div>

        <div className="mt-auto pt-2">
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-colors duration-200 rounded-none font-mono uppercase text-xs font-bold tracking-wider flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
