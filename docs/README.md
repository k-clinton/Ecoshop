# 🌱 EcoShop - E-Commerce Platform

A full-stack e-commerce platform for sustainable and eco-friendly products, featuring a React frontend and Next.js API backend with MySQL database.

## 📁 Project Structure

```
ecoshop/
├── frontend/            # React + Vite Frontend
│   ├── src/            # React components and pages
│   ├── public/         # Static assets
│   └── ...
│
└── backend/            # Next.js API + MySQL Backend
    ├── lib/           # Core utilities (auth, db, types)
    ├── pages/api/     # 17 API endpoints
    ├── scripts/       # Database setup and seeding
    └── ...
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Edit .env file with your MySQL credentials
   nano .env
   ```

4. **Setup database:**
   ```bash
   npm run db:setup
   npm run db:seed
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```
   
   Backend runs on: **http://localhost:3001**

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```
   
   Frontend runs on: **http://localhost:5173**

## 🎯 Features

### Backend Features
- ✅ RESTful API with 17 endpoints
- ✅ MySQL database with 8 normalized tables
- ✅ JWT authentication & authorization
- ✅ Role-based access control (Customer & Admin)
- ✅ Complete CRUD operations for products
- ✅ Order management with inventory tracking
- ✅ Product variants support
- ✅ Category management
- ✅ Admin dashboard with statistics
- ✅ CORS enabled for frontend integration
- ✅ TypeScript for type safety

### Frontend Features
- ✅ Modern React with TypeScript
- ✅ Responsive design with Tailwind CSS
- ✅ **Mobile-optimized UI with responsive layouts**
- ✅ **Categories dropdown in navigation bar**
- ✅ **Active filter indicators with count badges**
- ✅ Product browsing and filtering
- ✅ **2-column mobile product grid for better space utilization**
- ✅ Shopping cart functionality
- ✅ User authentication UI
- ✅ **Stripe payment integration**
- ✅ Checkout process
- ✅ Admin dashboard
- ✅ Product management interface
- ✅ Order tracking

## 🛠️ Technology Stack

### Backend
- **Framework:** Next.js 14
- **Database:** MySQL 8.0+
- **Authentication:** JWT + bcrypt
- **Language:** TypeScript
- **API Style:** REST

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Language:** TypeScript

## 📚 Documentation

### Backend Documentation
Located in `backend/`:
- **README.md** - Main API documentation
- **SETUP_GUIDE.md** - Detailed setup instructions
- **API_TESTING.md** - API testing examples
- **FRONTEND_INTEGRATION.md** - Frontend integration guide
- **PROJECT_SUMMARY.md** - Complete project overview

## 📊 API Endpoints Overview

### Public Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/categories` - List categories
- `GET /api/products` - List products (with filters)
- `GET /api/products/featured` - Featured products

### Authenticated Endpoints
- `GET /api/auth/me` - Current user info
- `GET /api/orders` - User orders
- `POST /api/orders` - Create order

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product

## 🗄️ Database Schema

**8 Tables:**
1. `categories` - Product categories
2. `products` - Main product data
3. `product_images` - Multiple images per product
4. `product_tags` - Tag-based filtering
5. `product_variants` - Size, color, etc.
6. `users` - Customers and admins
7. `orders` - Order headers
8. `order_items` - Order line items

## 🔄 Development

### Backend Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run db:setup # Create database schema
npm run db:seed  # Seed initial data
```

### Frontend Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🚢 Deployment

### Backend
- Recommended: Vercel, Railway, DigitalOcean
- Database: PlanetScale, Railway, AWS RDS

### Frontend
- Recommended: Vercel, Netlify, Cloudflare Pages

## 🧪 Testing

### Test Backend API
```bash
cd backend
npm run dev

# In another terminal
curl http://localhost:3001/api/categories
```

### Test Frontend
```bash
cd frontend
npm run dev

# Visit http://localhost:5173
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- SQL injection prevention
- CORS configuration
- Input validation

## 📝 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=ecoshop_db
JWT_SECRET=your_secret_key
API_PORT=3001
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## 🐛 Troubleshooting

### Backend Issues
- **Database connection:** Check MySQL is running and credentials are correct
- **Port in use:** Change API_PORT in .env
- **JWT errors:** Ensure JWT_SECRET is set

### Frontend Issues
- **API connection:** Verify backend is running on port 3001
- **CORS errors:** Check CORS configuration in backend

## 📞 Support

For setup issues or questions:
1. Check the documentation in `backend/` directory
2. Review the setup guides
3. Check API testing examples

## 📄 License

This project is for educational and commercial use.

---

**Built with 💚 for a sustainable future**

*EcoShop - Making eco-friendly shopping accessible to everyone*
