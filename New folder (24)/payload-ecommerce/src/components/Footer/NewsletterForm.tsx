'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'footer-form',
        }),
      })

      if (res.ok) {
        toast.success('Thanks for subscribing!')
        setEmail('')
      } else {
        const error = await res.json()
        if (error.errors?.[0]?.message?.includes('duplicate')) {
          toast.info('You are already subscribed.')
          setEmail('')
        } else {
          throw new Error('Failed to subscribe')
        }
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <span className="font-medium text-foreground">Stay Updated</span>
      <p className="text-xs opacity-70">Subscribe for early access and latest drops.</p>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/5 border-white/10 text-sm focus-visible:ring-primary/50"
          disabled={isLoading}
          required
        />
        <Button type="submit" disabled={isLoading} className="shrink-0 transition-transform active:scale-95">
          {isLoading ? 'Wait...' : 'Subscribe'}
        </Button>
      </div>
    </form>
  )
}
