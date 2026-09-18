import { createApp } from './app.js'
import { env } from './config/env.js'

async function main() {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required. Add it to backend/.env')
  }

  const app = createApp()
  app.listen(env.port, () => {
    console.log(`Coco Care backend running on http://localhost:${env.port}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
