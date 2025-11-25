import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Flower Shop API is running' })
})

// Connect to MongoDB (optional - server will work with mock data if unavailable)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flower-shop')
    .then(() => {
        console.log('✓ Connected to MongoDB')
    })
    .catch((error) => {
        console.warn('⚠️  MongoDB connection failed - using mock data fallback')
        console.warn('   To fix: Install MongoDB or use Docker')
    })

// Start server regardless of MongoDB connection
app.listen(PORT, () => {
    console.log('✓ Server running on http://localhost:' + PORT)
    console.log('✓ API available at http://localhost:' + PORT + '/api')
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

export default app
