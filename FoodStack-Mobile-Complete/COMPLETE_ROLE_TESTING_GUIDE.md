# 🧪 Hướng Dẫn Test Đầy Đủ Theo Role - FoodStack Mobile

## 📋 Thông Tin Test Accounts

| Role | Email | Password | UI Destination |
|------|-------|----------|----------------|
| **Admin** | admin@mobile.test | 123456 | AdminDashboard |
| **Owner** | owner@mobile.test | 123456 | RestaurantDashboard |
| **Manager** | manager@mobile.test | 123456 | RestaurantDashboard |
| **Staff** | staff@mobile.test | 123456 | KitchenDisplay |
| **Customer** | customer@mobile.test | 123456 | HomeScreen |

---

## 👑 1. ADMIN ROLE TEST

### 🔐 Login Process
1. **Mở app** → Login Screen
2. **Nhập**: admin@mobile.test / 123456
3. **Kết quả**: Redirect to AdminDashboard

### 📊 Admin Dashboard Features
**Kiểm tra hiển thị:**
- ✅ Tổng quan hệ thống: 3 Nhà hàng, 5 Người dùng
- ✅ Thống kê: 0 Đơn hàng, 0đ Doanh thu
- ✅ 6 nút quản lý: Nhà hàng, Người dùng, Đơn hàng, Báo cáo, Phê duyệt, Cài đặt

### 🧪 Test Admin APIs
**Navigation Tests:**
1. **Tap "Nhà hàng"** → AdminRestaurants screen
2. **Tap "Người dùng"** → AdminUsers screen  
3. **Tap "Đơn hàng"** → AdminOrders screen
4. **Tap "Báo cáo"** → AdminReports screen
5. **Tap "Phê duyệt"** → AdminApprovals screen
6. **Tap "Cài đặt"** → AdminSettings screen

**Expected Results:**
- ✅ Tất cả screens load thành công
- ✅ Không có crash hoặc network errors
- ✅ UI hiển thị đúng admin layout

---

## 🏪 2. OWNER ROLE TEST

### 🔐 Login Process
1. **Mở app** → Login Screen
2. **Nhập**: owner@mobile.test / 123456
3. **Kết quả**: Redirect to RestaurantDashboard

### 📈 Restaurant Dashboard Features
**Kiểm tra hiển thị:**
- ✅ Header: "Mobile Test Restaurant"
- ✅ Stats cards: Đơn hôm nay, Doanh thu hôm nay, Đơn chờ xử lý, Món ăn
- ✅ Hoạt động gần đây: Đơn hàng mới, Yêu cầu dịch vụ, Thanh toán
- ✅ Món bán chạy nhất: Top 3 món ăn

### 🧪 Test Owner APIs
**Core Features:**
1. **Analytics** → Tap refresh icon → Check data loads
2. **Menu Management** → Navigate to menu screen
3. **Order Management** → View active orders
4. **Staff Management** → Manage restaurant staff
5. **Settings** → Restaurant settings

**Advanced Features (New):**
6. **Subscription** → Tap menu → "Subscription" → Test subscription screen
7. **Advanced Analytics** → Tap menu → "Analytics" → Test charts/reports
8. **Notifications** → Tap bell icon → Test notification center
9. **Service Requests** → Check service request management

**Expected Results:**
- ✅ Dashboard loads with real restaurant data
- ✅ All navigation works smoothly
- ✅ New features (Subscription, Analytics) accessible
- ✅ API calls return proper data

---

## 👨‍💼 3. MANAGER ROLE TEST

### 🔐 Login Process
1. **Mở app** → Login Screen
2. **Nhập**: manager@mobile.test / 123456
3. **Kết quả**: Redirect to RestaurantDashboard (same as Owner)

### 📊 Manager Dashboard Features
**Kiểm tra giống Owner nhưng có hạn chế:**
- ✅ Xem được dashboard và statistics
- ✅ Quản lý đơn hàng và menu
- ⚠️ Có thể hạn chế một số settings (tùy implementation)

### 🧪 Test Manager APIs
**Same as Owner but check permissions:**
1. **Order Management** → Full access expected
2. **Menu Management** → Full access expected  
3. **Staff Management** → May be limited
4. **Settings** → May be limited
5. **Analytics** → Full access expected
6. **Subscription** → May be view-only

**Expected Results:**
- ✅ Most features work like Owner
- ⚠️ Some admin features may be restricted
- ✅ No crashes on permission checks

---

## 👨‍🍳 4. STAFF ROLE TEST

### 🔐 Login Process
1. **Mở app** → Login Screen
2. **Nhập**: staff@mobile.test / 123456
3. **Kết quả**: Redirect to KitchenDisplay (DIFFERENT!)

### 🍳 Kitchen Display Features
**Kiểm tra hiển thị:**
- ✅ Header: "Kitchen Display"
- ✅ Active orders list với status
- ✅ Order items với cooking instructions
- ✅ Timer cho mỗi món
- ✅ Status update buttons

### 🧪 Test Staff APIs
**Kitchen Operations:**
1. **View Orders** → Check active orders load
2. **Update Status** → Mark items as "Preparing" → "Ready"
3. **Order Details** → Tap order → View full details
4. **Timer Functions** → Check cooking timers work
5. **Notifications** → Check new order notifications

**Service Requests:**
6. **Service Requests** → View table service requests
7. **Update Requests** → Mark requests as completed

**Expected Results:**
- ✅ Kitchen-focused UI (different from Owner/Manager)
- ✅ Order status updates work
- ✅ Real-time updates (if implemented)
- ✅ Service request management

---

## 👤 5. CUSTOMER ROLE TEST

### 🔐 Login Process
1. **Mở app** → Login Screen
2. **Nhập**: customer@mobile.test / 123456
3. **Kết quả**: Stay on HomeScreen

### 🛍️ Customer Features
**Main Flow:**
- ✅ QR Code scanner
- ✅ Restaurant selection
- ✅ Menu browsing
- ✅ Cart management
- ✅ Order placement
- ✅ Payment processing

### 🧪 Test Customer APIs
**Complete Order Flow:**
1. **QR Scan** → Tap "Quét mã QR" → Test scanner
2. **Restaurant List** → Browse available restaurants
3. **Menu** → View menu items and categories
4. **Add to Cart** → Add items, customize options
5. **Cart** → Review cart, modify quantities
6. **Checkout** → Place order
7. **Payment** → Test payment methods
8. **Order Tracking** → Track order status
9. **Feedback** → Submit feedback after order

**Additional Features:**
10. **Service Request** → Request table service
11. **Reservation** → Make table reservation
12. **Order History** → View past orders
13. **Profile** → Update customer info

**Expected Results:**
- ✅ Complete customer journey works
- ✅ All payment methods function
- ✅ Order tracking updates in real-time
- ✅ Feedback system works

---

## 🔄 6. CROSS-ROLE INTEGRATION TESTS

### 📱 Real-time Flow Test
**Scenario: Complete Order Cycle**

1. **Customer** places order → Check order appears
2. **Staff** sees new order in Kitchen Display → Update status
3. **Manager** sees order in dashboard → Monitor progress
4. **Customer** receives status updates → Track progress
5. **Customer** completes payment → Order marked paid
6. **Customer** submits feedback → Feedback appears in system

### 🧪 API Integration Points
**Test these connections:**
- ✅ Order creation → Kitchen display update
- ✅ Status changes → Customer notifications  
- ✅ Payment completion → Order status update
- ✅ Service requests → Staff notifications
- ✅ Feedback submission → Manager dashboard

---

## 🚨 7. ERROR HANDLING TESTS

### 🌐 Network Issues
1. **Disconnect WiFi** → Test offline behavior
2. **Slow connection** → Test loading states
3. **Server down** → Test error messages

### 🔒 Authentication Issues  
1. **Invalid credentials** → Test error handling
2. **Expired tokens** → Test auto-refresh
3. **Permission denied** → Test role restrictions

### 📱 App State Tests
1. **Background/foreground** → Test state persistence
2. **App restart** → Test login persistence
3. **Memory pressure** → Test app stability

---

## ✅ 8. SUCCESS CRITERIA

### 🎯 Each Role Should:
- ✅ **Login successfully** with correct credentials
- ✅ **Navigate to correct screen** based on role
- ✅ **Access appropriate features** for their role
- ✅ **Perform core functions** without crashes
- ✅ **Handle errors gracefully** with proper messages

### 📊 API Performance:
- ✅ **Response time** < 3 seconds for most calls
- ✅ **Success rate** > 95% for stable APIs
- ✅ **Error handling** shows user-friendly messages
- ✅ **Loading states** provide good UX

### 🔄 Integration:
- ✅ **Real-time updates** work between roles
- ✅ **Data consistency** across different views
- ✅ **Permission system** enforces role restrictions
- ✅ **Notification system** delivers timely updates

---

## 🐛 9. KNOWN ISSUES TO VERIFY

### ⚠️ Current Status:
1. **Payment API** - May fail on duplicate orders
2. **Service Requests** - Using notifications table as workaround
3. **Analytics** - Some complex queries simplified
4. **Real-time** - WebSocket not fully implemented

### 🔍 Focus Testing On:
- ✅ **Core user flows** work end-to-end
- ✅ **Role-based access** is properly enforced  
- ✅ **New features** (Subscription, Analytics) function
- ✅ **Mobile responsiveness** on different screen sizes

---

## 📝 10. TESTING CHECKLIST

### Before Testing:
- [ ] Backend server running on port 3000
- [ ] Mobile app connected to correct IP (192.168.1.133)
- [ ] Database has test data
- [ ] All dependencies installed

### During Testing:
- [ ] Test each role login
- [ ] Navigate through all screens
- [ ] Try core functions for each role
- [ ] Test error scenarios
- [ ] Check performance and responsiveness

### After Testing:
- [ ] Document any bugs found
- [ ] Note performance issues
- [ ] Verify all new features work
- [ ] Confirm role restrictions work properly

**Happy Testing! 🚀**