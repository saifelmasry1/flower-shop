import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import './Products.css'
import './Products.css'

export default function Products() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const { addToCart } = useCart()
    const [addedToCart, setAddedToCart] = useState({})

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/products')
                setProducts(response.data)
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    const handleAddToCart = (product) => {
        addToCart(product)
        setAddedToCart(prev => ({ ...prev, [product._id]: true }))
        setTimeout(() => {
            setAddedToCart(prev => ({ ...prev, [product._id]: false }))
        }, 2000)
    }

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter)

    const categories = ['all', ...new Set(products.map(p => p.category))]

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading beautiful flowers...</p>
            </div>
        )
    }

    return (
        <div className="products-page">
            <section className="products-hero">
                <div className="container">
                    <h1 className="page-title">Our Flower Collection</h1>
                    <p className="page-subtitle">
                        Browse our stunning selection of fresh flowers and arrangements
                    </p>
                </div>
            </section>

            <section className="products-content section">
                <div className="container">
                    {/* Filter Bar */}
                    <div className="filter-bar">
                        <h3>Filter by Category:</h3>
                        <div className="filter-buttons">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setFilter(category)}
                                    className={`btn ${filter === category ? 'btn-primary' : 'btn-outline'} btn-sm`}
                                >
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="no-products">
                            <p>No products found in this category.</p>
                        </div>
                    ) : (
                        <div className="products-grid grid-3">
                            {filteredProducts.map(product => (
                                <div key={product._id} className="product-card card">
                                    <Link to={`/products/${product._id}`} className="product-link">
                                        <div className="product-image-wrapper">
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="card-image"
                                            />
                                            {!product.inStock && (
                                                <div className="product-badge badge-warning">Out of Stock</div>
                                            )}
                                            {product.featured && (
                                                <div className="product-badge badge" style={{ top: 'auto', bottom: 'var(--spacing-md)', left: 'var(--spacing-md)', right: 'auto' }}>
                                                    ⭐ Featured
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    <div className="card-body">
                                        <Link to={`/products/${product._id}`} className="product-link">
                                            <h3 className="product-name">{product.name}</h3>
                                            <p className="product-description">{product.description}</p>
                                        </Link>

                                        <div className="product-footer">
                                            <span className="product-price">${product.price.toFixed(2)}</span>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={!product.inStock}
                                                className={`btn btn-sm ${addedToCart[product._id] ? 'btn-secondary' : 'btn-primary'}`}
                                            >
                                                {addedToCart[product._id] ? '✓ Added!' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
