import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product.js'

dotenv.config()

const products = [
    {
        name: 'Classic Red Roses',
        description: "A timeless bouquet of 12 premium red roses with baby's breath and lush greenery. Perfect for expressing love and romance.",
        price: 59.99,
        category: 'roses',
        imageUrl: '/images/red-roses.png',
        inStock: true,
        featured: true
    },
    {
        name: 'Spring Tulip Arrangement',
        description: 'Vibrant pink and white tulips arranged in a clear glass vase. Brings the freshness of spring to any room.',
        price: 45.99,
        category: 'tulips',
        imageUrl: '/images/spring-tulips.png',
        inStock: true,
        featured: true
    },
    {
        name: 'Sunny Day Sunflowers',
        description: 'Cheerful sunflower bouquet that brightens any space. Includes 6 large sunflower blooms with seasonal greenery.',
        price: 42.99,
        category: 'seasonal',
        imageUrl: '/images/sunflowers.jpg',
        inStock: true,
        featured: true
    },
    {
        name: 'Elegant Orchid Plant',
        description: 'Sophisticated white and purple orchids in a decorative ceramic pot. A long-lasting gift that requires minimal care.',
        price: 68.99,
        category: 'orchids',
        imageUrl: '/images/orchids.png',
        inStock: true,
        featured: false
    },
    {
        name: 'Wildflower Meadow Mix',
        description: 'A rustic collection of colorful wildflowers including daisies, cosmos, and asters. Perfect for a natural, bohemian look.',
        price: 38.99,
        category: 'mixed',
        imageUrl: '/images/wildflowers.png',
        inStock: true,
        featured: false
    },
    {
        name: 'Pure White Lilies',
        description: 'Sophisticated arrangement of pristine white lilies symbolizing purity and elegance. Ideal for sympathy or weddings.',
        price: 55.99,
        category: 'mixed',
        imageUrl: '/images/white-lilies.png',
        inStock: true,
        featured: false
    },
    {
        name: 'Romantic Pink Roses',
        description: 'Soft pink roses arranged with eucalyptus and white roses. A gentle expression of admiration and gratitude.',
        price: 52.99,
        category: 'roses',
        imageUrl: '/images/pink-roses.png',
        inStock: true,
        featured: false
    },
    {
        name: 'Lavender Dreams',
        description: 'Calming lavender bouquet mixed with white flowers and silver foliage. Brings tranquility to any space.',
        price: 47.99,
        category: 'mixed',
        imageUrl: '/images/lavender.png',
        inStock: false,
        featured: false
    },
    {
        name: 'Garden Rose Delight',
        description: 'Lush garden roses in shades of coral and peach. A premium arrangement that exudes luxury and sophistication.',
        price: 75.99,
        category: 'roses',
        imageUrl: '/images/garden-roses.png',
        inStock: true,
        featured: false
    },
    {
        name: 'Tropical Paradise',
        description: 'Exotic tropical flowers including birds of paradise, orchids, and anthuriums. Makes a bold, stunning statement.',
        price: 82.99,
        category: 'orchids',
        imageUrl: '/images/tropical-flowers.png',
        inStock: true,
        featured: false
    },
    {
        name: 'Spring Tulip Mix',
        description: 'Colorful assortment of tulips in red, yellow, pink, and white. Celebrates the beauty of spring in full bloom.',
        price: 48.99,
        category: 'tulips',
        imageUrl: '/images/tulip-mix.png',
        inStock: true,
        featured: false
    },
    {
        name: 'Autumn Harvest Bouquet',
        description: 'Warm autumn tones featuring orange roses, burgundy carnations, and golden accents. Perfect for fall celebrations.',
        price: 54.99,
        category: 'seasonal',
        imageUrl: '/images/autumn-bouquet.png',
        inStock: true,
        featured: false
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flower-shop')
        console.log('✓ Connected to MongoDB')

        // Clear existing products
        await Product.deleteMany({})
        console.log('✓ Cleared existing products')

        // Insert new products
        await Product.insertMany(products)
        console.log(`✓ Inserted ${products.length} products`)

        console.log('\n🌸 Database seeded successfully!')
        process.exit(0)
    } catch (error) {
        console.error('✗ Error seeding database:', error)
        process.exit(1)
    }
}

seedDatabase()
