import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'
import { AppDataSource } from './config/database-simple'
import { User } from './entities/User-simple'
import { Game } from './entities/Game'
import { Transaction } from './entities/Transaction'

// Load environment variables
dotenv.config()

const app = express()
const port = process.env.PORT || 3001
const wsPort = process.env.WS_PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// Initialize WebSocket server
const wsServer = new WebSocketServer({ port: Number(wsPort) })

// WebSocket connection handling
wsServer.on('connection', (ws) => {
  console.log('Client connected')

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())
      console.log('Received:', data)
      
      // Echo back for testing
      ws.send(JSON.stringify({ type: 'echo', data }))
    } catch (error) {
      console.error('Error processing message:', error)
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })
})

// Initialize database
AppDataSource.initialize()
  .then(() => {
    console.log('Database initialized')
  })
  .catch((error) => {
    console.error('Error initializing database:', error)
  })

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Start server
app.listen(port, () => {
  console.log(`🚀 Simple server running on port ${port}`)
  console.log(`📊 Health: http://localhost:${port}/health`)
  console.log(`🎮 Frontend URL: http://localhost:3003`)
})