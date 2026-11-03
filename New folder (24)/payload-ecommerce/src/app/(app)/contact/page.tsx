import React from 'react'
import { ContactFormClient } from './ContactFormClient'

export const metadata = {
  title: 'Contact Us | Payload Commerce',
  description: 'Get in touch with our team.',
}

export default function ContactPage() {
  return (
    <div className="container py-24 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Have a question or need assistance? We're here to help.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <ContactFormClient />
        </div>
      </div>
    </div>
  )
}
