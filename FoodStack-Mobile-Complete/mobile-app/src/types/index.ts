// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Table & Restaurant Types
export interface Restaurant {
  id: string;
  name: string;
  logo_url?: string;
}

export interface Branch {
  id: string;
  name: string;
  restaurant_id: string;
  restaurant: Restaurant;
}

export interface Area {
  id: string;
  name: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'OutOfService';
  area?: Area;
}

export interface TableInfo {
  table: Table;
  branch: Branch;
  restaurant: Restaurant;
}

// Menu Types
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  menu_items: MenuItem[];
}

export interface MenuData {
  categories: Category[];
}

// Customization Types
export interface CustomizationOption {
  id: string;
  name: string;
  price_delta: number;
  sort_order: number;
}

export interface CustomizationGroup {
  group_id: string;
  name: string;
  min_select: number;
  max_select: number;
  is_required: boolean;
  options: CustomizationOption[];
}

export interface ItemCustomizations {
  customizations: CustomizationGroup[];
}

// Order Types
export interface OrderItemCustomization {
  option_id: string;
}

export interface OrderItem {
  menu_item_id: string;
  quantity: number;
  notes?: string;
  customizations?: OrderItemCustomization[];
}

export interface OrderSession {
  session_token: string;
  table: Table;
  branch: Branch;
}

export interface Order {
  id: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Paid' | 'Cancelled';
  payment_status: 'Pending' | 'Success' | 'Failed' | 'Refunded';
  sub_total: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  items: OrderItemDetail[];
}

export interface OrderItemDetail {
  id: string;
  name: string;
  quantity: number;
  base_price: number;
  image_url?: string;
  notes?: string;
  customizations: {
    name: string;
    price_delta: number;
  }[];
}

// Cart Types
export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  notes?: string;
  selected_customizations: {
    group_id: string;
    group_name: string;
    options: CustomizationOption[];
  }[];
  total_price: number;
}

// Navigation Types
export type RootStackParamList = {
  // Splash Screen
  Splash: undefined;
  
  // Auth Screens
  Login: undefined;
  UserTypeSelection: undefined;
  Register: {
    userType?: 'customer' | 'partner';
  };
  ForgotPassword: undefined;
  EmailVerification: {
    email: string;
  };
  
  // Test Screen
  APITest: undefined;
  TestMenu: undefined;
  SimpleMenu: undefined;
  QRTest: undefined;
  QRGallery: undefined;
  TestData: undefined;
  MenuManagementTest: undefined;
  
  // Main App Screens
  Home: undefined;
  QRScan: undefined;
  RestaurantList: undefined;
  RestaurantSelection: undefined;
  RestaurantDetail: {
    restaurantId: string;
  };
  Menu: { 
    tableInfo?: TableInfo;
    sessionToken?: string;
    restaurantId?: string;
    branchId?: string;
  };
  FoodDetail: {
    menuItem: MenuItem;
    tableInfo?: TableInfo;
    sessionToken?: string;
    restaurantId?: string;
    branchId?: string;
  };
  Cart: {
    tableInfo?: TableInfo;
    sessionToken?: string;
    restaurantId?: string;
    branchId?: string;
  };
  OrderTracking: {
    orderId: string;
    orderNumber?: string;
  };
  OrderQR: {
    orderId: string;
    orderNumber: string;
    tableInfo?: {
      name: string;
      area: { name: string };
    };
    restaurantName?: string;
  };
  OrderStatus: {
    orderId: string;
    sessionToken?: string;
    tableInfo?: TableInfo;
  };
  Payment: {
    orderId: string;
    sessionToken?: string;
    tableInfo?: TableInfo;
    totalAmount?: number;
  };
  OrderHistory: undefined;
  Profile: undefined;
  Offers: undefined;
  ServiceRequest: {
    tableInfo?: TableInfo;
  };
  Feedback: {
    orderId?: string;
    tableInfo?: TableInfo;
  };
  Reservation: {
    restaurantId?: string;
    branchId?: string;
  };
  
  // Restaurant Management Screens (for partners)
  RestaurantDashboard: undefined;
  MenuManagement: undefined;
  OrderManagement: undefined;
  RestaurantStatistics: undefined;
  RestaurantSettings: undefined;
  KitchenDisplay: undefined;
  ServiceRequests: undefined;
  TableManagement: undefined;
  StaffManagement: undefined;
  AddMenuItem: {
    categoryId: string;
  };
  EditMenuItem: {
    item: any; // Define proper type later
  };
  OrderDetails: {
    order: any; // Define proper type later
  };

  // Staff Screens
  StaffDashboard: undefined;
  StaffTableManagement: undefined;
  StaffProfile: undefined;
  StaffNotification: undefined;
  StaffChat: undefined;
  StaffOrderHistory: undefined;
  StaffInventory: undefined;
  StaffAnalytics: undefined;
  StaffPerformance: undefined;
  StaffTasks: undefined;
  StaffSchedule: undefined;
  StaffTraining: undefined;
  StaffOrderManagement: undefined;
  StaffServiceRequests: undefined;
  StaffWorkflowDebug: undefined;

  // Owner Screens
  OwnerNotification: undefined;
  OwnerChat: undefined;
  OwnerStaffManagement: {
    updatedStaff?: any; // Updated staff data
    newStaff?: any; // New staff data from create screen
  };
  OwnerTableManagement: undefined;
  OwnerBranchManagement: undefined;
  OwnerInventory: undefined;
  OwnerMenuManagement: undefined;
  OwnerStaffDetail: {
    staff: any; // Define proper Staff type later
    updated?: boolean;
  };
  OwnerStaffEdit: {
    staff: any; // Define proper Staff type later
  };
  OwnerStaffCreate: undefined;
  OwnerStaffAnalytics: undefined;

  // Manager Screens
  ManagerDashboard: undefined;
  ManagerStaffManagement: undefined;
  ManagerProfile: undefined;
  ManagerOrderManagement: undefined;
  ManagerTableManagement: undefined;
  ManagerShiftManagement: undefined;
  ManagerReports: undefined;
  ManagerStaffDetail: {
    staff: any; // Define proper Staff type later
  };

  // Customer Advanced Screens
  Notification: undefined;
  Loyalty: undefined;
  PromoCode: undefined;
  Wallet: undefined;
  OrderModification: {
    orderId: string;
    orderNumber: string;
  };

  // Admin Screens
  AdminDashboard: undefined;
  AdminRestaurants: undefined;
  AdminUsers: undefined;
  AdminOrders: undefined;
  AdminReports: undefined;
  AdminApprovals: undefined;
  AdminSettings: undefined;
  Analytics: undefined;
  ReservationManagement: undefined;
  Subscription: undefined;
};

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  userType: 'user' | 'restaurant';
  // Restaurant specific fields
  restaurantName?: string;
  restaurantEmail?: string;
  restaurantAddress?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  restaurantId?: string;
  restaurant?: {
    id: string;
    name: string;
    email_verified: boolean;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}

// Wallet Types
export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  reference_id?: string;
  reference_type?: 'ORDER' | 'TOP_UP' | 'REFUND' | 'BONUS';
  balance_before: number;
  balance_after: number;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  transactions: WalletTransaction[];
  created_at?: string;
  updated_at?: string;
}

// Loyalty Types
export interface LoyaltyTier {
  id: string;
  name: string;
  min_points: number;
  max_points?: number;
  benefits: string[];
  color: string;
  icon: string;
}

export interface LoyaltyProgram {
  id: string;
  user_id: string;
  current_points: number;
  total_earned_points: number;
  current_tier: LoyaltyTier;
  next_tier?: LoyaltyTier;
  points_to_next_tier?: number;
  transactions: LoyaltyTransaction[];
  created_at?: string;
  updated_at?: string;
}

export interface LoyaltyTransaction {
  id: string;
  loyalty_program_id: string;
  type: 'EARN' | 'REDEEM' | 'EXPIRED' | 'BONUS';
  points: number;
  description: string;
  reference_id?: string;
  reference_type?: 'ORDER' | 'REDEMPTION' | 'BONUS' | 'EXPIRED';
  order_amount?: number;
  created_at: string;
  expires_at?: string;
}

// Payment Types
export interface PaymentMethod {
  id: string;
  type: 'WALLET' | 'CASH' | 'CARD' | 'BANK_TRANSFER';
  name: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentRequest {
  order_id: string;
  payment_method: string;
  amount: number;
  wallet_amount?: number;
  cash_amount?: number;
}

export interface PaymentResult {
  id: string;
  order_id: string;
  payment_method: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  qr_code_data?: string;
  created_at: string;
}