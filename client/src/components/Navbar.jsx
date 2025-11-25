import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import './Navbar.css'

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { getCartCount } = useCart()
    const cartCount = getCartCount()

    return (
        <nav className="navbar">
            <div className="navbar-container container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🌿</span>
                    <span className="logo-text">The Garden</span>
                </Link>

                <button
                    className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <li>
                        <Link
                            to="/"
                            className="navbar-link"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/products"
                            className="navbar-link"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Shop All
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/cart"
                            className="navbar-link navbar-cart"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="cart-icon">🛒</span>
                            Cart
                            {cartCount > 0 && (
                                <span className="cart-badge">{cartCount}</span>
                            )}
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
