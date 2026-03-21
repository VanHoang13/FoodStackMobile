# 🐛 Debug Menu Item Issues

## 🔍 Vấn đề hiện tại:
- Thêm món ăn thành công (có thông báo "Thành công")
- Nhưng món ăn không hiện trong danh sách menu
- Không có ảnh món ăn

## 🧪 Các bước debug:

### 1. Kiểm tra Backend Server
```bash
cd FoodStack-Mobile-Complete/backend
node test-database.js
```

### 2. Kiểm tra API Endpoints
```bash
cd FoodStack-Mobile-Complete/backend
node test-menu-api.js
```

### 3. Kiểm tra Mobile App Logs
- Mở React Native Debugger hoặc Metro logs
- Tìm các log messages:
  - `🍽️ Creating menu item:`
  - `📡 API Response:`
  - `🔄 MenuManagementScreen focused`

### 4. Kiểm tra Network Requests
- Mở Network tab trong debugger
- Xem có request nào đến `/api/v1/menu-items` không
- Kiểm tra response status và data

## 🔧 Các fix đã áp dụng:

### 1. Auto-refresh Menu ✅
- Thêm `useFocusEffect` để tự động reload menu khi quay lại screen
- Improved logging để track API calls

### 2. Better Error Handling ✅
- Detailed error logging trong AddMenuItemScreen
- Specific error messages cho các lỗi khác nhau (401, 403, etc.)

### 3. Enhanced Menu Loading ✅
- Better logging trong loadMenuData()
- Fallback to mock data nếu API fails

## 🚨 Các vấn đề có thể:

### 1. Backend không chạy
- Server không start hoặc crash
- Port 3000 không accessible

### 2. Database issues
- Categories table empty
- Menu items table có vấn đề với schema
- Foreign key constraints

### 3. Authentication issues
- Token expired hoặc invalid
- User không có permission tạo menu items

### 4. Network issues
- Mobile app không connect được đến backend
- IP address sai trong config

## 📱 Test Steps:

### Immediate Test:
1. **Check console logs** khi thêm món ăn
2. **Pull to refresh** trong menu management screen
3. **Restart app** và check lại menu

### Backend Test:
```bash
# Test server health
curl http://localhost:3000/health

# Test categories
curl http://localhost:3000/api/v1/categories

# Test menu items search
curl http://localhost:3000/api/v1/menu-items/search
```

### Mobile Debug:
1. Enable Remote JS Debugging
2. Check Network tab for API calls
3. Look for error messages in console
4. Verify auth token in AsyncStorage

## 🎯 Next Actions:
1. Run database test script
2. Check server logs
3. Verify mobile app network connectivity
4. Test with mock data first, then real API