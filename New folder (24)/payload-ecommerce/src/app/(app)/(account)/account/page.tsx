import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { AccountForm } from '@/components/forms/AccountForm'
import { Order } from '@/payload-types'
import { OrderItem } from '@/components/OrderItem'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  let orders: Order[] | null = null

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Please login to access your account settings.')}`,
    )
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 5,
      user,
      overrideAccess: false,
      pagination: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (error) {
    // when deploying this template on Payload Cloud, this page needs to build before the APIs are live
    // so swallow the error here and simply render the page with fallback data where necessary
    // in production you may want to redirect to a 404  page or at least log the error somewhere
    // console.error(error)
  }

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto">
      <div className="p-8 md:p-12 rounded-2xl bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent mb-8">Account Settings</h1>
        <AccountForm />
      </div>

      <div className="p-8 md:p-12 rounded-2xl bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl relative overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent mb-6">Recent Orders</h2>

        <div className="prose dark:prose-invert mb-8 text-muted-foreground leading-relaxed">
          <p>
            These are the most recent orders you have placed. Each order is associated with a payment. 
            As you place more orders, they will appear in your orders list.
          </p>
        </div>

        {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
          <div className="p-6 rounded-xl bg-background/50 border border-white/5 backdrop-blur-sm text-center">
            <p className="text-muted-foreground">You have no orders yet.</p>
          </div>
        )}

        {orders && orders.length > 0 && (
          <ul className="flex flex-col gap-6 mb-8">
            {orders?.map((order, index) => (
              <li key={order.id} className="p-4 rounded-xl bg-background/50 border border-white/5 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <Button asChild variant="default" className="shadow-lg">
            <Link href="/orders">View all orders</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Account',
    url: '/account',
  }),
  title: 'Account',
}
