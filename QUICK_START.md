# 🚀 EcoShop Quick Start Guide

## Issue: Node.js Version

Your system has Node.js 18.19.1, but Next.js 14+ requires Node.js 20.9.0+.

### Solution Options

#### Option 1: Upgrade Node.js (Recommended)

**Using nvm (Node Version Manager):**
```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 20
nvm install 20
nvm use 20

# Verify
node --version  # Should show v20.x.x
```

**After upgrading Node.js:**
```bash
cd backend
npm install
npm run dev
```

#### Option 2: Use Next.js 13 (Current Setup)

I've already updated `backend/package.json` to use Next.js 13.5.6 which works with Node 18.

**Wait for npm install to complete, then:**
```bash
cd backend
npm run dev
```

---

## Complete Setup Steps

### 1. Backend Setup

```bash
cd backend

# If npm install is still running, wait for it to complete
# Check with: ps aux | grep "npm install"

# Once complete, start the server
npm run dev
```

**Expected output:**
```
ready - started server on 0.0.0.0:3001, url: http://localhost:3001
```

### 2. Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

**Expected output:**
```
VITE ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## Quick Tests

### Test 1: API is Working
Open browser: **http://localhost:3001**
- Should see API documentation page

### Test 2: Categories API
```bash
curl http://localhost:3001/api/categories
```

Should return:
```json
{
  "success": true,
  "data": [
    {"id": "cat-eco-fashion", "name": "Eco Fashion", ...},
    ...
  ]
}
```

### Test 3: Frontend
Open browser: **http://localhost:5173**
- Should see the EcoShop homepage
- Featured products should load
- Categories should display

### Test 4: Login
1. Click "Sign In"
2. Use test account:
   - Email: `customer@ecoshop.com`
   - Password: `customer123`
3. Should successfully log in

---

## Troubleshooting

### Backend won't start
```bash
# Check if npm install completed
cd backend
ls node_modules/.bin/next

# If file exists, try starting again
npm run dev
```

### Port already in use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in backend/.env
API_PORT=3002
```

### Database connection error
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify credentials in backend/.env
DB_USER=root
DB_PASSWORD=your_password
```

---

## Integration Status

✅ **Database:** Seeded successfully with 13 categories, 3 products, 2 users
✅ **Backend API:** 17 endpoints ready (once server starts)
✅ **Frontend:** Fully integrated with API services
✅ **Authentication:** JWT-based auth configured

---

## Next Steps

Once both servers are running:

1. **Test Homepage** - http://localhost:5173
2. **Browse Products** - Click "Products" in navigation
3. **View Product Details** - Click any product
4. **Test Login** - Use test accounts
5. **Test Cart** - Add products to cart
6. **Test Checkout** - Complete an order

---

## Support

If you continue having issues:

1. **Upgrade to Node.js 20** (recommended)
2. Check `TEST_INSTRUCTIONS.md` for detailed testing guide
3. Review `backend/README.md` for API documentation
4. Check browser console for errors (F12)

---

**Current Status:**
- ✅ Database setup complete
- ✅ Database seeded with data
- ⏳ Backend npm install in progress
- ⏳ Backend server not started yet
- ⏳ Frontend not tested yet

**Once npm install completes, run:**
```bash
cd backend && npm run dev
```

Then in a new terminal:
```bash
cd frontend && npm run dev
```
