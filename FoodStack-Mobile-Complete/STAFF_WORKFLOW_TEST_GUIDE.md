# Staff Workflow Testing Guide

## Hướng dẫn kiểm tra Staff Workflow System

### Bước 1: Chuẩn bị
1. Mở app FoodStack
2. Từ HomeScreen, tìm và nhấn nút **"Staff Debug"** (màu tím)
3. Trong màn hình debug, nhấn **"Clear All Data"** để xóa dữ liệu cũ
4. Xác nhận xóa dữ liệu

### Bước 2: Test Service Request (Yêu cầu dịch vụ)

#### Từ Customer Account:
1. Quay lại HomeScreen
2. Nhấn **"Quét QR"** hoặc **"Chọn nhà hàng"**
3. Chọn nhà hàng và bàn bất kỳ
4. Trong MenuScreen, nhấn nút **"Yêu cầu dịch vụ"** (biểu tượng chuông)
5. Chọn một dịch vụ (ví dụ: "Thêm nước")
6. Nhấn **"Gửi yêu cầu"**
7. Xác nhận thấy thông báo "Yêu cầu đã gửi!"

#### Kiểm tra từ Staff Account:
1. Đăng xuất và đăng nhập với tài khoản Staff
2. Hoặc từ HomeScreen → **"Staff Debug"** → **"Staff Service Requests"**
3. Kiểm tra xem yêu cầu vừa tạo có xuất hiện không
4. Thử nhấn **"Nhận việc"** để accept request
5. Thử nhấn **"Hoàn thành"** để complete request

### Bước 3: Test Order Management (Quản lý đơn hàng)

#### Từ Customer Account:
1. Quay lại MenuScreen
2. Thêm một vài món vào giỏ hàng
3. Nhấn **"Giỏ hàng"**
4. Nhấn **"Đặt hàng"**
5. Tiến hành thanh toán (có thể dùng mock payment)

#### Kiểm tra từ Staff Account:
1. Từ Staff Dashboard hoặc HomeScreen → **"Staff Debug"** → **"Staff Order Management"**
2. Kiểm tra xem đơn hàng vừa tạo có xuất hiện không
3. Thử các action buttons:
   - **"Xác nhận"** (PENDING → CONFIRMED)
   - **"Chuyển bếp"** (CONFIRMED → PREPARING)
   - **"Đã phục vụ"** (READY → SERVED)

### Bước 4: Debug và Troubleshooting

#### Sử dụng Debug Screen:
1. HomeScreen → **"Staff Debug"**
2. Kiểm tra **"Dữ liệu hiện tại"**:
   - Service Requests: Số lượng yêu cầu dịch vụ
   - Staff Orders: Số lượng đơn hàng staff
   - Customer Orders: Số lượng đơn hàng customer
3. Nhấn **"View Storage Data"** để xem dữ liệu trong console
4. Nhấn **"Refresh Counts"** để cập nhật số liệu

#### Tạo Test Data:
1. **"Create Test Service Request"** - Tạo yêu cầu dịch vụ test
2. **"Create Test Order"** - Tạo đơn hàng test
3. **"Initialize Mock Data"** - Tạo dữ liệu mẫu

### Bước 5: Kiểm tra Real-time Updates

#### Auto-refresh:
- Staff Service Requests: Tự động refresh mỗi 15 giây
- Staff Order Management: Tự động refresh mỗi 30 giây
- Pull-to-refresh: Kéo xuống để refresh thủ công

#### Status Updates:
- Tạo request từ customer → Kiểm tra staff có nhận được không
- Update status từ staff → Kiểm tra customer có thấy thay đổi không

### Bước 6: Test Workflow hoàn chỉnh

#### Quy trình Staff hoàn chỉnh:
1. **Nhận đơn** - Đơn hàng mới xuất hiện với status PENDING
2. **Xác nhận** - Staff nhấn "Xác nhận" → CONFIRMED
3. **Chuyển bếp** - Staff nhấn "Chuyển bếp" → PREPARING
4. **Theo dõi** - Đơn hàng đang được chuẩn bị
5. **Phục vụ** - Khi sẵn sàng, staff nhấn "Đã phục vụ" → SERVED
6. **Xử lý yêu cầu** - Xử lý các service requests song song
7. **Thu dọn** - Hoàn thành và dọn dẹp
8. **Cập nhật trạng thái bàn** - Cập nhật status cuối cùng

### Troubleshooting

#### Nếu không thấy dữ liệu:
1. Kiểm tra console logs (React Native Debugger)
2. Xóa tất cả dữ liệu và test lại
3. Kiểm tra storage keys có đúng không
4. Verify AsyncStorage permissions

#### Nếu dữ liệu không đồng bộ:
1. Kiểm tra cùng storage key được sử dụng
2. Verify không có cache cũ
3. Test với fresh app restart

#### Common Issues:
- **"Mock data already exists"** - Dữ liệu mẫu đã tồn tại, xóa và tạo lại
- **"No requests found"** - Chưa có yêu cầu nào, tạo từ customer side
- **"Navigation error"** - Kiểm tra tất cả screens đã được register

### Expected Results

#### Thành công khi:
✅ Customer tạo service request → Staff nhận được ngay lập tức
✅ Customer đặt hàng → Đơn hàng xuất hiện trong Staff Order Management
✅ Staff update status → Thay đổi được lưu và hiển thị
✅ Auto-refresh hoạt động đúng
✅ Pull-to-refresh cập nhật dữ liệu
✅ Debug screen hiển thị đúng số liệu

#### Cần sửa nếu:
❌ Dữ liệu không đồng bộ giữa customer và staff
❌ Auto-refresh không hoạt động
❌ Status updates không được lưu
❌ Navigation errors
❌ Console errors trong debug

### Debug Console Commands

Mở React Native Debugger và chạy:
```javascript
// Xem tất cả service requests
AsyncStorage.getItem('foodstack_service_requests').then(data => console.log('Service Requests:', JSON.parse(data || '[]')));

// Xem tất cả staff orders
AsyncStorage.getItem('foodstack_staff_orders').then(data => console.log('Staff Orders:', JSON.parse(data || '[]')));

// Xóa tất cả dữ liệu
AsyncStorage.multiRemove(['foodstack_service_requests', 'foodstack_staff_orders', 'foodstack_customer_orders']);
```

### Next Steps

Sau khi test thành công:
1. Tích hợp với backend APIs thật
2. Thêm push notifications
3. Implement real-time WebSocket connections
4. Add user authentication và permissions
5. Enhance UI/UX based on feedback

Hệ thống Staff Workflow hiện tại sử dụng AsyncStorage để demo và test. Trong production, cần thay thế bằng backend APIs và real-time connections.