'use client'
import { CMSLink } from '@/components/Link'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import Link from 'next/link'
import React, { Suspense, useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

import { MobileMenu } from './MobileMenu'
import type { Header } from 'src/payload-types'

import { LogoIcon } from '@/components/icons/logo'
import { SearchBar } from './SearchBar'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/cn'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  const pathname = usePathname()
  
  // Override DB seeded navigation with actual functional routes for the premium store
  const menu = [
    {
      id: 'nav-shop',
      link: {
        type: 'custom',
        url: '/shop',
        label: 'Shop',
        newTab: false,
      } as const
    },
    {
      id: 'nav-account',
      link: {
        type: 'custom',
        url: '/account',
        label: 'Account',
        newTab: false,
      } as const
    }
  ]
  
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b border-transparent",
        scrolled ? "bg-background/70 backdrop-blur-xl border-border/50 shadow-sm py-2" : "bg-transparent py-4"
      )}
    >
      <nav className="flex items-center justify-between container">
        <div className="block flex-none md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full items-center gap-8 md:w-1/3">
            <Link className="flex items-center justify-center transform transition-transform hover:scale-105" href="/">
              <LogoIcon className="w-8 h-auto text-foreground" />
            </Link>
            {menu.length ? (
              <ul className="hidden gap-6 text-sm font-medium md:flex md:items-center">
                {menu.map((item) => (
                  <li key={item.id}>
                    <CMSLink
                      {...item.link}
                      size={'clear'}
                      className={cn(
                        'relative navLink text-foreground/70 hover:text-foreground transition-colors duration-300 tracking-wide',
                        {
                          'text-foreground font-semibold':
                            item.link.url && (item.link.url as string) !== '/'
                              ? pathname.includes(item.link.url)
                              : false,
                        }
                      )}
                      appearance="nav"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="ml-4 flex-1 max-w-md">
              <SearchBar />
            </div>
          </div>

          <div className="flex justify-end md:w-1/3 gap-6 items-center">
            <Link href="/wishlist" className="relative text-foreground/70 hover:text-foreground transition-colors group">
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
            <Suspense fallback={<OpenCartButton />}>
              <Cart />
            </Suspense>
          </div>
        </div>
      </nav>
    </div>
  )
}
