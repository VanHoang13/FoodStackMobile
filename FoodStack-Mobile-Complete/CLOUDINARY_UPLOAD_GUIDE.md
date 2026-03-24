# 📸 Hướng dẫn Upload Ảnh với Cloudinary

## ✅ Tình trạng hiện tại
- ✅ Cloudinary đã được cấu hình trong backend (.env)
- ✅ Upload controller và routes đã được tạo
- ✅ ImageUploadService đã được implement trong mobile app
- ✅ UI đã được cập nhật với ImageUploadSection component
- ✅ Tất cả dependencies đã được cài đặt

## 🚀 Cách sử dụng

### 1. Trong ứng dụng mobile:
1. Mở **Quản lý Chi nhánh** từ menu Owner
2. Nhấn nút **+** để thêm chi nhánh mới hoặc **Edit** để sửa chi nhánh
3. Trong form, tìm phần **"Hình ảnh chi nhánh"**
4. Nhấn nút **"Chọn ảnh"** để mở menu tùy chọn:
   - **Thư viện**: Chọn ảnh từ thư viện ảnh
   - **Chụp ảnh**: Chụp ảnh mới bằng camera
   - **Nhập URL**: Nhập URL ảnh trực tiếp
   - **Hủy**: Đóng menu

### 2. Quy trình upload:
1. Chọn ảnh từ thư viện hoặc chụp ảnh mới
2. Ảnh sẽ được tự động upload lên Cloudinary
3. Hiển thị thông báo "Đang tải lên..." trong quá trình upload
4. Khi thành công, ảnh sẽ hiển thị preview và URL được lưu
5. Nhấn "Lưu" để lưu thông tin chi nhánh

## 🔧 Cấu hình Cloudinary

### Backend (.env):
```
CLOUDINARY_CLOUD_NAME=dsqym4qpr
CLOUDINARY_API_KEY=197628145811452
CLOUDINARY_API_SECRET=aeoi3UJr65GonJl2pja0N6eVFQU
```

### Upload settings:
- **Folder**: `foodstack/branches`
- **Max size**: 5MB
- **Formats**: JPG, PNG, GIF, WebP
- **Transformations**: 
  - Max size: 800x600px
  - Quality: auto
  - Format: auto

## 📱 Tính năng

### ImageUploadSection Component:
- ✅ Upload button với icon camera
- ✅ URL input button với icon link
- ✅ Image preview với khả năng xóa
- ✅ Placeholder khi chưa có ảnh
- ✅ Loading state khi đang upload
- ✅ Error handling với thông báo lỗi

### Upload Service:
- ✅ Permission handling (camera & gallery)
- ✅ Image picker với aspect ratio 16:9
- ✅ Quality optimization (0.8)
- ✅ Automatic file naming
- ✅ Backend upload via API
- ✅ Fallback direct Cloudinary upload

## 🛠️ API Endpoints

### Upload Image:
```
POST /api/v1/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- image: File
- folder: String (optional, default: "foodstack")
```

### Response:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/dsqym4qpr/image/upload/...",
    "public_id": "foodstack/branches/branch_1234567890.jpg",
    "width": 800,
    "height": 600,
    "format": "jpg",
    "bytes": 45678
  }
}
```

## 🔍 Testing

### Test Cloudinary connection:
```bash
cd backend
node test-upload-simple.js
```

### Test từ mobile app:
1. Đảm bảo backend đang chạy (port 3000)
2. Đảm bảo mobile app có quyền camera và gallery
3. Thử upload ảnh từ thư viện
4. Thử chụp ảnh mới
5. Kiểm tra ảnh hiển thị trong danh sách chi nhánh

## 🚨 Troubleshooting

### Lỗi thường gặp:

1. **"Cần cấp quyền truy cập camera/thư viện"**
   - Cấp quyền camera và gallery cho app
   - Restart app sau khi cấp quyền

2. **"Không thể tải ảnh lên"**
   - Kiểm tra kết nối internet
   - Kiểm tra backend có đang chạy không
   - Kiểm tra token authentication

3. **"Upload failed"**
   - Kiểm tra Cloudinary configuration
   - Kiểm tra file size (max 5MB)
   - Kiểm tra format ảnh

4. **"Không thể tải ảnh từ URL này"**
   - URL không hợp lệ hoặc ảnh không tồn tại
   - Thử URL khác hoặc upload ảnh trực tiếp

## 📝 Notes

- Ảnh được lưu trong folder `foodstack/branches` trên Cloudinary
- Ảnh được tự động optimize về size và quality
- Hỗ trợ cả iOS và Android
- Có fallback cho trường hợp backend không khả dụng
- UI responsive và user-friendly với loading states

## 🎯 Next Steps

Bạn có thể mở rộng tính năng này cho:
- Upload ảnh menu items
- Upload logo restaurant
- Upload avatar user
- Batch upload multiple images
- Image editing trước khi upload