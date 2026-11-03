'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import { useAuth } from '@/providers/Auth'
import clsx from 'clsx'

type Review = {
  id: string
  title: string
  review: string
  rating: number
  user: { name: string }
  createdAt: string
}

export function ReviewsSection({ productId }: { productId: string }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({ title: '', review: '', rating: 5 })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/product-reviews?where[product][equals]=${productId}&where[status][equals]=published&sort=-createdAt`)
        if (res.ok) {
          const data = await res.json()
          setReviews(data.docs)
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReviews()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to leave a review.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/product-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          product: productId,
          user: user.id,
          status: 'pending', // reviews pend approval
        }),
      })

      if (res.ok) {
        toast.success('Review submitted! It will appear after approval.')
        setFormData({ title: '', review: '', rating: 5 })
      } else {
        throw new Error('Failed to submit review')
      }
    } catch (err) {
      toast.error('Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="py-12 border-t border-border/50 mt-12">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/3">
          <h2 className="text-2xl font-bold mb-6 tracking-tight">Customer Reviews</h2>
          
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-lg">Write a Review</h3>
            {user ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={clsx("transition-transform hover:scale-110", star <= formData.rating ? "text-yellow-400" : "text-muted")}
                    >
                      <Star className={clsx("w-6 h-6", star <= formData.rating ? "fill-current" : "")} />
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Review Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-black/40 border-white/10"
                  required
                />
                <textarea
                  placeholder="Tell us what you thought..."
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                  rows={4}
                  required
                />
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            ) : (
              <p className="text-muted-foreground text-sm">Please log in to leave a review.</p>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col gap-6">
          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-24 bg-white/5 rounded-2xl w-full" />
              <div className="h-24 bg-white/5 rounded-2xl w-full" />
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={clsx("w-4 h-4", i < review.rating ? "fill-current" : "text-muted")} />
                    ))}
                  </div>
                  <span className="font-semibold">{review.title}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{review.review}</p>
                <div className="text-xs text-muted-foreground opacity-60">
                  By {review.user?.name || 'Verified Customer'} on {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10">
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
