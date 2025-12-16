'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Star, Grid, Globe, Zap } from 'lucide-react'
import { useAuthContext } from '@/context/auth-context'

export default function Home() {
  const { user } = useAuthContext()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-16 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center text-sm font-mono font-bold uppercase bg-primary/10 text-primary rounded-full px-3 py-1 mb-4">
                <Star className="w-4 h-4 mr-2" /> Conversational Retail AI
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-syne font-bold leading-tight">
                Master sales conversations, convert customers faster
              </h1>

              <p className="mt-6 text-lg font-medium text-muted-foreground max-w-2xl">
                Blend a friendly AI sales assistant with a sleek retro shopping UI. Help customers discover, ask, and buy — all from one delightful experience.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href={user ? "/chat" : "/login"}>
                  <Button className="bg-black text-white px-6 py-4 font-mono shadow-retro border-2 border-black hover:bg-[#FF5E5B] transition-all">
                    Start Shopping
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-[#FF5E5B] text-white px-6 py-4 font-mono shadow-retro border-2 border-black hover:bg-[#00CCBF] transition-all">
                    Sign Up Free
                  </Button>
                </Link>
                <Link href="/documentation">
                  <Button variant="outline" className="px-6 py-4 font-mono border-2 border-border hover:bg-accent transition-all">
                    Contact Sales
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 bg-white rounded-full overflow-hidden border-2 border-border shadow-retro">
                    <Image 
                      src="/images/logo.jpg" 
                      alt="ABFRL Logo" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold">Trusted by</div>
                    <div className="text-xs">ABFRL & Partners</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl overflow-hidden border-2 border-border shadow-retro bg-white">
                <div className="border-b-2 border-border bg-muted/20 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/20" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/20" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/20" />
                  </div>
                  <div className="ml-4 text-xs font-mono font-bold text-muted-foreground flex-1 text-center mr-12">
                    demo-preview.mp4
                  </div>
                </div>
                <div className="aspect-video bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/90EZf3vSMHY?si=Gc3IXXGPsp9GAH1C"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="border-y-4 border-border bg-gradient-to-br from-[#FFD166] to-[#00CCBF] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,.1) 20px, rgba(0,0,0,.1) 40px)'
        }} />
        <div className="container mx-auto px-6 lg:px-16 py-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold font-mono text-black mb-2">10K+</div>
              <div className="text-sm md:text-base font-bold uppercase text-black/80 font-mono">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold font-mono text-black mb-2">98%</div>
              <div className="text-sm md:text-base font-bold uppercase text-black/80 font-mono">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold font-mono text-black mb-2">24/7</div>
              <div className="text-sm md:text-base font-bold uppercase text-black/80 font-mono">AI Support</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold font-mono text-black mb-2">50K+</div>
              <div className="text-sm md:text-base font-bold uppercase text-black/80 font-mono">Products Sold</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 lg:px-16 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-block px-4 py-2 bg-primary/10 border-2 border-primary text-primary font-mono font-bold uppercase text-sm mb-4">
            Features
          </div>
          <h2 className="text-4xl md:text-5xl font-syne font-bold mb-4">Everything You Need To Sell More</h2>
          <p className="text-lg md:text-xl font-medium text-muted-foreground">AI chat, product discovery, and a retro-inspired storefront — built to convert.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group">
            <div className="w-14 h-14 flex items-center justify-center bg-[#FF5E5B] border-4 border-border text-white mb-4 shadow-retro group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
              <Globe className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold font-mono mb-2 uppercase">Global Catalog</h3>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">Organize products and manage inventory with ease. Browse through thousands of items.</p>
          </div>

          <div className="p-6 bg-white border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group">
            <div className="w-14 h-14 flex items-center justify-center bg-[#00CCBF] border-4 border-border text-white mb-4 shadow-retro group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
              <Grid className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold font-mono mb-2 uppercase">Custom Workflows</h3>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">Define funnels and automate follow-ups using conversational AI flows.</p>
          </div>

          <div className="p-6 bg-white border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group">
            <div className="w-14 h-14 flex items-center justify-center bg-[#FFD166] border-4 border-border text-black mb-4 shadow-retro group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
              <Zap className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold font-mono mb-2 uppercase">Fast Integration</h3>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">Connect with payment gateways, analytics and shipping providers instantly.</p>
          </div>

          <div className="p-6 bg-white border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group">
            <div className="w-14 h-14 flex items-center justify-center bg-black border-4 border-border text-white mb-4 shadow-retro group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
              <Star className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold font-mono mb-2 uppercase">AI Sales Agent</h3>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">Guide customers, recommend products and close deals conversationally.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#f0f0f0] border-y-4 border-border py-20">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 border-2 border-primary text-primary font-mono font-bold uppercase text-sm mb-4">
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-syne font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg md:text-xl font-medium text-muted-foreground">Real feedback from real people who love our platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-4 border-border shadow-retro p-8 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FFD166] text-[#FFD166]" />
                ))}
              </div>
              <p className="text-base font-medium mb-6 leading-relaxed">"The AI assistant helped me find exactly what I needed in seconds. The retro design is absolutely stunning!"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF5E5B] border-4 border-border flex items-center justify-center font-bold font-mono text-white">
                  PK
                </div>
                <div>
                  <div className="font-bold font-mono">Priya Kapoor</div>
                  <div className="text-sm text-muted-foreground font-mono">Fashion Enthusiast</div>
                </div>
              </div>
            </div>

            <div className="bg-white border-4 border-border shadow-retro p-8 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FFD166] text-[#FFD166]" />
                ))}
              </div>
              <p className="text-base font-medium mb-6 leading-relaxed">"Shopping has never been this easy! The chatbot understood my style preferences perfectly."</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#00CCBF] border-4 border-border flex items-center justify-center font-bold font-mono text-white">
                  RS
                </div>
                <div>
                  <div className="font-bold font-mono">Rahul Sharma</div>
                  <div className="text-sm text-muted-foreground font-mono">Regular Customer</div>
                </div>
              </div>
            </div>

            <div className="bg-white border-4 border-border shadow-retro p-8 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FFD166] text-[#FFD166]" />
                ))}
              </div>
              <p className="text-base font-medium mb-6 leading-relaxed">"Fast delivery, great quality products, and the most helpful AI shopping assistant I've ever used!"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black border-4 border-border flex items-center justify-center font-bold font-mono text-white">
                  AM
                </div>
                <div>
                  <div className="font-bold font-mono">Ananya Mehta</div>
                  <div className="text-sm text-muted-foreground font-mono">VIP Member</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 lg:px-16 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-block px-4 py-2 bg-secondary/10 border-2 border-secondary text-secondary font-mono font-bold uppercase text-sm mb-4">
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-syne font-bold mb-4">Shop Smarter in 3 Steps</h2>
          <p className="text-lg md:text-xl font-medium text-muted-foreground">From browsing to buying in just a few clicks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="relative">
            <div className="bg-white border-4 border-border shadow-retro p-8 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#FF5E5B] border-4 border-border flex items-center justify-center font-bold font-mono text-2xl text-white shadow-retro">
                1
              </div>
              <h3 className="text-xl font-bold font-mono mb-3 mt-4 uppercase">Chat With AI</h3>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                Tell our AI assistant what you're looking for. It understands natural language and your style preferences.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white border-4 border-border shadow-retro p-8 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#00CCBF] border-4 border-border flex items-center justify-center font-bold font-mono text-2xl text-white shadow-retro">
                2
              </div>
              <h3 className="text-xl font-bold font-mono mb-3 mt-4 uppercase">Browse & Select</h3>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                Get personalized product recommendations. Add items to cart with a single click. Easy size selection.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white border-4 border-border shadow-retro p-8 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#FFD166] border-4 border-border flex items-center justify-center font-bold font-mono text-2xl text-black shadow-retro">
                3
              </div>
              <h3 className="text-xl font-bold font-mono mb-3 mt-4 uppercase">Quick Checkout</h3>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                Secure payment with multiple options. Fast delivery. Track your order in real-time through the chat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative bg-black text-white border-y-4 border-border overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
        }} />
        <div className="container mx-auto px-6 lg:px-16 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold font-syne mb-6 uppercase">Ready To Start Shopping?</h2>
            <p className="text-lg md:text-xl font-medium mb-10 text-white/80">Join thousands of happy customers. Launch your shopping experience in minutes.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={user ? "/chat" : "/login"}>
                <Button className="bg-[#FF5E5B] text-white px-8 py-6 text-lg font-mono shadow-retro border-4 border-white hover:bg-[#00CCBF] transition-all">
                  START SHOPPING NOW
                </Button>
              </Link>
              <Link href="/shop">
                <Button className="bg-white text-black px-8 py-6 text-lg font-mono shadow-retro border-4 border-white hover:bg-[#FFD166] transition-all">
                  BROWSE PRODUCTS
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm font-mono font-bold">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00CCBF] border-2 border-white" />
                <span>FREE SHIPPING OVER ₹999</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FFD166] border-2 border-white" />
                <span>30 DAY RETURNS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FF5E5B] border-2 border-white" />
                <span>24/7 AI SUPPORT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#f0f0f0] border-t-4 border-border">
        <div className="container mx-auto px-6 lg:px-16 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold font-mono text-lg mb-4 uppercase">About Us</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Revolutionizing e-commerce with AI-powered conversational shopping experiences.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold font-mono text-lg mb-4 uppercase">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/shop" className="text-muted-foreground hover:text-primary font-medium transition-colors">Shop</Link></li>
                <li><Link href="/chat" className="text-muted-foreground hover:text-primary font-medium transition-colors">AI Assistant</Link></li>
                <li><Link href="/orders" className="text-muted-foreground hover:text-primary font-medium transition-colors">Track Order</Link></li>
                <li><Link href="/profile" className="text-muted-foreground hover:text-primary font-medium transition-colors">My Account</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold font-mono text-lg mb-4 uppercase">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/documentation" className="text-muted-foreground hover:text-primary font-medium transition-colors">Help Center</Link></li>
                <li><Link href="/documentation" className="text-muted-foreground hover:text-primary font-medium transition-colors">Shipping Info</Link></li>
                <li><Link href="/documentation" className="text-muted-foreground hover:text-primary font-medium transition-colors">Returns</Link></li>
                <li><Link href="/documentation" className="text-muted-foreground hover:text-primary font-medium transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold font-mono text-lg mb-4 uppercase">Connect</h3>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-black border-2 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer flex items-center justify-center">
                  <span className="text-white font-bold text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-black border-2 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer flex items-center justify-center">
                  <span className="text-white font-bold text-sm">𝕏</span>
                </div>
                <div className="w-10 h-10 bg-black border-2 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer flex items-center justify-center">
                  <span className="text-white font-bold text-sm">in</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t-4 border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground font-mono">
              © {new Date().getFullYear()} Master Sales Agent — Built with a retro aesthetic
            </div>
            <div className="flex gap-6 text-sm font-mono">
              <Link href="/documentation" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
              <Link href="/documentation" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
              <Link href="/documentation" className="text-muted-foreground hover:text-primary transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}