'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface DataPoint {
  time: number
  multiplier: number
}

interface CrashGraphProps {
  currentMultiplier: number
  gameState: 'waiting' | 'running' | 'crashed'
  crashPoint?: number
  onCrash?: () => void
}

export const CrashGraph = ({ 
  currentMultiplier, 
  gameState, 
  crashPoint,
  onCrash 
}: CrashGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [graphData, setGraphData] = useState<DataPoint[]>([])
  const animationRef = useRef<number>()

  // Reset graph when game starts
  useEffect(() => {
    if (gameState === 'waiting') {
      setGraphData([])
    }
  }, [gameState])

  // Add new data points during game
  useEffect(() => {
    if (gameState === 'running') {
      const newPoint: DataPoint = {
        time: Date.now(),
        multiplier: currentMultiplier
      }
      setGraphData(prev => [...prev, newPoint])
    }
  }, [currentMultiplier, gameState])

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear and draw graph
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Simple graph implementation
    ctx.strokeStyle = gameState === 'crashed' ? '#EF4444' : '#10B981'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, canvas.height)
    ctx.lineTo(canvas.width * 0.8, canvas.height - (currentMultiplier * 10))
    ctx.stroke()

    // Grid background
    drawGrid(ctx, canvas.width, canvas.height)

    // Draw graph line
    if (graphData.length > 1) {
      drawGraph(ctx, graphData, canvas.width, canvas.height, gameState === 'crashed')
    }

    // Draw crash point if crashed
    if (gameState === 'crashed' && crashPoint) {
      drawCrashPoint(ctx, crashPoint, canvas.width, canvas.height)
    }

    // Current multiplier indicator
    if (gameState === 'running') {
      drawCurrentIndicator(ctx, currentMultiplier, canvas.width, canvas.height)
    }

  }, [currentMultiplier, gameState, crashPoint, graphData])

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1

    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Vertical lines
    for (let i = 0; i <= 20; i++) {
      const x = (width / 20) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Axis labels
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '12px Inter'
    
    // Y-axis (multiplier)
    for (let i = 0; i <= 10; i++) {
      const y = height - (height / 10) * i
      const value = i * 2 // 0x to 20x
      ctx.fillText(`${value}x`, 5, y - 5)
    }
  }

  const drawGraph = (
    ctx: CanvasRenderingContext2D, 
    data: DataPoint[], 
    width: number, 
    height: number,
    isCrashed: boolean
  ) => {
    if (data.length < 2) return

    const startTime = data[0].time
    const timeRange = data[data.length - 1].time - startTime
    const maxMultiplier = Math.max(...data.map(d => d.multiplier), 20)

    // Create gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0)
    if (isCrashed) {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)')
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.8)')
    } else {
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.1)')
      gradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.6)')
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.8)')
    }

    ctx.strokeStyle = isCrashed ? '#EF4444' : '#10B981'
    ctx.lineWidth = 3
    ctx.fillStyle = gradient

    ctx.beginPath()
    ctx.moveTo(0, height)

    // Draw the curve
    data.forEach((point, index) => {
      const x = ((point.time - startTime) / timeRange) * width
      const y = height - ((point.multiplier / maxMultiplier) * height)
      
      if (index === 0) {
        ctx.lineTo(x, y)
      } else {
        // Smooth curve using quadratic curves
        const prevPoint = data[index - 1]
        const prevX = ((prevPoint.time - startTime) / timeRange) * width
        const prevY = height - ((prevPoint.multiplier / maxMultiplier) * height)
        
        const cpX = (prevX + x) / 2
        const cpY = (prevY + y) / 2
        
        ctx.quadraticCurveTo(cpX, cpY, x, y)
      }
    })

    // Fill area under curve
    const lastPoint = data[data.length - 1]
    const lastX = ((lastPoint.time - startTime) / timeRange) * width
    ctx.lineTo(lastX, height)
    ctx.closePath()
    ctx.fill()

    // Draw the line
    ctx.beginPath()
    ctx.moveTo(0, height)
    data.forEach((point, index) => {
      const x = ((point.time - startTime) / timeRange) * width
      const y = height - ((point.multiplier / maxMultiplier) * height)
      
      if (index === 0) {
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
  }

  const drawCrashPoint = (
    ctx: CanvasRenderingContext2D, 
    crashMultiplier: number, 
    width: number, 
    height: number
  ) => {
    if (graphData.length === 0) return

    const startTime = graphData[0].time
    const timeRange = graphData[graphData.length - 1].time - startTime
    const maxMultiplier = Math.max(...graphData.map(d => d.multiplier), 20)

    const lastPoint = graphData[graphData.length - 1]
    const x = ((lastPoint.time - startTime) / timeRange) * width
    const y = height - ((crashMultiplier / maxMultiplier) * height)

    // Explosion effect
    ctx.fillStyle = '#EF4444'
    ctx.beginPath()
    ctx.arc(x, y, 15, 0, 2 * Math.PI)
    ctx.fill()

    // Crash text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 16px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('💥', x, y + 5)
    
    ctx.fillStyle = '#EF4444'
    ctx.font = 'bold 12px Inter'
    ctx.fillText(`${crashMultiplier.toFixed(2)}x`, x, y - 25)
  }

  const drawCurrentIndicator = (
    ctx: CanvasRenderingContext2D,
    multiplier: number,
    width: number,
    height: number
  ) => {
    if (graphData.length === 0) return

    const startTime = graphData[0].time
    const timeRange = Date.now() - startTime
    const maxMultiplier = Math.max(multiplier, 20)

    const x = width
    const y = height - ((multiplier / maxMultiplier) * height)

    // Glowing indicator
    ctx.shadowColor = '#10B981'
    ctx.shadowBlur = 20
    ctx.fillStyle = '#10B981'
    ctx.beginPath()
    ctx.arc(x - 10, y, 8, 0, 2 * Math.PI)
    ctx.fill()
    ctx.shadowBlur = 0

    // Current multiplier text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'right'
    ctx.fillText(`${multiplier.toFixed(2)}x`, x - 25, y - 15)
  }

  return (
    <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      <canvas
        ref={canvasRef}
        width={800}
        height={256}
        className="w-full h-full"
      />
      
      {/* Overlay indicators */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="text-sm text-gray-400">
          Current: <span className={`font-bold ${
            gameState === 'running' ? 'text-green-400' : 
            gameState === 'crashed' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {currentMultiplier.toFixed(2)}x
          </span>
        </div>
        
        {gameState === 'crashed' && crashPoint && (
          <div className="text-sm text-red-400">
            Crashed at: <span className="font-bold">{crashPoint.toFixed(2)}x</span>
          </div>
        )}
      </div>

      {/* Game state indicator */}
      <div className="absolute top-4 right-4">
        {gameState === 'waiting' && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            Waiting
          </div>
        )}
        
        {gameState === 'running' && (
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Flying
          </div>
        )}
        
        {gameState === 'crashed' && (
          <div className="flex items-center gap-2 text-red-400">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            Crashed
          </div>
        )}
      </div>
    </div>
  )
}

// Historical graph component for past crashes
export const HistoricalGraph = ({ 
  crashes 
}: { 
  crashes: Array<{ round: string; multiplier: number; timestamp: number }> 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Recent Crashes</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {crashes.slice(0, 6).map((crash, index) => (
          <motion.div
            key={crash.round}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-4 rounded-lg border ${
                crash.multiplier < 2 
                  ? 'border-red-500/30 bg-red-500/10' 
                  : crash.multiplier < 5
                  ? 'border-yellow-500/30 bg-yellow-500/10'
                  : 'border-green-500/30 bg-green-500/10'
              }
            `}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{crash.round}</span>
              <span className={`
                font-bold ${
                  crash.multiplier < 2 
                    ? 'text-red-400' 
                    : crash.multiplier < 5
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }
              `}>
                {crash.multiplier.toFixed(2)}x
              </span>
            </div>
            
            {/* Mini visualization */}
            <div className="mt-2 h-8 bg-gray-800 rounded relative overflow-hidden">
              <div 
                className={`
                  h-full rounded transition-all duration-300 ${
                    crash.multiplier < 2 
                      ? 'bg-gradient-to-r from-red-500/20 to-red-500' 
                      : crash.multiplier < 5
                      ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-500'
                      : 'bg-gradient-to-r from-green-500/20 to-green-500'
                  }
                `}
                style={{ width: `${Math.min((crash.multiplier / 10) * 100, 100)}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 