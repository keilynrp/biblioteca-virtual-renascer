# Stripe Payment Integration - Sprint 4

## Overview
Complete Stripe integration for the Biblioteca Virtual Renascer do Saber project, replacing the mock payment system with real Stripe Payment Intents API.

## Setup Instructions

### Backend Setup

1. Install Stripe dependency (already added to requirements.txt):
```bash
docker-compose exec backend pip install stripe>=7.0
```

2. Run database migration for the new stripe_payment_intent_id field:
```bash
docker-compose exec backend python manage.py migrate
```

3. Update .env with your Stripe API keys:
   - Get test keys from: https://dashboard.stripe.com/test/apikeys
   - Replace the placeholder keys in .env with your actual keys

### Frontend Setup

1. Install Stripe packages (already added to package.json):
```bash
cd frontend
npm install
```

2. Restart the frontend development server:
```bash
npm run dev
```

## Testing

### Test Card Numbers
- **Success**: 4242 4242 4242 4242
- **3D Secure**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 9995

Use any future expiry date (e.g., 12/34) and any 3-digit CVC (e.g., 123)

### Test Flow
1. Navigate to http://localhost:3000/plans
2. Select a plan and click Subscribe
3. Use test card: 4242 4242 4242 4242
4. Enter expiry: 12/34, CVC: 123
5. Click Pay Now
6. Should redirect to profile with success message

## API Endpoints

- `GET /api/payments/config/` - Get Stripe publishable key
- `POST /api/payments/checkout/` - Create PaymentIntent
- `POST /api/payments/confirm/` - Confirm payment
- `POST /api/payments/webhook/` - Stripe webhook handler

## Files Modified

### Backend
- `backend/requirements.txt` - Added stripe>=7.0
- `backend/apps/payments/models.py` - Added stripe_payment_intent_id field
- `backend/apps/payments/views.py` - Implemented Stripe integration
- `backend/apps/payments/urls.py` - Added new endpoints
- `backend/apps/payments/migrations/0002_transaction_stripe_payment_intent_id.py` - Migration file
- `.env` - Added Stripe keys

### Frontend
- `frontend/package.json` - Added Stripe packages
- `frontend/src/app/(dashboard)/checkout/page.tsx` - Stripe Elements integration
- `frontend/.env.local` - Added Stripe publishable key

## Security Features
- PCI Compliance: Card data handled by Stripe
- SCA Support: 3D Secure authentication
- Webhook signature verification
- Environment variable protection

## Troubleshooting

### "Stripe is not defined"
- Restart Next.js dev server after updating .env.local

### "No module named 'stripe'"
- Run: `docker-compose exec backend pip install stripe>=7.0`

### Database migration error
- Run: `docker-compose exec backend python manage.py migrate`

## Production Checklist

Before deploying to production:
1. Replace test keys with live Stripe keys
2. Setup webhook endpoint in Stripe dashboard
3. Enable HTTPS
4. Update STRIPE_WEBHOOK_SECRET with actual webhook secret

## Resources
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
