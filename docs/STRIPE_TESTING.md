# Stripe Payment Testing Guide

## 🧪 Test Mode Configuration

Your Stripe integration is configured and ready for testing with mock data!

## 📝 Quick Test Card Reference

### ✅ Successful Payment (Most Common)
```
Card Number: 4242 4242 4242 4242
Expiry:      Any future date (e.g., 12/34)
CVC:         Any 3 digits (e.g., 123)
ZIP:         Any 5 digits (e.g., 12345)
```

### 🔐 3D Secure Authentication Required
```
Card Number: 4000 0025 0000 3155
Expiry:      Any future date
CVC:         Any 3 digits
ZIP:         Any 5 digits
```
*Note: This will prompt for additional authentication*

### ❌ Declined Payment (Insufficient Funds)
```
Card Number: 4000 0000 0000 9995
Expiry:      Any future date
CVC:         Any 3 digits
ZIP:         Any 5 digits
```

### 💳 Other Test Cards

| Card Number          | Scenario                        |
|---------------------|---------------------------------|
| 4000 0000 0000 0077 | Charge succeeds, funds on hold  |
| 4000 0000 0000 0341 | Attach succeeds, charge fails   |
| 4000 0000 0000 0002 | Card declined (generic)         |
| 4000 0000 0000 9987 | Card declined (lost card)       |
| 4000 0000 0000 9979 | Card declined (stolen card)     |

## 🚀 How to Test Payment Flow

1. **Add products to cart** - Browse products and add items
2. **Go to checkout** - Click cart icon and proceed to checkout
3. **Fill shipping info** - Enter any valid shipping address
4. **Select shipping method** - Choose standard or express
5. **Use test card** - On payment page, you'll see test card instructions
6. **Complete payment** - Use `4242 4242 4242 4242` for successful payment

## 🔄 Webhook Testing

To test webhooks locally, ensure the Stripe CLI is listening:

```bash
./stripe listen --forward-to localhost:3001/api/payments/webhook
```

When a payment succeeds, the webhook will:
1. Receive `payment_intent.succeeded` event
2. Update order status from `pending` to `processing`
3. Log the update in the backend console

## 📊 Verify Payment in Stripe Dashboard

1. Visit [Stripe Dashboard - Test Mode](https://dashboard.stripe.com/test/payments)
2. You'll see all test payments listed
3. Click on a payment to see full details

## 🎯 In-App Test Mode Notice

When running in development mode, the checkout page automatically displays:
- ✅ Test card instructions
- ✅ Multiple test card scenarios
- ✅ Visual "Test Mode" indicator

This notice only appears in development and will be hidden in production!

## 🛠️ Environment Variables

Make sure these are set in `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

And in `frontend/.env` (or `.env.local`):
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## ✨ Features Enabled

- ✅ Stripe Payment Elements (modern UI)
- ✅ Real-time validation
- ✅ Webhook integration for order status updates
- ✅ Secure payment processing
- ✅ Test mode indicators
- ✅ Mock data support

---

**Happy Testing! 🎉**
