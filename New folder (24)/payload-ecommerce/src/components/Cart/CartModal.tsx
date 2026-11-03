'use client'

import { Price } from '@/components/Price'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import { DeleteItemButton } from './DeleteItemButton'
import { EditItemQuantityButton } from './EditItemQuantityButton'
import { OpenCartButton } from './OpenCart'
import { Button } from '@/components/ui/button'
import { Product } from '@/payload-types'

export function CartModal() {
  const { cart } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    // Close the cart modal when the pathname changes.
    setIsOpen(false)
  }, [pathname])

  const totalQuantity = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return undefined
    return cart.items.reduce((quantity, item) => (item.quantity || 0) + quantity, 0)
  }, [cart])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <OpenCartButton quantity={totalQuantity} />
      </SheetTrigger>

      <SheetContent className="flex flex-col bg-black/60 backdrop-blur-3xl border-l-white/10 text-white shadow-2xl">
        <SheetHeader>
          <SheetTitle>My Cart</SheetTitle>

          <SheetDescription>Manage your cart here, add items to view the total.</SheetDescription>
        </SheetHeader>

        {!cart || cart?.items?.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-4 justify-center h-full">
            <div className="bg-white/5 p-6 rounded-full border border-white/10">
              <ShoppingCart className="h-12 w-12 text-white/50" />
            </div>
            <p className="text-center text-xl font-medium text-white/80">Your cart is empty</p>
          </div>
        ) : (
          <div className="grow flex px-4">
            <div className="flex flex-col justify-between w-full">
              <ul className="grow overflow-auto py-4">
                {cart?.items?.map((item, i) => {
                  const product = item.product
                  const variant = item.variant

                  if (typeof product !== 'object' || !item || !product || !product.slug)
                    return <React.Fragment key={i} />

                  const metaImage =
                    product.meta?.image && typeof product.meta?.image === 'object'
                      ? product.meta.image
                      : undefined

                  const firstGalleryImage =
                    typeof product.gallery?.[0]?.image === 'object'
                      ? product.gallery?.[0]?.image
                      : undefined

                  let image = firstGalleryImage || metaImage
                  let price = product.priceInUSD

                  const isVariant = Boolean(variant) && typeof variant === 'object'

                  if (isVariant) {
                    price = variant?.priceInUSD

                    const imageVariant = product.gallery?.find((item: any) => {
                      if (!item.variantOption) return false
                      const variantOptionID =
                        typeof item.variantOption === 'object'
                          ? item.variantOption.id
                          : item.variantOption

                      const hasMatch = variant?.options?.some((option: any) => {
                        if (typeof option === 'object') return option.id === variantOptionID
                        else return option === variantOptionID
                      })

                      return hasMatch
                    })

                    if (imageVariant && typeof imageVariant.image === 'object') {
                      image = imageVariant.image
                    }
                  }

                  return (
                    <li className="flex w-full flex-col group" key={i}>
                      <div className="relative flex w-full flex-row justify-between px-2 py-4 bg-white/5 hover:bg-white/10 transition-colors border border-white/5 rounded-2xl mb-3 backdrop-blur-md">
                        <div className="absolute z-40 -mt-2 ml-[55px]">
                          <DeleteItemButton item={item} />
                        </div>
                        <Link
                          className="z-30 flex flex-row space-x-4"
                          href={`/products/${(item.product as Product)?.slug}`}
                        >
                          <div className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black/40">
                            {image?.url && (
                              <Image
                                alt={image?.alt || product?.title || ''}
                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                height={94}
                                src={image.url}
                                width={94}
                              />
                            )}
                          </div>

                          <div className="flex flex-1 flex-col text-base pt-1">
                            <span className="leading-tight font-medium text-white">{product?.title}</span>
                            {isVariant && variant ? (
                              <p className="text-sm text-white/60 capitalize mt-1">
                                {variant.options?.map((option: any) => {
                                    if (typeof option === 'object') return option.label
                                    return null
                                  })
                                  .join(', ')}
                              </p>
                            ) : null}
                          </div>
                        </Link>
                        <div className="flex h-20 flex-col justify-between pt-1">
                          {typeof price === 'number' && (
                            <Price
                              amount={price}
                              className="flex justify-end space-y-2 text-right font-semibold text-white"
                            />
                          )}
                          <div className="ml-auto flex h-9 flex-row items-center rounded-lg border border-white/10 bg-black/40 text-white">
                            <EditItemQuantityButton item={item} type="minus" />
                            <p className="w-8 text-center flex items-center justify-center">
                              <span className="w-full text-sm font-medium">{item.quantity}</span>
                            </p>
                            <EditItemQuantityButton item={item} type="plus" />
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className="px-4">
                <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                  {typeof cart?.subtotal === 'number' && (
                    <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4 pt-1">
                      <p className="text-white/80 font-medium">Subtotal</p>
                      <Price
                        amount={cart?.subtotal}
                        className="text-right text-xl font-bold text-white"
                      />
                    </div>
                  )}

                  <Button asChild>
                    <Link className="w-full" href="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
