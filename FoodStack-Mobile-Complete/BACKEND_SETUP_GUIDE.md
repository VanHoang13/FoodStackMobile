# Backend Setup Guide - Mock Data Only

## ✅ Status: READY TO USE

The backend has been successfully converted to use **mock data only** - no database required!

## 🚀 How to Run

### 1. Install Dependencies
```bash
cd FoodStackMobile/FoodStack-Mobile-Complete/backend
npm install
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Verify It's Working
The server will start on `http://localhost:3000` and show:
```
🚀 Server running on port 3000
📝 Environment: development
🔗 Local URL: http://localhost:3000
🌐 Network URL: http://0.0.0.0:3000
```

### 4. Test Key Endpoints
Run the test script to verify all endpoints work:
```bash
node test-all-endpoints.js
```

## 📱 Mobile App Configuration

Update your mobile app's `config.js` to point to your backend:
```javascript
export const API_BASE_URL = 'http://192.168.1.99:3000/api/v1';
```

Replace `192.168.1.99` with your actual IP address.

## 🔧 Key Features Working

### ✅ QR Code Scanning
- **Endpoint**: `GET /api/v1/public/tables/:qr_token`
- **Test**: `http://localhost:3000/api/v1/public/tables/qr-token-table-1`
- **Returns**: Table info, branch info, restaurant info

### ✅ Menu Display
- **Endpoint**: `GET /api/v1/public/branches/:branch_id/menu`
- **Test**: `http://localhost:3000/api/v1/public/branches/branch-1/menu`
- **Returns**: Categories with menu items

### ✅ Food Customization
- **Endpoint**: `GET /api/v1/public/menu-items/:item_id/customizations`
- **Test**: `http://localhost:3000/api/v1/public/menu-items/item-1-1/customizations`
- **Returns**: Customization options (spice level, toppings)

### ✅ Order Management
- **Endpoint**: `POST /api/v1/orders`
- **Returns**: Order confirmation with QR codes

### ✅ Payment System
- **Endpoint**: `POST /api/v1/payments`
- **Returns**: Payment confirmation

## 📊 Mock Data Available

### Restaurants
- **Nhà Hàng Phố Cổ** (restaurant-1)
- **Quán Ăn Sài Gòn** (restaurant-2)

### Branches
- **Chi nhánh Hoàn Kiếm** (branch-1)
- **Chi nhánh Tây Hồ** (branch-2)

### Tables
- **B01** (qr-token-table-1) - 4 seats
- **B02** (qr-token-table-2) - 2 seats  
- **B03** (qr-token-table-3) - 6 seats

### Menu Categories
1. **Phở & Bún** - 4 items (85,000 - 80,000 VND)
2. **Cơm** - 3 items (85,000 - 105,000 VND)
3. **Đồ uống** - 3 items (15,000 - 30,000 VND)
4. **Tráng miệng** - 2 items (25,000 - 35,000 VND)

## 🛠️ What Was Removed

### ❌ Database Dependencies
- ✅ Removed `@prisma/client`, `prisma`
- ✅ Removed `pg`, `mongoose` 
- ✅ Removed `ioredis`, `bull`
- ✅ Removed all SQL files and migrations
- ✅ Removed Prisma schema

### ❌ External Services
- ✅ Replaced real Redis with MockRedis
- ✅ Replaced real database with MockDatabase
- ✅ All data stored in memory (resets on restart)

## 🔄 How Mock Data Works

### Data Storage
- All data stored in `src/data/mockData.js`
- Data persists during server runtime
- Data resets when server restarts

### Database Simulation
- `MockDatabase` class simulates Prisma operations
- `MockRedis` class simulates Redis operations
- All repository patterns maintained

### API Compatibility
- All endpoints work exactly the same
- Same request/response format
- Same error handling

## 🧪 Testing

### Automated Tests
```bash
node test-all-endpoints.js
```

### Manual Testing
1. **QR Scanning**: Use tokens `qr-token-table-1`, `qr-token-table-2`, `qr-token-table-3`
2. **Menu Browsing**: Use branch ID `branch-1`
3. **Food Ordering**: Use any menu item IDs from the mock data
4. **Payment**: All payment methods work with mock responses

## 🚨 Important Notes

### Data Persistence
- **Mock data resets on server restart**
- Orders, payments, user data will be lost
- For production, you'd need a real database

### Performance
- Mock data is fast (in-memory)
- No network latency to database
- Perfect for development and testing

### Scalability
- Single server instance only
- No data sharing between server instances
- Not suitable for production load

## 🎯 Next Steps

1. **Start the backend**: `npm run dev`
2. **Test the mobile app**: Point it to your backend IP
3. **Verify QR scanning**: Use the test QR tokens
4. **Test full order flow**: From menu to payment
5. **Check payment system**: Wallet deduction and loyalty points

The backend is now fully functional with mock data and ready for mobile app integration!