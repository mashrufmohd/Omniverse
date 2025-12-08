'use client'

import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Search, ChevronDown, MoreHorizontal, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('orders')

  // Mock orders data based on the reference image structure
  const orders = [
    {
      id: '112-0822160-5390023',
      date: 'June 2, 2023',
      total: 157.99,
      shipTo: 'Mashruf Chowdhury',
      status: 'Delivered June 5',
      statusMessage: 'Your package was delivered. It was handed directly to a resident.',
      items: [
        {
          name: 'SAMSUNG 980 PRO SSD 2TB PCIe NVMe Gen 4 Gaming M.2 Internal Solid State Drive',
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=200&q=80', // Using a shirt image as placeholder or I should use tech? The user's shop is clothes now. I'll use clothes.
          returnWindow: 'Return or replace items: Eligible through July 5, 2023'
        }
      ]
    },
    {
      id: '112-9876543-2109876',
      date: 'June 1, 2023',
      total: 89.50,
      shipTo: 'Mashruf Chowdhury',
      status: 'Delivered June 7',
      statusMessage: 'Your package was delivered. It was handed directly to a resident.',
      items: [
        {
          name: 'Urban Trekker Hoodie - Premium Cotton Blend',
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=200&q=80',
          returnWindow: 'Return or replace items: Eligible through July 5, 2023'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-2xl font-medium text-gray-900">Your Orders</h1>
              <span className="text-sm font-medium text-gray-500">6 orders</span>
            </div>

            {/* Tabs & Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-200 pb-1">
              <div className="flex gap-6 text-sm font-medium">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`pb-3 border-b-2 transition-colors ${activeTab === 'orders' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                  Orders
                </button>
                <button 
                  onClick={() => setActiveTab('not-shipped')}
                  className={`pb-3 border-b-2 transition-colors ${activeTab === 'not-shipped' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                  Not Yet Shipped
                </button>
                <button 
                  onClick={() => setActiveTab('cancelled')}
                  className={`pb-3 border-b-2 transition-colors ${activeTab === 'cancelled' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                  Cancelled Orders
                </button>
              </div>
              
              <div className="relative">
                <button className="flex items-center gap-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md shadow-sm border border-gray-300">
                  <span>Past 3 Months</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between gap-4 text-sm text-gray-600">
                    <div className="flex gap-8">
                      <div>
                        <p className="uppercase text-xs font-bold mb-1">Order placed</p>
                        <p className="text-gray-900">{order.date}</p>
                      </div>
                      <div>
                        <p className="uppercase text-xs font-bold mb-1">Total</p>
                        <p className="text-gray-900">${order.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="uppercase text-xs font-bold mb-1">Ship to</p>
                        <div className="group relative cursor-pointer">
                          <p className="text-blue-600 hover:underline hover:text-orange-700 flex items-center gap-1">
                            {order.shipTo} <ChevronDown className="w-3 h-3" />
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="uppercase text-xs font-bold">Order # {order.id}</span>
                      </div>
                      <div className="flex gap-4 mt-1 text-blue-600">
                        <Link href="#" className="hover:underline hover:text-orange-700">View order details</Link>
                        <span className="text-gray-300">|</span>
                        <Link href="#" className="hover:underline hover:text-orange-700">View invoice</Link>
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{order.status}</h3>
                    <p className="text-sm text-gray-600 mb-6">{order.statusMessage}</p>

                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 relative border border-gray-200 rounded bg-white p-2">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <Link href="#" className="text-blue-600 font-medium hover:underline hover:text-orange-700 line-clamp-2">
                            {item.name}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">{item.returnWindow}</p>
                          
                          <div className="mt-4 flex gap-2">
                            <Button className="bg-[#FFD814] hover:bg-[#F7CA00] text-black border border-[#FCD200] shadow-sm h-8 text-sm font-normal px-4 rounded-lg">
                              Buy it again
                            </Button>
                            <Button variant="outline" className="h-8 text-sm font-normal px-4 rounded-lg border-gray-300 shadow-sm hover:bg-gray-50">
                              View your item
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:w-48">
                          <Button variant="outline" className="w-full h-8 text-sm font-normal rounded-lg border-gray-300 shadow-sm hover:bg-gray-50">
                            Track package
                          </Button>
                          <Button variant="outline" className="w-full h-8 text-sm font-normal rounded-lg border-gray-300 shadow-sm hover:bg-gray-50">
                            Write a product review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Footer/Archive */}
                  <div className="bg-white px-6 py-3 border-t border-gray-200">
                    <Link href="#" className="text-blue-600 text-sm hover:underline hover:text-orange-700">
                      Archive order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-[#007185]" />
                <h3 className="font-bold text-gray-900">Send us a message</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                If you unable to find answer please describe your issue solutions within the next 24h.
              </p>
              <Button className="w-full bg-[#232F3E] hover:bg-[#374151] text-white rounded-lg">
                Send us a message
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
