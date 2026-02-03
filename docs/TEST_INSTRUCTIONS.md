# 🧪 EcoShop Integration Testing Guide

This guide will help you test the complete frontend-backend integration.

## Prerequisites Checklist

Before starting, ensure you have:
- [x] Node.js 18+ installed
- [x] MySQL 8.0+ installed and running
- [x] Git repository cloned
- [x] Terminal/Command prompt open

## Step 1: Backend Setup (5 minutes)

### 1.1 Navigate to Backend
```bash
cd backend
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Configure Database
Edit the `.env` file with your MySQL credentials:
```bash
nano .env  # or use your preferred editor
```

Update these values:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root                    # Your MySQL username
DB_PASSWORD=your_password       # Your MySQL password
DB_NAME=ecoshop_db
JWT_SECRET=ecoshop_jwt_secret_key_change_in_production_2024
API_PORT=3001
NODE_ENV=development
```

### 1.4 Create Database Schema
```bash
npm run db:setup
```

Expected output:
```
Connected to MySQL server
Database schema created successfully!
Database: ecoshop_db
```

### 1.5 Seed Database
```bash
npm run db:seed
```

Expected output:
```
✓ Seeded 13 categories
✓ Seeded 3 products
✓ Created admin user (email: admin@ecoshop.com, password: admin123)
✓ Created customer user (email: customer@ecoshop.com, password: customer123)
✅ Database seeded successfully!
```

### 1.6 Start Backend Server
```bash
npm run dev
```

Expected output:
```
ready - started server on 0.0.0.0:3001, url: http://localhost:3001
```

**✅ Backend is ready!** Keep this terminal open.

---

## Step 2: Frontend Setup (3 minutes)

Open a **NEW TERMINAL** window/tab.

### 2.1 Navigate to Frontend
```bash
cd frontend
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Verify Environment Configuration
Check that `.env` file exists with:
```env
VITE_API_URL=http://localhost:3001/api
```

### 2.4 Start Frontend Server
```bash
npm run dev
```

Expected output:
```
VITE v6.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**✅ Frontend is ready!** Keep this terminal open too.

---

## Step 3: Test the Integration (10 minutes)

Open your browser and go to: **http://localhost:5173**

### Test 1: Homepage Loading ✅
- [ ] Page loads without errors
- [ ] Featured products display (should show 4 products)
- [ ] Categories display (should show 4 categories)
- [ ] All images load correctly

### Test 2: Browse Products ✅
Navigate to **Products** page:
- [ ] Products grid displays
- [ ] Sidebar categories load
- [ ] Click on a category (products filter)
- [ ] Use search bar (products filter by search)
- [ ] Sort dropdown works (Featured, Price, Rating)

### Test 3: Product Details ✅
Click on any product:
- [ ] Product details load
- [ ] Product images display
- [ ] Variants are selectable
- [ ] Price updates when selecting variants
- [ ] Related products show at bottom
- [ ] "Add to Cart" button works

### Test 4: Cart Functionality ✅
After adding items:
- [ ] Cart icon shows item count
- [ ] Click cart icon to open drawer
- [ ] Cart items display correctly
- [ ] Quantity can be updated
- [ ] Items can be removed
- [ ] Subtotal calculates correctly

### Test 5: User Registration ✅
Navigate to **Sign Up**:
- [ ] Fill in registration form:
  - Name: `Test User`
  - Email: `test@example.com`
  - Password: `test123`
- [ ] Click "Sign Up"
- [ ] Successfully redirected after registration
- [ ] User appears logged in (check header)

### Test 6: User Login ✅
Navigate to **Sign In**:
- [ ] Use test account:
  - Email: `customer@ecoshop.com`
  - Password: `customer123`
- [ ] Click "Sign In"
- [ ] Successfully logged in
- [ ] User name appears in header

### Test 7: Checkout Flow ✅
With items in cart and logged in:
- [ ] Click "Checkout" button
- [ ] Fill shipping information:
  - Email: `test@example.com`
  - First Name: `John`
  - Last Name: `Doe`
  - Address: `123 Main St`
  - City: `New York`
  - State: `NY`
  - ZIP: `10001`
- [ ] Click "Continue to Shipping"
- [ ] Select shipping method
- [ ] Click "Continue to Payment"
- [ ] Fill payment details (use test card):
  - Card: `4242 4242 4242 4242`
  - Expiry: `12/25`
  - CVC: `123`
- [ ] Click "Pay" button
- [ ] Order confirmation page appears
- [ ] Cart is cleared

### Test 8: Admin Login ✅
Log out and login as admin:
- [ ] Navigate to Sign In
- [ ] Use admin account:
  - Email: `admin@ecoshop.com`
  - Password: `admin123`
- [ ] Successfully logged in as admin

---

## Step 4: API Testing (5 minutes)

Test API endpoints directly:

### Test with curl (Terminal)

```bash
# Test 1: Get Categories
curl http://localhost:3001/api/categories

# Test 2: Get Products
curl http://localhost:3001/api/products

# Test 3: Get Featured Products
curl http://localhost:3001/api/products/featured

# Test 4: Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@ecoshop.com","password":"customer123"}'

# Save the token from response and test authenticated endpoint:
TOKEN="your_token_here"
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test with Browser
Visit: **http://localhost:3001**
- [ ] API documentation page displays
- [ ] All endpoints are listed

---

## Step 5: Database Verification (3 minutes)

Verify data in MySQL:

```bash
mysql -u root -p
```

```sql
USE ecoshop_db;

-- Check tables
SHOW TABLES;

-- Check categories
SELECT COUNT(*) FROM categories;  -- Should be 13

-- Check products
SELECT COUNT(*) FROM products;    -- Should be 3+

-- Check users
SELECT id, email, name, role FROM users;

-- Check recent orders
SELECT id, user_id, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5;

EXIT;
```

---

## Troubleshooting

### Backend Issues

**Error: "Cannot connect to database"**
```bash
# Check MySQL is running
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Verify credentials in backend/.env
```

**Error: "Port 3001 already in use"**
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9  # macOS/Linux
# Or change API_PORT in backend/.env
```

**Error: "Database doesn't exist"**
```bash
cd backend
npm run db:setup
```

### Frontend Issues

**Error: "Failed to fetch"**
- Check backend is running on port 3001
- Verify VITE_API_URL in frontend/.env
- Check browser console for CORS errors

**Error: "Module not found"**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: "Cannot read properties of null"**
- Backend may not be seeded
- Run: `cd backend && npm run db:seed`

### Integration Issues

**Products not loading**
1. Check backend console for errors
2. Open browser DevTools (F12) → Network tab
3. Look for failed API calls
4. Check browser Console for errors

**Authentication not working**
1. Clear localStorage: Browser DevTools → Application → Local Storage → Clear
2. Try logging in again
3. Check backend console for JWT errors

---

## Success Indicators

✅ **Backend is working if:**
- Server starts without errors
- API responds to curl requests
- Database has seeded data
- Documentation page loads at http://localhost:3001

✅ **Frontend is working if:**
- Homepage loads products
- Navigation works smoothly
- No console errors in browser
- Images display correctly

✅ **Integration is working if:**
- Login/Registration works
- Products load from API
- Cart functions properly
- Orders are created in database
- Data persists across page reloads

---

## Quick Test Script

Run this to test all API endpoints:

```bash
#!/bin/bash
echo "Testing EcoShop API..."

# Test categories
echo "1. Testing categories..."
curl -s http://localhost:3001/api/categories | jq -r '.success'

# Test products
echo "2. Testing products..."
curl -s http://localhost:3001/api/products | jq -r '.success'

# Test login
echo "3. Testing login..."
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@ecoshop.com","password":"customer123"}' | jq -r '.data.token')

echo "Token: ${TOKEN:0:20}..."

# Test authenticated endpoint
echo "4. Testing authenticated endpoint..."
curl -s http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq -r '.success'

echo "✅ All tests completed!"
```

Save as `test-api.sh`, make executable with `chmod +x test-api.sh`, and run `./test-api.sh`

---

## Performance Benchmarks

Expected performance:
- Homepage load: < 2 seconds
- Product list load: < 1 second
- Product details: < 500ms
- API response time: < 200ms
- Database queries: < 50ms

---

## Next Steps After Testing

1. ✅ Verify all functionality works
2. 📊 Review integration summary in `frontend/INTEGRATION_SUMMARY.md`
3. 🔧 Customize products and categories via admin panel
4. 🚀 Deploy to production (see deployment guides)
5. 📈 Add monitoring and analytics
6. 🎨 Customize branding and styling

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend logs
3. Check browser console
4. Review documentation:
   - `backend/README.md`
   - `backend/SETUP_GUIDE.md`
   - `backend/API_TESTING.md`
   - `frontend/INTEGRATION_SUMMARY.md`

---

**Happy Testing! 🎉**
