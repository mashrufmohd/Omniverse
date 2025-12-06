'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { cn } from '@/lib/utils'

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '')
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '')
  const [activeImage, setActiveImage] = useState(product.image_url)

  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedSize,
      selectedColor
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Left Column - Images */}
      <div className="space-y-4">
        <div className="relative aspect-square w-full border-2 border-border bg-muted overflow-hidden shadow-retro">
          {activeImage ? (
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[product.image_url, 'https://placehold.co/600x400/png?text=View+2', 'https://placehold.co/600x400/png?text=View+3', 'https://placehold.co/600x400/png?text=View+4'].map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={cn(
                "relative aspect-square border-2 border-border bg-muted overflow-hidden transition-all hover:opacity-80",
                activeImage === img ? "ring-2 ring-primary ring-offset-2" : ""
              )}
            >
              {img ? (
                <Image
                  src={img}
                  alt={`View ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  View {idx + 1}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Column - Details */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold font-mono uppercase leading-tight">{product.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-accent">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={cn("h-5 w-5", star <= (product.rating || 4.5) ? "fill-current" : "text-muted-foreground")} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {product.rating || 4.5} ({product.reviews || 1234} reviews)
            </span>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {product.description || "Experience the perfect blend of performance and comfort. Engineered for modern life, this product delivers unmatched quality and style."}
          </p>
        </div>

        <div className="space-y-6 py-6 border-y-2 border-border border-dashed">
          {/* Colors */}
          <div className="space-y-3">
            <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Color: {selectedColor || 'Select'}</span>
            <div className="flex gap-3">
              {['Midnight Black', 'Retro Red', 'Electric Blue', 'Classic White'].map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 border-border shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    selectedColor === color ? "ring-2 ring-primary ring-offset-2 scale-110" : ""
                  )}
                  style={{ backgroundColor: color.toLowerCase().replace(' ', '') }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3">
            <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Size: {selectedSize || 'Select'}</span>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "h-10 border-2 border-border font-mono text-sm font-bold transition-all hover:bg-secondary hover:text-secondary-foreground",
                    selectedSize === size 
                      ? "bg-primary text-primary-foreground shadow-retro" 
                      : "bg-background text-foreground hover:shadow-retro-hover"
                  )}
                >
                  {size}
                </button>
              )) || (
                <div className="col-span-4 text-sm text-muted-foreground">One Size</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono">${product.price.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground uppercase">USD</span>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleAddToCart}
              className="flex-1 h-14 text-lg font-bold uppercase tracking-wide gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button variant="outline" className="h-14 w-14 p-0">
              <Heart className="h-6 w-6" />
            </Button>
            <Button variant="outline" className="h-14 w-14 p-0">
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
