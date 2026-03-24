# Menu Error Solution - Maximum Update Depth Exceeded

## 🔍 Vấn đề đã xác định và sửa

### 1. ✅ useEffect Loop trong MenuScreen
**Nguyên nhân:** useEffect có dependency gây vòng lặp vô hạn
**Đã sửa:** Loại bỏ dependencies gây vòng lặp

### 2. ✅ CartContext Functions không được memoized
**Nguyên nhân:** Functions được tạo mới mỗi render
**Đã sửa:** Sử dụng useCallback để memoize functions

### 3. ✅ currentBranchId thay đổi liên tục
**Nguyên nhân:** Object reference thay đổi mỗi render
**Đã sửa:** Sử dụng useMemo để memoize giá trị

## 🧪 Cách test từng bước

### Bước 1: Test Simple Menu (Không có API/useEffect)
```
Home → Simple Menu
```
- Nếu hoạt động: Vấn đề là API/useEffect
- Nếu vẫn lỗi: Vấn đề ở component cơ bản

### Bước 2: Test Menu API riêng biệt
```
Home → Test Menu
```
- Kiểm tra API response
- Xem console logs

### Bước 3: Test Full Menu
```
Home → Test Menu (Full Menu button)
```
- Test với tất cả logic

## 🔧 Files đã sửa

### MenuScreen.tsx
```typescript
// ✅ Sửa useEffect loop
useEffect(() => {
  if (tableInfo) {
    setTableInfo(tableInfo, sessionToken);
  }
}, [tableInfo, sessionToken]); // Bỏ setTableInfo

// ✅ Sửa category selection loop  
useEffect(() => {
  if (menuData?.success && menuData.data?.categories && menuData.data.categories.length > 0 && !selectedCategory) {
    setSelectedCategory(menuData.data.categories[0].id);
  }
}, [menuData]); // Bỏ selectedCategory

// ✅ Memoize currentBranchId
const currentBranchId = useMemo(() => {
  return branchId || tableInfo?.branch?.id;
}, [branchId, tableInfo?.branch?.id]);
```

### CartContext.tsx
```typescript
// ✅ Memoize tất cả functions
const addItem = useCallback((item) => {
  // ...
}, []);

const setTableInfo = useCallback((tableInfo, sessionToken) => {
  dispatch({ type: 'SET_TABLE_INFO', payload: { tableInfo, sessionToken } });
}, []);

const getTotalItems = useCallback(() => state.totalItems, [state.totalItems]);
```

## 🚀 Restart Instructions

1. **Stop Metro bundler** (Ctrl+C)
2. **Clear cache:**
   ```bash
   npx react-native start --reset-cache
   ```
3. **Reload app** (R R trong Metro hoặc Cmd+R)

## 📱 Test Sequence

1. **Mở app** → Home screen
2. **Test Simple Menu** → Nếu OK, tiếp tục
3. **Test Test Menu** → Kiểm tra API response
4. **Test Full Menu** → Nếu vẫn lỗi, xem logs

## 🐛 Nếu vẫn lỗi

### Kiểm tra Console Logs
```
// Tìm các logs này:
🧪 Testing menu API...
✅ Menu API response: {...}
❌ Menu API error: {...}
```

### Kiểm tra React Native Debugger
1. Mở Chrome DevTools
2. Xem Console tab
3. Tìm error stack trace

### Kiểm tra Network
```bash
# Test backend connection
node find-ip.js
node test-backend.js
```

## 🔄 Fallback Options

### Option 1: Sử dụng Simple Menu
- Không có API calls
- Không có useEffect phức tạp
- Pure React component

### Option 2: Mock Data
- API đã có fallback mock data
- Hoạt động khi backend không available

### Option 3: Disable React Query
```typescript
// Tạm thời comment React Query
// const { data: menuData, isLoading, error, refetch } = useQuery({...});

// Sử dụng useState thay thế
const [menuData, setMenuData] = useState(MOCK_DATA);
```

## 📋 Checklist Debug

- [x] Sửa useEffect loops
- [x] Memoize CartContext functions  
- [x] Memoize currentBranchId
- [x] Tạo SimpleMenu test
- [x] Tạo TestMenu debug
- [x] Thêm debug buttons vào Home
- [ ] Test trên thiết bị
- [ ] Verify không còn infinite loops
- [ ] Test full user journey

## 🎯 Expected Results

Sau khi sửa:
- ✅ Simple Menu hoạt động ngay lập tức
- ✅ Test Menu hiển thị API response
- ✅ Full Menu load được categories và items
- ✅ Không còn "Maximum update depth exceeded"

## 📞 Next Steps

1. **Test Simple Menu** trước để confirm cơ bản hoạt động
2. **Kiểm tra logs** để xem API response
3. **Test Full Menu** để verify fix hoàn chỉnh
4. **Report results** để tiếp tục debug nếu cần