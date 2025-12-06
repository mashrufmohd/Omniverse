export interface Product {
  id: string
  name: string
  price: number
  description?: string
  image_url: string
  sizes?: string[]
  colors?: string[]
  rating?: number
  reviews?: number
  cta?: string
}

export interface CartItem extends Product {
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

export interface ChatMessage {
  role: 'user' | 'ai'
  content: string
  timestamp: string
  product_cards?: Product[]
  suggested_actions?: string[]
}

export interface ChatResponse {
  ai_message: string
  product_cards?: Product[]
  suggested_actions?: string[]
  cart_summary?: {
    items: CartItem[]
    total: number
  }
  order_status?: {
    status: string
    eta: string
  }
  metadata?: any
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: string
  date: string
}