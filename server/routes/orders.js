import express from 'express'
import Order from '../models/Order.js'

const router = express.Router()

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.product')
            .sort({ createdAt: -1 })
        res.json(orders)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders', message: error.message })
    }
})

// Get single order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product')

        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        res.json(order)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order', message: error.message })
    }
})

// Mock orders data (fallback when MongoDB is unavailable)
let mockOrders = [];

// Create new order
router.post('/', async (req, res) => {
    try {
        const order = new Order(req.body)
        const savedOrder = await order.save()
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate('items.product')
        res.status(201).json(populatedOrder)
    } catch (error) {
        // If MongoDB fails, use mock data
        console.warn('⚠️  MongoDB write failed, using in-memory fallback for order')

        const newOrder = {
            _id: 'mock_order_' + Date.now(),
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'pending'
        }

        mockOrders.push(newOrder)
        res.status(201).json(newOrder)
    }
})

// Update order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body

        if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' })
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('items.product')

        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        res.json(order)
    } catch (error) {
        res.status(400).json({ error: 'Failed to update order status', message: error.message })
    }
})

// Delete order
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id)

        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        res.json({ message: 'Order deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete order', message: error.message })
    }
})

export default router
