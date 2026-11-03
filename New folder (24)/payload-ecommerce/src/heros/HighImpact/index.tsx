'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className="relative flex items-center justify-center text-white min-h-[90vh] overflow-hidden -mt-[10.4rem]"
      data-theme="dark"
    >
      {/* Background Overlay for Cinematic Feel */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 mix-blend-multiply" />
      
      {/* Animated Glow Effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/20 rounded-full blur-[150px] mix-blend-screen opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="container z-10 relative flex flex-col items-center justify-center px-4 pt-48 pb-16">
        <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-forwards">
          
          {/* Glassmorphism Badge */}
          <div className="inline-flex items-center px-5 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-sm font-medium tracking-wide text-white/90 uppercase mb-4 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <span className="w-2 h-2 rounded-full bg-white mr-3 animate-pulse" />
            New Collection Arrived
          </div>

          <div className="prose prose-invert prose-h1:text-6xl md:prose-h1:text-8xl prose-h1:font-light prose-h1:tracking-tighter prose-h1:leading-tight prose-p:text-xl md:prose-p:text-2xl prose-p:text-white/80 prose-p:font-light">
            {richText && <RichText data={richText} enableGutter={false} />}
          </div>

          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-col sm:flex-row justify-center gap-6 mt-12 w-full max-w-lg pt-8">
              {links.map(({ link }, i) => {
                return (
                  <li key={i} className="w-full sm:w-auto flex-1 flex justify-center">
                    <CMSLink {...link} className="!bg-white !text-black !rounded-full hover:!scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)] !px-10 !py-6 !text-lg" />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="absolute inset-0 select-none -z-10">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="object-cover w-full h-full transform scale-105 transition-transform duration-[20s] ease-out hover:scale-110" priority resource={media} />
        )}
      </div>
    </div>
  )
}
