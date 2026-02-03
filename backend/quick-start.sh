#!/bin/bash

# EcoShop Backend Quick Start Script
# This script helps you set up the backend quickly

echo "🌱 EcoShop Backend Quick Start"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL command not found. Please ensure MySQL is installed and running."
    echo "   You can continue if MySQL is running as a service."
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MySQL is installed"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your database credentials:"
    echo "   - DB_USER"
    echo "   - DB_PASSWORD"
    echo "   - DB_NAME"
    echo "   - JWT_SECRET"
    echo ""
    read -p "Press Enter after you've configured .env file..."
fi

echo ""
echo "🗄️  Setting up database..."
read -p "Do you want to create the database schema? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:setup
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to set up database"
        echo "   Please check your database credentials in .env file"
        exit 1
    fi
    
    echo "✅ Database schema created successfully"
    echo ""
    
    read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:seed
        
        if [ $? -ne 0 ]; then
            echo "❌ Failed to seed database"
            exit 1
        fi
        
        echo "✅ Database seeded successfully"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Default test accounts:"
echo "  Admin:    admin@ecoshop.com / admin123"
echo "  Customer: customer@ecoshop.com / customer123"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The API will be available at: http://localhost:3001"
echo ""
