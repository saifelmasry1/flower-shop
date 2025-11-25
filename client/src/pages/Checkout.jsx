import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import './Checkout.css'
import './Checkout.css'

export default function Checkout() {
    const navigate = useNavigate()
    const { cart, getCartTotal, clearCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        customerName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        notes: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const orderData = {
                customerName: formData.customerName,
                email: formData.email,
                phone: formData.phone,
                shippingAddress: {
                    street: formData.address,
                    city: formData.city,
                    zipCode: formData.zipCode
                },
                items: cart.map(item => ({
                    product: item._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: getCartTotal(),
                notes: formData.notes
            }

            const response = await axios.post('/api/orders', orderData)
            clearCart()
            navigate(`/order-success/${response.data._id}`)
        } catch (error) {
            console.error('Error creating order:', error)
            alert('Failed to create order. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (cart.length === 0) {
        navigate('/cart')
        return null
    }

    return (
        <div className="checkout-page">
            <section className="checkout-hero">
                <div className="container">
                    <h1 className="page-title">Checkout</h1>
                    <p className="page-subtitle">Complete your order</p>
                </div>
            </section>

            <section className="checkout-content section">
                <div className="container">
                    <form onSubmit={handleSubmit} className="checkout-form">
                        <div className="checkout-grid">
                            <div className="checkout-main">
                                {/* Contact Information */}
                                <div className="form-section card">
                                    <h2>Contact Information</h2>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="customerName">Full Name *</label>
                                            <input
                                                type="text"
                                                id="customerName"
                                                name="customerName"
                                                value={formData.customerName}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">Email *</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phone">Phone Number *</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="form-section card">
                                    <h2>Shipping Address</h2>
                                    <div className="form-grid">
                                        <div className="form-group full-width">
                                            <label htmlFor="address">Street Address *</label>
                                            <input
                                                type="text"
                                                id="address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                                placeholder="123 Main Street"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="city">City *</label>
                                            <input
                                                type="text"
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                                placeholder="New York"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="zipCode">ZIP Code *</label>
                                            <input
                                                type="text"
                                                id="zipCode"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                                placeholder="10001"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="form-section card">
                                    <h2>Payment Information</h2>
                                    <div className="payment-note">
                                        <span>🔒</span>
                                        <span>Your payment information is secure</span>
                                    </div>
                                    <div className="form-grid">
                                        <div className="form-group full-width">
                                            <label htmlFor="cardNumber">Card Number *</label>
                                            <input
                                                type="text"
                                                id="cardNumber"
                                                name="cardNumber"
                                                value={formData.cardNumber}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="expiryDate">Expiry Date *</label>
                                            <input
                                                type="text"
                                                id="expiryDate"
                                                name="expiryDate"
                                                value={formData.expiryDate}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                                placeholder="MM/YY"
                                                maxLength="5"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="cvv">CVV *</label>
                                            <input
                                                type="text"
                                                id="cvv"
                                                name="cvv"
                                                value={formData.cvv}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                                placeholder="123"
                                                maxLength="4"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Notes */}
                                <div className="form-section card">
                                    <h2>Additional Notes (Optional)</h2>
                                    <div className="form-group">
                                        <label htmlFor="notes">Delivery Instructions or Gift Message</label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            className="input textarea"
                                            placeholder="Add any special instructions or a gift message..."
                                            rows="4"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="checkout-sidebar">
                                <div className="order-summary card">
                                    <h2>Order Summary</h2>

                                    <div className="summary-items">
                                        {cart.map(item => (
                                            <div key={item._id} className="summary-item">
                                                <img src={item.imageUrl} alt={item.name} />
                                                <div className="summary-item-info">
                                                    <h4>{item.name}</h4>
                                                    <p>Qty: {item.quantity}</p>
                                                </div>
                                                <span className="summary-item-price">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="summary-divider"></div>

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

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        style={{ width: '100%' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Place Order 🌸'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    )
}
