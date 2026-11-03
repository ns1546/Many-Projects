import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

export const metadata = {
  title: 'About Us | Payload Commerce',
  description: 'Learn more about our premium commerce brand.',
  openGraph: mergeOpenGraph({
    title: 'About Us | Payload Commerce',
    url: '/about',
  }),
}

export default function AboutPage() {
  return (
    <div className="container py-24 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">About Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Redefining digital commerce with a focus on cinematic aesthetics, premium quality, and seamless user experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-16">
          <div className="aspect-square relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 flex items-center justify-center text-white/20">
              {/* Cinematic Placeholder */}
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
          </div>
          <div className="space-y-6 flex flex-col justify-center">
            <h2 className="text-3xl font-semibold">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              We started with a simple idea: that an online store should be more than just a grid of products. It should be an immersive experience.
              By leveraging modern technologies like Next.js and Payload CMS, we built a storefront that feels alive, fast, and distinctly premium.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every detail, from the glassmorphic blurs to the micro-interactions on hover, has been meticulously crafted to elevate the brand and provide customers with an unparalleled shopping journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
