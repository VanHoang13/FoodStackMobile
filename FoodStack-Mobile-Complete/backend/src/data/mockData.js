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
  },
  {
    id: 'restaurant-2',
    name: 'Quán Ăn Sài Gòn',
    email: 'saigon@restaurant.com',
    phone: '0907654321',
    address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
    logo_url: 'https://via.placeholder.com/200x200?text=Sai+Gon',
    email_verified: true,
    email_verified_at: new Date('2024-01-15').toISOString(),
    subscription_id: 'sub-2',
    created_at: new Date('2024-01-15').toISOString(),
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
  },
  {
    id: 'branch-2',
    restaurant_id: 'restaurant-1',
    name: 'Chi nhánh Tây Hồ',
    address: '789 Tây Hồ, Hà Nội',
    phone: '0901234568',
    status: 'ACTIVE',
    created_at: new Date('2024-02-01').toISOString(),
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
  },
  {
    id: 'area-2',
    branch_id: 'branch-1',
    name: 'Tầng 2',
    sort_order: 2,
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
  },
  {
    id: 'table-2',
    area_id: 'area-1',
    table_number: 'B02',
    capacity: 2,
    qr_token: 'qr-token-table-2',
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=qr-token-table-2',
    status: 'AVAILABLE',
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'table-3',
    area_id: 'area-2',
    table_number: 'B03',
    capacity: 6,
    qr_token: 'qr-token-table-3',
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=qr-token-table-3',
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
    name: 'Đồ uống',
    description: 'Nước uống và trà',
    sort_order: 3,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'cat-1-4',
    branch_id: 'branch-1',
    name: 'Tráng miệng',
    description: 'Chè và bánh ngọt',
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
    image_url: 'https://via.placeholder.com/300x200?text=Pho+Bo+Tai',
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
    image_url: 'https://via.placeholder.com/300x200?text=Pho+Bo+Chin',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-3',
    category_id: 'cat-1-1',
    name: 'Bún Bò Huế',
    description: 'Bún bò Huế cay nồng đặc trưng',
    price: 75000,
    image_url: 'https://via.placeholder.com/300x200?text=Bun+Bo+Hue',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-4',
    category_id: 'cat-1-1',
    name: 'Bún Chả Hà Nội',
    description: 'Bún chả Hà Nội truyền thống',
    price: 80000,
    image_url: 'https://via.placeholder.com/300x200?text=Bun+Cha',
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
    image_url: 'https://via.placeholder.com/300x200?text=Com+Ga+Nuong',
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
    image_url: 'https://via.placeholder.com/300x200?text=Com+Suon+Nuong',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-7',
    category_id: 'cat-1-2',
    name: 'Cơm Chiên Dương Châu',
    description: 'Cơm chiên Dương Châu với tôm và xúc xích',
    price: 85000,
    image_url: 'https://via.placeholder.com/300x200?text=Com+Chien',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  // Đồ uống
  {
    id: 'item-1-8',
    category_id: 'cat-1-3',
    name: 'Trà Đá',
    description: 'Trà đá truyền thống',
    price: 15000,
    image_url: 'https://via.placeholder.com/300x200?text=Tra+Da',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-9',
    category_id: 'cat-1-3',
    name: 'Nước Cam Tươi',
    description: 'Nước cam tươi vắt',
    price: 25000,
    image_url: 'https://via.placeholder.com/300x200?text=Nuoc+Cam',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-10',
    category_id: 'cat-1-3',
    name: 'Cà Phê Sữa Đá',
    description: 'Cà phê sữa đá Việt Nam',
    price: 30000,
    image_url: 'https://via.placeholder.com/300x200?text=Ca+Phe+Sua',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  // Tráng miệng
  {
    id: 'item-1-11',
    category_id: 'cat-1-4',
    name: 'Chè Ba Màu',
    description: 'Chè ba màu truyền thống',
    price: 35000,
    image_url: 'https://via.placeholder.com/300x200?text=Che+Ba+Mau',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: 'item-1-12',
    category_id: 'cat-1-4',
    name: 'Bánh Flan',
    description: 'Bánh flan mềm mịn',
    price: 25000,
    image_url: 'https://via.placeholder.com/300x200?text=Banh+Flan',
    available: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
];

// Mock Users
const mockUsers = [
  {
    id: 'user-1',
    restaurant_id: 'restaurant-1',
    email: 'manager@phoco.com',
    password_hash: '$2a$12$kD6g1Nj4mxmOh9NFbUotr.QaZWMuoH3hxEurSnHHYMUZrCisSKJzm', // password123
    full_name: 'Nguyễn Văn Manager',
    phone: '0901234567',
    role: 'MANAGER',
    status: 'ACTIVE',
    reset_token: null,
    reset_token_expires_at: null,
    last_login_at: new Date().toISOString(),
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    email_verify_otp: null,
    email_verify_otp_expires_at: null
  },
  {
    id: 'user-2',
    restaurant_id: 'restaurant-1',
    email: 'staff@phoco.com',
    password_hash: '$2a$12$kD6g1Nj4mxmOh9NFbUotr.QaZWMuoH3hxEurSnHHYMUZrCisSKJzm', // password123
    full_name: 'Trần Thị Staff',
    phone: '0907654321',
    role: 'STAFF',
    status: 'ACTIVE',
    reset_token: null,
    reset_token_expires_at: null,
    last_login_at: new Date().toISOString(),
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    email_verify_otp: null,
    email_verify_otp_expires_at: null
  },
  {
    id: 'user-3',
    restaurant_id: 'restaurant-1',
    email: 'customer@mobile.test',
    password_hash: '$2a$12$kD6g1Nj4mxmOh9NFbUotr.QaZWMuoH3hxEurSnHHYMUZrCisSKJzm', // password123
    full_name: 'Customer Mobile Test',
    phone: '0909999999',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    reset_token: null,
    reset_token_expires_at: null,
    last_login_at: new Date().toISOString(),
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    email_verify_otp: null,
    email_verify_otp_expires_at: null
  },
  {
    id: 'user-4',
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
  },
  // Additional Staff Members
  {
    id: 'user-5',
    restaurant_id: 'restaurant-1',
    email: 'chef1@phoco.com',
    password_hash: '$2a$12$kD6g1Nj4mxmOh9NFbUotr.QaZWMuoH3hxEurSnHHYMUZrCisSKJzm', // password123
    full_name: 'Lê Văn Đầu Bếp',
    phone: '0902345678',
    role: 'STAFF',
    status: 'ACTIVE',
    reset_token: null,
    reset_token_expires_at: null,
    last_login_at: new Date().toISOString(),
    created_at: new Date('2024-01-05').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    email_verify_otp: null,
    email_verify_otp_expires_at: null
  },
  {
    id: 'user-6',
    restaurant_id: 'restaurant-1',
    email: 'waiter1@phoco.com',
    password_hash: '$2a$12$kD6g1Nj4mxmOh9NFbUotr.QaZWMuoH3hxEurSnHHYMUZrCisSKJzm', // password123
    full_name: 'Phạm Thị Phục Vụ',
    phone: '0903456789',
    role: 'STAFF',
    status: 'ACTIVE',
    reset_token: null,
    reset_token_expires_at: null,
    last_login_at: new Date().toISOString(),
    created_at: new Date('2024-01-10').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    email_verify_otp: null,
    email_verify_otp_expires_at: null
  },
  {
    id: 'user-7',
    restaurant_id: 'restaurant-1',
    email: 'cashier1@phoco.com',
    password_hash: '$2a$12$kD6g1Nj4mxmOh9NFbUotr.QaZWMuoH3hxEurSnHHYMUZrCisSKJzm', // password123
    full_name: 'Hoàng Văn Thu Ngân',
    phone: '0904567890',
    role: 'STAFF',
    status: 'ACTIVE',
    reset_token: null,
    reset_token_expires_at: null,
    last_login_at: new Date().toISOString(),
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    email_verify_otp: null,
    email_verify_otp_expires_at: null
  },
  {
    id: 'user-8',
    restaurant_id: 'restaurant-1',
    email: 'chef2@phoco.com',
    password_hash: '$2a$12$kD6g1Nj4mxmOh9NFbUotr.QaZWMuoH3hxEurSnHHYMUZrCisSKJzm', // password123
    full_name: 'Vũ Thị Bếp Phó',
    phone: '0905678901',
    role: 'STAFF',
    status: 'INACTIVE',
    reset_token: null,
    reset_token_expires_at: null,
    last_login_at: new Date('2024-01-18').toISOString(),
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    email_verify_otp: null,
    email_verify_otp_expires_at: null
  },
  {
    id: 'user-9',
    restaurant_id: 'restaurant-1',
    email: 'waiter2@phoco.com',
    password_hash: '$2a$12$kD6g1Nj4mxmOh9NFbUotr.QaZWMuoH3hxEurSnHHYMUZrCisSKJzm', // password123
    full_name: 'Đặng Văn Phục Vụ 2',
    phone: '0906789012',
    role: 'STAFF',
    status: 'ACTIVE',
    reset_token: null,
    reset_token_expires_at: null,
    last_login_at: new Date().toISOString(),
    created_at: new Date('2024-02-01').toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    email_verify_otp: null,
    email_verify_otp_expires_at: null
  },
  {
    id: 'user-10',
    restaurant_id: 'restaurant-1',
    email: 'manager2@phoco.com',
    password_hash: '$2a$12$kD6g1Nj4mxmOh9NFbUotr.QaZWMuoH3hxEurSnHHYMUZrCisSKJzm', // password123
    full_name: 'Bùi Thị Quản Lý Ca',
    phone: '0907890123',
    role: 'MANAGER',
    status: 'ACTIVE',
    reset_token: null,
    reset_token_expires_at: null,
    last_login_at: new Date().toISOString(),
    created_at: new Date('2024-02-05').toISOString(),
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