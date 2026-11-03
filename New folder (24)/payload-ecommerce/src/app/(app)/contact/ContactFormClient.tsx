'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function ContactFormClient() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Message sent! We will get back to you shortly.')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      toast.error('Could not send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-white/80">Full Name</label>
          <input 
            id="name" 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-white/30" 
            placeholder="John Doe" 
            required 
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white/80">Email Address</label>
          <input 
            id="email" 
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-white/30" 
            placeholder="john@example.com" 
            required 
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-white/80">Subject</label>
        <input 
          id="subject" 
          type="text" 
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-white/30" 
          placeholder="How can we help?" 
          required 
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-white/80">Message</label>
        <textarea 
          id="message" 
          rows={6} 
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-white/30 resize-none" 
          placeholder="Tell us more about your inquiry..." 
          required 
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground font-semibold rounded-xl px-4 py-6 hover:opacity-90 transition-opacity">
        {isLoading ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  )
}
