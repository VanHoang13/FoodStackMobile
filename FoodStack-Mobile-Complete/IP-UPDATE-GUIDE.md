# 🔧 Hướng dẫn sửa lỗi Network Error

## ❌ Vấn đề
Khi chạy mobile app, bạn gặp lỗi:
```
ERROR ❌ Error getting staff performance: Network Error
LOG ⚠️ Performance API not available, using mock data
```

## 🔍 Nguyên nhân
- Backend server đã tắt
- IP address của máy đã thay đổi
- Mobile app không thể kết nối tới backend

## ✅ Giải pháp

### Bước 1: Khởi động Backend
```bash
cd FoodStackMobile/FoodStack-Mobile-Complete/backend
npm start
```

### Bước 2: Cập nhật IP tự động
```bash
cd FoodStackMobile/FoodStack-Mobile-Complete/mobile-app
npm run update-ip
```

### Bước 3: Restart Mobile App
- Dừng Metro bundler (Ctrl+C)
- Chạy lại: `npm start`

## 🛠️ Cách thủ công (nếu script không hoạt động)

### 1. Tìm IP của máy:
**Windows:**
```cmd
ipconfig
```
Tìm dòng có `IPv4 Address` và `192.168.x.x`

**Mac/Linux:**
```bash
ifconfig | grep "inet 192.168"
```

### 2. Cập nhật file config:
Mở `mobile-app/config.js` và thay đổi:
```javascript
BACKEND_IP: '192.168.1.XXX', // Thay XXX bằng IP mới
```

### 3. Restart mobile app

## 🚀 Kiểm tra kết nối

Test backend:
```bash
curl http://192.168.1.XXX:3000/health
```

Kết quả mong đợi:
```json
{"success":true,"status":"healthy","timestamp":"..."}
```

## 📝 Lưu ý
- IP có thể thay đổi khi restart router/máy tính
- Đảm bảo mobile device và máy chạy backend cùng mạng WiFi
- Nếu vẫn lỗi, kiểm tra firewall/antivirus

## 🔧 Scripts hữu ích

```bash
# Tự động cập nhật IP
npm run update-ip

# Khởi động backend
cd backend && npm start

# Khởi động mobile app
npm start
```