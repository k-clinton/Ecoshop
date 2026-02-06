# 🚀 EcoShop Backend Setup Guide

This guide will walk you through setting up the EcoShop backend from scratch.

## Step 1: Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- **npm** (comes with Node.js) or **yarn**

Verify installations:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
mysql --version   # Should show 8.0.x or higher
```

## Step 2: MySQL Database Setup

### Option A: Using MySQL Command Line

1. **Login to MySQL:**
   ```bash
   mysql -u root -p
   ```

2. **Create database and user:**
   ```sql
   CREATE DATABASE ecoshop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'ecoshop_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON ecoshop_db.* TO 'ecoshop_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Create a new connection to your MySQL server
3. Create a new schema named `ecoshop_db`
4. (Optional) Create a dedicated user for the application

## Step 3: Install Dependencies

Navigate to the backend directory and install packages:

```bash
cd Ecoshop/backend
npm install
```

This will install:
- Next.js framework
- MySQL2 driver
- Authentication libraries (bcryptjs, jsonwebtoken)
- TypeScript and type definitions

## Step 4: Configure Environment Variables

The `.env` file has been created with default values. Update it with your MySQL credentials:

```bash
# Open .env file in your editor
nano .env   # or use your preferred editor
```

Update these values:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=ecoshop_user              # Your MySQL username
DB_PASSWORD=your_secure_password  # Your MySQL password
DB_NAME=ecoshop_db
JWT_SECRET=your_very_long_random_secret_string_min_32_chars
```

**Important Security Notes:**
- Use a strong, random JWT_SECRET (minimum 32 characters)
- Never commit `.env` file to version control
- Use different credentials for production

## Step 5: Create Database Schema

Run the setup script to create all necessary tables:

```bash
npm run db:setup
```

This creates:
- ✅ categories table
- ✅ products table
- ✅ product_images table
- ✅ product_tags table
- ✅ product_variants table
- ✅ users table
- ✅ orders table
- ✅ order_items table

Expected output:
```
Connected to MySQL server
Database schema created successfully!
Database: ecoshop_db
```

## Step 6: Seed Database with Initial Data

Populate the database with sample data from mockData.ts:

```bash
npm run db:seed
```

This will create:
- ✅ 13 product categories
- ✅ Sample products with variants
- ✅ Admin user (admin@ecoshop.com / admin123)
- ✅ Customer user (customer@ecoshop.com / customer123)

Expected output:
```
Connected to database
Seeding categories...
✓ Seeded 13 categories
Seeding products...
✓ Seeded 3 products
✓ Created admin user (email: admin@ecoshop.com, password: admin123)
✓ Created customer user (email: customer@ecoshop.com, password: customer123)

✅ Database seeded successfully!
```

## Step 7: Start the Development Server

```bash
npm run dev
```

The server will start on port 3001. You should see:
```
ready - started server on 0.0.0.0:3001, url: http://localhost:3001
```

## Step 8: Verify Installation

### Test the API

**Option 1: Using Browser**

Visit: http://localhost:3001

You should see the API documentation page.

**Option 2: Using curl**

```bash
# Test categories endpoint
curl http://localhost:3001/api/categories

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecoshop.com","password":"admin123"}'
```

**Option 3: Using Postman or Insomnia**

Import these test requests:

1. **Get Categories:** GET http://localhost:3001/api/categories
2. **Login:** POST http://localhost:3001/api/auth/login
   ```json
   {
     "email": "admin@ecoshop.com",
     "password": "admin123"
   }
   ```
3. **Get Products:** GET http://localhost:3001/api/products

## 🎉 Success!

Your backend is now running! You can:

1. **Access the API documentation:** http://localhost:3001
2. **Login as admin:** admin@ecoshop.com / admin123
3. **Login as customer:** customer@ecoshop.com / customer123
4. **Make API requests** to any of the available endpoints

## 📝 Next Steps

### For Development

1. **Explore API endpoints** using the documentation at http://localhost:3001
2. **Test authentication** by logging in and using the JWT token
3. **Create test orders** using the customer account
4. **Manage products** using the admin account

### For Production

1. **Change JWT_SECRET** to a strong random string
2. **Update database credentials** to production values
3. **Configure CORS** in `next.config.js` to allow only your frontend domain
4. **Set up SSL/TLS** for database connections
5. **Enable proper logging** and error monitoring
6. **Use environment-specific .env files**
7. **Run `npm run build` and `npm start`** for production mode

## 🔧 Troubleshooting

### Issue: "Access denied for user"
**Solution:** Check your MySQL credentials in `.env` file. Ensure the user has proper permissions.

```sql
GRANT ALL PRIVILEGES ON ecoshop_db.* TO 'ecoshop_user'@'localhost';
FLUSH PRIVILEGES;
```

### Issue: "Cannot connect to MySQL server"
**Solution:** 
- Ensure MySQL service is running
- Check if MySQL is listening on the correct port (default 3306)
- Verify firewall settings

### Issue: "Port 3001 already in use"
**Solution:** 
- Change API_PORT in `.env` to a different port (e.g., 3002)
- Or stop the process using port 3001:
  ```bash
  # On macOS/Linux
  lsof -ti:3001 | xargs kill -9
  
  # On Windows
  netstat -ano | findstr :3001
  taskkill /PID <PID> /F
  ```

### Issue: "Module not found" errors
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database tables not created
**Solution:**
- Ensure you ran `npm run db:setup`
- Check MySQL error logs
- Verify the database exists: `SHOW DATABASES;`

### Issue: JWT token errors
**Solution:**
- Ensure JWT_SECRET is set in `.env`
- Token format should be: `Bearer <token>`
- Check token hasn't expired (valid for 7 days)

## 📚 Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [JWT Authentication Guide](https://jwt.io/introduction)

## 🆘 Getting Help

If you encounter issues:

1. Check the console output for error messages
2. Review the troubleshooting section above
3. Ensure all prerequisites are properly installed
4. Verify environment variables are correctly set

## 📊 Database Schema Overview

```
categories
├── id (PK)
├── name
├── slug (unique)
├── image
└── description

products
├── id (PK)
├── name
├── slug (unique)
├── description
├── price
├── compare_at_price
├── category (FK)
├── featured
├── rating
├── review_count
└── stock

product_variants
├── id (PK)
├── product_id (FK)
├── name
├── sku (unique)
├── price
├── stock
└── available

orders
├── id (PK)
├── user_id (FK)
├── subtotal
├── shipping
├── tax
├── total
├── status
└── shipping_address (JSON)
```

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It's already in .gitignore
2. **Use strong passwords** for database and JWT secret
3. **Enable HTTPS** in production
4. **Implement rate limiting** for API endpoints
5. **Validate and sanitize** all user inputs
6. **Keep dependencies updated** regularly
7. **Use prepared statements** (already implemented with mysql2)
8. **Implement proper logging** for security events

---

**Ready to build something amazing! 🚀**
