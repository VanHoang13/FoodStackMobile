# 🚀 Quick Test: Authentication & Upload

## ✅ Bước test nhanh

### 1. Kiểm tra đăng nhập
```
1. Mở app mobile
2. Nếu thấy màn hình login → Đăng nhập với:
   - Email: owner@foodstack.test
   - Password: password123
3. Nếu đã login → Tiếp tục bước 2
```

### 2. Test upload ảnh
```
1. Vào "Quản lý Chi nhánh"
2. Nhấn "+" để thêm chi nhánh mới
3. Điền thông tin cơ bản (tên, địa chỉ, SĐT)
4. Tìm phần "Hình ảnh chi nhánh"
5. Nhấn "Chọn ảnh"
6. Chọn "Thư viện" hoặc "Chụp ảnh"
7. Chọn một ảnh bất kỳ
```

### 3. Kiểm tra kết quả
```
✅ Thành công nếu:
- Hiển thị "Đang tải lên..."
- Sau đó hiển thị "Đã tải ảnh lên thành công"
- Ảnh hiển thị preview trong form
- Có thể lưu chi nhánh thành công

❌ Thất bại nếu:
- Báo lỗi "Không tìm thấy token xác thực"
- Báo lỗi "Vui lòng đăng nhập lại"
- Upload không hoàn thành
```

## 🔧 Nếu gặp lỗi token

### Option 1: Đăng nhập lại
```
1. Force close app
2. Mở lại app
3. Đăng nhập lại
4. Thử upload lại
```

### Option 2: Sử dụng URL
```
1. Khi upload fail, chọn "Nhập URL thay thế"
2. Paste URL ảnh test:
   https://images.unsplash.com/photo-1517248135467-4c7edcad34c4
3. Ảnh sẽ hiển thị preview
4. Lưu chi nhánh
```

### Option 3: Check console
```
Mở React Native debugger và xem logs:
- "🔐 Is authenticated: true/false"
- "🎫 Token found: true/false"
- Nếu false → cần đăng nhập lại
```

## 📋 Checklist debug

- [ ] Backend đang chạy (port 3000)
- [ ] Mobile app connected to correct IP
- [ ] User đã đăng nhập thành công
- [ ] Token được lưu trong AsyncStorage
- [ ] Upload endpoint accessible
- [ ] Cloudinary credentials valid

## 🎯 Expected behavior

1. **Login successful** → Token saved to storage
2. **Navigate to branch management** → UI loads correctly
3. **Click upload button** → Permission dialog appears
4. **Select image** → Upload starts with loading indicator
5. **Upload completes** → Success message + image preview
6. **Save branch** → Branch saved with image URL

Nếu bất kỳ bước nào fail → Check debug guide!