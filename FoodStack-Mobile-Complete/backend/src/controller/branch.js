// src/controller/branch.js
const { CreateBranchSchema } = require('../dto/branch/create-branch');
const { UpdateBranchSchema } = require('../dto/branch/update-branch');
const { ListBranchesSchema } = require('../dto/branch/list-branches');

class BranchController {
  constructor({
    createBranchUseCase,
    updateBranchUseCase,
    listBranchesUseCase,
    deleteBranchUseCase,
    getBranchDetailsUseCase,
    getFullMenuByBranchUseCase
  }) {
    this.createBranchUseCase = createBranchUseCase;
    this.updateBranchUseCase = updateBranchUseCase;
    this.listBranchesUseCase = listBranchesUseCase;
    this.deleteBranchUseCase = deleteBranchUseCase;
    this.getBranchDetailsUseCase = getBranchDetailsUseCase;
    this.getFullMenuByBranchUseCase = getFullMenuByBranchUseCase;
  }

  // POST /api/v1/branches
  async create(req, res, next) {
    try {
      const dto = CreateBranchSchema.parse(req.body);

      const result = await this.createBranchUseCase.execute(dto, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(201).json({
        success: true,
        message: 'Branch created',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/v1/branches/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const dto = UpdateBranchSchema.parse(req.body);

      const result = await this.updateBranchUseCase.execute(id, dto, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: 'Branch updated',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/branches?page=1&limit=10
  async list(req, res, next) {
    try {
      // Get restaurantId from user context instead of query params
      const restaurantId = req.user?.restaurantId;
      
      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with any restaurant'
        });
      }

      const queryParams = {
        restaurantId,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const dto = ListBranchesSchema.parse(queryParams);

      const result = await this.listBranchesUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: 'Branches list',
        data: result.items, // Return items directly, not the whole result
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/v1/branches/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await this.deleteBranchUseCase.execute(id, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/branches/:id
  async getDetails(req, res, next) {
    try {
      const { id } = req.params;

      const result = await this.getBranchDetailsUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Branch details',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/branches/:branchId/menu
  async getMenu(req, res, next) {
    try {
      const { branchId } = req.params;
      
      console.log(`🔍 Getting menu for branch: ${branchId}`);
      
      // Import mock data
      const { mockCategories, mockMenuItems, mockBranches, mockRestaurants } = require('../data/mockData');
      
      // Find branch and restaurant
      const branch = mockBranches.find(b => b.id === branchId);
      const restaurant = branch ? mockRestaurants.find(r => r.id === branch.restaurant_id) : null;
      
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }

      // Get categories for this branch and organize menu items
      const branchCategories = mockCategories
        .filter(cat => cat.branch_id === branchId)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(category => {
          const categoryItems = mockMenuItems
            .filter(item => item.category_id === category.id && item.available)
            .map(item => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              image_url: item.image_url,
              available: item.available
            }));

          return {
            id: category.id,
            name: category.name,
            description: category.description,
            sort_order: category.sort_order,
            menu_items: categoryItems
          };
        });

      const menuData = {
        branch: {
          id: branch.id,
          name: branch.name,
          address: branch.address,
          phone: branch.phone
        },
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          logo_url: restaurant.logo_url
        },
        categories: branchCategories
      };

      console.log(`📋 Returning menu with ${branchCategories.length} categories and ${mockMenuItems.length} total items`);
      
      res.status(200).json({
        success: true,
        message: 'Branch menu retrieved successfully',
        data: menuData,
      });
    } catch (err) {
      console.error('❌ Error in getMenu:', err);
      next(err);
    }
  }
}

module.exports = { BranchController };
