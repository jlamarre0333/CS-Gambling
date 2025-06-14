import express from 'express'
import cors from 'cors'
import inventoryRoutes from './routes/inventory'
import steamAuthRoutes from './routes/steamAuth'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  })
})

// Routes
app.use('/api/inventory', inventoryRoutes)
app.use('/api/steam-auth', steamAuthRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🎮 Steam inventory: http://localhost:${PORT}/api/inventory`)
  console.log(`🔐 Steam auth: http://localhost:${PORT}/api/steam-auth`)
}) 