export interface Product {
  id: number
  name: string
  price: number
  description?: string
  imageUrl?: string
  image_url?: string
  category?: string
  sizes?: string[]
  colors?: string[]
  rating?: number
  reviews?: number
}

export interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  products?: Product[]
}

export interface ChatMessage {
  role: 'user' | 'ai'
  content: string
  timestamp: string
  product_cards?: Product[]
  suggested_actions?: string[]
}

export interface CartItem extends Product {
  quantity: number
  selectedSize?: string
  selectedColor?: string
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