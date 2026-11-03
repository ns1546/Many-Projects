import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import Link from 'next/link'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { CreateAccountForm } from '@/components/forms/CreateAccountForm'
import { redirect } from 'next/navigation'

export default async function CreateAccount() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('You are already logged in.')}`)
  }

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-12">
      {/* Cinematic background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10" />
      </div>
      
      <div className="container relative z-10 flex justify-center">
        <div className="w-full max-w-md p-8 md:p-12 rounded-3xl bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <RenderParams />
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">Create Account</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Join us to experience the pinnacle of digital commerce.
            </p>
          </div>
          <CreateAccountForm />
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Account',
    url: '/account',
  }),
  title: 'Account',
}
