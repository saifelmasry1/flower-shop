# 🌸 THE GARDEN

A beautiful, full-stack e-commerce flower shop application built with React and Node.js.

## ✨ Features

### Frontend
- 🎨 **Premium Design**: Modern, responsive UI with stunning animations
- 🛒 **Shopping Cart**: Full cart functionality with localStorage persistence
- 📱 **Mobile Responsive**: Works perfectly on all devices
- 🌸 **Product Catalog**: Browse and filter flower arrangements
- 💳 **Checkout Process**: Complete order placement system
- 🎯 **Product Details**: Detailed view for each product

### Backend
- 🚀 **RESTful API**: Express.js backend with MongoDB
- 📊 **Database Models**: Products and Orders with validation
- 🔍 **Filtering**: Product filtering by category and featured status
- 📝 **Order Management**: Complete order tracking system

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Axios
- Vite
- CSS3 with custom design system

**Backend:**
- Node.js
- Express
- MongoDB with Mongoose
- CORS & dotenv

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

### Setup Instructions

1. **Clone or navigate to the project directory**

2. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Configure Environment Variables**
   
   The `server/.env` file is already set up with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/flower-shop
   NODE_ENV=development
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # On Windows (if MongoDB is installed as a service)
   net start MongoDB
   
   # Or run mongod directly
   mongod
   ```

6. **Seed the Database**
   ```bash
   # From the server directory
   npm run seed
   ```

7. **Start the Backend Server**
   ```bash
   # From the server directory
   npm run dev
   ```
   Server will run on http://localhost:5000

8. **Start the Frontend**
   ```bash
   # From the client directory (in a new terminal)
   npm run dev
   ```
   Frontend will run on http://localhost:3000

## 🚀 Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Browse the flower catalog
3. Add items to your cart
4. Proceed to checkout and complete your order
5. View order confirmation

## 📁 Project Structure

```
flower-shop/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components (Navbar, Footer)
│   │   ├── context/       # React Context (CartContext)
│   │   ├── pages/         # Page components (Home, Products, Cart, etc.)
│   │   ├── App.jsx        # Main App component
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles & design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                # Backend Node.js application
    ├── models/            # Mongoose models
    │   ├── Product.js
    │   └── Order.js
    ├── routes/            # Express routes
    │   ├── products.js
    │   └── orders.js
    ├── server.js          # Express server setup
    ├── seed.js            # Database seeding script
    ├── .env               # Environment variables
    └── package.json
```

## 🎨 Design Features

- Custom color palette with premium gradients
- Smooth animations and transitions
- Glassmorphism effects on cards
- Responsive grid layouts
- Interactive hover effects
- Professional typography (Playfair Display & Inter)

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products (supports ?category=, ?featured=, ?limit=)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

## 🌟 Future Enhancements

- User authentication and accounts
- Admin dashboard
- Payment gateway integration
- Email notifications
- Review and rating system
- Wishlist functionality
- Advanced search and filters

## 📝 License

This project is open source and available for educational purposes.

## 💖 Made with Love

Created with passion for beautiful flowers and elegant code.

---

**Happy Flower Shopping! 🌸**


