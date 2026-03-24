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