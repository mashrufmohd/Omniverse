'use client'

import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Book, 
  Code, 
  Server, 
  Database, 
  Zap, 
  Layout, 
  GitBranch, 
  Menu, 
  ChevronRight,
  Terminal,
  Layers,
  Brain
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const sidebarItems = [
    {
      category: "GETTING STARTED",
      items: [
        { id: 'overview', label: 'Project Overview', icon: Book },
        { id: 'quickstart', label: 'Quick Start', icon: Zap },
      ]
    },
    {
      category: "ARCHITECTURE",
      items: [
        { id: 'system-design', label: 'System Design', icon: Layers },
        { id: 'data-flow', label: 'Data Flow', icon: GitBranch },
      ]
    },
    {
      category: "TECHNOLOGY",
      items: [
        { id: 'frontend', label: 'Frontend Stack', icon: Layout },
        { id: 'backend', label: 'Backend & AI', icon: Server },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 flex relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-[64px] left-0 h-[calc(100vh-64px)] w-72 bg-gray-50 border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search documentation..." 
                className="pl-9 bg-white border-gray-200 focus-visible:ring-black"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-130px)]">
            <div className="p-4 space-y-8">
              {sidebarItems.map((group, idx) => (
                <div key={idx}>
                  <h4 className="text-xs font-bold text-gray-500 mb-3 px-2 tracking-wider">
                    {group.category}
                  </h4>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id)
                          setIsSidebarOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors",
                          activeSection === item.id 
                            ? "bg-blue-50 text-blue-700" 
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-white">
          {/* Mobile Header */}
          <div className="lg:hidden p-4 border-b flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-bold">Documentation</span>
          </div>

          <div className="max-w-4xl mx-auto p-6 lg:p-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <span>Docs</span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-gray-900 capitalize">
                {activeSection.replace('-', ' ')}
              </span>
            </div>

            {activeSection === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h1 className="text-4xl font-bold font-syne mb-4">Master Sales Agent Documentation</h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Welcome to the comprehensive documentation for the Master Sales Agent platform. 
                    This project represents a paradigm shift in e-commerce, moving from static catalogs to 
                    intelligent, conversational shopping experiences.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer group" onClick={() => setActiveSection('quickstart')}>
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Quick Start</h3>
                    <p className="text-gray-600 text-sm">
                      Get up and running with the Master Sales Agent in minutes.
                    </p>
                  </Card>

                  <Card className="p-6 border border-gray-200 hover:border-purple-500 transition-colors cursor-pointer group" onClick={() => setActiveSection('system-design')}>
                    <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                      <GitBranch className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Architecture</h3>
                    <p className="text-gray-600 text-sm">
                      Deep dive into the system design and data flow.
                    </p>
                  </Card>
                </div>

                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold font-syne mt-8 mb-4">Why Master Sales Agent?</h2>
                  <p className="text-gray-700 mb-4">
                    Traditional e-commerce interfaces can be overwhelming. Our solution uses <strong>Generative AI</strong> to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Understand complex user intents (&quot;I need an outfit for a summer wedding&quot;)</li>
                    <li>Provide personalized product recommendations</li>
                    <li>Manage cart operations through natural language</li>
                    <li>Offer instant support and product details</li>
                  </ul>
                </div>

                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold font-syne mt-8 mb-4">Key Features</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-2">🤖 Intelligent Chatbot</h3>
                      <p className="text-sm text-gray-600">Powered by Gemini Pro, capable of understanding context, sentiment, and complex queries.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-2">🔍 Semantic Search</h3>
                      <p className="text-sm text-gray-600">Find products by description, occasion, or style using vector embeddings stored in Qdrant.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-2">🛒 Conversational Cart</h3>
                      <p className="text-sm text-gray-600">Add, remove, and modify cart items directly through the chat interface.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-2">⚡ Real-time Updates</h3>
                      <p className="text-sm text-gray-600">Instant UI feedback for all agent actions, ensuring a smooth user experience.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'quickstart' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h1 className="text-3xl font-bold font-syne mb-4">Quick Start Guide</h1>
                  <p className="text-lg text-gray-600">
                    Follow these steps to set up the development environment and start building.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="flex gap-2 mb-2 text-gray-500">
                      <span className="select-none">$</span>
                      <span>git clone https://github.com/your-repo/omnivers.git</span>
                    </div>
                    <div className="flex gap-2 mb-2 text-gray-500">
                      <span className="select-none">$</span>
                      <span>cd omnivers</span>
                    </div>
                    <div className="flex gap-2 text-gray-500">
                      <span className="select-none">$</span>
                      <span>npm install</span>
                    </div>
                  </div>

                  <Card className="p-6 bg-blue-50 border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-2">Prerequisites</h3>
                    <ul className="list-disc pl-5 space-y-1 text-blue-800 text-sm">
                      <li><strong>Node.js 18+</strong>: Required for the Next.js frontend.</li>
                      <li><strong>Python 3.10+</strong>: Required for the FastAPI backend and AI agents.</li>
                      <li><strong>Docker Desktop</strong>: Essential for running Qdrant (Vector DB) and PostgreSQL containers.</li>
                      <li><strong>Google Gemini API Key</strong>: Necessary for the LLM to function.</li>
                    </ul>
                  </Card>

                  <div>
                    <h3 className="text-xl font-bold font-syne mb-4">Environment Setup</h3>
                    <p className="text-gray-600 mb-4">Create a <code>.env.local</code> file in the root directory with the following variables:</p>
                    <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm text-gray-800 border border-gray-200">
                      NEXT_PUBLIC_API_URL=http://localhost:8000<br/>
                      GEMINI_API_KEY=your_api_key_here<br/>
                      QDRANT_URL=http://localhost:6333<br/>
                      DATABASE_URL=postgresql://user:password@localhost:5432/db
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-syne mb-4">Running the Application</h3>
                    <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                      <li>
                        <strong>Start Backend Services:</strong> Run <code>docker-compose up -d</code> to start Qdrant and Postgres.
                      </li>
                      <li>
                        <strong>Start API Server:</strong> Navigate to <code>/backend</code> and run <code>uvicorn main:app --reload</code>.
                      </li>
                      <li>
                        <strong>Start Frontend:</strong> In the root directory, run <code>npm run dev</code>.
                      </li>
                      <li>
                        <strong>Access App:</strong> Open <code>http://localhost:3000</code> in your browser.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'system-design' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h1 className="text-3xl font-bold font-syne mb-4">System Architecture</h1>
                  <p className="text-lg text-gray-600">
                    A high-level view of the Master Sales Agent ecosystem.
                  </p>
                </div>

                <Card className="p-8 border-2 border-gray-100 shadow-sm">
                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                      <div className="w-32 font-bold text-gray-900">Client Layer</div>
                      <div className="text-gray-600">Next.js 14 SPA • Tailwind CSS • Zustand</div>
                    </div>
                    <div className="flex justify-center text-gray-400">↓ REST API / WebSockets</div>
                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                      <div className="w-32 font-bold text-gray-900">API Gateway</div>
                      <div className="text-gray-600">FastAPI (Python) • Pydantic • Auth Middleware</div>
                    </div>
                    <div className="flex justify-center text-gray-400">↓ Orchestration</div>
                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                      <div className="w-32 font-bold text-gray-900">Agent Core</div>
                      <div className="text-gray-600">LangGraph • LangChain • Tool Definitions</div>
                    </div>
                    <div className="flex justify-center text-gray-400">↓ Intelligence & Data</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 rounded-lg bg-blue-50 text-center">
                        <div className="font-bold text-blue-900">LLM Provider</div>
                        <div className="text-blue-700 text-xs mt-1">Google Gemini Pro</div>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg bg-orange-50 text-center">
                        <div className="font-bold text-orange-900">Vector DB</div>
                        <div className="text-orange-700 text-xs mt-1">Qdrant</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeSection === 'data-flow' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h1 className="text-3xl font-bold font-syne mb-4">Data Flow & RAG</h1>
                  <p className="text-lg text-gray-600">
                    How data moves from user input to AI response.
                  </p>
                </div>

                <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 py-4">
                  <div className="relative pl-8">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
                    <h3 className="font-bold text-gray-900 mb-1">1. User Query</h3>
                    <p className="text-gray-600 text-sm">User sends a message via the Chat Interface (e.g., &quot;Show me red running shoes&quot;).</p>
                  </div>
                  
                  <div className="relative pl-8">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-purple-500 border-4 border-white shadow-sm" />
                    <h3 className="font-bold text-gray-900 mb-1">2. Intent Classification</h3>
                    <p className="text-gray-600 text-sm">The Agent analyzes if the user wants to buy, search, or ask for help.</p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-orange-500 border-4 border-white shadow-sm" />
                    <h3 className="font-bold text-gray-900 mb-1">3. Retrieval (RAG)</h3>
                    <p className="text-gray-600 text-sm">If searching, the system queries <strong>Qdrant</strong> for semantically similar products.</p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-green-500 border-4 border-white shadow-sm" />
                    <h3 className="font-bold text-gray-900 mb-1">4. Generation</h3>
                    <p className="text-gray-600 text-sm"><strong>Gemini Pro</strong> generates a response using the retrieved product data.</p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-gray-900 border-4 border-white shadow-sm" />
                    <h3 className="font-bold text-gray-900 mb-1">5. Response</h3>
                    <p className="text-gray-600 text-sm">The UI renders the text response and any interactive Product Cards.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'frontend' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h1 className="text-3xl font-bold font-syne mb-4">Frontend Technology</h1>
                  <p className="text-lg text-gray-600">
                    Built with modern web standards for performance and accessibility.
                  </p>
                </div>

                <div className="grid gap-6">
                  <Card className="p-6">
                    <h3 className="font-bold font-mono mb-4 border-b pb-2">Core Stack</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">Framework</span>
                        <Badge variant="outline">Next.js 14</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">Language</span>
                        <Badge variant="outline">TypeScript</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">Styling</span>
                        <Badge variant="outline">Tailwind CSS</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">State</span>
                        <Badge variant="outline">Zustand</Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-bold font-mono mb-4 border-b pb-2">Key Components</h3>
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <Code className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div>
                          <strong className="block text-gray-900">ChatInterface</strong>
                          <span className="text-sm text-gray-600">Real-time message list with typing indicators and auto-scroll.</span>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <Layout className="h-5 w-5 text-purple-500 flex-shrink-0" />
                        <div>
                          <strong className="block text-gray-900">ProductCard</strong>
                          <span className="text-sm text-gray-600">Reusable component for displaying products in grid or chat.</span>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <Menu className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <div>
                          <strong className="block text-gray-900">CartDrawer</strong>
                          <span className="text-sm text-gray-600">Slide-out panel for managing cart items without leaving the page.</span>
                        </div>
                      </li>
                    </ul>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === 'backend' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h1 className="text-3xl font-bold font-syne mb-4">Backend & AI Infrastructure</h1>
                  <p className="text-lg text-gray-600">
                    Scalable microservices architecture powered by Python.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 border-t-4 border-t-blue-500">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Server className="h-5 w-5" /> API Server
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Built with <strong>FastAPI</strong> for high performance and async support. Handles all client requests and manages WebSocket connections.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>FastAPI</Badge>
                      <Badge>Pydantic</Badge>
                      <Badge>Uvicorn</Badge>
                    </div>
                  </Card>

                  <Card className="p-6 border-t-4 border-t-purple-500">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Brain className="h-5 w-5" /> AI Engine
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Orchestrated using <strong>LangChain</strong> and <strong>LangGraph</strong> to manage agent state and tool execution.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Gemini Pro</Badge>
                      <Badge variant="secondary">LangGraph</Badge>
                    </div>
                  </Card>

                  <Card className="p-6 border-t-4 border-t-orange-500 md:col-span-2">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Database className="h-5 w-5" /> Data Storage
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded">
                        <strong className="block text-gray-900 mb-1">PostgreSQL</strong>
                        <span className="text-sm text-gray-600">Relational data (Orders, Users, Inventory).</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <strong className="block text-gray-900 mb-1">Qdrant</strong>
                        <span className="text-sm text-gray-600">Vector database for product embeddings and semantic search.</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
