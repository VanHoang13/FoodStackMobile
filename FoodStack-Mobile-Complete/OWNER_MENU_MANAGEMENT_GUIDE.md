# Owner Menu Management System Guide

## Overview

The Owner Menu Management system provides comprehensive menu management capabilities for restaurant owners, including CRUD operations for menu categories and items, with rich mock data and functional UI controls.

## Features

### 📊 Dashboard Statistics
- **Total Items**: Shows total number of menu items
- **Available Items**: Shows items currently available for ordering
- **Featured Items**: Shows items marked as featured/recommended
- **Average Price**: Displays average price across all menu items

### 🔍 Search & Filtering
- **Search**: Search by item name, description, or ingredients
- **Category Filter**: Filter items by category (Món Khai Vị, Phở & Bún, etc.)
- **Status Filters**: Filter by availability (Available/Unavailable) and featured status

### 🍽️ Menu Items Management
- **Toggle Availability**: Enable/disable items for ordering
- **Toggle Featured**: Mark/unmark items as featured
- **Edit Items**: Modify item details (placeholder for future implementation)
- **Delete Items**: Remove items from menu with confirmation

### 📋 Rich Mock Data
The system includes comprehensive mock data with:
- **7 Categories**: Món Khai Vị, Phở & Bún, Cơm & Cháo, Món Nướng, Hải Sản, Thức Uống, Tráng Miệng
- **18+ Menu Items**: Diverse Vietnamese dishes with detailed information
- **Item Details**: Name, description, price, ingredients, allergens, nutrition info, preparation time

## File Structure

```
src/
├── services/
│   └── menuManagementService.ts     # Core service with CRUD operations
├── screens/
│   ├── OwnerMenuManagementScreen.tsx # Main management interface
│   └── MenuManagementTestScreen.tsx  # Test/debug screen
└── types/
    └── index.ts                     # Type definitions
```

## Navigation Flow

```
RestaurantDashboardScreen
    ↓ (Quản lý menu button)
OwnerMenuManagementScreen
    ↓ (Add/Edit buttons)
[Future: Add/Edit Item Forms]
```

## Service Architecture

### MenuManagementService

**Core Methods:**
- `initializeMockData()`: Initialize rich mock data if not exists
- `getMenuData()`: Get all menu data from AsyncStorage
- `getCategories()`: Get all categories sorted by order
- `getItems()`: Get all items sorted by order
- `getMenuStats()`: Get dashboard statistics

**Category Management:**
- `createCategory()`: Add new category
- `updateCategory()`: Update category details
- `deleteCategory()`: Remove category and its items
- `toggleCategoryActive()`: Enable/disable category

**Item Management:**
- `createItem()`: Add new menu item
- `updateItem()`: Update item details
- `deleteItem()`: Remove menu item
- `toggleItemAvailability()`: Enable/disable item for ordering
- `toggleItemFeatured()`: Mark/unmark as featured

**Search & Filter:**
- `searchItems()`: Search items by query
- `getItemsByStatus()`: Filter by availability
- `getFeaturedItems()`: Get featured items only
- `getItemsByCategory()`: Get items in specific category

## Data Models

### MenuCategory
```typescript
interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### MenuItem
```typescript
interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  ingredients?: string[];
  allergens?: string[];
  nutrition_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  preparation_time?: number;
  created_at: string;
  updated_at: string;
}
```

## Mock Data Examples

### Categories (7 total)
1. **Món Khai Vị** - Các món ăn nhẹ để bắt đầu bữa ăn
2. **Phở & Bún** - Các loại phở và bún truyền thống Việt Nam
3. **Cơm & Cháo** - Cơm và cháo đa dạng
4. **Món Nướng** - Các món nướng thơm ngon
5. **Hải Sản** - Hải sản tươi sống
6. **Thức Uống** - Nước uống và đồ uống
7. **Tráng Miệng** - Các món tráng miệng ngọt ngào

### Sample Menu Items
- **Gỏi Cuốn Tôm Thịt** (45,000đ) - Featured appetizer
- **Phở Bò Tái** (85,000đ) - Featured main dish
- **Bún Bò Huế** (75,000đ) - Spicy noodle soup
- **Cơm Tấm Sườn Nướng** (65,000đ) - Grilled pork with broken rice
- **Tôm Rang Me** (150,000đ) - Tamarind prawns
- **Cà Phê Sữa Đá** (30,000đ) - Vietnamese iced coffee
- **Chè Ba Màu** (25,000đ) - Three-color dessert

## UI Components

### Statistics Cards
- Horizontal scrollable cards showing key metrics
- Color-coded values (green for available, orange for featured, blue for price)

### Search Bar
- Real-time search with clear button
- Filter toggle button

### Filter Chips
- Category filter chips (horizontal scroll)
- Status filter buttons (Available, Featured)

### Item Cards
- Comprehensive item information display
- Status badges (Featured, Available/Unavailable)
- Action buttons (Toggle availability, Toggle featured, Edit, Delete)
- Item metadata (preparation time, ingredients preview)

### Action Buttons
- **Toggle Availability**: Green (show) / Gray (hide)
- **Toggle Featured**: Orange (feature) / Gray (unfeature)  
- **Edit**: Blue button (placeholder)
- **Delete**: Red button with confirmation

## Testing

### MenuManagementTestScreen
Access via Home screen → "Menu Test" button

**Features:**
- Display statistics overview
- Test toggle functions
- Preview categories and items
- Direct navigation to main management screen

**Test Actions:**
- Toggle availability of first item
- Toggle featured status of first item
- Navigate to full management interface

## Usage Instructions

### For Owners:
1. **Access**: RestaurantDashboard → "Quản lý menu"
2. **View Stats**: Check dashboard statistics at top
3. **Search**: Use search bar to find specific items
4. **Filter**: Toggle filters and select categories/status
5. **Manage Items**: Use action buttons to toggle status or delete items

### For Developers:
1. **Test**: Home → "Menu Test" to verify functionality
2. **Debug**: Check console logs for service operations
3. **Extend**: Add new methods to MenuManagementService
4. **UI**: Modify OwnerMenuManagementScreen for new features

## Future Enhancements

### Planned Features:
- [ ] Add/Edit item forms with image upload
- [ ] Category management interface
- [ ] Bulk operations (enable/disable multiple items)
- [ ] Item analytics and performance metrics
- [ ] Export/import menu data
- [ ] Multi-language support
- [ ] Price history tracking
- [ ] Inventory integration

### Technical Improvements:
- [ ] Real API integration
- [ ] Image caching and optimization
- [ ] Offline support with sync
- [ ] Advanced search with filters
- [ ] Drag-and-drop reordering
- [ ] Undo/redo functionality

## Error Handling

The system includes comprehensive error handling:
- AsyncStorage failures
- Data validation errors
- Network connectivity issues (future)
- User confirmation for destructive actions

## Performance Considerations

- **Lazy Loading**: Items loaded on demand
- **Efficient Filtering**: Client-side filtering for responsive UI
- **Memory Management**: Proper cleanup of resources
- **Optimized Rendering**: Minimal re-renders with proper state management

## Troubleshooting

### Common Issues:
1. **Data not loading**: Check AsyncStorage permissions
2. **Actions not working**: Verify service method calls
3. **UI not updating**: Check state management and re-renders
4. **Navigation errors**: Verify screen registration in AppNavigator

### Debug Steps:
1. Check console logs for service operations
2. Use MenuManagementTestScreen for isolated testing
3. Verify AsyncStorage data with React Native Debugger
4. Test individual service methods

## Integration Points

### With Other Systems:
- **Order System**: Items availability affects ordering
- **Staff System**: Kitchen staff see preparation times
- **Customer App**: Featured items shown prominently
- **Analytics**: Track popular items and performance

This comprehensive menu management system provides a solid foundation for restaurant menu operations with room for future enhancements and integrations.