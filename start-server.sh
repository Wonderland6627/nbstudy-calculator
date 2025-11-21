#!/bin/bash
echo "Starting local server..."
echo ""

# 获取本机IP地址（Linux/Mac）
LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)

echo "========================================"
echo "Local server started!"
echo "========================================"
echo ""
echo "Computer access:"
echo "  http://localhost:8000"
echo ""
echo "Mobile access (same WiFi):"
if [ -n "$LOCAL_IP" ]; then
    echo "  http://$LOCAL_IP:8000"
else
    echo "  Please check your IP address manually"
    echo "  Run: ifconfig (Linux) or ipconfig (Mac)"
fi
echo ""
echo "========================================"
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""
python3 -m http.server 8000

