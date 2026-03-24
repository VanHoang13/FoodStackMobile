# 🔧 Fix Login AbortError - GIẢI PHÁP

## ✅ Đã xác nhận
- Backend đang chạy đúng ✅
- IP configuration đúng (192.168.1.99:3000) ✅  
- Connection từ Node.js thành công ✅
- Vấn đề chỉ xảy ra trong React Native environment ❌

## 🚀 Giải pháp theo thứ tự ưu tiên

### 1. Clear Metro Cache & Restart (THỰC HIỆN NGAY)
```bash
# Trong terminal mobile-app folder:
npx expo start --clear
# Hoặc
npm start -- --reset-cache
```

### 2. Force Restart Mobile App
```
1. Force close app hoàn toàn trên điện thoại
2. Mở lại app
3. Thử login lại
```

### 3. Restart Expo Development Server
```bash
# Stop current expo server (Ctrl+C)
# Then restart:
cd mobile-app
npx expo start --clear --reset-cache
```

### 4. Check Network Configuration
```
1. Đảm bảo mobile và PC cùng WiFi network
2. Tắt VPN nếu có
3. Tắt proxy nếu có
4. Check firewall không block port 3000
```

### 5. Alternative IP Test
Nếu vẫn không work, thử các IP khác:
```javascript
// Trong config.js, thử từng IP này:
BACKEND_IP: '192.168.1.99'  // Current
BACKEND_IP: '26.145.139.243'  // Alternative 1  
BACKEND_IP: '172.28.176.1'   // Alternative 2
```

### 6. Development Build vs Expo Go
Nếu đang dùng Expo Go:
```bash
# Try development build instead:
npx expo run:android
# hoặc
npx expo run:ios
```

## 🔍 Debug Steps

### Step 1: Clear Everything
```bash
# Clear Metro cache
npx expo start --clear

# Clear npm cache  
npm cache clean --force

# Clear node_modules (if needed)
rm -rf node_modules
npm install
```

### Step 2: Verify Config
```bash
# Check current config
node test-connection.js

# Should show:
# ✅ Connection successful!
# 🎉 Backend is reachable from this IP
```

### Step 3: Test Mobile Connection
```
1. Open mobile app
2. Try login with: owner@foodstack.test / password123
3. Check console logs for:
   - 🔐 Login attempt 1/2...
   - Should NOT see "AbortError"
```

## 🎯 Expected Result

After clearing cache and restart:
```
LOG  🚀 Starting login process...
LOG  📧 Logging in with email: owner@foodstack.test
LOG  🔄 AuthContext: Starting login...
LOG  🔐 Login attempt 1/2...
LOG  ✅ Login successful!
LOG  💾 Auth data stored successfully
```

## 🚨 If Still Failing

### Fallback 1: Use localhost tunnel
```bash
# Install ngrok
npm install -g ngrok

# Tunnel backend
ngrok http 3000

# Update config.js with ngrok URL
BACKEND_IP: 'abc123.ngrok.io'
BACKEND_PORT: '80'
```

### Fallback 2: Use different network
```
1. Try mobile hotspot instead of WiFi
2. Connect PC to mobile hotspot
3. Get new IP with: ipconfig
4. Update config.js
5. Test again
```

### Fallback 3: Emulator instead of physical device
```bash
# Android emulator
npx expo run:android

# iOS simulator  
npx expo run:ios
```

## 📱 Quick Test Commands

```bash
# 1. Clear and restart
npx expo start --clear

# 2. Test backend connection
node test-connection.js

# 3. Check IP
ipconfig | findstr "IPv4"

# 4. Test backend directly
curl -X POST http://192.168.1.99:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@foodstack.test","password":"password123"}'
```

## 🎉 Success Indicators

Login thành công khi thấy:
- ✅ No AbortError in console
- ✅ "Login successful" message
- ✅ Navigate to main app screen
- ✅ Can access owner features
- ✅ Upload ảnh works without token error

**Hãy thực hiện Step 1 (Clear Metro Cache) trước tiên!**