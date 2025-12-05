export interface Product {
  id: number
  name: string
  description: string
  price: number
  imageUrl?: string
  category?: string
}

export interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  products?: Product[]
}

export interface ChatRequest {
  user_id: string
  message: string
}

export interface ChatResponse {
  response: string
  products?: Product[]
}