import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { OrderItem } from '@/components/OrderItem'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

export default async function Orders() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  let orders: Order[] | null = null

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your orders.')}`)
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (error) {}

  return (
    <div className="flex flex-col max-w-5xl mx-auto">
      <div className="p-8 md:p-12 rounded-2xl bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent mb-8">Order History</h1>
        
        {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
          <div className="p-8 rounded-xl bg-background/50 border border-white/5 backdrop-blur-sm text-center">
            <p className="text-muted-foreground text-lg">You have no orders yet.</p>
          </div>
        )}

        {orders && orders.length > 0 && (
          <ul className="flex flex-col gap-6">
            {orders?.map((order, index) => (
              <li key={order.id} className="p-6 rounded-xl bg-background/50 border border-white/5 backdrop-blur-sm hover:border-primary/50 transition-colors shadow-sm">
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Your orders.',
  openGraph: mergeOpenGraph({
    title: 'Orders',
    url: '/orders',
  }),
  title: 'Orders',
}
