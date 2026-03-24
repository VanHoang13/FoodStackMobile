# 🔧 Sửa lỗi thống kê Menu không đúng

## ❌ Vấn đề
- Menu chỉ có 3 món nhưng thống kê hiển thị 25 món
- Số liệu không khớp với thực tế

## 🔍 Nguyên nhân
1. **AsyncStorage cache cũ**: Dữ liệu mock cũ vẫn còn trong storage
2. **Mock data khác nhau**: Service có 2 loại mock data (3 món vs 18 món)
3. **Initialization conflict**: App có thể load data cũ từ lần chạy trước

## ✅ Giải pháp đã thêm

### 1. **Debug Function**
```typescript
async debugMenuData(): Promise<void> {
  // Hiển thị thông tin chi tiết về data hiện tại
  // Console log số lượng categories và items
}
```

### 2. **Reset Options**
- **3 món (Minimal)**: Reset về 3 món cơ bản
- **18 món (Full)**: Reset về dữ liệu đầy đủ

### 3. **UI Controls**
- **Nút Debug (ℹ️)**: Kiểm tra thông tin data hiện tại
- **Nút Reset (🔄)**: Chọn loại data muốn reset

## 🚀 Cách sử dụng

### Bước 1: Kiểm tra data hiện tại
1. Vào **Quản lý Menu**
2. Nhấn nút **ℹ️ (Debug)** ở header
3. Xem popup hiển thị số liệu thực tế

### Bước 2: Reset về 3 món
1. Nhấn nút **🔄 (Reset)** ở header  
2. Chọn **"3 món (Minimal)"**
3. Xác nhận reset
4. Kiểm tra thống kê đã đúng

### Bước 3: Xác minh
- **Tổng món**: 3
- **Có sẵn**: 3  
- **Nổi bật**: 1
- **Giá TB**: ~80,000đ

## 📊 Mock Data Options

### Option 1: Minimal (3 món)
```
1. Phở Bò - 85,000đ (Featured)
2. Cơm Tấm - 75,000đ  
3. Bún Bò Huế - 80,000đ
```

### Option 2: Full (18 món)
```
7 categories × 2-3 items each = 18 total items
- Món Khai Vị: 3 items
- Phở & Bún: 3 items  
- Cơm & Cháo: 3 items
- Món Nướng: 3 items
- Hải Sản: 2 items
- Thức Uống: 2 items
- Tráng Miệng: 2 items
```

## 🔧 Technical Details

### Service Methods:
- `forceResetWithMinimalData()`: Reset về 3 món
- `resetMockData()`: Reset về 18 món đầy đủ
- `debugMenuData()`: Debug info
- `getMenuStats()`: Tính thống kê real-time

### Storage Key:
```typescript
private storageKey = 'foodstack_menu_management';
```

### Stats Calculation:
```typescript
const totalItems = menuData.items.length;
const availableItems = menuData.items.filter(item => item.is_available).length;
const featuredItems = menuData.items.filter(item => item.is_featured).length;
```

## 🎯 Kết quả mong đợi
- ✅ Thống kê hiển thị đúng số món thực tế
- ✅ Có thể chọn giữa 3 món hoặc 18 món
- ✅ Debug tool để kiểm tra data
- ✅ Reset dễ dàng khi cần thiết