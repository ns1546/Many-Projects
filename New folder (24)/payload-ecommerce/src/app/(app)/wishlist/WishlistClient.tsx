'use client'

import React, { useEffect, useState } from 'react'
import { useWishlist } from '@/providers/Wishlist'
import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import type { Product } from '@/payload-types'
import { HeartCrack } from 'lucide-react'
import Link from 'next/link'

export function WishlistClient() {
  const { items } = useWishlist()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      if (items.length === 0) {
        setProducts([])
        setIsLoading(false)
        return
      }

      try {
        // Fetch products by id
        const queryIds = items.join(',')
        const res = await fetch(`/api/products?where[id][in]=${queryIds}&depth=1`)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.docs)
        }
      } catch (error) {
        console.error('Error fetching wishlist products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [items])

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (items.length === 0 || products.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6 bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-12">
        <div className="w-20 h-20 bg-black/20 rounded-full flex items-center justify-center">
          <HeartCrack className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Your wishlist is empty</h2>
          <p className="text-muted-foreground max-w-md">
            Looks like you haven't saved any items yet. Explore our collections and find something you love.
          </p>
        </div>
        <Link href="/shop" className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductGridItem key={product.id} product={product} />
      ))}
    </Grid>
  )
}
