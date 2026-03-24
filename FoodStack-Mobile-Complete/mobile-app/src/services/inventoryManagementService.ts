import AsyncStorage from '@react-native-async-storage/async-storage';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'INGREDIENTS' | 'BEVERAGES' | 'SUPPLIES' | 'CONDIMENTS';
  description?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  price?: number;
  supplier?: string;
  barcode?: string;
  expiryDate?: string;
  location?: string;
  image_url?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
  lastUpdated: string;
  updatedBy: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryStats {
  totalItems: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  expiringSoon: number;
  totalValue: number;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

class InventoryManagementService {
  private static instance: InventoryManagementService;
  private storageKey = 'foodstack_inventory_management';
  private movementsKey = 'foodstack_stock_movements';

  static getInstance(): InventoryManagementService {
    if (!InventoryManagementService.instance) {
      InventoryManagementService.instance = new InventoryManagementService();
    }
    return InventoryManagementService.instance;
  }

  // Get all inventory items
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting inventory items:', error);
      return [];
    }
  }

  // Save inventory items
  private async saveInventoryItems(items: InventoryItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving inventory items:', error);
      throw error;
    }
  }

  // Create new inventory item
  async createItem(item: Omit<InventoryItem, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
    try {
      const items = await this.getInventoryItems();
      
      const newItem: InventoryItem = {
        ...item,
        id: `inv_${Date.now()}`,
        status: this.calculateStatus(item.currentStock, item.minStock, item.expiryDate),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      items.push(newItem);
      await this.saveInventoryItems(items);
      
      // Log stock movement
      await this.logStockMovement({
        itemId: newItem.id,
        type: 'IN',
        quantity: newItem.currentStock,
        reason: 'Thêm sản phẩm mới',
        performedBy: newItem.updatedBy,
        notes: `Tạo mới: ${newItem.name}`
      });
      
      return newItem;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  }

  // Update inventory item
  async updateItem(itemId: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    try {
      const items = await this.getInventoryItems();
      const index = items.findIndex(item => item.id === itemId);
      
      if (index === -1) return null;
      
      const oldItem = items[index];
      const updatedItem: InventoryItem = {
        ...oldItem,
        ...updates,
        status: this.calculateStatus(
          updates.currentStock ?? oldItem.currentStock,
          updates.minStock ?? oldItem.minStock,
          updates.expiryDate ?? oldItem.expiryDate
        ),
        updated_at: new Date().toISOString()
      };
      
      items[index] = updatedItem;
      await this.saveInventoryItems(items);
      
      // Log stock movement if quantity changed
      if (updates.currentStock !== undefined && updates.currentStock !== oldItem.currentStock) {
        const quantityDiff = updates.currentStock - oldItem.currentStock;
        await this.logStockMovement({
          itemId: itemId,
          type: quantityDiff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(quantityDiff),
          reason: 'Cập nhật tồn kho',
          performedBy: updates.updatedBy || oldItem.updatedBy,
          notes: `Từ ${oldItem.currentStock} thành ${updates.currentStock}`
        });
      }
      
      return updatedItem;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }

  // Delete inventory item
  async deleteItem(itemId: string): Promise<boolean> {
    try {
      const items = await this.getInventoryItems();
      const filteredItems = items.filter(item => item.id !== itemId);
      await this.saveInventoryItems(filteredItems);
      return true;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      return false;
    }
  }

  // Update stock quantity
  async updateStock(itemId: string, newQuantity: number, reason: string, performedBy: string): Promise<InventoryItem | null> {
    try {
      const items = await this.getInventoryItems();
      const item = items.find(item => item.id === itemId);
      
      if (!item) return null;
      
      const oldQuantity = item.currentStock;
      const updatedItem = await this.updateItem(itemId, {
        currentStock: newQuantity,
        updatedBy: performedBy,
        lastUpdated: new Date().toISOString()
      });
      
      if (updatedItem) {
        // Log stock movement
        const quantityDiff = newQuantity - oldQuantity;
        await this.logStockMovement({
          itemId: itemId,
          type: quantityDiff > 0 ? 'IN' : quantityDiff < 0 ? 'OUT' : 'ADJUSTMENT',
          quantity: Math.abs(quantityDiff),
          reason: reason,
          performedBy: performedBy,
          notes: `Từ ${oldQuantity} thành ${newQuantity}`
        });
      }
      
      return updatedItem;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  // Get inventory statistics
  async getInventoryStats(): Promise<InventoryStats> {
    try {
      const items = await this.getInventoryItems();
      
      const totalItems = items.length;
      const inStock = items.filter(item => item.status === 'IN_STOCK').length;
      const lowStock = items.filter(item => item.status === 'LOW_STOCK').length;
      const outOfStock = items.filter(item => item.status === 'OUT_OF_STOCK').length;
      const expiringSoon = items.filter(item => this.isExpiringSoon(item.expiryDate)).length;
      const totalValue = items.reduce((sum, item) => sum + (item.price || 0) * item.currentStock, 0);
      
      return {
        totalItems,
        inStock,
        lowStock,
        outOfStock,
        expiringSoon,
        totalValue
      };
    } catch (error) {
      console.error('Error getting inventory stats:', error);
      return {
        totalItems: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        expiringSoon: 0,
        totalValue: 0
      };
    }
  }

  // Search items
  async searchItems(query: string): Promise<InventoryItem[]> {
    try {
      const items = await this.getInventoryItems();
      const lowercaseQuery = query.toLowerCase();
      
      return items.filter(item =>
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.description?.toLowerCase().includes(lowercaseQuery) ||
        item.supplier?.toLowerCase().includes(lowercaseQuery) ||
        item.barcode?.includes(query)
      );
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  }

  // Get items by category
  async getItemsByCategory(category: string): Promise<InventoryItem[]> {
    try {
      const items = await this.getInventoryItems();
      return items.filter(item => item.category === category);
    } catch (error) {
      console.error('Error getting items by category:', error);
      return [];
    }
  }

  // Get low stock items
  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const items = await this.getInventoryItems();
      return items.filter(item => item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK');
    } catch (error) {
      console.error('Error getting low stock items:', error);
      return [];
    }
  }

  // Get expiring items
  async getExpiringItems(): Promise<InventoryItem[]> {
    try {
      const items = await this.getInventoryItems();
      return items.filter(item => this.isExpiringSoon(item.expiryDate));
    } catch (error) {
      console.error('Error getting expiring items:', error);
      return [];
    }
  }

  // Stock movements
  async logStockMovement(movement: Omit<StockMovement, 'id' | 'timestamp'>): Promise<void> {
    try {
      const movements = await this.getStockMovements();
      const newMovement: StockMovement = {
        ...movement,
        id: `mov_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      movements.unshift(newMovement); // Add to beginning
      
      // Keep only last 1000 movements
      if (movements.length > 1000) {
        movements.splice(1000);
      }
      
      await AsyncStorage.setItem(this.movementsKey, JSON.stringify(movements));
    } catch (error) {
      console.error('Error logging stock movement:', error);
    }
  }

  async getStockMovements(): Promise<StockMovement[]> {
    try {
      const data = await AsyncStorage.getItem(this.movementsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting stock movements:', error);
      return [];
    }
  }

  async getItemMovements(itemId: string): Promise<StockMovement[]> {
    try {
      const movements = await this.getStockMovements();
      return movements.filter(movement => movement.itemId === itemId);
    } catch (error) {
      console.error('Error getting item movements:', error);
      return [];
    }
  }

  // Helper methods
  private calculateStatus(currentStock: number, minStock: number, expiryDate?: string): InventoryItem['status'] {
    if (this.isExpired(expiryDate)) {
      return 'EXPIRED';
    }
    if (currentStock === 0) {
      return 'OUT_OF_STOCK';
    }
    if (currentStock <= minStock) {
      return 'LOW_STOCK';
    }
    return 'IN_STOCK';
  }

  private isExpired(expiryDate?: string): boolean {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  }

  private isExpiringSoon(expiryDate?: string, daysThreshold: number = 7): boolean {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);
    return expiry <= threshold && expiry >= new Date();
  }

  // Initialize with mock data
  async initializeMockData(): Promise<void> {
    try {
      const existingItems = await this.getInventoryItems();
      if (existingItems.length > 0) {
        console.log('InventoryManagementService: Mock data already exists, skipping initialization');
        return;
      }

      await this.createMockInventoryData();
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }
  }

  // Reset and recreate mock data
  async resetMockData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      await AsyncStorage.removeItem(this.movementsKey);
      await this.createMockInventoryData();
      console.log('InventoryManagementService: Mock data reset and recreated');
    } catch (error) {
      console.error('Error resetting mock data:', error);
    }
  }

  private async createMockInventoryData(): Promise<void> {
    try {
      console.log('InventoryManagementService: Creating mock inventory data...');

      const mockItems: Omit<InventoryItem, 'id' | 'status' | 'created_at' | 'updated_at'>[] = [
        // Nguyên liệu chính
        {
          name: 'Thịt bò Úc',
          category: 'INGREDIENTS',
          description: 'Thịt bò Úc cao cấp, tươi ngon',
          currentStock: 25,
          minStock: 10,
          maxStock: 50,
          unit: 'kg',
          price: 450000,
          supplier: 'Công ty Thịt Sạch ABC',
          barcode: '8934567890123',
          expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
          location: 'Tủ lạnh A1',
          image_url: 'https://images.unsplash.com/photo-1588347818481-c7c4b1b6b3c8?w=400&h=300&fit=crop',
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Nguyễn Văn A'
        },
        {
          name: 'Bánh phở tươi',
          category: 'INGREDIENTS',
          description: 'Bánh phở tươi làm từ gạo ST25',
          currentStock: 8,
          minStock: 15,
          maxStock: 80,
          unit: 'kg',
          price: 35000,
          supplier: 'Xưởng bánh phở Minh Hạnh',
          barcode: '8934567890124',
          expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
          location: 'Kho khô B2',
          image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Trần Thị B'
        },
        {
          name: 'Tôm sú tươi',
          category: 'INGREDIENTS',
          description: 'Tôm sú tươi sống từ Cà Mau',
          currentStock: 12,
          minStock: 8,
          maxStock: 30,
          unit: 'kg',
          price: 380000,
          supplier: 'Hợp tác xã Tôm Cà Mau',
          barcode: '8934567890125',
          expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day
          location: 'Tủ lạnh A2',
          image_url: 'https://images.unsplash.com/photo-1565680018434-b513d5573b07?w=400&h=300&fit=crop',
          lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updatedBy: 'Lê Văn C'
        },
        {
          name: 'Gạo ST25',
          category: 'INGREDIENTS',
          description: 'Gạo ST25 thơm ngon, chất lượng cao',
          currentStock: 45,
          minStock: 20,
          maxStock: 100,
          unit: 'kg',
          price: 45000,
          supplier: 'Công ty Gạo Việt Nam',
          barcode: '8934567890126',
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
          location: 'Kho khô B1',
          image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
          lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Phạm Thị D'
        },
        {
          name: 'Rau thơm tổng hợp',
          category: 'INGREDIENTS',
          description: 'Ngò gai, húng quế, rau răm, giá đỗ',
          currentStock: 3,
          minStock: 5,
          maxStock: 20,
          unit: 'kg',
          price: 25000,
          supplier: 'Nông trại Xanh Đà Lạt',
          barcode: '8934567890127',
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
          location: 'Tủ lạnh rau A3',
          image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
          lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Hoàng Văn E'
        },

        // Gia vị
        {
          name: 'Nước mắm Phú Quốc',
          category: 'CONDIMENTS',
          description: 'Nước mắm truyền thống Phú Quốc 40 độ đạm',
          currentStock: 15,
          minStock: 8,
          maxStock: 40,
          unit: 'chai',
          price: 85000,
          supplier: 'Công ty Nước mắm Phú Quốc',
          barcode: '8934567890128',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          location: 'Kho gia vị C1',
          image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400&h=300&fit=crop',
          lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Nguyễn Thị F'
        },
        {
          name: 'Hạt nêm Knorr',
          category: 'CONDIMENTS',
          description: 'Hạt nêm từ thịt heo và tôm',
          currentStock: 0,
          minStock: 10,
          maxStock: 50,
          unit: 'gói',
          price: 12000,
          supplier: 'Unilever Việt Nam',
          barcode: '8934567890129',
          expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(), // 10 months
          location: 'Kho gia vị C2',
          image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop',
          lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Trần Văn G'
        },

        // Đồ uống
        {
          name: 'Coca Cola',
          category: 'BEVERAGES',
          description: 'Nước ngọt Coca Cola 330ml',
          currentStock: 48,
          minStock: 24,
          maxStock: 120,
          unit: 'lon',
          price: 18000,
          supplier: 'Coca Cola Việt Nam',
          barcode: '8934567890130',
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months
          location: 'Kho đồ uống D1',
          image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop',
          lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Lê Thị H'
        },
        {
          name: 'Bia Saigon',
          category: 'BEVERAGES',
          description: 'Bia Saigon Special 330ml',
          currentStock: 36,
          minStock: 24,
          maxStock: 100,
          unit: 'lon',
          price: 22000,
          supplier: 'Sabeco',
          barcode: '8934567890131',
          expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 4 months
          location: 'Kho đồ uống D2',
          image_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop',
          lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Phạm Văn I'
        },

        // Vật tư
        {
          name: 'Khăn giấy ăn',
          category: 'SUPPLIES',
          description: 'Khăn giấy ăn cao cấp 2 lớp',
          currentStock: 25,
          minStock: 15,
          maxStock: 80,
          unit: 'gói',
          price: 8000,
          supplier: 'Công ty Giấy Sạch',
          barcode: '8934567890132',
          location: 'Kho vật tư E1',
          image_url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop',
          lastUpdated: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Hoàng Thị J'
        },
        {
          name: 'Đũa gỗ',
          category: 'SUPPLIES',
          description: 'Đũa gỗ tự nhiên dùng một lần',
          currentStock: 8,
          minStock: 20,
          maxStock: 100,
          unit: 'gói',
          price: 15000,
          supplier: 'Công ty Đồ gỗ Việt',
          barcode: '8934567890133',
          location: 'Kho vật tư E2',
          image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
          lastUpdated: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Nguyễn Văn K'
        }
      ];

      // Create all items
      for (const itemData of mockItems) {
        await this.createItem(itemData);
      }

      console.log('InventoryManagementService: Mock inventory data created successfully');
    } catch (error) {
      console.error('Error creating mock inventory data:', error);
    }
  }
}

export default InventoryManagementService.getInstance();