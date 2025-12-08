'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Star, Grid, Globe, Zap } from 'lucide-react'

export default function Home() {
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
                <Link href="/chat">
                  <Button className="bg-black text-white px-6 py-4 font-mono shadow-retro border-2 border-black">
                    Start Shopping
                  </Button>
                </Link>
                <Link href="/documentation">
                  <Button variant="outline" className="px-6 py-4 font-mono border-2 border-border">
                    Contact Sales
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-border shadow-retro">FD</div>
                  <div>
                    <div className="font-bold">Used by teams</div>
                    <div className="text-xs">1000+ customers</div>
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

      {/* Features */}
      <section className="container mx-auto px-6 lg:px-16 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-syne font-bold">Everything you need to stay organized</h2>
          <p className="mt-4 text-lg font-medium text-muted-foreground">AI chat, product discovery, and a retro-inspired storefront — built to convert.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white border-2 border-border rounded-lg shadow-retro text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary text-white rounded-md mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-bold font-mono">Global Catalog</h3>
            <p className="mt-2 text-sm font-medium text-muted-foreground">Organize products and manage inventory with ease.</p>
          </div>

          <div className="p-6 bg-white border-2 border-border rounded-lg shadow-retro text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary text-white rounded-md mb-4">
              <Grid className="w-6 h-6" />
            </div>
            <h3 className="font-bold font-mono">Custom Workflows</h3>
            <p className="mt-2 text-sm font-medium text-muted-foreground">Define funnels and automate follow-ups using conversational flows.</p>
          </div>

          <div className="p-6 bg-white border-2 border-border rounded-lg shadow-retro text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary text-white rounded-md mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold font-mono">Fast Integrations</h3>
            <p className="mt-2 text-sm font-medium text-muted-foreground">Connect with payment gateways, analytics and shipping providers.</p>
          </div>

          <div className="p-6 bg-white border-2 border-border rounded-lg shadow-retro text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary text-white rounded-md mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold font-mono">AI Sales Agent</h3>
            <p className="mt-2 text-sm font-medium text-muted-foreground">Guide customers, recommend products and close deals — conversationally.</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 border-t-2 border-border">
        <div className="container mx-auto px-6 lg:px-16 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold font-syne">Ready to get started?</h3>
            <p className="text-muted-foreground font-medium mt-2">Launch your first conversational storefront in minutes.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/chat">
              <Button className="bg-black text-white px-5 py-3 font-mono border-2 border-black">Start Free</Button>
            </Link>
            <Link href="/documentation">
              <Button variant="outline" className="px-5 py-3 font-mono border-2 border-border">Talk to Sales</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="mt-auto py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">© {new Date().getFullYear()} Master Sales Agent — Built with a retro aesthetic</div>
      </footer>
    </div>
  )
}