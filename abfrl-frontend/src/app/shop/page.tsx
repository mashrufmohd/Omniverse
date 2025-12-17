'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ProductCard } from '@/components/product/product-card'
import { Product } from '@/types'
import Link from 'next/link'
import { Minus, Plus, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuthContext } from '@/context/auth-context'

export default function ShopPage() {
  const { user, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products')
  const [isSizeOpen, setIsSizeOpen] = useState(true)

  // Redirect shopkeepers to login page - they need to login as user
  useEffect(() => {
    if (!authLoading && user && user.role === 'shopkeeper') {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.PRODUCTS)
        setProducts(response.data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Don't render page content if shopkeeper - show loading instead
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-lg font-mono">Loading...</div>
      </div>
    )
  }

  if (user && user.role === 'shopkeeper') {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-lg font-mono">Redirecting...</div>
      </div>
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
  }

  const filteredProducts = products.filter(product => {
    // Filter by category
    if (selectedCategory !== 'All Products' && product.category !== selectedCategory) {
      return false
    }

    // Filter by price
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false
    }

    // Filter by size if any selected
    if (selectedSizes.length > 0) {
      const hasSize = product.sizes?.some(s => selectedSizes.includes(s))
      if (!hasSize) return false
    }

    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F5F5]">
        <Header />
      
      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-10">
            {/* Browse by */}
            <div>
              <h3 className="text-lg font-medium text-gray-600 mb-4">Browse by</h3>
              <div className="w-12 h-0.5 bg-gray-300 mb-6"></div>
              <ul className="space-y-3 text-sm">
                {['All Products', 'Tops', 'Bottoms', 'Outerwear'].map((category) => (
                  <li key={category}>
                    <button 
                      onClick={() => setSelectedCategory(category)}
                      className={`text-left w-full transition-colors ${
                        selectedCategory === category 
                          ? 'text-black font-medium underline decoration-1 underline-offset-4' 
                          : 'text-gray-500 hover:text-black'
                      }`}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filter by */}
            <div>
              <h3 className="text-lg font-medium text-gray-600 mb-4">Filter by</h3>
              <div className="w-12 h-0.5 bg-gray-300 mb-6"></div>
              
              <div className="space-y-6">
                {/* Price Filter */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Price</span>
                    <Minus className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="5000" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="flex justify-between mt-2 text-xs font-medium text-gray-600">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Color Filter */}
                <div className="border-b border-gray-200 pb-6">
                  <div 
                    className="flex items-center justify-between cursor-pointer mb-4"
                    onClick={() => setIsColorOpen(!isColorOpen)}
                  >
                    <span className="text-sm font-medium text-gray-700">Size</span>
                    {isSizeOpen ? (
                      <Minus className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Plus className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  {isSizeOpen && (
                    <div className="space-y-2">
                      {allSizes.map(size => (
                        <div key={size} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`size-${size}`}
                            checked={selectedSizes.includes(size)}
                            onChange={() => toggleSize(size)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                          />
                          <label htmlFor={`size-${size}`} className="ml-2 text-sm text-gray-600 cursor-pointer select-none">
                            {size}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="text-center mb-10">
              <h1 className="text-2xl font-medium text-gray-800">{selectedCategory}</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {filteredProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group block">
                  <div className="bg-white p-8 mb-4 aspect-square flex items-center justify-center relative overflow-hidden">
                    {/* Placeholder for product image - using the card component logic but simplified for this layout */}
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.id === 6 && (
                      <span className="absolute top-4 left-4 bg-[#C19A6B] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                        Best Seller
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm font-medium text-gray-500">₹{product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/chat">
          <Button className="rounded-full w-14 h-14 bg-black hover:bg-gray-800 text-white shadow-lg flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </Button>
        </Link>
      </div>
    </div>
    </ProtectedRoute>
  )
}
