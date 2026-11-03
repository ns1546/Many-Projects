const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Test Business Store',
      domain: 'testbusiness.local',
      products: {
        create: [
          { name: 'Premium Leather Bag', description: 'A very nice bag', price: 120.0, stock: 50 },
          { name: 'Wireless Headphones', description: 'Noise cancelling', price: 199.99, stock: 30 }
        ]
      }
    }
  })
  
  console.log('Created test tenant:', tenant.id)
  
  // Update storefront .env file
  const fs = require('fs')
  const path = require('path')
  const envPath = path.join(__dirname, '..', '..', 'storefront', '.env')
  
  let envContent = fs.readFileSync(envPath, 'utf8')
  envContent = envContent.replace(/NEXT_PUBLIC_TENANT_ID=".*"/, `NEXT_PUBLIC_TENANT_ID="${tenant.id}"`)
  fs.writeFileSync(envPath, envContent)
  console.log('Updated storefront .env with tenant ID')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
