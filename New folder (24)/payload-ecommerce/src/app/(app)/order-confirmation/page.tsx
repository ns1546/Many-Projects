import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export const metadata = {
  title: 'Order Confirmed | Payload Commerce',
  description: 'Your order has been placed successfully.',
  openGraph: mergeOpenGraph({
    title: 'Order Confirmed',
    url: '/order-confirmation',
  }),
}

export default function OrderConfirmationPage({ searchParams }: { searchParams: { demo?: string } }) {
  const isDemo = searchParams.demo === 'true'

  return (
    <div className="container py-24 min-h-[80vh] flex items-center justify-center">
      <div className="max-w-xl mx-auto w-full relative">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/20 rounded-full blur-[80px] -z-10 pointer-events-none" />
        
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-8">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Order Confirmed!</h1>
          
          <p className="text-muted-foreground text-lg">
            {isDemo 
              ? "Thank you for trying out the demo checkout. Your mock order has been placed successfully!" 
              : "Thank you for your purchase. We've sent a confirmation email with your order details."}
          </p>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8 shadow-xl">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link href="/orders">View Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
