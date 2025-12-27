# Stripe Integration - Quick Setup Steps

## Immediate Next Steps

### 1. Get Your Stripe API Keys
1. Go to https://dashboard.stripe.com/register to create a Stripe account (if you don't have one)
2. Go to https://dashboard.stripe.com/test/apikeys
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### 2. Update Environment Variables

#### Backend (.env)
Replace the placeholder keys in `d:/bvs_framework/.env`:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY
```

#### Frontend (.env.local)
Replace the placeholder key in `d:/bvs_framework/frontend/.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY
```

### 3. Install Backend Dependencies
```bash
docker-compose exec backend pip install stripe>=7.0
```

### 4. Run Database Migration
```bash
docker-compose exec backend python manage.py migrate
```

### 5. Install Frontend Dependencies
```bash
cd d:/bvs_framework/frontend
npm install
```

### 6. Restart Services
```bash
# Backend (if needed)
docker-compose restart backend

# Frontend
cd d:/bvs_framework/frontend
npm run dev
```

## Test the Integration

1. Open browser: http://localhost:3000/plans
2. Click "Subscribe" on any plan
3. You'll be redirected to checkout page
4. Use test card: **4242 4242 4242 4242**
5. Enter any future expiry (e.g., 12/34)
6. Enter any CVC (e.g., 123)
7. Click "Pay Now"
8. Should redirect to profile with success message

## Common Issues

### Backend container needs rebuilding
```bash
docker-compose build backend
docker-compose up -d backend
```

### Frontend modules not found
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Payment fails with "Invalid API Key"
- Double-check that you copied the correct keys from Stripe dashboard
- Make sure there are no extra spaces in the .env files
- Ensure you're using TEST keys (pk_test_ and sk_test_)

## Stripe Dashboard

Monitor test payments:
- https://dashboard.stripe.com/test/payments

View test API keys:
- https://dashboard.stripe.com/test/apikeys

## Note on Test Keys

The placeholder keys in the files are FAKE and will NOT work. You MUST replace them with your actual Stripe test keys from the dashboard.
