#!/bin/bash

echo "==============================================="
echo "LinguaVault - Heritage Language Preservation"
echo "==============================================="
echo ""

echo "Starting Backend Server..."
cd "$(dirname "$0")/backend"
python main.py &
BACKEND_PID=$!

sleep 3

echo ""
echo "Starting Frontend Development Server..."
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "==============================================="
echo "LinguaVault is starting up!"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "==============================================="
echo ""
echo "Press Ctrl+C to stop all servers"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait
