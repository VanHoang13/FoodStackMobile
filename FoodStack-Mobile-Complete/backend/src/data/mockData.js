// Mock Data for FoodStack Backend
// This file contains all mock data used instead of database

const { v4: uuidv4 } = require('uuid');

// Mock Restaurants
const mockRestaurants = [
  {
    id: 'restaurant-1',
    name: 'Nhà Hàng Phố Cổ',
    email: 'phoco@restaurant.com',
    phone: '0901234567',
    address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
    logo_url: 'https://via.placeholder.com/200x200?text=Pho+Co',
    email_verified: true,
    email_verified_at: new Date('2024-01-01').toISOString(),
    subscription_id: 'sub-1',
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
];

// Mock Branches
const mockBranches = [
  {
    id: 'branch-1',
    restaurant_id: 'restaurant-1',
    name: 'Chi nhánh Hoàn Kiếm',
    address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
    phone: '0901234567',
    status: 'ACTIVE',
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
];

// Mock Areas
const mockAreas = [
  {
    id: 'area-1',
    branch_id: 'branch-1',
    name: 'Tầng 1',
    sort_order: 1,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
];

// Mock Tables
const mockTables = [
  {
    id: 'table-1',
    area_id: 'area-1',
    table_number: 'B01',
    capacity: 4,
    qr_token: 'qr-token-table-1',
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=qr-token-table-1',
    status: 'AVAILABLE',
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
];

// Mock Categories
const mockCategories = [
  {
    id: 'cat-1-1',
    branch_id: 'branch-1',
    name: 'Phở & Bún',
    description: 'Các món phở và bún truyền thống',
    sort_order: 1,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'cat-1-2',
    branch_id: 'branch-1',
    name: 'Cơm',
    description: 'Các món cơm đặc sản',
    sort_order: 2,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'cat-1-3',
    branch_id: 'branch-1',
    name: 'Đồ Uống',
    description: 'Nước uống và đồ uống giải khát',
    sort_order: 3,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'cat-1-4',
    branch_id: 'branch-1',
    name: 'Tráng Miệng',
    description: 'Các món tráng miệng ngọt ngào',
    sort_order: 4,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
];

// Mock Menu Items
const mockMenuItems = [
  // Phở & Bún
  {
    id: 'item-1-1',
    category_id: 'cat-1-1',
    name: 'Phở Bò Tái',
    description: 'Phở bò tái truyền thống với nước dùng đậm đà',
    price: 85000,
    image_url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-2',
    category_id: 'cat-1-1',
    name: 'Phở Bò Chín',
    description: 'Phở bò chín với thịt bò mềm',
    price: 85000,
    image_url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-3',
    category_id: 'cat-1-1',
    name: 'Bún Bò Huế',
    description: 'Bún bò Huế cay nồng đặc trưng miền Trung',
    price: 75000,
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-4',
    category_id: 'cat-1-1',
    name: 'Bún Chả',
    description: 'Bún chả Hà Nội với thịt nướng thơm lừng',
    price: 70000,
    image_url: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  
  // Cơm
  {
    id: 'item-1-5',
    category_id: 'cat-1-2',
    name: 'Cơm Gà Nướng',
    description: 'Cơm gà nướng thơm ngon với nước mắm pha',
    price: 95000,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-6',
    category_id: 'cat-1-2',
    name: 'Cơm Sườn Nướng',
    description: 'Cơm sườn nướng BBQ đậm đà',
    price: 105000,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-7',
    category_id: 'cat-1-2',
    name: 'Cơm Tấm Bì Chả',
    description: 'Cơm tấm truyền thống với bì chả thịt nướng',
    price: 80000,
    image_url: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-8',
    category_id: 'cat-1-2',
    name: 'Cơm Chiên Dương Châu',
    description: 'Cơm chiên Dương Châu với tôm, xúc xích',
    price: 85000,
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },

  // Đồ Uống
  {
    id: 'item-1-9',
    category_id: 'cat-1-3',
    name: 'Trà Đá',
    description: 'Trà đá truyền thống mát lạnh',
    price: 15000,
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-10',
    category_id: 'cat-1-3',
    name: 'Nước Cam Tươi',
    description: 'Nước cam tươi vắt 100% tự nhiên',
    price: 35000,
    image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-11',
    category_id: 'cat-1-3',
    name: 'Cà Phê Sữa Đá',
    description: 'Cà phê sữa đá đậm đà kiểu Việt Nam',
    price: 25000,
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-12',
    category_id: 'cat-1-3',
    name: 'Sinh Tố Bơ',
    description: 'Sinh tố bơ béo ngậy với sữa đặc',
    price: 40000,
    image_url: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },

  // Tráng Miệng
  {
    id: 'item-1-13',
    category_id: 'cat-1-4',
    name: 'Chè Ba Màu',
    description: 'Chè ba màu truyền thống với đậu xanh, đậu đỏ',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-14',
    category_id: 'cat-1-4',
    name: 'Bánh Flan',
    description: 'Bánh flan mềm mịn với caramel đắng',
    price: 25000,
    image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-15',
    category_id: 'cat-1-4',
    name: 'Kem Xôi',
    description: 'Kem xôi dẻo với nhiều vị thơm ngon',
    price: 20000,
    image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
];

// Mock Users
const mockUsers = [
  {
    id: 'user-4', // Using user-4 as it's the OWNER role, which is essential for our flow
    restaurant_id: 'restaurant-1',
    email: 'owner@foodstack.test',
    password_hash: '$2a$12$kD6g1Nj4mxmOh9NFbUotr.QaZWMuoH3hxEurSnHHYMUZrCisSKJzm', // password123
    full_name: 'Restaurant Owner',
    phone: '0901111111',
    role: 'OWNER',
    status: 'ACTIVE',
    reset_token: null,
    reset_token_expires_at: null,
    last_login_at: new Date().toISOString(),
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    email_verify_otp: null,
    email_verify_otp_expires_at: null
  }
];

// Mock Orders (will be populated dynamically)
let mockOrders = [];

// Mock Order Items (will be populated dynamically)
let mockOrderItems = [];

// Mock Payments (will be populated dynamically)
let mockPayments = [];

// Helper functions
const generateOrderNumber = () => {
  return `ORD${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
};

const generateId = () => {
  return uuidv4();
};

module.exports = {
  mockRestaurants,
  mockBranches,
  mockAreas,
  mockTables,
  mockCategories,
  mockMenuItems,
  mockUsers,
  mockOrders,
  mockOrderItems,
  mockPayments,
  generateOrderNumber,
  generateId
};