'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query)}`)
    } else {
      router.push(`/shop`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-sm hidden md:block group">
      <input
        type="text"
        placeholder="Search for products..."
        className="w-full h-10 pl-10 pr-4 bg-background/50 border border-border/50 rounded-full text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all group-hover:bg-background/80"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
      </div>
    </form>
  )
}
