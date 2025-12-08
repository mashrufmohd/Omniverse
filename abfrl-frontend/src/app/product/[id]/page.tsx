import { ProductDetails } from '@/components/product/product-details'
import { Header } from '@/components/layout/header'
import { Product } from '@/types'

// Mock data fetcher
async function getProduct(id: string): Promise<Product> {
  // In a real app, fetch from API
  // For demo purposes, return different images based on ID if possible, or just the main one
  const images: Record<string, string> = {
    '1': 'https://placehold.co/600x400/png?text=AeroStride+Pro',
    '2': 'https://placehold.co/600x400/png?text=Urban+Trekker',
    '3': 'https://placehold.co/600x400/png?text=Classic+Cap',
    '4': 'https://placehold.co/600x400/png?text=HydroFlow',
    '5': 'https://placehold.co/600x400/png?text=TechRunner',
    '6': 'https://placehold.co/600x400/png?text=Watch+Strap',
  }

  const names: Record<string, string> = {
    '1': 'AeroStride Pro',
    '2': 'Urban Trekker Hoodie',
    '3': 'Classic Cap',
    '4': 'HydroFlow Bottle',
    '5': 'TechRunner Shorts',
    '6': 'Smart Watch Strap',
  }

  return {
    id: parseInt(id),
    name: names[id] || 'AeroStride Pro',
    price: 149.99,
    description: 'Experience the perfect blend of performance and comfort. Engineered for modern life, this product delivers unmatched quality and style. The premium materials ensure durability while maintaining a lightweight feel.',
    image_url: images[id] || 'https://placehold.co/600x400/png?text=Product',
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    colors: ['Midnight Black', 'Retro Red', 'Electric Blue'],
    rating: 4.5,
    reviews: 1234
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ProductDetails product={product} />
      </main>
    </div>
  )
}
