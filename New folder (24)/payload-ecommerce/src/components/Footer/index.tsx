import type { Footer } from '@/payload-types'

import { FooterMenu } from '@/components/Footer/menu'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { NewsletterForm } from './NewsletterForm'
import Link from 'next/link'
import React, { Suspense } from 'react'
import { LogoIcon } from '@/components/icons/logo'

const { COMPANY_NAME, SITE_NAME } = process.env

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()
  // Override DB seeded navigation with functional premium routes
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
      id: 'nav-about',
      link: {
        type: 'custom',
        url: '/about',
        label: 'About Us',
        newTab: false,
      } as const
    },
    {
      id: 'nav-contact',
      link: {
        type: 'custom',
        url: '/contact',
        label: 'Contact',
        newTab: false,
      } as const
    },
    {
      id: 'nav-faq',
      link: {
        type: 'custom',
        url: '/faq',
        label: 'FAQ',
        newTab: false,
      } as const
    },
    {
      id: 'nav-terms',
      link: {
        type: 'custom',
        url: '/terms',
        label: 'Terms of Service',
        newTab: false,
      } as const
    }
  ]
  const currentYear = new Date().getFullYear()
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '')
  const skeleton = 'w-full h-6 animate-pulse rounded bg-border/50'

  const copyrightName = COMPANY_NAME || SITE_NAME || ''

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border/50 bg-background/50 backdrop-blur-xl text-sm text-muted-foreground transition-colors duration-500">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent -z-10" />
      <div className="container">
        <div className="flex w-full flex-col gap-12 py-16 md:flex-row md:justify-between">
          <div className="flex flex-col gap-6 md:w-1/3">
            <Link className="flex items-center gap-3 text-foreground hover:opacity-80 transition-opacity" href="/">
              <LogoIcon className="w-8" />
              <span className="text-xl font-semibold tracking-tight">{SITE_NAME}</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed">
              Experience the pinnacle of digital commerce. Curated collections for the modern aesthetic.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-12 md:w-2/3 md:justify-end">
            <Suspense
              fallback={
                <div className="flex h-[188px] w-[200px] flex-col gap-3">
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                </div>
              }
            >
              <FooterMenu menu={menu} />
            </Suspense>
            <div className="flex flex-col gap-4">
              <span className="font-medium text-foreground">Preferences</span>
              <ThemeSelector />
            </div>
            <div className="flex flex-col md:max-w-[280px]">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50 py-8 bg-card/30">
        <div className="container flex w-full flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-mono text-xs opacity-70">
            &copy; {copyrightDate} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith('.') ? '.' : ''} All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="opacity-70">Designed for Excellence</span>
            <span className="h-4 w-px bg-border"></span>
            <a className="text-foreground hover:text-primary transition-colors" href="https://payloadcms.com">
              Powered by Payload
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
