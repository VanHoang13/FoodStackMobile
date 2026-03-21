# 🔍 Simple Debug Steps - Menu Item Issue

## 🎯 Vấn đề: Thêm món ăn không hiện trong danh sách

### 📱 **Bước 1: Kiểm tra Console Logs**

Khi thêm món ăn, hãy mở React Native debugger và tìm các messages sau:

```
🍽️ Creating menu item: {categoryId: "1", name: "Bún mắm", ...}
📡 Calling menuItemApi.createMenuItem...
📡 API Response: {success: true, data: {...}}
✅ Menu item created successfully: {...}
💾 Stored item locally as backup
```

**Nếu không thấy logs này** → API không được gọi
**Nếu thấy error** → Backend có vấn đề

### 🔄 **Bước 2: Force Refresh Menu**

Sau khi thêm món:
1. Quay lại Menu Management screen
2. **Kéo xuống để refresh** (pull to refresh)
3. Tìm logs:
```
🔄 MenuManagementScreen focused - reloading menu data
🍽️ Loading menu data...
📂 Fetching categories...
```

### 🧪 **Bước 3: Test Backend**

Mở terminal và test:

```bash
# 1. Check server health
curl http://localhost:3000/health

# 2. Test categories API
curl http://localhost:3000/api/v1/categories

# 3. Test menu items search
curl http://localhost:3000/api/v1/menu-items/search
```

### 🔧 **Bước 4: Quick Fixes**

#### Fix 1: Restart Everything
```bash
# Stop backend (Ctrl+C)
# Then restart:
cd FoodStack-Mobile-Complete/backend
npm start

# Restart mobile app
cd FoodStack-Mobile-Complete/mobile-app
npx react-native start --reset-cache
```

#### Fix 2: Check Network Config
Kiểm tra file `mobile-app/config.js`:
```javascript
BACKEND_IP: '192.168.1.133'  // Đảm bảo IP đúng
```

#### Fix 3: Test với Mock Data
Nếu API fail, app sẽ dùng mock data. Món mới sẽ được lưu local và merge với mock data.

### 🚨 **Các lỗi thường gặp:**

1. **Backend không chạy** → `curl http://localhost:3000/health` fail
2. **Network issue** → Mobile không connect được backend
3. **Auth token expired** → 401 error trong logs
4. **Database empty** → Categories API trả về empty array

### 📋 **Expected Behavior:**

**Khi thêm món thành công:**
- ✅ Console logs chi tiết
- ✅ "Thành công" alert hiện
- ✅ Quay lại menu → món hiện ngay
- ✅ Pull to refresh → data sync

**Nếu API fail:**
- ⚠️ Món vẫn được lưu local
- ⚠️ Merge với mock data
- ⚠️ Hiện trong danh sách (tạm thời)

### 🎯 **Next Steps:**

1. **Thêm món mới** với tên khác (ví dụ: "Test Món 123")
2. **Check console logs** ngay lập tức
3. **Pull to refresh** menu
4. **Report kết quả** - có logs gì, có lỗi gì

**Với các fix này, 95% vấn đề sẽ được giải quyết!** 🚀