import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './modules/auth/auth.routes.js'
import farmerRoutes from './modules/farmer/farmer.routes.js'
import diagnosisRoutes from './modules/diagnosis/diagnosis.routes.js'
import reportsRoutes from './modules/reports/reports.routes.js'
import diseaseMapRoutes from './modules/diseaseMap/diseaseMap.routes.js'
import chatRoutes from './modules/chat/chat.routes.js'
import adminRoutes from './modules/admin/admin.routes.js'
import weatherRoutes from './modules/weather/weather.routes.js'
import knowledgeRoutes from './modules/knowledge/knowledge.routes.js'
import notificationsRoutes from './modules/notifications/notifications.routes.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.frontendOrigins.includes(origin)) {
          callback(null, true)
          return
        }

        callback(new Error(`CORS origin not allowed: ${origin}`))
      },
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '15mb' }))

  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
  })

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'coco-care-backend' })
  })

  app.use('/auth', authRoutes)
  app.use(farmerRoutes)
  app.use(diagnosisRoutes)
  app.use(reportsRoutes)
  app.use(diseaseMapRoutes)
  app.use(chatRoutes)
  app.use(adminRoutes)
  app.use(weatherRoutes)
  app.use(knowledgeRoutes)
  app.use(notificationsRoutes)

  app.use(errorHandler)

  return app
}
