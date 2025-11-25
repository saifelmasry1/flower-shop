import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content container">
                <div className="footer-section">
                    <h3 className="footer-title">
                        <span className="footer-icon">🌿</span>
                        The Garden
                    </h3>
                    <p className="footer-description">
                        Premium flowers for every occasion. Bringing beauty and joy to your special moments since 2024.
                    </p>
                    <div className="footer-social">
                        <a href="#" className="social-link" aria-label="Facebook">📘</a>
                        <a href="#" className="social-link" aria-label="Instagram">📷</a>
                        <a href="#" className="social-link" aria-label="Twitter">🐦</a>
                        <a href="#" className="social-link" aria-label="Pinterest">📌</a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4 className="footer-heading">Quick Links</h4>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">Shop All</Link></li>
                        <li><Link to="/cart">Shopping Cart</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-heading">Customer Service</h4>
                    <ul className="footer-links">
                        <li><a href="#contact">Contact Us</a></li>
                        <li><a href="#delivery">Delivery Info</a></li>
                        <li><a href="#returns">Returns</a></li>
                        <li><a href="#faq">FAQ</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-heading">Contact</h4>
                    <ul className="footer-info">
                        <li>📞 01023461364</li>
                        <li>📧 saifelmasry5968@gmail.com</li>
                        <li>📍 Cairo-Egypt</li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>© 2025 The Garden. All rights reserved.</p>
                    <p className="footer-tagline">Made with 💖 and fresh flowers</p>
                </div>
            </div>
        </footer>
    );
}
