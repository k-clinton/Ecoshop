# Product Seeding Script

## Overview
This script seeds the database with 35 mock products from `frontend/src/data/mockData.ts`.

## Usage

### Quick Run
```bash
cd backend
node scripts/seed-mock-products.js
```

### What it does
- Extracts all 35 products from the JSON file
- Maps frontend category IDs to backend category IDs
- Inserts/updates products in the database
- Handles images, tags, and variants
- Shows progress with success/failure indicators

### Requirements
- Database must be running and accessible
- `.env` file must be configured with correct DB credentials
- `tmp_rovodev_products.json` file must exist in the workspace root

### Category Mapping
The script automatically maps frontend categories to backend:
- `beauty` → `cat-beauty`
- `fashion` → `cat-eco-fashion`
- `kitchen` → `cat-kitchen`
- `appliances` → `cat-appliances`
- `books` → `cat-books`
- `sports` → `cat-sports`
- `phones` → `cat-phones`
- `clothes` → `cat-clothes`
- `bags` → `cat-bags`
- `watches` → `cat-watches`
- `health` → `cat-health`
- `computers` → `cat-computers`
- `home` → `cat-home`

### Output
```
╔════════════════════════════════════════╗
║  Seeding Mock Products to Database    ║
╚════════════════════════════════════════╝

Loaded 35 products from JSON file

[01] Bamboo Cutlery Set                       ... ✓
[02] Organic Cotton Tote Bag                  ... ✓
...
[35] Cork Laptop Sleeve                       ... ✓

╔════════════════════════════════════════╗
║  ✅ Seeding Complete!                  ║
║  Success: 35                           ║
║  Failed:  0                            ║
╚════════════════════════════════════════╝
```

### Troubleshooting

**Error: Cannot find tmp_rovodev_products.json**
- The JSON file was cleaned up after seeding
- Re-extract products using the Python script or manually create the JSON

**Error: Foreign key constraint fails**
- Category ID doesn't exist in the database
- Check the category mapping in the script
- Verify categories exist: `curl http://localhost:3001/api/categories`

**Error: Duplicate entry for key 'slug'**
- A product with that slug already exists
- Delete the existing product or update the script to use UPDATE instead of INSERT

## Verification

After running, verify products appear in both places:

**Admin Dashboard:**
```bash
curl -s http://localhost:3001/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN" | json_pp
```

**Customer Store:**
```bash
curl -s http://localhost:3001/api/products | json_pp
```

## Integration Complete

✅ Admin dashboard now uses real database via API  
✅ Customer store uses real database via API  
✅ Products created in admin appear immediately in store  
✅ All 35 mock products successfully seeded  
