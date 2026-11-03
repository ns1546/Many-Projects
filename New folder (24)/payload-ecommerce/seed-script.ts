import { createLocalReq, getPayload } from 'payload'
import config from './src/payload.config'
import { seed } from './src/endpoints/seed'

async function run() {
  try {
    const payload = await getPayload({ config })
    const payloadReq = await createLocalReq({}, payload)
    
    console.log('Starting seed process...')
    await seed({ payload, req: payloadReq })
    console.log('Seeding complete!')
  } catch (error) {
    console.error('Error during seeding:', error)
  }
  process.exit(0)
}

run()
