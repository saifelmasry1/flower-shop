import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import './ProductDetail.css'
import './ProductDetail.css'

export default function ProductDetail() {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [added, setAdded] = useState(false)
    const { addToCart } = useCart()

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/api/products/${id}`)
                setProduct(response.data)
            } catch (error) {
                console.error('Error fetching product:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [id])

    const handleAddToCart = () => {
        if (product && product.inStock) {
            addToCart(product, quantity)
            setAdded(true)
            setTimeout(() => setAdded(false), 2000)
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="container section">
                <h2>Product not found</h2>
                <Link to="/products" className="btn btn-primary">Back to Products</Link>
            </div>
        )
    }

    return (
        <div className="product-detail">
            <div className="container section">
                <Link to="/products" className="back-link">← Back to Products</Link>

                <div className="product-detail-grid">
                    <div className="product-detail-image">
                        <img src={product.imageUrl} alt={product.name} />
                        {!product.inStock && (
                            <div className="out-of-stock-overlay">
                                <span className="badge badge-warning">Out of Stock</span>
                            </div>
                        )}
                    </div>

                    <div className="product-detail-info">
                        <h1 className="product-detail-title">{product.name}</h1>

                        {product.featured && (
                            <div className="badge" style={{ marginBottom: 'var(--spacing-md)' }}>
                                ⭐ Featured Product
                            </div>
                        )}

                        <div className="product-detail-price">
                            ${product.price.toFixed(2)}
                        </div>

                        <div className="product-detail-description">
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>

                        <div className="product-detail-details">
                            <h3>Details</h3>
                            <ul>
                                <li><strong>Category:</strong> {product.category}</li>
                                <li><strong>Availability:</strong> {product.inStock ? 'In Stock' : 'Out of Stock'}</li>
                                {product.featured && <li><strong>Status:</strong> Featured Product</li>}
                            </ul>
                        </div>

                        <div className="product-detail-actions">
                            <div className="quantity-selector">
                                <label htmlFor="quantity">Quantity:</label>
                                <div className="quantity-controls">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="btn btn-ghost btn-sm"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        id="quantity"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="quantity-input"
                                        min="1"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="btn btn-ghost btn-sm"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={!product.inStock}
                                className={`btn btn-lg ${added ? 'btn-secondary' : 'btn-primary'}`}
                                style={{ width: '100%' }}
                            >
                                {added ? '✓ Added to Cart!' : product.inStock ? 'Add to Cart 🛒' : 'Out of Stock'}
                            </button>
                        </div>

                        <div className="product-features">
                            <div className="feature-item">
                                <span className="feature-icon">🚚</span>
                                <span>Same-day delivery available</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🌿</span>
                                <span>Fresh from our growers</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">💝</span>
                                <span>Gift message included</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
