'use client'

import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  className?: string
}

export const AccountNav: React.FC<Props> = ({ className }) => {
  const pathname = usePathname()

  return (
    <div className={clsx(className)}>
      <ul className="flex flex-col gap-3">
        <li>
          <Link
            href="/account"
            className={clsx(
              'flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-medium',
              pathname === '/account'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            )}
          >
            Account Settings
          </Link>
        </li>

        <li>
          <Link
            href="/orders"
            className={clsx(
              'flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-medium',
              pathname === '/orders' || pathname.includes('/orders')
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            )}
          >
            Order History
          </Link>
        </li>
      </ul>

      <hr className="w-full border-white/10 my-4" />

      <Link
        href="/logout"
        className={clsx(
          'flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-medium',
          pathname === '/logout'
            ? 'bg-destructive text-destructive-foreground'
            : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
        )}
      >
        Log out
      </Link>
    </div>
  )
}
