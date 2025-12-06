'use client'

import { Header } from '@/components/layout/header'
import { ProductCard } from '@/components/product/product-card'
import { Product } from '@/types'
import Link from 'next/link'

// Mock data for the shop page
const products: Product[] = [
  {
    id: '1',
    name: 'AeroStride Pro',
    price: 149.99,
    description: 'Lightweight running shoes with responsive foam.',
    image_url: 'https://placehold.co/600x400/png?text=AeroStride+Pro',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Black', 'Red', 'Blue']
  },
  {
    id: '2',
    name: 'Urban Trekker Hoodie',
    price: 89.50,
    description: 'Premium cotton blend hoodie for urban exploration.',
    image_url: 'https://placehold.co/600x400/png?text=Urban+Trekker',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Grey', 'Black']
  },
  {
    id: '3',
    name: 'Classic Cap',
    price: 29.99,
    description: 'Minimalist cap with adjustable strap.',
    image_url: 'https://placehold.co/600x400/png?text=Classic+Cap',
    sizes: ['One Size'],
    colors: ['Navy', 'Beige']
  },
  {
    id: '4',
    name: 'HydroFlow Bottle',
    price: 24.99,
    description: '24oz stainless steel insulated water bottle.',
    image_url: 'https://placehold.co/600x400/png?text=HydroFlow',
    sizes: ['24oz'],
    colors: ['Silver', 'Matte Black']
  },
  {
    id: '5',
    name: 'TechRunner Shorts',
    price: 45.00,
    description: 'Breathable running shorts with phone pocket.',
    image_url: 'https://placehold.co/600x400/png?text=TechRunner',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Neon Green']
  },
  {
    id: '6',
    name: 'Smart Watch Strap',
    price: 19.99,
    description: 'Durable silicone strap for smart watches.',
    image_url: 'https://placehold.co/600x400/png?text=Watch+Strap',
    sizes: ['20mm', '22mm'],
    colors: ['White', 'Black', 'Pink']
  }
]

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold font-mono uppercase mb-2">Shop All</h1>
            <p className="text-muted-foreground">Browse our latest collection of premium gear.</p>
          </div>
          <div className="flex gap-2">
            <select className="h-10 px-3 border-2 border-border bg-white font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <ProductCard product={product} />
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
