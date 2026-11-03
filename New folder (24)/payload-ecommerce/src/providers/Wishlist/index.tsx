'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type WishlistContextType = {
  items: string[]
  toggleItem: (id: string) => void
  isInWishlist: (id: string) => boolean
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  toggleItem: () => {},
  isInWishlist: () => false,
})

export const useWishlist = () => useContext(WishlistContext)

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const stored = localStorage.getItem('payload-wishlist')
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const toggleItem = (id: string) => {
    setItems((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      localStorage.setItem('payload-wishlist', JSON.stringify(next))
      return next
    })
  }

  const isInWishlist = (id: string) => items.includes(id)

  return (
    <WishlistContext.Provider value={{ items: isMounted ? items : [], toggleItem, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}
