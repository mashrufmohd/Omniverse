'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { ProductCard } from '@/components/product/product-card'
import { Product } from '@/types'
import Link from 'next/link'
import { Minus, Plus, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Mock data for the shop page
const products: Product[] = [
  {
    id: 1,
    name: 'Classic Oxford Shirt',
    price: 79.99,
    description: 'Premium cotton oxford shirt for a sharp look.',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    category: 'Tops',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Blue']
  },
  {
    id: 2,
    name: 'Urban Trekker Hoodie',
    price: 89.50,
    description: 'Premium cotton blend hoodie for urban exploration.',
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    category: 'Tops',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Grey', 'Black']
  },
  {
    id: 3,
    name: 'Slim Fit Chinos',
    price: 69.99,
    description: 'Versatile chinos perfect for office or casual wear.',
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    category: 'Bottoms',
    sizes: ['30', '32', '34', '36'],
    colors: ['Beige', 'Navy', 'Olive']
  },
  {
    id: 4,
    name: 'Merino Wool Sweater',
    price: 120.00,
    description: 'Soft and warm merino wool sweater.',
    image_url: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=800&q=80',
    category: 'Tops',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Grey', 'Navy']
  },
  {
    id: 5,
    name: 'TechRunner Shorts',
    price: 45.00,
    description: 'Breathable running shorts with phone pocket.',
    image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
    category: 'Bottoms',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Neon Green']
  },
  {
    id: 6,
    name: 'Denim Jacket',
    price: 110.00,
    description: 'Classic denim jacket with a modern fit.',
    image_url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80',
    category: 'Outerwear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black']
  },
  {
    id: 7,
    name: 'Polo Shirt',
    price: 55.00,
    description: 'Breathable cotton pique polo shirt.',
    image_url: 'https://images.unsplash.com/photo-1626557981101-aae6f84aa6ff?auto=format&fit=crop&w=800&q=80',
    category: 'Tops',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Navy', 'Red']
  },
  {
    id: 8,
    name: 'Cargo Pants',
    price: 85.00,
    description: 'Durable cargo pants with multiple pockets.',
    image_url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    category: 'Bottoms',
    sizes: ['30', '32', '34', '36'],
    colors: ['Green', 'Black', 'Khaki']
  }
]

export default function ShopPage() {
  const [priceRange, setPriceRange] = useState([0, 200])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products')
  const [isSizeOpen, setIsSizeOpen] = useState(true)
  const [isColorOpen, setIsColorOpen] = useState(false)

  const allSizes = Array.from(new Set(products.flatMap(p => p.sizes))).sort()
  const allColors = Array.from(new Set(products.flatMap(p => p.colors))).sort()

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
  }

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
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

    // Filter by color if any selected
    if (selectedColors.length > 0) {
      const hasColor = product.colors?.some(c => selectedColors.includes(c))
      if (!hasColor) return false
    }

    return true
  })

  return (
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
                      max="200" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="flex justify-between mt-2 text-xs font-medium text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Color Filter */}
                <div className="border-b border-gray-200 pb-6">
                  <div 
                    className="flex items-center justify-between cursor-pointer mb-4"
                    onClick={() => setIsColorOpen(!isColorOpen)}
                  >
                    <span className="text-sm font-medium text-gray-700">Color</span>
                    {isColorOpen ? (
                      <Minus className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Plus className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  {isColorOpen && (
                    <div className="space-y-2">
                      {allColors.map(color => (
                        <div key={color} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`color-${color}`}
                            checked={selectedColors.includes(color)}
                            onChange={() => toggleColor(color)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                          />
                          <label htmlFor={`color-${color}`} className="ml-2 text-sm text-gray-600 cursor-pointer select-none">
                            {color}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Size Filter */}
                <div className="border-b border-gray-200 pb-6">
                  <div 
                    className="flex items-center justify-between cursor-pointer mb-4"
                    onClick={() => setIsSizeOpen(!isSizeOpen)}
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
                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-500">I&apos;m a Product</p>
                    <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
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
          <Button className="bg-[#C19A6B] hover:bg-[#a88659] text-white rounded-none px-6 py-6 shadow-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span>Let&apos;s Chat!</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
