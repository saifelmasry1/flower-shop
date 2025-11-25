import axios from 'axios';

async function createOrder() {
    try {
        const orderData = {
            customerName: "Test User",
            email: "test@example.com",
            phone: "1234567890",
            shippingAddress: {
                street: "123 Test St",
                city: "Test City",
                zipCode: "12345"
            },
            items: [],
            totalAmount: 0,
            notes: "Test order"
        };

        console.log('Sending order request...');
        const response = await axios.post('http://localhost:5000/api/orders', orderData);
        console.log('Order created successfully:', response.data);
    } catch (error) {
        console.error('Error creating order:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

createOrder();
