import { cn } from '@/utilities/cn'
import React from 'react'

import type { Product } from '@/payload-types'

import { ProductGridItem } from '../ProductGridItem'

export type Props = {
  posts: Product[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('container px-4 py-8')}>
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-1" key={index}>
                  <ProductGridItem product={result} />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
