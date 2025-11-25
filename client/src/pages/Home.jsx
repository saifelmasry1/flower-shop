import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import './Home.css'
import './Home.css'

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const response = await axios.get('/api/products?featured=true&limit=3')
                setFeaturedProducts(response.data)
            } catch (error) {
                console.error('Error fetching featured products:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchFeaturedProducts()
    }, [])

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content container">
                    <h1 className="hero-title animate-fade-in">
                        Beautiful Blooms for
                        <span className="hero-highlight"> Every Occasion</span>
                    </h1>
                    <p className="hero-description animate-fade-in">
                        Premium flowers delivered fresh to your door. From romantic roses to elegant arrangements,
                        find the perfect bouquet to brighten someone's day.
                    </p>
                    <div className="hero-buttons animate-fade-in">
                        <Link to="/products" className="btn btn-primary btn-lg">
                            Shop Now 🌸
                        </Link>
                        <a href="#featured" className="btn btn-primary btn-lg">
                            View Collections
                        </a>
                    </div>
                </div>
                <div className="hero-decoration">
                    <div className="floating-flower flower-1">🌺</div>
                    <div className="floating-flower flower-2">🌷</div>
                    <div className="floating-flower flower-3">🌹</div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🚚</div>
                            <h3>Fast Delivery</h3>
                            <p>Same-day delivery available on all orders placed before 2 PM</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🌿</div>
                            <h3>Fresh Quality</h3>
                            <p>Hand-picked flowers sourced from the finest growers worldwide</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💝</div>
                            <h3>Perfect Gifts</h3>
                            <p>Beautiful arrangements for birthdays, anniversaries, and more</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⭐</div>
                            <h3>Expert Florists</h3>
                            <p>Professionally designed by our award-winning team</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section id="featured" className="featured section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured Bouquets</h2>
                        <p className="section-subtitle">
                            Our most popular arrangements, loved by customers
                        </p>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="products-grid grid-3">
                            {featuredProducts.map(product => (
                                <Link
                                    to={`/products/${product._id}`}
                                    key={product._id}
                                    className="product-card card"
                                >
                                    <div className="product-image-wrapper">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="card-image"
                                        />
                                        {product.inStock === false && (
                                            <div className="product-badge badge-warning">Out of Stock</div>
                                        )}
                                    </div>
                                    <div className="card-body">
                                        <h3 className="product-name">{product.name}</h3>
                                        <p className="product-description">{product.description}</p>
                                        <div className="product-footer">
                                            <span className="product-price">${product.price.toFixed(2)}</span>
                                            <span className="product-cta">View Details →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="section-cta">
                        <Link to="/products" className="btn btn-primary btn-lg">
                            View All Products 🌼
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials section" style={{ background: 'var(--neutral-50)' }}>
                <div className="container">
                    <h2 className="section-title">What Our Customers Say</h2>

                    <div className="testimonials-grid grid-3">
                        <div className="testimonial-card card card-glass">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">
                                "Absolutely stunning flowers! They arrived fresh and beautifully arranged.
                                Will definitely order again!"
                            </p>
                            <p className="testimonial-author">- Sarah M.</p>
                        </div>

                        <div className="testimonial-card card card-glass">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">
                                "The quality is exceptional and the customer service is outstanding.
                                My go-to flower shop!"
                            </p>
                            <p className="testimonial-author">- James L.</p>
                        </div>

                        <div className="testimonial-card card card-glass">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">
                                "Fast delivery and gorgeous arrangements. Made my anniversary perfect.
                                Highly recommend!"
                            </p>
                            <p className="testimonial-author">- Emily R.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
