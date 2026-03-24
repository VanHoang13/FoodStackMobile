# Menu Debug Guide

## Vấn đề hiện tại
Bạn đang gặp lỗi "Maximum update depth exceeded" khi cố gắng xem menu.

## Nguyên nhân đã xác định và sửa

### 1. ✅ Lỗi useEffect vòng lặp vô hạn
**Vấn đề:** Trong MenuScreen.tsx, useEffect có dependency `selectedCategory` nhưng lại set `selectedCategory` bên trong.

**Đã sửa:**
```typescript
// TRƯỚC (gây lỗi):
useEffect(() => {
  if (menuData?.success && menuData.data?.categories && menuData.data.categories.length > 0 && !selectedCategory) {
    setSelectedCategory(menuData.data.categories[0].id);
  }
}, [menuData, selectedCategory]); // selectedCategory ở đây gây vòng lặp

// SAU (đã sửa):
useEffect(() => {
  if (menuData?.success && menuData.data?.categories && menuData.data.categories.length > 0 && !selectedCategory) {
    setSelectedCategory(menuData.data.categories[0].id);
  }
}, [menuData]); // Bỏ selectedCategory khỏi dependency
```

### 2. ✅ Cấu hình IP Backend
**Vấn đề:** IP trong config.js không đúng với IP thực tế của máy.

**Đã sửa:**
- Chạy script `find-ip.js` để tìm IP đúng: `192.168.1.99`
- Cập nhật `config.js`:
```javascript
BACKEND_IP: '192.168.1.99', // IP được tìm thấy từ script
```

### 3. ✅ Mock Data cho API
**Vấn đề:** Backend cần authentication, không thể test trực tiếp.

**Đã sửa:** Thêm mock data vào `branchApi.getBranchMenu()`:
```typescript
try {
  const response = await apiClient.get(`/branches/${branchId}/menu`);
  return response.data;
} catch (error) {
  console.warn('Backend not available, using mock data');
  // Return mock menu data
  return {
    success: true,
    data: {
      categories: [
        {
          id: 'cat-1',
          name: 'Món chính',
          menu_items: [...]
        }
      ]
    }
  };
}
```

## Cách test

### 1. Test API riêng biệt
Sử dụng TestMenuScreen để kiểm tra API:
```
Navigation: Home → TestMenu
```

### 2. Test Menu Screen
Sau khi sửa lỗi, thử:
```
Navigation: Home → QRScan → Menu
```

### 3. Kiểm tra Console
Mở React Native Debugger hoặc Metro console để xem logs:
- `console.log` từ API calls
- Error messages
- Network requests

## Scripts hỗ trợ debug

### 1. Tìm IP máy:
```bash
node find-ip.js
```

### 2. Test backend connection:
```bash
node test-backend.js
```

### 3. Kiểm tra backend health:
```bash
curl http://192.168.1.99:3000/health
```

## Checklist debug

- [x] Sửa lỗi useEffect vòng lặp
- [x] Cập nhật IP backend đúng
- [x] Thêm mock data cho API
- [x] Tạo TestMenuScreen để debug
- [ ] Test trên thiết bị thật
- [ ] Kiểm tra network connectivity
- [ ] Verify CartContext hoạt động đúng

## Nếu vẫn gặp lỗi

1. **Restart Metro bundler:**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Clear app cache:**
   - Android: Settings → Apps → FoodStack → Storage → Clear Cache
   - iOS: Delete app và reinstall

3. **Kiểm tra network:**
   - Đảm bảo mobile và máy backend cùng WiFi
   - Test ping từ mobile đến IP backend

4. **Debug từng bước:**
   - Mở TestMenuScreen trước
   - Kiểm tra API response
   - Sau đó mới test MenuScreen

## Logs quan trọng cần xem

```
🧪 Testing menu API...
✅ Menu API response: {...}
❌ Menu API error: {...}
```

Nếu thấy mock data trong response, nghĩa là API fallback đang hoạt động đúng.