import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import './OrderSuccess.css'
import './OrderSuccess.css'

export default function OrderSuccess() {
    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/orders/${orderId}`)
                setOrder(response.data)
            } catch (error) {
                console.error('Error fetching order:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [orderId])

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="container section">
                <h2>Order not found</h2>
                <Link to="/" className="btn btn-primary">Go to Home</Link>
            </div>
        )
    }

    return (
        <div className="order-success-page">
            <section className="success-hero">
                <div className="container">
                    <div className="success-icon">✓</div>
                    <h1 className="success-title">Order Confirmed!</h1>
                    <p className="success-subtitle">
                        Thank you for your order. We'll send you a confirmation email shortly.
                    </p>
                </div>
            </section>

            <section className="order-details section">
                <div className="container">
                    <div className="order-details-grid">
                        <div className="order-info card">
                            <h2>Order Information</h2>
                            <div className="info-row">
                                <span className="info-label">Order Number:</span>
                                <span className="info-value">#{order._id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Order Date:</span>
                                <span className="info-value">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Status:</span>
                                <span className="badge badge-success">{order.status}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Total Amount:</span>
                                <span className="info-value total-amount">${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="customer-info card">
                            <h2>Customer Details</h2>
                            <div className="info-row">
                                <span className="info-label">Name:</span>
                                <span className="info-value">{order.customerName}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{order.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Phone:</span>
                                <span className="info-value">{order.phone}</span>
                            </div>
                        </div>

                        <div className="shipping-info card">
                            <h2>Shipping Address</h2>
                            <p className="address-text">
                                {order.shippingAddress.street}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                            </p>
                        </div>

                        {order.notes && (
                            <div className="notes-info card">
                                <h2>Special Instructions</h2>
                                <p className="notes-text">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="order-items card">
                        <h2>Order Items</h2>
                        <div className="items-list">
                            {order.items.map((item, index) => (
                                <div key={index} className="order-item">
                                    <div className="order-item-info">
                                        <h3>{item.product?.name || 'Product'}</h3>
                                        <p>Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="order-item-price">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="items-total">
                            <span>Total:</span>
                            <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="success-actions">
                        <Link to="/products" className="btn btn-primary btn-lg">
                            Continue Shopping 🌸
                        </Link>
                        <Link to="/" className="btn btn-outline btn-lg">
                            Back to Home
                        </Link>
                    </div>

                    <div className="success-message">
                        <h3>What's Next?</h3>
                        <div className="next-steps">
                            <div className="step">
                                <div className="step-icon">📧</div>
                                <div className="step-content">
                                    <h4>Confirmation Email</h4>
                                    <p>You'll receive an order confirmation email at {order.email}</p>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-icon">📦</div>
                                <div className="step-content">
                                    <h4>Processing</h4>
                                    <p>Our florists are preparing your beautiful arrangement</p>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-icon">🚚</div>
                                <div className="step-content">
                                    <h4>Delivery</h4>
                                    <p>Your flowers will be delivered fresh to your door</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
