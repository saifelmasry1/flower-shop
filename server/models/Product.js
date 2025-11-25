import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['roses', 'tulips', 'orchids', 'mixed', 'seasonal'],
        default: 'mixed'
    },
    imageUrl: {
        type: String,
        required: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Product = mongoose.model('Product', productSchema)

export default Product
