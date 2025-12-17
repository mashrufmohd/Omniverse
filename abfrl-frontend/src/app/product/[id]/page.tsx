import { ProductDetails } from '@/components/product/product-details'
import { Header } from '@/components/layout/header'
import { Product } from '@/types'

// Fetch product from MongoDB backend API
async function getProduct(id: string): Promise<Product> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/products/${id}`, {
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        id: data._id || data.id,
        name: data.name,
        price: data.price,
        description: data.description,
        image_url: data.image_url,
        imageUrl: data.image_url,
        sizes: data.sizes || ['7', '8', '9', '10', '11', '12', '13'],
        colors: data.colors || ['Midnight Black', 'Retro Red', 'Electric Blue'],
        rating: data.rating || 4.5,
        reviews: data.reviews || 1234,
        category: data.category
      }
    }
  } catch (error) {
    console.error('Error fetching product:', error)
  }
  
  // Fallback mock data
  return {
    id: id,
    name: 'AeroStride Pro',
    price: 149.99,
    description: 'Experience the perfect blend of performance and comfort. Engineered for modern life, this product delivers unmatched quality and style. The premium materials ensure durability while maintaining a lightweight feel.',
    image_url: 'https://placehold.co/600x400/png?text=Product',
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
