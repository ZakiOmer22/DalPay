#!/bin/bash

trap 'kill 0' SIGINT

echo "🚀 Starting DalPay..."

# Backend API
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Background worker
cd backend
npm run worker &
WORKER_PID=$!
cd ..

# Frontend Vite
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ All services started"
echo "📡 Backend:  http://localhost:5000"
echo "🖥️  Frontend: http://localhost:5173"
echo "⚙️  Worker:   background job"
echo ""
echo "Press Ctrl+C to stop all."

wait