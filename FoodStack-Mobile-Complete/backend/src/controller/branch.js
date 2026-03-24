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
      
      // Always use mock data
      const mockMenuData = {
        branch: {
          id: branchId,
          name: 'Chi nhánh Hoàn Kiếm',
          address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
          phone: '0901234567'
        },
        restaurant: {
          id: 'restaurant-1',
          name: 'Nhà Hàng Phố Cổ',
          logo_url: 'https://via.placeholder.com/200x200?text=Pho+Co'
        },
        categories: [
          {
            id: 'cat-1-1',
            name: 'Phở & Bún',
            description: 'Các món phở và bún truyền thống',
            sort_order: 1,
            menu_items: [
              {
                id: 'item-1-1',
                name: 'Phở Bò Tái',
                description: 'Phở bò tái truyền thống với nước dùng đậm đà',
                price: 85000,
                image_url: 'https://via.placeholder.com/300x200?text=Pho+Bo+Tai',
                available: true
              },
              {
                id: 'item-1-2',
                name: 'Phở Bò Chín',
                description: 'Phở bò chín với thịt bò mềm',
                price: 85000,
                image_url: 'https://via.placeholder.com/300x200?text=Pho+Bo+Chin',
                available: true
              },
              {
                id: 'item-1-3',
                name: 'Bún Bò Huế',
                description: 'Bún bò Huế cay nồng đặc trưng',
                price: 75000,
                image_url: 'https://via.placeholder.com/300x200?text=Bun+Bo+Hue',
                available: true
              },
              {
                id: 'item-1-4',
                name: 'Bún Chả Hà Nội',
                description: 'Bún chả Hà Nội truyền thống',
                price: 80000,
                image_url: 'https://via.placeholder.com/300x200?text=Bun+Cha',
                available: true
              }
            ]
          },
          {
            id: 'cat-1-2',
            name: 'Cơm',
            description: 'Các món cơm đặc sản',
            sort_order: 2,
            menu_items: [
              {
                id: 'item-1-5',
                name: 'Cơm Gà Nướng',
                description: 'Cơm gà nướng thơm ngon với nước mắm pha',
                price: 95000,
                image_url: 'https://via.placeholder.com/300x200?text=Com+Ga+Nuong',
                available: true
              },
              {
                id: 'item-1-6',
                name: 'Cơm Sườn Nướng',
                description: 'Cơm sườn nướng BBQ đậm đà',
                price: 105000,
                image_url: 'https://via.placeholder.com/300x200?text=Com+Suon+Nuong',
                available: true
              },
              {
                id: 'item-1-7',
                name: 'Cơm Chiên Dương Châu',
                description: 'Cơm chiên Dương Châu với tôm và xúc xích',
                price: 85000,
                image_url: 'https://via.placeholder.com/300x200?text=Com+Chien',
                available: true
              }
            ]
          },
          {
            id: 'cat-1-3',
            name: 'Đồ uống',
            description: 'Nước uống và trà',
            sort_order: 3,
            menu_items: [
              {
                id: 'item-1-8',
                name: 'Trà Đá',
                description: 'Trà đá truyền thống',
                price: 15000,
                image_url: 'https://via.placeholder.com/300x200?text=Tra+Da',
                available: true
              },
              {
                id: 'item-1-9',
                name: 'Nước Cam Tươi',
                description: 'Nước cam tươi vắt',
                price: 25000,
                image_url: 'https://via.placeholder.com/300x200?text=Nuoc+Cam',
                available: true
              },
              {
                id: 'item-1-10',
                name: 'Cà Phê Sữa Đá',
                description: 'Cà phê sữa đá Việt Nam',
                price: 30000,
                image_url: 'https://via.placeholder.com/300x200?text=Ca+Phe+Sua',
                available: true
              }
            ]
          },
          {
            id: 'cat-1-4',
            name: 'Tráng miệng',
            description: 'Chè và bánh ngọt',
            sort_order: 4,
            menu_items: [
              {
                id: 'item-1-11',
                name: 'Chè Ba Màu',
                description: 'Chè ba màu truyền thống',
                price: 35000,
                image_url: 'https://via.placeholder.com/300x200?text=Che+Ba+Mau',
                available: true
              },
              {
                id: 'item-1-12',
                name: 'Bánh Flan',
                description: 'Bánh flan mềm mịn',
                price: 25000,
                image_url: 'https://via.placeholder.com/300x200?text=Banh+Flan',
                available: true
              }
            ]
          }
        ]
      };

      console.log('📋 Returning mock menu data');
      res.status(200).json({
        success: true,
        message: 'Branch menu retrieved (mock data)',
        data: mockMenuData,
      });
    } catch (err) {
      console.error('❌ Error in getMenu:', err);
      next(err);
    }
  }
}

module.exports = { BranchController };
