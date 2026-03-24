# 📊 KPI Layout Preview - Tổng quan Hiệu suất

## 🎨 Bố cục mới: 2 trên 2 dưới

```
┌─────────────────────────────────────────────────────────┐
│                 Tổng quan Hiệu suất                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │ 📈 Đơn hàng/giờ     │  │ ⏰ Thời gian phục vụ │      │
│  │ 12.5 đơn            │  │ 8.2 phút            │      │
│  │ ▲ +8.3%             │  │ ▼ -12.5%            │      │
│  │ ████████░░ 83%      │  │ ████████░░ 82%      │      │
│  │ Mục tiêu: 15 đơn    │  │ Mục tiêu: 10 phút   │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │ 🎯 Độ chính xác     │  │ ⭐ Đánh giá KH      │      │
│  │ 96.8%               │  │ 4.7/5               │      │
│  │ ▲ +2.1%             │  │ ─ 0%                │      │
│  │ ██████████ 100%     │  │ ████████░░ 94%      │      │
│  │ Mục tiêu: 95%       │  │ Mục tiêu: 4.5/5     │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## ✨ Thay đổi chính:

### 🔄 **Trước (Grid 2x2)**:
- `flexDirection: 'row'`
- `flexWrap: 'wrap'`
- `width: (width - 72) / 2`
- Cards tự động wrap xuống dòng

### 🆕 **Sau (2 hàng riêng biệt)**:
- **Hàng 1**: `kpis.slice(0, 2)` - 2 KPI đầu
- **Hàng 2**: `kpis.slice(2, 4)` - 2 KPI cuối
- `flex: 1` cho mỗi card
- `marginBottom: 10` giữa các hàng

## 🎯 **Lợi ích**:
- ✅ Bố cục rõ ràng hơn
- ✅ Dễ đọc trên mobile
- ✅ Spacing đều đặn
- ✅ Responsive tốt hơn
- ✅ Visual hierarchy tốt hơn

## 📱 **Responsive Design**:
- Cards tự động điều chỉnh width
- Gap 10px giữa cards và rows
- Padding 12px trong mỗi card
- Border radius 12px cho modern look

## 🎨 **Visual Elements**:
- **Icons**: Màu theo theme của từng KPI
- **Trend indicators**: Arrows + percentages
- **Progress bars**: Visual progress tracking
- **Color coding**: Mỗi KPI có màu riêng
- **Typography**: Clear hierarchy với font sizes phù hợp