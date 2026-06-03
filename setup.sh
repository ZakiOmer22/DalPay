#!/bin/bash

set -e

echo "🚀 Setting up DalPay..."

# Backend
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🔐 Creating backend/.env..."
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
FRONTEND_URL=https://dalpay-portal.vercel.app

DATABASE_URL=postgresql://neondb_owner:npg_lWeoQt0yg6JX@ep-polished-voice-amk1r9vl-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=c3ced869ce64e54a1d7d84bed289c70e9e9ab0f6966fd851711805e72fce26dcc8c09121351d7a174116eb5eef5dbce8b3d2ddd6fcc13b2ba2986e0ae02a12ad
JWT_SECRET_V1=b84a7260670e4bf00bc2ae9ac7f7fd900ee698d21028810dd5644f3fa63ea9ca4aafbafea82da9dcd39a5e25cdd210880e86d5c62e0e7025ebde41222dfaa67c
JWT_SECRET_V2=c3ced869ce64e54a1d7d84bed289c70e9e9ab0f6966fd851711805e72fce26dcc8c09121351d7a174116eb5eef5dbce8b3d2ddd6fcc13b2ba2986e0ae02a12ad
ACTIVE_JWT_VERSION=2
JWT_REFRESH_SECRET=6ca2baa65d8c680cebb7b43cb64f3720eb7bdeb4dad2503adab89a0a083b2aee9b41c8b8f9c659fa252e80d52bdb36f10c6020fd6e46447a79f732793bb9311d
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=1d

ENCRYPTION_KEY_V1=167b23f7c61afbe3fb9265e55e16a3775c4bcedafae423b7a87ee55c65232efd
ENCRYPTION_KEY_V2=d6c8daf563444709be8011155ddc2858c0a1ec58bb0295b7946de58f6070610d
ACTIVE_ENCRYPTION_KEY_VERSION=2
HASH_SALT=somaliland-dalpay-salt-2026

SESSION_SECRET=3a9c7e2f26e464d0c585a7213f6b10494ee3c99aaf4ec5de21bc5f8d25a69f346e6b1554f5071a1d3988984123dd82606e28602d7cbb2cd20581c29409dd103f
TURNSTILE_SECRET_KEY=0x4AAAAAADMENPWIpNVh6lsXxMPZjZ4uttc

STRIPE_SECRET_KEY=your_stripe_secret_key_here

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=zakiomer624@gmail.com
SMTP_PASS=hnhomzlrhyalgxnv
SMTP_FROM=noreply@dalpay.gov
ALERT_EMAIL=alert@dalpay.gov

ZAAD_API_URL=https://api.zaad.com/v1
ZAAD_API_KEY=zaad_test_key
EDAHAB_API_URL=https://api.edahab.com/v1
EDAHAB_API_KEY=edahab_test_key
MOBILE_MONEY_CALLBACK_SECRET=93631a7605a2a40e4874e6d8a156b237ffb863d53c1e74c2b77295e87ade21d0

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

METRICS_KEY=b6835b3633b7881e6ddeba16a3d498241c5c08e455d06b15

VITE_GEMINI_MODEL=gemini-1.5-flash
VITE_GEMINI_API_KEY=AIzaSyALxm1ecqjExjSuiLZb7OQXhE907tBJsqI
EOF

cd ..

# Frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🔐 Creating frontend/.env..."
cat > .env << 'EOF'
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51TMi2DRjhXN4uRPSzCf3AcznJfaXBB6BtwQIxUs82nezornLiuHRL1dIEeqxhlaapX7GGOYhAFz0WQhDSjiQv6mv00B1rHjw9V
VITE_SHOW_CONSOLE_WARNING=true
VITE_TURNSTILE_SITE_KEY=0x4AAAAAADMENE-gf9XZAvaS
VITE_RECAPTCHA_SITE_KEY=6LcK-vYsAAAAAJeuMe4ns7QV1Ei5qesd5vXZLk0T
EOF

cd ..

echo "✅ Setup complete!"
echo "👉 Run './dev.sh' to start the environment."