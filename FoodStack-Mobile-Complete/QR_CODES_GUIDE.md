# 🎯 QR Codes Guide - Hướng dẫn sử dụng QR Code trong FoodStack

## ✅ Đã hoàn thành

Tôi đã tạo hệ thống QR code hoàn chỉnh cho ứng dụng FoodStack với các loại QR code khác nhau phục vụ cho từng mục đích cụ thể.

## 📱 Các loại QR Code đã tạo

### 1. **QR Code Bàn (Table QR)**
- **Mục đích:** Quét để xem menu và đặt món
- **Format:** `qr-token-table-{id}`
- **Ví dụ:** 
  - `qr-token-table-1` → Bàn B01 (4 chỗ)
  - `qr-token-table-2` → Bàn B02 (2 chỗ)  
  - `qr-token-table-3` → Bàn B03 (6 chỗ)
- **Chức năng:** Khi quét sẽ hiển thị thông tin bàn, nhà hàng và chuyển đến menu

### 2. **QR Code Đơn hàng (Order QR)**
- **Mục đích:** Theo dõi trạng thái đơn hàng
- **Format:** `ORDER-{orderNumber}-{orderId}`
- **Ví dụ:** `ORDER-ORD1234-order-123`
- **Chức năng:** 
  - Hiển thị trong OrderTrackingScreen
  - Có thể chia sẻ, lưu ảnh
  - Nhân viên quét để xem chi tiết đơn hàng

### 3. **QR Code Thanh toán (Payment QR)**
- **Mục đích:** Thanh toán nhanh chóng
- **Format:** `PAYMENT-{paymentId}-{amount}`
- **Ví dụ:** `PAYMENT-PAY5678-207000`
- **Chức năng:** Tích hợp với cổng thanh toán

### 4. **QR Code Đánh giá (Feedback QR)**
- **Mục đích:** Đánh giá dịch vụ nhà hàng
- **Format:** `FEEDBACK-{restaurantId}-{branchId}`
- **Ví dụ:** `FEEDBACK-restaurant-1-branch-1`
- **Chức năng:** Chuyển đến form đánh giá

### 5. **QR Code Tích điểm (Loyalty QR)**
- **Mục đích:** Tích lũy điểm thưởng
- **Format:** `LOYALTY-{customerId}-points`
- **Ví dụ:** `LOYALTY-customer-123-points`
- **Chức năng:** Cập nhật điểm thành viên

### 6. **QR Code WiFi**
- **Mục đích:** Kết nối WiFi tự động
- **Format:** `WIFI:T:WPA;S:{SSID};P:{password};H:false;;`
- **Ví dụ:** `WIFI:T:WPA;S:FoodStack_Guest;P:foodstack2024;H:false;;`
- **Chức năng:** Tự động kết nối WiFi khi quét

## 🖥️ Screens đã tạo

### 1. **QRTestScreen** (`/QRTest`)
- Hiển thị 3 QR codes test cho bàn
- Button "Vào Menu Trực Tiếp" để bypass QR
- Test API integration
- Debug info

### 2. **OrderQRScreen** (`/OrderQR`)
- Hiển thị QR code đơn hàng lớn
- Thông tin chi tiết đơn hàng
- Chức năng chia sẻ, lưu ảnh, sao chép
- UI đẹp với corners và effects

### 3. **QRGalleryScreen** (`/QRGallery`)
- Thư viện tất cả loại QR codes
- Grid layout với 6 loại QR khác nhau
- Mỗi QR có màu sắc và icon riêng
- Hướng dẫn sử dụng chi tiết

### 4. **OrderTrackingScreen** (đã cập nhật)
- Thêm section QR code nhỏ
- Button "Xem lớn" để mở OrderQRScreen
- Chức năng chia sẻ và lưu ảnh

## 🎨 Tính năng QR Code

### **Tự động tạo QR**
```typescript
// QR URL generator
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}&bgcolor=FFFFFF&color=000000&margin=10`;
```

### **Màu sắc theo loại**
- 🟠 **Bàn:** `#E8622A` (Orange)
- 🔵 **Đơn hàng:** `#3498DB` (Blue)  
- 🟢 **Thanh toán:** `#27AE60` (Green)
- 🟡 **Đánh giá:** `#F39C12` (Yellow)
- 🟣 **Tích điểm:** `#9B59B6` (Purple)
- 🟦 **WiFi:** `#1ABC9C` (Teal)

### **UI Effects**
- Corner borders với màu tương ứng
- Shadows và gradients
- Responsive design
- Loading states

## 🔄 Luồng sử dụng

### **Luồng đặt món:**
1. **Quét QR bàn** → Xem thông tin bàn
2. **Vào Menu** → Chọn món ăn  
3. **Thêm vào giỏ** → Xem giỏ hàng
4. **Đặt hàng** → Tạo đơn hàng
5. **Nhận QR đơn hàng** → Theo dõi trạng thái

### **Luồng theo dõi:**
1. **OrderTrackingScreen** → Xem trạng thái
2. **QR Code section** → QR nhỏ với thông tin
3. **"Xem lớn"** → OrderQRScreen với QR lớn
4. **Chia sẻ/Lưu** → Các chức năng bổ sung

## 🧪 Cách test

### **1. Test QR Bàn:**
```
Home → QR Gallery → Bàn B01 → Test QR
Home → QR Test → Chọn QR code
```

### **2. Test QR Đơn hàng:**
```
Home → QR Gallery → Đơn hàng #ORD1234
Hoặc: Đặt món → OrderTracking → QR section
```

### **3. Test tất cả QR:**
```
Home → QR Gallery → Xem 6 loại QR khác nhau
```

## 📊 Mock Data

### **API Endpoints có mock data:**
- ✅ `/api/v1/public/tables/{qr_token}` → Table info
- ✅ `/api/v1/branches/{branchId}/menu` → Menu data  
- ✅ `/api/v1/orders` → Create order
- ✅ `/api/v1/orders/{orderId}` → Order details

### **QR Tokens test:**
- ✅ `qr-token-table-1` → Bàn B01
- ✅ `qr-token-table-2` → Bàn B02
- ✅ `qr-token-table-3` → Bàn B03

## 🎯 Kết quả

### **Chức năng hoàn chỉnh:**
- ✅ **6 loại QR code** cho các mục đích khác nhau
- ✅ **4 screens mới** với UI đẹp và UX tốt
- ✅ **Mock data đầy đủ** cho test offline
- ✅ **Tích hợp hoàn chỉnh** với luồng đặt món
- ✅ **Responsive design** cho mọi kích thước màn hình

### **User có thể:**
- 🎯 Quét QR bàn để xem menu
- 🛒 Đặt món và nhận QR đơn hàng  
- 📱 Xem QR đơn hàng với UI đẹp
- 📤 Chia sẻ và lưu QR codes
- 🎨 Khám phá thư viện QR Gallery
- 🧪 Test tất cả chức năng offline

## 🚀 Hướng dẫn sử dụng

1. **Restart Metro bundler:**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Test luồng hoàn chỉnh:**
   - Home → QR Gallery (xem tất cả QR)
   - Home → QR Test → Test QR bàn
   - Đặt món → Nhận QR đơn hàng
   - OrderTracking → Xem QR lớn

3. **Các button test trong Home:**
   - 🎨 **QR Gallery** → Thư viện QR codes
   - 🧪 **QR Test** → Test QR bàn
   - ⚙️ **API Test** → Test API endpoints

Hệ thống QR code đã hoàn thiện và sẵn sàng sử dụng! 🎉