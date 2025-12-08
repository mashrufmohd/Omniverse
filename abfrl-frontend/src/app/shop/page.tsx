'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { ProductCard } from '@/components/product/product-card'
import { Product } from '@/types'
import Link from 'next/link'
import api from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.PRODUCTS)
        setProducts(response.data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

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

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[400px] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group">
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
