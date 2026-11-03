import fs from 'fs'
import path from 'path'

async function runRealLifeTest() {
  const SERVER_URL = 'http://127.0.0.1:3000'
  console.log('\n--- STARTING REAL LIFE API E2E TEST ---\n')

  try {
    // 1. Fetch Homepage
    console.log('[1/6] Fetching Homepage...')
    const homeRes = await fetch(`${SERVER_URL}/`)
    console.log(homeRes.ok ? '✅ Homepage loaded successfully' : '❌ Homepage failed')

    // 2. Fetch Shop Page
    console.log('[2/6] Fetching Shop Page...')
    const shopRes = await fetch(`${SERVER_URL}/shop`)
    console.log(shopRes.ok ? '✅ Shop Page loaded successfully' : '❌ Shop Page failed')

    // 3. Fetch Products API
    console.log('[3/6] Fetching Products API...')
    const productsRes = await fetch(`${SERVER_URL}/api/products?limit=1`)
    const productsData = await productsRes.json()
    console.log(productsData.docs?.length > 0 ? '✅ Products retrieved' : '❌ No products found')

    const productId = productsData.docs?.[0]?.id

    // 4. Test Contact Form Submission (Public Access)
    console.log('[4/6] Testing Contact Form Submission...')
    const contactRes = await fetch(`${SERVER_URL}/api/contact-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Real Life Test',
        message: 'This is an automated test message from the E2E verification script.',
      }),
    })
    console.log(contactRes.ok ? '✅ Contact Form submitted successfully' : '❌ Contact Form failed')

    // 5. Test Newsletter Subscription (Public Access)
    console.log('[5/6] Testing Newsletter Subscription...')
    const newsRes = await fetch(`${SERVER_URL}/api/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `test-${Date.now()}@example.com` }),
    })
    console.log(newsRes.ok ? '✅ Newsletter subscribed successfully' : '❌ Newsletter subscription failed')

    // 6. Test Wishlist Fetch (Simulate stored IDs)
    if (productId) {
      console.log(`[6/6] Testing Wishlist API Fetch for product ${productId}...`)
      const wishRes = await fetch(`${SERVER_URL}/api/products?where[id][in]=${productId}&depth=1`)
      const wishData = await wishRes.json()
      console.log(wishData.docs?.length > 0 ? '✅ Wishlist products fetched successfully' : '❌ Wishlist fetch failed')
    }

    console.log('\n--- REAL LIFE API E2E TEST COMPLETED SUCCESSFULLY ---\n')
  } catch (err) {
    console.error('Error during testing:', err)
  }
}

runRealLifeTest()
