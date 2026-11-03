'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useTheme } from '@/providers/Theme'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useState } from 'react'

import { cssVariables } from '@/cssVariables'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Address } from '@/payload-types'
import { Checkbox } from '@/components/ui/checkbox'
import { AddressItem } from '@/components/addresses/AddressItem'
import { FormItem } from '@/components/forms/FormItem'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const hasStripeKey = stripeKey && stripeKey !== 'undefined' && stripeKey.length > 0
const stripe = hasStripeKey ? loadStripe(stripeKey) : null

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const { theme } = useTheme()
  /**
   * State to manage the email input for guest checkout.
   */
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [paymentData, setPaymentData] = useState<null | Record<string, unknown>>(null)
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  const canGoToPayment = Boolean(
    (email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress),
  )

  // On initial load wait for addresses to be loaded and check to see if we can prefill a default one
  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const initiatePaymentIntent = useCallback(
    async (paymentID: string) => {
      try {
        const paymentData = (await initiatePayment(paymentID, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            billingAddress,
            shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
          },
        })) as Record<string, unknown>

        if (paymentData) {
          setPaymentData(paymentData)
        }
      } catch (error) {
        const errorData = error instanceof Error ? JSON.parse(error.message) : {}
        let errorMessage = 'An error occurred while initiating payment.'

        if (errorData?.cause?.code === 'OutOfStock') {
          errorMessage = 'One or more items in your cart are out of stock.'
        }

        setError(errorMessage)
        toast.error(errorMessage)
      }
    },
    [billingAddress, billingAddressSameAsShipping, shippingAddress],
  )

  const handleDemoCheckout = async () => {
    setProcessingPayment(true)
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Demo Order placed successfully!')
    router.push('/order-confirmation?demo=true')
  }

  // Remove the early return so the page renders even without Stripe.
  // if (!stripe) return null
  
  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-12 w-full items-center justify-center">
        <div className="prose dark:prose-invert text-center max-w-none self-center mb-8">
          <p>Processing your payment...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="prose dark:prose-invert py-12 w-full items-center">
        <p>Your cart is empty.</p>
        <Link href="/search">Continue shopping?</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch justify-stretch my-12 md:flex-row grow gap-10 lg:gap-12 max-w-7xl mx-auto px-4 md:px-8">
      <div className="basis-full lg:basis-2/3 flex flex-col gap-10 justify-stretch relative">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 pointer-events-none" />
        
        <h2 className="font-bold text-3xl tracking-tight">Contact</h2>
          {!user && (
            <div className="bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl w-full flex flex-col md:flex-row items-center gap-6">
              <div className="prose dark:prose-invert flex-grow">
                <p className="text-muted-foreground m-0">Sign in for a faster checkout experience.</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button asChild className="w-full md:w-auto shadow-md" variant="default">
                  <Link href="/login">Log in</Link>
                </Button>
                <span className="text-muted-foreground text-sm">or</span>
                <Link href="/create-account" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap">
                  Sign up
                </Link>
              </div>
            </div>
          )}
        {user ? (
          <div className="bg-accent dark:bg-card rounded-lg p-4 ">
            <div>
              <p>{user.email}</p>{' '}
              <p>
                Not you?{' '}
                <Link className="underline" href="/logout">
                  Log out
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-accent dark:bg-black rounded-lg p-4 ">
            <div>
              <p className="mb-4">Enter your email to checkout as a guest.</p>

              <FormItem className="mb-6">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  disabled={!emailEditable}
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </FormItem>

              <Button
                disabled={!email || !emailEditable}
                onClick={(e) => {
                  e.preventDefault()
                  setEmailEditable(false)
                }}
                variant="default"
              >
                Continue as guest
              </Button>
            </div>
          </div>
        )}

        <h2 className="font-bold text-3xl tracking-tight mt-8">Address</h2>
        <div className="bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl flex flex-col gap-6">
            <h3 className="text-xl font-semibold text-foreground/80">Billing Information</h3>
            {billingAddress ? (
              <div className="bg-background/40 rounded-xl p-4 border border-white/5">
                <AddressItem
                  actions={
                    <Button
                      variant={'outline'}
                      className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      disabled={Boolean(paymentData)}
                      onClick={(e) => {
                        e.preventDefault()
                        setBillingAddress(undefined)
                      }}
                    >
                      Remove
                    </Button>
                  }
                  address={billingAddress}
                />
              </div>
            ) : user ? (
              <CheckoutAddresses heading="Billing address" setAddress={setBillingAddress} />
            ) : (
              <CreateAddressModal
                disabled={!email || Boolean(emailEditable)}
                callback={(address) => {
                  setBillingAddress(address)
                }}
                skipSubmission={true}
              />
            )}

            <div className="flex gap-4 items-center mt-2 p-4 bg-black/5 dark:bg-white/5 rounded-xl">
              <Checkbox
                id="shippingTheSameAsBilling"
                className="w-5 h-5 rounded-md"
                checked={billingAddressSameAsShipping}
                disabled={Boolean(paymentData || (!user && (!email || Boolean(emailEditable))))}
                onCheckedChange={(state) => {
                  setBillingAddressSameAsShipping(state as boolean)
                }}
              />
              <Label htmlFor="shippingTheSameAsBilling" className="text-base font-medium cursor-pointer">Shipping is the same as billing</Label>
            </div>

            {!billingAddressSameAsShipping && (
              <div className="mt-4 pt-6 border-t border-white/10">
                <h3 className="text-xl font-semibold text-foreground/80 mb-6">Shipping Information</h3>
                {shippingAddress ? (
                  <div className="bg-background/40 rounded-xl p-4 border border-white/5">
                    <AddressItem
                      actions={
                        <Button
                          variant={'outline'}
                          className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          disabled={Boolean(paymentData)}
                          onClick={(e) => {
                            e.preventDefault()
                            setShippingAddress(undefined)
                          }}
                        >
                          Remove
                        </Button>
                      }
                      address={shippingAddress}
                    />
                  </div>
                ) : user ? (
                  <CheckoutAddresses
                    heading="Shipping address"
                    description="Please select a shipping address."
                    setAddress={setShippingAddress}
                  />
                ) : (
                  <CreateAddressModal
                    callback={(address) => {
                      setShippingAddress(address)
                    }}
                    disabled={!email || Boolean(emailEditable)}
                    skipSubmission={true}
                  />
                )}
              </div>
            )}
          </div>

        {!paymentData && (
          <div className="mt-4">
            {hasStripeKey ? (
              <Button
                size="lg"
                className="w-full md:w-auto px-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                disabled={!canGoToPayment}
                onClick={(e) => {
                  e.preventDefault()
                  void initiatePaymentIntent('stripe')
                }}
              >
                Proceed to Payment
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full md:w-auto px-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all bg-green-600 hover:bg-green-700 text-white"
                disabled={!canGoToPayment || isProcessingPayment}
                onClick={(e) => {
                  e.preventDefault()
                  handleDemoCheckout()
                }}
              >
                {isProcessingPayment ? 'Processing...' : 'Complete Demo Order (No Stripe)'}
              </Button>
            )}
          </div>
        )}

        {!paymentData?.['clientSecret'] && error && (
          <div className="my-8">
            <Message error={error} />

            <Button
              onClick={(e) => {
                e.preventDefault()
                router.refresh()
              }}
              variant="default"
            >
              Try again
            </Button>
          </div>
        )}

        <Suspense fallback={<React.Fragment />}>
          {/* @ts-ignore */}
          {paymentData && paymentData?.['clientSecret'] && (
            <div className="mt-8 bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl">
              <h2 className="font-bold text-3xl tracking-tight mb-6">Payment</h2>
              {error && <p className="text-destructive mb-4">{`Error: ${error}`}</p>}
              <Elements
                options={{
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      borderRadius: '12px',
                      colorPrimary: cssVariables.colors.base1000,
                      gridColumnSpacing: '24px',
                      gridRowSpacing: '24px',
                      colorBackground: theme === 'dark' ? '#111111' : '#f8f8f8',
                      colorDanger: cssVariables.colors.error500,
                      colorDangerText: cssVariables.colors.error500,
                      colorIcon: theme === 'dark' ? '#ffffff' : '#000000',
                      colorText: theme === 'dark' ? '#ffffff' : '#000000',
                      colorTextPlaceholder: '#858585',
                      fontFamily: 'Inter, Geist, sans-serif',
                      fontSizeBase: '16px',
                      fontWeightBold: '600',
                      fontWeightNormal: '400',
                      spacingUnit: '6px',
                    },
                  },
                  clientSecret: paymentData['clientSecret'] as string,
                }}
                stripe={stripe}
              >
                <div className="flex flex-col gap-8">
                  <CheckoutForm
                    customerEmail={email}
                    billingAddress={billingAddress}
                    setProcessingPayment={setProcessingPayment}
                  />
                  <Button
                    variant="ghost"
                    className="self-start text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    onClick={() => setPaymentData(null)}
                  >
                    Cancel payment
                  </Button>
                </div>
              </Elements>
            </div>
          )}
        </Suspense>
      </div>

      {!cartIsEmpty && (
        <div className="basis-full lg:basis-1/3 lg:pl-10 relative">
          <div className="sticky top-24 p-8 border border-white/10 bg-white/5 dark:bg-black/30 backdrop-blur-xl flex flex-col gap-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-bold tracking-tight">Order Summary</h2>
            <div className="flex flex-col gap-6">
            {cart?.items?.map((item, index) => {
              if (typeof item.product === 'object' && item.product) {
                const {
                  product,
                  product: { id, meta, title, gallery },
                  quantity,
                  variant,
                } = item

                if (!quantity) return null

                let image = gallery?.[0]?.image || meta?.image
                let price = product?.priceInUSD

                const isVariant = Boolean(variant) && typeof variant === 'object'

                if (isVariant) {
                  price = variant?.priceInUSD

                  const imageVariant = product.gallery?.find((item: any) => {
                    if (!item.variantOption) return false
                    const variantOptionID =
                      typeof item.variantOption === 'object'
                        ? item.variantOption.id
                        : item.variantOption

                    const hasMatch = variant?.options?.some((option: any) => {
                      if (typeof option === 'object') return option.id === variantOptionID
                      else return option === variantOptionID
                    })

                    return hasMatch
                  })

                  if (imageVariant && typeof imageVariant.image !== 'string') {
                    image = imageVariant.image
                  }
                }

                return (
                  <div className="flex items-center gap-4 group" key={index}>
                    <div className="flex items-center justify-center h-20 w-20 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-white/5 overflow-hidden relative">
                      {image && typeof image !== 'string' && (
                        <Media className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" fill imgClassName="rounded-lg object-contain" resource={image} />
                      )}
                    </div>
                    <div className="flex flex-col grow gap-1 justify-center">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-semibold text-foreground line-clamp-2 leading-tight">{title}</p>
                        {typeof price === 'number' && <Price className="font-medium whitespace-nowrap" amount={price} />}
                      </div>
                      
                      {variant && typeof variant === 'object' && (
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {variant.options
                            ?.map((option: any) => {
                              if (typeof option === 'object') return option.label
                              return null
                            })
                            .join(', ')}
                        </p>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">
                        Qty: {quantity}
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })}
            </div>
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            
            <div className="flex justify-between items-end gap-2">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total</span>{' '}
              <Price className="text-3xl font-bold tracking-tighter" amount={cart.subtotal || 0} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
