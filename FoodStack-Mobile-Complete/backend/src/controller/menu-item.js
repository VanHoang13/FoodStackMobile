// src/controller/menu-item.js

class MenuItemController {
  constructor({ 
    createMenuItemUseCase, 
    updateMenuItemUseCase, 
    deleteMenuItemUseCase, 
    uploadMenuItemImageUseCase, 
    updateMenuItemAvailabilityUseCase, 
    searchMenuItemsUseCase 
  }) {
    this.createMenuItemUseCase = createMenuItemUseCase;
    this.updateMenuItemUseCase = updateMenuItemUseCase;
    this.deleteMenuItemUseCase = deleteMenuItemUseCase;
    this.uploadMenuItemImageUseCase = uploadMenuItemImageUseCase;
    this.updateMenuItemAvailabilityUseCase = updateMenuItemAvailabilityUseCase;
    this.searchMenuItemsUseCase = searchMenuItemsUseCase;
  }

  // POST /api/v1/menu-items
  async create(req, res, next) {
    try {
      const { mockMenuItems, mockCategories, generateId } = require('../data/mockData');
      
      // Validate category exists
      const category = mockCategories.find(cat => cat.id === req.body.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Create new menu item
      const newItem = {
        id: generateId(),
        category_id: req.body.categoryId,
        name: req.body.name,
        description: req.body.description || '',
        price: Number(req.body.price),
        image_url: req.body.imageUrl || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
        available: req.body.available !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };

      // Add to mock data
      mockMenuItems.push(newItem);

      console.log(`✅ Created menu item: ${newItem.name} (ID: ${newItem.id})`);

      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: newItem,
      });
    } catch (error) {
      console.error('❌ Error creating menu item:', error);
      next(error);
    }
  }

  // PUT /api/v1/menu-items/:id
  async update(req, res, next) {
    try {
      const { mockMenuItems, mockCategories } = require('../data/mockData');
      const { id } = req.params;

      // Find item
      const itemIndex = mockMenuItems.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      // Validate category if provided
      if (req.body.categoryId) {
        const category = mockCategories.find(cat => cat.id === req.body.categoryId);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Category not found'
          });
        }
      }

      // Update item
      const updatedItem = {
        ...mockMenuItems[itemIndex],
        name: req.body.name || mockMenuItems[itemIndex].name,
        description: req.body.description !== undefined ? req.body.description : mockMenuItems[itemIndex].description,
        price: req.body.price !== undefined ? Number(req.body.price) : mockMenuItems[itemIndex].price,
        category_id: req.body.categoryId || mockMenuItems[itemIndex].category_id,
        image_url: req.body.imageUrl || mockMenuItems[itemIndex].image_url,
        available: req.body.available !== undefined ? req.body.available : mockMenuItems[itemIndex].available,
        updated_at: new Date().toISOString()
      };

      mockMenuItems[itemIndex] = updatedItem;

      console.log(`✅ Updated menu item: ${updatedItem.name} (ID: ${id})`);

      res.status(200).json({
        success: true,
        message: 'Menu item updated successfully',
        data: updatedItem,
      });
    } catch (error) {
      console.error('❌ Error updating menu item:', error);
      next(error);
    }
  }

  // DELETE /api/v1/menu-items/:id
  async delete(req, res, next) {
    try {
      const { mockMenuItems } = require('../data/mockData');
      const { id } = req.params;

      // Find item
      const itemIndex = mockMenuItems.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      const itemName = mockMenuItems[itemIndex].name;
      
      // Remove from array (soft delete by setting deleted_at)
      mockMenuItems[itemIndex].deleted_at = new Date().toISOString();
      mockMenuItems[itemIndex].available = false;

      console.log(`🗑️ Deleted menu item: ${itemName} (ID: ${id})`);

      res.status(200).json({
        success: true,
        message: 'Menu item deleted successfully',
        data: { menuItemId: id },
      });
    } catch (error) {
      console.error('❌ Error deleting menu item:', error);
      next(error);
    }
  }

  // POST /api/v1/menu-items/:id/image
  async uploadImage(req, res, next) {
    try {
      const { mockMenuItems } = require('../data/mockData');
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // Find item
      const itemIndex = mockMenuItems.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      // For mock, just use a placeholder URL
      const imageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=300&h=200&fit=crop`;
      
      // Update image URL
      mockMenuItems[itemIndex].image_url = imageUrl;
      mockMenuItems[itemIndex].updated_at = new Date().toISOString();

      console.log(`📸 Updated image for menu item: ${mockMenuItems[itemIndex].name}`);

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          menuItemId: id,
          imageUrl: imageUrl,
        },
      });
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      next(error);
    }
  }

  // PATCH /api/v1/menu-items/:id/availability
  async updateAvailability(req, res, next) {
    try {
      const { mockMenuItems } = require('../data/mockData');
      const { id } = req.params;

      // Find item
      const itemIndex = mockMenuItems.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      // Update availability
      mockMenuItems[itemIndex].available = req.body.available;
      mockMenuItems[itemIndex].updated_at = new Date().toISOString();

      const status = req.body.available ? 'available' : 'unavailable';
      console.log(`🔄 Set menu item ${mockMenuItems[itemIndex].name} as ${status}`);

      res.status(200).json({
        success: true,
        message: 'Menu item availability updated successfully',
        data: mockMenuItems[itemIndex],
      });
    } catch (error) {
      console.error('❌ Error updating availability:', error);
      next(error);
    }
  }

  // GET /api/v1/menu-items/search
  async search(req, res, next) {
    try {
      const { mockMenuItems, mockCategories } = require('../data/mockData');
      
      const {
        keyword = '',
        category = '',
        branchId = '',
        page = 1,
        limit = 10
      } = req.query;

      let filteredItems = mockMenuItems.filter(item => 
        !item.deleted_at && // Not deleted
        item.available // Available
      );

      // Filter by branch (through category)
      if (branchId) {
        const branchCategories = mockCategories
          .filter(cat => cat.branch_id === branchId)
          .map(cat => cat.id);
        
        filteredItems = filteredItems.filter(item => 
          branchCategories.includes(item.category_id)
        );
      }

      // Filter by category
      if (category) {
        filteredItems = filteredItems.filter(item => 
          item.category_id === category
        );
      }

      // Filter by keyword
      if (keyword) {
        const searchTerm = keyword.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.name.toLowerCase().includes(searchTerm) ||
          (item.description && item.description.toLowerCase().includes(searchTerm))
        );
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedItems = filteredItems.slice(startIndex, endIndex);

      // Add category info to items
      const itemsWithCategory = paginatedItems.map(item => {
        const category = mockCategories.find(cat => cat.id === item.category_id);
        return {
          ...item,
          category: category ? {
            id: category.id,
            name: category.name
          } : null
        };
      });

      console.log(`🔍 Search results: ${paginatedItems.length} items found`);

      res.status(200).json({
        success: true,
        message: 'Menu items retrieved successfully',
        data: itemsWithCategory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredItems.length,
          totalPages: Math.ceil(filteredItems.length / limit)
        }
      });
    } catch (error) {
      console.error('❌ Error searching menu items:', error);
      next(error);
    }
  }
}

module.exports = { MenuItemController };
