import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
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

export interface MenuData {
  categories: MenuCategory[];
  items: MenuItem[];
}

class MenuManagementService {
  private static instance: MenuManagementService;
  private storageKey = 'foodstack_menu_management';

  static getInstance(): MenuManagementService {
    if (!MenuManagementService.instance) {
      MenuManagementService.instance = new MenuManagementService();
    }
    return MenuManagementService.instance;
  }

  // Get all menu data
  async getMenuData(): Promise<MenuData> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : { categories: [], items: [] };
    } catch (error) {
      console.error('Error getting menu data:', error);
      return { categories: [], items: [] };
    }
  }

  // Save menu data
  private async saveMenuData(menuData: MenuData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(menuData));
    } catch (error) {
      console.error('Error saving menu data:', error);
      throw error;
    }
  }

  // Category Management
  async getCategories(): Promise<MenuCategory[]> {
    const menuData = await this.getMenuData();
    return menuData.categories.sort((a, b) => a.sort_order - b.sort_order);
  }

  async createCategory(category: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>): Promise<MenuCategory> {
    try {
      const menuData = await this.getMenuData();
      const newCategory: MenuCategory = {
        ...category,
        id: `cat_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      menuData.categories.push(newCategory);
      await this.saveMenuData(menuData);
      
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(categoryId: string, updates: Partial<MenuCategory>): Promise<MenuCategory | null> {
    try {
      const menuData = await this.getMenuData();
      const index = menuData.categories.findIndex(cat => cat.id === categoryId);
      
      if (index === -1) return null;
      
      menuData.categories[index] = {
        ...menuData.categories[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      await this.saveMenuData(menuData);
      return menuData.categories[index];
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const menuData = await this.getMenuData();
      
      // Remove category
      menuData.categories = menuData.categories.filter(cat => cat.id !== categoryId);
      
      // Remove items in this category
      menuData.items = menuData.items.filter(item => item.category_id !== categoryId);
      
      await this.saveMenuData(menuData);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  // Item Management
  async getItems(): Promise<MenuItem[]> {
    const menuData = await this.getMenuData();
    return menuData.items.sort((a, b) => a.sort_order - b.sort_order);
  }

  async getItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    const menuData = await this.getMenuData();
    return menuData.items
      .filter(item => item.category_id === categoryId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  async createItem(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    try {
      const menuData = await this.getMenuData();
      const newItem: MenuItem = {
        ...item,
        id: `item_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      menuData.items.push(newItem);
      await this.saveMenuData(menuData);
      
      return newItem;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  async updateItem(itemId: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    try {
      const menuData = await this.getMenuData();
      const index = menuData.items.findIndex(item => item.id === itemId);
      
      if (index === -1) return null;
      
      menuData.items[index] = {
        ...menuData.items[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      await this.saveMenuData(menuData);
      return menuData.items[index];
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async deleteItem(itemId: string): Promise<boolean> {
    try {
      const menuData = await this.getMenuData();
      menuData.items = menuData.items.filter(item => item.id !== itemId);
      await this.saveMenuData(menuData);
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  }

  // Bulk operations
  async toggleItemAvailability(itemId: string): Promise<MenuItem | null> {
    const menuData = await this.getMenuData();
    const item = menuData.items.find(item => item.id === itemId);
    
    if (!item) return null;
    
    return this.updateItem(itemId, { is_available: !item.is_available });
  }

  async toggleItemFeatured(itemId: string): Promise<MenuItem | null> {
    const menuData = await this.getMenuData();
    const item = menuData.items.find(item => item.id === itemId);
    
    if (!item) return null;
    
    return this.updateItem(itemId, { is_featured: !item.is_featured });
  }

  async toggleCategoryActive(categoryId: string): Promise<MenuCategory | null> {
    const menuData = await this.getMenuData();
    const category = menuData.categories.find(cat => cat.id === categoryId);
    
    if (!category) return null;
    
    return this.updateCategory(categoryId, { is_active: !category.is_active });
  }

  // Search and filter
  async searchItems(query: string): Promise<MenuItem[]> {
    const menuData = await this.getMenuData();
    const lowercaseQuery = query.toLowerCase();
    
    return menuData.items.filter(item =>
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description?.toLowerCase().includes(lowercaseQuery) ||
      item.ingredients?.some(ing => ing.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getItemsByStatus(isAvailable: boolean): Promise<MenuItem[]> {
    const menuData = await this.getMenuData();
    return menuData.items.filter(item => item.is_available === isAvailable);
  }

  async getFeaturedItems(): Promise<MenuItem[]> {
    const menuData = await this.getMenuData();
    return menuData.items.filter(item => item.is_featured);
  }

  // Statistics
  async getMenuStats(): Promise<{
    totalCategories: number;
    activeCategories: number;
    totalItems: number;
    availableItems: number;
    featuredItems: number;
    avgPrice: number;
  }> {
    const menuData = await this.getMenuData();
    
    const totalCategories = menuData.categories.length;
    const activeCategories = menuData.categories.filter(cat => cat.is_active).length;
    const totalItems = menuData.items.length;
    const availableItems = menuData.items.filter(item => item.is_available).length;
    const featuredItems = menuData.items.filter(item => item.is_featured).length;
    const avgPrice = totalItems > 0 
      ? menuData.items.reduce((sum, item) => sum + item.price, 0) / totalItems 
      : 0;

    return {
      totalCategories,
      activeCategories,
      totalItems,
      availableItems,
      featuredItems,
      avgPrice
    };
  }

  // Initialize with rich mock data
  async initializeMockData(): Promise<void> {
    try {
      const existingData = await this.getMenuData();
      if (existingData.categories.length > 0 || existingData.items.length > 0) {
        console.log('MenuManagementService: Mock data already exists, skipping initialization');
        return;
      }

      await this.createMockMenuData();
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }
  }

  // Debug function to check current data
  async debugMenuData(): Promise<void> {
    try {
      const menuData = await this.getMenuData();
      console.log('=== MENU DEBUG INFO ===');
      console.log('Categories:', menuData.categories.length);
      console.log('Items:', menuData.items.length);
      console.log('Categories list:', menuData.categories.map(c => c.name));
      console.log('Items list:', menuData.items.map(i => i.name));
      console.log('======================');
    } catch (error) {
      console.error('Error debugging menu data:', error);
    }
  }

  // Reset and recreate full mock data (for testing/demo purposes)
  async resetMockData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      await this.createMockMenuData();
      console.log('MenuManagementService: Mock data reset and recreated');
    } catch (error) {
      console.error('Error resetting mock data:', error);
    }
  }

  // Force reset to ensure fresh data
  async forceResetWithMinimalData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      
      // Create minimal data with just 3 items as user expects
      const minimalCategories: MenuCategory[] = [
        {
          id: 'cat_1',
          name: 'Món Chính',
          description: 'Các món ăn chính',
          sort_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const minimalItems: MenuItem[] = [
        {
          id: 'item_1',
          category_id: 'cat_1',
          name: 'Phở Bò',
          description: 'Phở bò truyền thống',
          price: 85000,
          image_url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: true,
          sort_order: 1,
          ingredients: ['Bánh phở', 'Thịt bò', 'Hành'],
          allergens: [],
          nutrition_info: { calories: 450, protein: 25, carbs: 55, fat: 12 },
          preparation_time: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_2',
          category_id: 'cat_1',
          name: 'Cơm Tấm',
          description: 'Cơm tấm sườn nướng',
          price: 75000,
          image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: false,
          sort_order: 2,
          ingredients: ['Cơm tấm', 'Sườn nướng', 'Chả trứng'],
          allergens: [],
          nutrition_info: { calories: 520, protein: 30, carbs: 45, fat: 20 },
          preparation_time: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_3',
          category_id: 'cat_1',
          name: 'Bún Bò Huế',
          description: 'Bún bò Huế cay nồng',
          price: 80000,
          image_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: false,
          sort_order: 3,
          ingredients: ['Bún', 'Thịt bò', 'Chả cua'],
          allergens: ['Tôm cua'],
          nutrition_info: { calories: 480, protein: 28, carbs: 50, fat: 15 },
          preparation_time: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const menuData: MenuData = {
        categories: minimalCategories,
        items: minimalItems
      };

      await this.saveMenuData(menuData);
      console.log('MenuManagementService: Reset to minimal data with 3 items');
    } catch (error) {
      console.error('Error resetting to minimal data:', error);
    }
  }

  private async createMockMenuData(): Promise<void> {
    try {
      console.log('MenuManagementService: Creating mock data with beautiful images...');

      const mockCategories: MenuCategory[] = [
        {
          id: 'cat_1',
          name: 'Món Khai Vị',
          description: 'Các món ăn nhẹ để bắt đầu bữa ăn',
          sort_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'cat_2',
          name: 'Phở & Bún',
          description: 'Các loại phở và bún truyền thống Việt Nam',
          sort_order: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'cat_3',
          name: 'Cơm & Cháo',
          description: 'Cơm và cháo đa dạng',
          sort_order: 3,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'cat_4',
          name: 'Món Nướng',
          description: 'Các món nướng thơm ngon',
          sort_order: 4,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'cat_5',
          name: 'Hải Sản',
          description: 'Hải sản tươi sống',
          sort_order: 5,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'cat_6',
          name: 'Thức Uống',
          description: 'Nước uống và đồ uống',
          sort_order: 6,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'cat_7',
          name: 'Tráng Miệng',
          description: 'Các món tráng miệng ngọt ngào',
          sort_order: 7,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const mockItems: MenuItem[] = [
        // Món Khai Vị
        {
          id: 'item_1',
          category_id: 'cat_1',
          name: 'Gỏi Cuốn Tôm Thịt',
          description: 'Gỏi cuốn tươi với tôm, thịt heo và rau thơm',
          price: 45000,
          image_url: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: true,
          sort_order: 1,
          ingredients: ['Bánh tráng', 'Tôm', 'Thịt heo', 'Rau thơm', 'Bún'],
          allergens: ['Tôm cua'],
          nutrition_info: { calories: 180, protein: 12, carbs: 25, fat: 4 },
          preparation_time: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_2',
          category_id: 'cat_1',
          name: 'Chả Cá Lã Vọng',
          description: 'Chả cá truyền thống Hà Nội với thì là và hành lá',
          price: 85000,
          image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: false,
          sort_order: 2,
          ingredients: ['Cá lăng', 'Thì là', 'Hành lá', 'Bánh đa'],
          allergens: ['Cá'],
          nutrition_info: { calories: 320, protein: 28, carbs: 15, fat: 18 },
          preparation_time: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_3',
          category_id: 'cat_1',
          name: 'Nem Nướng Nha Trang',
          description: 'Nem nướng thơm ngon đặc sản Nha Trang',
          price: 65000,
          image_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: false,
          sort_order: 3,
          ingredients: ['Thịt heo', 'Bánh tráng', 'Rau sống', 'Nước chấm'],
          allergens: [],
          nutrition_info: { calories: 280, protein: 20, carbs: 18, fat: 15 },
          preparation_time: 20,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },

        // Phở & Bún
        {
          id: 'item_4',
          category_id: 'cat_2',
          name: 'Phở Bò Tái',
          description: 'Phở bò tái truyền thống với nước dùng đậm đà',
          price: 85000,
          image_url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: true,
          sort_order: 1,
          ingredients: ['Bánh phở', 'Thịt bò tái', 'Hành tây', 'Ngò gai', 'Giá đỗ'],
          allergens: [],
          nutrition_info: { calories: 450, protein: 25, carbs: 55, fat: 12 },
          preparation_time: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_5',
          category_id: 'cat_2',
          name: 'Phở Bò Chín',
          description: 'Phở bò với thịt chín mềm ngon',
          price: 85000,
          image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: false,
          sort_order: 2,
          ingredients: ['Bánh phở', 'Thịt bò chín', 'Hành tây', 'Ngò gai'],
          allergens: [],
          nutrition_info: { calories: 480, protein: 28, carbs: 55, fat: 14 },
          preparation_time: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_6',
          category_id: 'cat_2',
          name: 'Bún Bò Huế',
          description: 'Bún bò Huế cay nồng đặc trưng miền Trung',
          price: 75000,
          image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: true,
          sort_order: 3,
          ingredients: ['Bún', 'Thịt bò', 'Chả cua', 'Huyết', 'Rau thơm'],
          allergens: ['Tôm cua'],
          nutrition_info: { calories: 420, protein: 22, carbs: 48, fat: 16 },
          preparation_time: 8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_7',
          category_id: 'cat_2',
          name: 'Bún Chả Hà Nội',
          description: 'Bún chả truyền thống Hà Nội với thịt nướng thơm',
          price: 70000,
          image_url: 'https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: false,
          sort_order: 4,
          ingredients: ['Bún', 'Thịt nướng', 'Chả', 'Rau sống', 'Nước mắm chua ngọt'],
          allergens: [],
          nutrition_info: { calories: 380, protein: 24, carbs: 42, fat: 12 },
          preparation_time: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },

        // Cơm & Cháo
        {
          id: 'item_8',
          category_id: 'cat_3',
          name: 'Cơm Tấm Sườn Nướng',
          description: 'Cơm tấm với sườn nướng, chả trứng và bì',
          price: 65000,
          image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: true,
          sort_order: 1,
          ingredients: ['Cơm tấm', 'Sườn nướng', 'Chả trứng', 'Bì', 'Nước mắm'],
          allergens: ['Trứng'],
          nutrition_info: { calories: 520, protein: 26, carbs: 58, fat: 20 },
          preparation_time: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_9',
          category_id: 'cat_3',
          name: 'Cháo Lòng',
          description: 'Cháo lòng heo thơm ngon bổ dưỡng',
          price: 45000,
          image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: false,
          sort_order: 2,
          ingredients: ['Gạo', 'Lòng heo', 'Hành lá', 'Ngò rí', 'Tiêu'],
          allergens: [],
          nutrition_info: { calories: 280, protein: 18, carbs: 35, fat: 8 },
          preparation_time: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },

        // Món Nướng
        {
          id: 'item_10',
          category_id: 'cat_4',
          name: 'Thịt Nướng Lá Lốt',
          description: 'Thịt bò nướng cuốn lá lốt thơm ngon',
          price: 95000,
          image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: true,
          sort_order: 1,
          ingredients: ['Thịt bò', 'Lá lốt', 'Bánh tráng', 'Rau sống'],
          allergens: [],
          nutrition_info: { calories: 350, protein: 28, carbs: 12, fat: 22 },
          preparation_time: 18,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_11',
          category_id: 'cat_4',
          name: 'Gà Nướng Mật Ong',
          description: 'Gà nướng tẩm mật ong thơm ngọt',
          price: 120000,
          image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: false,
          sort_order: 2,
          ingredients: ['Gà ta', 'Mật ong', 'Gia vị nướng'],
          allergens: [],
          nutrition_info: { calories: 420, protein: 35, carbs: 8, fat: 28 },
          preparation_time: 25,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },

        // Hải Sản
        {
          id: 'item_12',
          category_id: 'cat_5',
          name: 'Tôm Rang Me',
          description: 'Tôm rang me chua ngọt đặc biệt',
          price: 150000,
          image_url: 'https://images.unsplash.com/photo-1565680018434-b513d5573b07?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: true,
          sort_order: 1,
          ingredients: ['Tôm sú', 'Me', 'Đường', 'Tỏi', 'Ớt'],
          allergens: ['Tôm cua'],
          nutrition_info: { calories: 280, protein: 24, carbs: 18, fat: 12 },
          preparation_time: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_13',
          category_id: 'cat_5',
          name: 'Cua Rang Me',
          description: 'Cua biển rang me thơm ngon',
          price: 180000,
          image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&crop=center',
          is_available: false,
          is_featured: false,
          sort_order: 2,
          ingredients: ['Cua biển', 'Me', 'Lá chanh', 'Ớt hiểm'],
          allergens: ['Tôm cua'],
          nutrition_info: { calories: 320, protein: 28, carbs: 15, fat: 18 },
          preparation_time: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },

        // Thức Uống
        {
          id: 'item_14',
          category_id: 'cat_6',
          name: 'Trà Đá',
          description: 'Trà đá truyền thống mát lạnh',
          price: 15000,
          image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: false,
          sort_order: 1,
          ingredients: ['Trà', 'Đá', 'Đường'],
          allergens: [],
          nutrition_info: { calories: 25, protein: 0, carbs: 6, fat: 0 },
          preparation_time: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_15',
          category_id: 'cat_6',
          name: 'Cà Phê Sữa Đá',
          description: 'Cà phê sữa đá đậm đà Việt Nam',
          price: 30000,
          image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: true,
          sort_order: 2,
          ingredients: ['Cà phê', 'Sữa đặc', 'Đá'],
          allergens: ['Sữa'],
          nutrition_info: { calories: 120, protein: 3, carbs: 18, fat: 4 },
          preparation_time: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_16',
          category_id: 'cat_6',
          name: 'Nước Dừa Tươi',
          description: 'Nước dừa tươi mát ngọt tự nhiên',
          price: 35000,
          image_url: 'https://images.unsplash.com/photo-1481671703460-040cb8a2d909?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: false,
          sort_order: 3,
          ingredients: ['Dừa tươi'],
          allergens: [],
          nutrition_info: { calories: 60, protein: 1, carbs: 15, fat: 0 },
          preparation_time: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },

        // Tráng Miệng
        {
          id: 'item_17',
          category_id: 'cat_7',
          name: 'Chè Ba Màu',
          description: 'Chè ba màu truyền thống với đậu xanh, đậu đỏ',
          price: 25000,
          image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: true,
          sort_order: 1,
          ingredients: ['Đậu xanh', 'Đậu đỏ', 'Thạch', 'Nước cốt dừa', 'Đá bào'],
          allergens: [],
          nutrition_info: { calories: 180, protein: 4, carbs: 35, fat: 3 },
          preparation_time: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'item_18',
          category_id: 'cat_7',
          name: 'Bánh Flan',
          description: 'Bánh flan mềm mịn thơm ngon',
          price: 20000,
          image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center',
          is_available: true,
          is_featured: false,
          sort_order: 2,
          ingredients: ['Trứng', 'Sữa', 'Đường', 'Vani'],
          allergens: ['Trứng', 'Sữa'],
          nutrition_info: { calories: 150, protein: 6, carbs: 22, fat: 5 },
          preparation_time: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const menuData: MenuData = {
        categories: mockCategories,
        items: mockItems
      };

      await this.saveMenuData(menuData);
      console.log('MenuManagementService: Rich mock data initialized successfully');
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }
  }
}

export default MenuManagementService.getInstance();