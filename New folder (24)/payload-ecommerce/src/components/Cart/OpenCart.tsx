import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { ShoppingBag } from 'lucide-react'
import React from 'react'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  return (
    <Button
      variant="nav"
      size="clear"
      className={clsx("relative flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors duration-300 group", className)}
      {...rest}
    >
      <ShoppingBag className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
      {quantity ? (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
          {quantity}
        </span>
      ) : null}
    </Button>
  )
}
