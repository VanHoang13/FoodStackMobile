# 🔧 Debug: Lỗi "Không tìm thấy token xác thực"

## 🚨 Vấn đề
Khi upload ảnh, app báo lỗi "Không tìm thấy token xác thực" hoặc "Vui lòng đăng nhập lại để upload ảnh".

## 🔍 Nguyên nhân có thể
1. **Chưa đăng nhập** - User chưa login vào app
2. **Token hết hạn** - Phiên đăng nhập đã expire
3. **Storage bị clear** - AsyncStorage bị xóa
4. **Network issue** - Không thể refresh token

## ✅ Cách khắc phục

### 1. Kiểm tra trạng thái đăng nhập
```
1. Mở app
2. Kiểm tra xem có hiển thị màn hình login không
3. Nếu có → Đăng nhập lại
4. Nếu không → Tiếp tục bước 2
```

### 2. Đăng nhập lại
```
1. Logout khỏi app (nếu có option)
2. Đăng nhập lại với:
   - Owner: owner@foodstack.test / password123
   - Customer: customer@mobile.test / password123
3. Thử upload ảnh lại
```

### 3. Restart app
```
1. Force close app hoàn toàn
2. Mở lại app
3. Đăng nhập lại
4. Thử upload ảnh
```

### 4. Clear app data (Android)
```
1. Settings → Apps → FoodStack
2. Storage → Clear Data
3. Mở app và đăng nhập lại
```

### 5. Sử dụng fallback option
```
Khi upload fail:
1. Chọn "Nhập URL thay thế"
2. Paste URL ảnh từ internet
3. Ví dụ: https://images.unsplash.com/photo-1517248135467-4c7edcad34c4
```

## 🛠️ Debug steps cho developer

### 1. Kiểm tra console logs
Khi upload ảnh, check console để xem:
```
🔍 Checking authentication for image upload...
🔐 Is authenticated: true/false
🎫 Token found: true/false
```

### 2. Kiểm tra AsyncStorage
```javascript
// Trong React Native Debugger hoặc console
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check all keys
AsyncStorage.getAllKeys().then(keys => console.log('All keys:', keys));

// Check specific tokens
AsyncStorage.getItem('access_token').then(token => console.log('Access token:', !!token));
AsyncStorage.getItem('user_data').then(data => console.log('User data:', !!data));
```

### 3. Test authentication flow
```javascript
// Test login
import AuthService from './src/services/authService';

AuthService.login({
  email: 'owner@foodstack.test',
  password: 'password123'
}).then(result => {
  console.log('Login success:', result);
}).catch(error => {
  console.error('Login failed:', error);
});
```

## 🎯 Giải pháp tạm thời

Nếu upload vẫn không work, user có thể:

1. **Sử dụng URL trực tiếp**:
   - Nhấn "Nhập URL" thay vì "Chọn ảnh"
   - Paste URL ảnh từ internet
   - Ví dụ URLs test:
     ```
     https://images.unsplash.com/photo-1517248135467-4c7edcad34c4
     https://images.unsplash.com/photo-1555396273-367ea4eb4db5
     https://images.unsplash.com/photo-1514933651103-005eec06c04b
     ```

2. **Upload ảnh sau**:
   - Tạo chi nhánh trước không có ảnh
   - Sau đó edit để thêm ảnh

## 🔄 Cập nhật code đã thực hiện

1. **Fixed token key mismatch**: `accessToken` → `access_token`
2. **Added AuthService integration**: Sử dụng AuthService thay vì direct storage
3. **Enhanced error handling**: Better error messages và fallback options
4. **Added debug logging**: Console logs để debug
5. **User-friendly alerts**: Suggest solutions trong error dialogs

## 📱 Test flow

1. Đăng nhập app
2. Vào "Quản lý Chi nhánh"
3. Thêm/sửa chi nhánh
4. Nhấn "Chọn ảnh"
5. Chọn ảnh từ gallery
6. Kiểm tra console logs
7. Nếu thành công → ảnh hiển thị preview
8. Nếu thất bại → hiển thị error với options