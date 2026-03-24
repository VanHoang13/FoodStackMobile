/**
 * Public API Routes - No Authentication Required
 * For mobile app QR scanning and menu access - Mock Data Only
 */

const express = require('express');
const router = express.Router();

/**
 * @route GET /api/v1/public/tables/:qr_token
 * @desc Get table info by QR token
 * @access Public
 */
async function getTableByQR(req, res) {
  try {
    console.log('🔍 QR Scan request received:', req.params);
    const { qr_token } = req.params;
    
    console.log('📱 Looking for QR token:', qr_token);
    
    // Mock data only - no database calls
    const mockTableData = {
      'qr-token-table-1': {
        table: {
          id: 'table-1',
          name: 'B01',
          capacity: 4,
          status: 'AVAILABLE'
        },
        branch: {
          id: 'branch-1',
          name: 'Chi nhánh Hoàn Kiếm',
          address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
          phone: '0901234567'
        },
        restaurant: {
          id: 'restaurant-1',
          name: 'Nhà Hàng Phố Cổ',
          logo_url: 'https://via.placeholder.com/200x200?text=Pho+Co'
        }
      },
      'qr-token-table-2': {
        table: {
          id: 'table-2',
          name: 'B02',
          capacity: 2,
          status: 'AVAILABLE'
        },
        branch: {
          id: 'branch-1',
          name: 'Chi nhánh Hoàn Kiếm',
          address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
          phone: '0901234567'
        },
        restaurant: {
          id: 'restaurant-1',
          name: 'Nhà Hàng Phố Cổ',
          logo_url: 'https://via.placeholder.com/200x200?text=Pho+Co'
        }
      },
      'qr-token-table-3': {
        table: {
          id: 'table-3',
          name: 'B03',
          capacity: 6,
          status: 'AVAILABLE'
        },
        branch: {
          id: 'branch-1',
          name: 'Chi nhánh Hoàn Kiếm',
          address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
          phone: '0901234567'
        },
        restaurant: {
          id: 'restaurant-1',
          name: 'Nhà Hàng Phố Cổ',
          logo_url: 'https://via.placeholder.com/200x200?text=Pho+Co'
        }
      }
    };

    // Use mock data only
    const mockTable = mockTableData[qr_token];
    if (!mockTable) {
      console.log('❌ Table not found for QR token:', qr_token);
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    console.log('📋 Returning mock table info for:', mockTable.table.name);
    res.json({
      success: true,
      message: 'Table info retrieved (mock data)',
      data: mockTable
    });

  } catch (error) {
    console.error('❌ Get table by QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * @route GET /api/v1/public/branches/:branch_id/menu
 * @desc Get public menu for branch
 * @access Public
 */
async function getPublicMenu(req, res) {
  try {
    console.log('🍽️ Menu request received for branch:', req.params.branch_id);
    const { branch_id } = req.params;

    // Mock menu data
    const mockMenuData = {
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
              image_url: 'https://via.placeholder.com/300x200?text=Pho+Bo+Tai'
            },
            {
              id: 'item-1-2',
              name: 'Phở Bò Chín',
              description: 'Phở bò chín với thịt bò mềm',
              price: 85000,
              image_url: 'https://via.placeholder.com/300x200?text=Pho+Bo+Chin'
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
              image_url: 'https://via.placeholder.com/300x200?text=Com+Ga+Nuong'
            }
          ]
        }
      ]
    };

    console.log('📋 Returning mock menu data');

    res.json({
      success: true,
      message: 'Menu retrieved (mock data)',
      data: mockMenuData
    });

  } catch (error) {
    console.error('❌ Get public menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * @route GET /api/v1/public/menu-items/:item_id/customizations
 * @desc Get customization options for menu item
 * @access Public
 */
async function getItemCustomizations(req, res) {
  try {
    const { item_id } = req.params;

    // Mock customizations data
    const mockCustomizations = {
      customizations: [
        {
          group_id: 'group-1',
          name: 'Độ cay',
          min_select: 1,
          max_select: 1,
          is_required: true,
          options: [
            { id: 'opt-1', name: 'Không cay', price_delta: 0, sort_order: 1 },
            { id: 'opt-2', name: 'Ít cay', price_delta: 0, sort_order: 2 },
            { id: 'opt-3', name: 'Cay vừa', price_delta: 0, sort_order: 3 },
            { id: 'opt-4', name: 'Cay nhiều', price_delta: 0, sort_order: 4 }
          ]
        },
        {
          group_id: 'group-2',
          name: 'Thêm topping',
          min_select: 0,
          max_select: 3,
          is_required: false,
          options: [
            { id: 'opt-5', name: 'Thêm thịt', price_delta: 20000, sort_order: 1 },
            { id: 'opt-6', name: 'Thêm trứng', price_delta: 10000, sort_order: 2 },
            { id: 'opt-7', name: 'Thêm rau', price_delta: 5000, sort_order: 3 }
          ]
        }
      ]
    };

    res.json({
      success: true,
      message: 'Customizations retrieved (mock data)',
      data: mockCustomizations
    });

  } catch (error) {
    console.error('Get item customizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

function createPublicRoutes() {
  router.get('/tables/:qr_token', getTableByQR);
  router.get('/branches/:branch_id/menu', getPublicMenu);
  router.get('/menu-items/:item_id/customizations', getItemCustomizations);

  return router;
}

module.exports = { createPublicRoutes };