import React from 'react'
import { WishlistClient } from './WishlistClient'

export const metadata = {
  title: 'My Wishlist | Payload Commerce',
  description: 'View your saved products.',
}

export default function WishlistPage() {
  return (
    <div className="container py-24 min-h-screen">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">My Wishlist</h1>
        <p className="text-xl text-muted-foreground">
          Products you've saved for later.
        </p>
      </div>
      
      <WishlistClient />
    </div>
  )
}
