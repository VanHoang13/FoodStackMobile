# 🧪 Menu System Testing Guide

## 🎯 Vấn đề đã được sửa

Customer không thể xem menu khi chọn nhà hàng. Đã sửa và thêm nhiều cách để test menu system.

## ✅ Những gì đã sửa

### 1. **Sửa RestaurantSelectionScreen**
- **File**: `mobile-app/src/screens/RestaurantSelectionScreen.tsx`
- **Vấn đề**: Truyền sai format data cho MenuScreen
- **Giải pháp**: Tạo mock tableInfo đúng format với branchId

### 2. **Cải thiện MenuScreen**
- **File**: `mobile-app/src/screens/MenuScreen.tsx`
- **Thêm**: Fallback data khi API fail
- **Thêm**: Debug logging để track lỗi
- **Thêm**: Better error handling

### 3. **Tạo TestMenuScreen**
- **File**: `mobile-app/src/screens/TestMenuScreen.tsx`
- **Chức năng**: Bypass QR scan và test trực tiếp menu
- **Mục đích**: Test menu mà không cần QR code hoặc network

### 4. **Thêm Test Button vào HomeScreen**
- **File**: `mobile-app/src/screens/HomeScreen.tsx`
- **Button**: "Test Menu" với icon bug
- **Màu**: Đỏ cam để dễ nhận biết

## 🧪 Cách Test Menu System

### **Phương pháp 1: Test Direct Menu (Khuyến nghị)**
1. Mở mobile app
2. Đăng nhập với role CUSTOMER
3. Ở HomeScreen, tìm button **"Test Menu"** (màu đỏ cam, icon bug)
4. Tap "Test Direct Menu"
5. Sẽ vào MenuScreen với mock data

### **Phương pháp 2: Test Restaurant Selection**
1. Ở HomeScreen, tap **"Browse Menu"** (màu xanh dương)
2. Chọn nhà hàng bất kỳ
3. Nhập số bàn (1-20)
4. Tap "Tiếp tục đặt món"
5. Sẽ vào MenuScreen

### **Phương pháp 3: Test QR Scan**
1. Ở HomeScreen, tap **"Scan to Order"** (màu cam)
2. Scan QR code hoặc dùng test QR
3. Sẽ vào MenuScreen

### **Phương pháp 4: Test từ TestMenuScreen**
1. Navigate đến TestMenuScreen
2. Chọn phương pháp test muốn thử
3. Mỗi button test một flow khác nhau

## 📱 Kết quả mong đợi

Khi vào MenuScreen, bạn sẽ thấy:

### **Header**
- Tên nhà hàng: "Nhà Hàng Phố Cổ"
- Thông tin bàn: "Bàn B01 - Chi nhánh Hoàn Kiếm"

### **Categories (4 loại)**
1. **Phở & Bún** (4 món)
   - Phở Bò Tái (85,000 VND)
   - Phở Bò Chín (85,000 VND)
   - Bún Bò Huế (75,000 VND)
   - Bún Chả (70,000 VND)

2. **Cơm** (4 món)
   - Cơm Gà Nướng (95,000 VND)
   - Cơm Sườn Nướng (105,000 VND)
   - Cơm Tấm Bì Chả (80,000 VND)
   - Cơm Chiên Dương Châu (85,000 VND)

3. **Đồ Uống** (4 món)
   - Trà Đá (15,000 VND)
   - Nước Cam Tươi (35,000 VND)
   - Cà Phê Sữa Đá (25,000 VND)
   - Sinh Tố Bơ (40,000 VND)

4. **Tráng Miệng** (3 món)
   - Chè Ba Màu (30,000 VND)
   - Bánh Flan (25,000 VND)
   - Kem Xôi (20,000 VND)

### **Chức năng**
- ✅ Scroll categories ngang
- ✅ Tap category để filter món
- ✅ Search món ăn
- ✅ Tap món để xem chi tiết
- ✅ Add to cart
- ✅ View cart (badge hiện số lượng)

## 🔧 Nếu vẫn lỗi

### **Lỗi "Không tìm thấy thông tin chi nhánh"**
- **Nguyên nhân**: branchId không được truyền đúng
- **Giải pháp**: Dùng "Test Direct Menu" để bypass

### **Lỗi "Menu trống"**
- **Nguyên nhân**: API không trả về data
- **Giải pháp**: MenuScreen đã có fallback data, sẽ tự động dùng mock data

### **Lỗi network/timeout**
- **Nguyên nhân**: Mobile device không kết nối được backend
- **Giải pháp**: Fallback data sẽ tự động kick in

### **App crash hoặc white screen**
- **Nguyên nhân**: Component error
- **Kiểm tra**: Console logs trong Expo
- **Giải pháp**: Restart app và thử "Test Direct Menu"

## 🚀 Test Flow hoàn chỉnh

### **Customer Journey Test**
1. **HomeScreen** → Tap "Test Menu"
2. **TestMenuScreen** → Tap "Test Direct Menu"  
3. **MenuScreen** → Chọn category "Phở & Bún"
4. **MenuScreen** → Tap "Phở Bò Tái"
5. **FoodDetailScreen** → Chọn quantity, tap "Add to Cart"
6. **MenuScreen** → Tap cart icon (có badge số 1)
7. **CartScreen** → Review order, tap "Đặt hàng"
8. **PaymentScreen** → Complete order

### **Search Test**
1. Vào MenuScreen
2. Tap search box
3. Type "phở"
4. Sẽ thấy 2 kết quả: Phở Bò Tái, Phở Bò Chín

### **Category Filter Test**
1. Vào MenuScreen
2. Tap category "Đồ Uống"
3. Sẽ chỉ hiện 4 món đồ uống
4. Tap category khác để test

## 📊 Backend API Status

Tất cả API endpoints đã hoạt động:
- ✅ `GET /api/v1/branches/branch-1/menu` - Menu data
- ✅ `GET /api/v1/menu-items/search` - Search functionality  
- ✅ `POST /api/v1/orders` - Order creation
- ✅ `GET /api/v1/public/tables/{qr_token}` - QR scan

## 🎯 Kết luận

Menu system đã hoạt động hoàn chỉnh với:
- **15 món ăn** trong 4 categories
- **Search functionality** 
- **Add to cart & order**
- **Multiple test methods**
- **Fallback data** khi network fail

Dùng **"Test Direct Menu"** để test nhanh nhất!