import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Cart.css'
import './Cart.css'

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart()

    if (cart.length === 0) {
        return (
            <div className="cart-empty">
                <div className="container section">
                    <div className="empty-cart-content">
                        <div className="empty-cart-icon">🛒</div>
                        <h2>Your Cart is Empty</h2>
                        <p>Looks like you haven't added any flowers yet.</p>
                        <Link to="/products" className="btn btn-primary btn-lg">
                            Start Shopping 🌸
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="cart-page">
            <section className="cart-hero">
                <div className="container">
                    <h1 className="page-title">Shopping Cart</h1>
                    <p className="page-subtitle">Review your beautiful selections</p>
                </div>
            </section>

            <section className="cart-content section">
                <div className="container">
                    <div className="cart-grid">
                        <div className="cart-items">
                            <h2>Cart Items ({cart.length})</h2>
                            {cart.map(item => (
                                <div key={item._id} className="cart-item card">
                                    <Link to={`/products/${item._id}`} className="cart-item-image">
                                        <img src={item.imageUrl} alt={item.name} />
                                    </Link>

                                    <div className="cart-item-details">
                                        <Link to={`/products/${item._id}`}>
                                            <h3>{item.name}</h3>
                                        </Link>
                                        <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                                    </div>

                                    <div className="cart-item-quantity">
                                        <label>Quantity:</label>
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                className="btn btn-ghost btn-sm"
                                            >
                                                −
                                            </button>
                                            <span className="quantity-display">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                className="btn btn-ghost btn-sm"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cart-item-total">
                                        <p>Total:</p>
                                        <p className="item-total-price">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="cart-item-remove"
                                        aria-label="Remove item"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary card">
                            <h2>Order Summary</h2>

                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>${getCartTotal().toFixed(2)}</span>
                            </div>

                            <div className="summary-row">
                                <span>Shipping:</span>
                                <span className="free-shipping">FREE</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row summary-total">
                                <span>Total:</span>
                                <span>${getCartTotal().toFixed(2)}</span>
                            </div>

                            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                Proceed to Checkout 🌸
                            </Link>

                            <Link to="/products" className="btn btn-outline" style={{ width: '100%' }}>
                                Continue Shopping
                            </Link>

                            <div className="cart-features">
                                <div className="feature-item">
                                    <span>✓</span>
                                    <span>Free delivery on all orders</span>
                                </div>
                                <div className="feature-item">
                                    <span>✓</span>
                                    <span>100% satisfaction guarantee</span>
                                </div>
                                <div className="feature-item">
                                    <span>✓</span>
                                    <span>Fresh flowers guaranteed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
