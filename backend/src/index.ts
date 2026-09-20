import { createApp } from './app.js'
import { env } from './config/env.js'
import { ensurePrimaryFarmColumn } from './modules/auth/auth.repository.js'

async function main() {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required. Add it to backend/.env')
  }

  await ensurePrimaryFarmColumn()
  const app = createApp()
  app.listen(env.port, () => {
    console.log(`Coco Care backend running on http://localhost:${env.port}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
