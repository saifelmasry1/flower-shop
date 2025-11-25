import express from 'express'
import Product from '../models/Product.js'

const router = express.Router()

// Mock products data (fallback when MongoDB is unavailable)
const mockProducts = [
    {
        _id: '1',
        name: 'Classic Red Roses',
        description: "A timeless bouquet of 12 premium red roses with baby's breath and lush greenery. Perfect for expressing love and romance.",
        price: 59.99,
        category: 'roses',
        imageUrl: '/images/red-roses.png',
        inStock: true,
        featured: true
    },
    {
        _id: '2',
        name: 'Spring Tulip Mix',
        description: 'Vibrant assortment of colorful tulips that bring the essence of spring into any room. Available in pink, yellow, and white.',
        price: 45.99,
        category: 'tulips',
        imageUrl: '/images/spring-tulips.png',
        inStock: true,
        featured: true
    },
    {
        _id: '3',
        name: 'Sunshine Sunflowers',
        description: 'Cheerful sunflowers that brighten any day. This bouquet features 6 large sunflower blooms with complementary greenery.',
        price: 39.99,
        category: 'sunflowers',
        imageUrl: '/images/sunflowers.jpg',
        inStock: true,
        featured: true
    },
    {
        _id: '4',
        name: 'Elegant White Lilies',
        description: 'Pure white oriental lilies symbolizing elegance and tranquility. Perfect for special occasions and sympathy arrangements.',
        price: 54.99,
        category: 'lilies',
        imageUrl: '/images/white-lilies.png',
        inStock: true,
        featured: false
    },
    {
        _id: '5',
        name: 'Mixed Wildflower Bundle',
        description: 'Rustic arrangement of seasonal wildflowers picked at their peak. Each bouquet is unique and full of natural charm.',
        price: 34.99,
        category: 'mixed',
        imageUrl: '/images/wildflowers.png',
        inStock: true,
        featured: true
    },
    {
        _id: '6',
        name: 'Pink Peony Perfection',
        description: 'Luxurious peonies in shades of pink and blush. These full-bloomed beauties are the epitome of romantic elegance.',
        price: 69.99,
        category: 'peonies',
        imageUrl: '/images/pink-roses.png',
        inStock: true,
        featured: false
    }
];

// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, featured, limit } = req.query

        // Try MongoDB first, fallback to mock data if unavailable
        try {
            let query = {}

            if (category && category !== 'all') {
                query.category = category
            }

            if (featured === 'true') {
                query.featured = true
            }

            let productsQuery = Product.find(query)

            if (limit) {
                productsQuery = productsQuery.limit(parseInt(limit))
            }

            const products = await productsQuery.sort({ createdAt: -1 })
            res.json(products)
        } catch (dbError) {
            // MongoDB not available, use mock data
            console.log('⚠️  MongoDB unavailable, using mock data')
            let filteredProducts = [...mockProducts]

            if (category && category !== 'all') {
                filteredProducts = filteredProducts.filter(p => p.category === category)
            }

            if (featured === 'true') {
                filteredProducts = filteredProducts.filter(p => p.featured === true)
            }

            if (limit) {
                filteredProducts = filteredProducts.slice(0, parseInt(limit))
            }

            res.json(filteredProducts)
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products', message: error.message })
    }
})

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        // Try MongoDB first
        try {
            const product = await Product.findById(req.params.id)

            if (!product) {
                return res.status(404).json({ error: 'Product not found' })
            }

            res.json(product)
        } catch (dbError) {
            // MongoDB not available or invalid ID format, use mock data
            console.log('⚠️  MongoDB unavailable, using mock data for single product')
            const product = mockProducts.find(p => p._id === req.params.id)

            if (!product) {
                return res.status(404).json({ error: 'Product not found' })
            }

            res.json(product)
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product', message: error.message })
    }
})

// Create new product (admin)
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body)
        const savedProduct = await product.save()
        res.status(201).json(savedProduct)
    } catch (error) {
        res.status(400).json({ error: 'Failed to create product', message: error.message })
    }
})

// Update product (admin)
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        res.json(product)
    } catch (error) {
        res.status(400).json({ error: 'Failed to update product', message: error.message })
    }
})

// Delete product (admin)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)

        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        res.json({ message: 'Product deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product', message: error.message })
    }
})

export default router
