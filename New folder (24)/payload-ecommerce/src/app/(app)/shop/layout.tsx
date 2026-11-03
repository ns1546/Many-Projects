import { Categories } from '@/components/layout/search/Categories'
import { FilterList } from '@/components/layout/search/filter'
import { sorting } from '@/lib/constants'
import { Search } from '@/components/Search'
import React, { Suspense } from 'react'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Background glow for shop page */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
      
      <Suspense fallback={null}>
        <div className="container flex flex-col gap-12 my-12 pb-16">
          <div className="flex flex-col gap-6 md:gap-8 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Explore Collection
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Discover our premium selection of curated products designed for those who appreciate the extraordinary.
            </p>
            <div className="w-full md:w-[400px]">
              <Search className="h-12 text-lg shadow-2xl" />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-16">
            <div className="w-full flex-none flex flex-col gap-8 basis-1/4 sticky top-28 p-6 rounded-2xl bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 shadow-xl">
              <div>
                <h3 className="font-semibold text-lg mb-4 text-foreground/90 uppercase tracking-widest text-xs">Categories</h3>
                <Categories />
              </div>
              <div className="h-px w-full bg-border/50" />
              <div>
                <h3 className="font-semibold text-lg mb-4 text-foreground/90 uppercase tracking-widest text-xs">Sort by</h3>
                <FilterList list={sorting} title="" />
              </div>
            </div>
            
            <div className="w-full lg:basis-3/4">
              {children}
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  )
}
