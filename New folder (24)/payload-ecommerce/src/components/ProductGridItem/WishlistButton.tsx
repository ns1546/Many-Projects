'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/providers/Wishlist'
import { cn } from '@/utilities/cn'
import { toast } from 'sonner'

type Props = {
  productId: string
}

export const WishlistButton: React.FC<Props> = ({ productId }) => {
  const { toggleItem, isInWishlist } = useWishlist()
  const active = isInWishlist(productId)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(productId)
    if (!active) {
      toast.success('Added to wishlist')
    } else {
      toast.info('Removed from wishlist')
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "absolute top-4 right-4 z-20 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110",
        active ? "bg-red-500/20 text-red-500" : "bg-black/20 text-white hover:bg-black/40"
      )}
      aria-label="Toggle Wishlist"
    >
      <Heart className={cn("w-5 h-5 transition-all duration-300", active && "fill-current")} />
    </button>
  )
}
