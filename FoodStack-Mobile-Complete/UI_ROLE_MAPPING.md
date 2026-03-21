# UI Role Mapping - Fixed

## Phân biệt UI theo Role:

### ✅ ADMIN
- **Screen**: `AdminDashboard`
- **Features**: Quản lý toàn hệ thống, xem tất cả nhà hàng
- **Fixed**: Hiển thị 3 nhà hàng thay vì 0

### ✅ OWNER/RESTAURANT_OWNER  
- **Screen**: `RestaurantDashboard`
- **Features**: Quản lý nhà hàng, xem analytics, settings

### ✅ MANAGER
- **Screen**: `RestaurantDashboard` 
- **Features**: Giống Owner nhưng hạn chế một số quyền

### ✅ STAFF
- **Screen**: `KitchenDisplay` (Khác biệt!)
- **Features**: Xem đơn hàng, cập nhật trạng thái món ăn

### ✅ CUSTOMER
- **Screen**: `HomeScreen`
- **Features**: Scan QR, đặt món, thanh toán

## Test Credentials:
- **Admin**: admin@mobile.test / 123456 → AdminDashboard
- **Owner**: owner@mobile.test / 123456 → RestaurantDashboard  
- **Manager**: manager@mobile.test / 123456 → RestaurantDashboard
- **Staff**: staff@mobile.test / 123456 → KitchenDisplay ⭐
- **Customer**: customer@mobile.test / 123456 → HomeScreen

## Đã Fix:
1. ✅ Staff giờ vào KitchenDisplay (khác Owner/Manager)
2. ✅ Admin hiển thị 3 nhà hàng thay vì 0
3. ✅ Navigation logic phân biệt đúng role

**Restart app và test lại!**