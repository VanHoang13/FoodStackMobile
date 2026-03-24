import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UserTypeSelectionScreen from '../screens/UserTypeSelectionScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import HomeScreen from '../screens/HomeScreen';
import CustomerDashboardScreen from '../screens/CustomerDashboardScreen';
import QRTestScreen from '../screens/QRTestScreen';
import QRGalleryScreen from '../screens/QRGalleryScreen';
import TestMenuScreen from '../screens/TestMenuScreen';
import SimpleMenuScreen from '../screens/SimpleMenuScreen';
import QRScanScreen from '../screens/QRScanScreen';
import RestaurantListScreen from '../screens/RestaurantListScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import RestaurantSelectionScreen from '../screens/RestaurantSelectionScreen';
import MenuScreen from '../screens/MenuScreen';
import FoodDetailScreen from '../screens/FoodDetailScreen';
import CartScreen from '../screens/CartScreen';
import OrderStatusScreen from '../screens/OrderStatusScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OffersScreen from '../screens/OffersScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderQRScreen from '../screens/OrderQRScreen';
import ServiceRequestScreen from '../screens/ServiceRequestScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import KitchenDisplayScreen from '../screens/KitchenDisplayScreen';
import ReservationScreen from '../screens/ReservationScreen';
import ServiceRequestsScreen from '../screens/ServiceRequestsScreen';
import RestaurantDashboardScreen from '../screens/RestaurantDashboardScreen';
import MenuManagementScreen from '../screens/MenuManagementScreen';
import OrderManagementScreen from '../screens/OrderManagementScreen';
import RestaurantStatisticsScreen from '../screens/RestaurantStatisticsScreen';
import RestaurantSettingsScreen from '../screens/RestaurantSettingsScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminRestaurantsScreen from '../screens/AdminRestaurantsScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminOrdersScreen from '../screens/AdminOrdersScreen';
import AdminReportsScreen from '../screens/AdminReportsScreen';
import AdminApprovalsScreen from '../screens/AdminApprovalsScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';
import WalletScreen from '../screens/WalletScreen';
import LoyaltyScreen from '../screens/LoyaltyScreen';
import TestDataScreen from '../screens/TestDataScreen';
import APITestScreen from '../screens/APITestScreen';
import AddMenuItemScreen from '../screens/AddMenuItemScreen';
import EditMenuItemScreen from '../screens/EditMenuItemScreen';
import StaffDashboardScreen from '../screens/StaffDashboardScreen';
import StaffTableManagementScreen from '../screens/StaffTableManagementScreen';
import StaffProfileScreen from '../screens/StaffProfileScreen';
import StaffNotificationScreen from '../screens/StaffNotificationScreen';
import StaffChatScreen from '../screens/StaffChatScreen';
import StaffOrderHistoryScreen from '../screens/StaffOrderHistoryScreen';
import StaffInventoryScreen from '../screens/StaffInventoryScreen';
import StaffAnalyticsScreen from '../screens/StaffAnalyticsScreen';
import StaffPerformanceScreen from '../screens/StaffPerformanceScreen';
import StaffTasksScreen from '../screens/StaffTasksScreen';
import StaffScheduleScreen from '../screens/StaffScheduleScreen';
import StaffTrainingScreen from '../screens/StaffTrainingScreen';
import StaffOrderManagementScreen from '../screens/StaffOrderManagementScreen';
import StaffServiceRequestsScreen from '../screens/StaffServiceRequestsScreen';
import StaffWorkflowDebugScreen from '../screens/StaffWorkflowDebugScreen';
import OwnerNotificationScreen from '../screens/OwnerNotificationScreen';
import OwnerChatScreen from '../screens/OwnerChatScreen';
import OwnerStaffManagementScreen from '../screens/OwnerStaffManagementScreen';
import OwnerStaffAnalyticsScreen from '../screens/OwnerStaffAnalyticsScreen';
import OwnerTableManagementScreen from '../screens/OwnerTableManagementScreen';
import OwnerInventoryScreen from '../screens/OwnerInventoryScreen';
import OwnerMenuManagementScreen from '../screens/OwnerMenuManagementScreen';
import OwnerBranchManagementScreen from '../screens/OwnerBranchManagementScreen';
import OwnerStaffDetailScreen from '../screens/OwnerStaffDetailScreen';
import OwnerStaffEditScreen from '../screens/OwnerStaffEditScreen';
import OwnerStaffCreateScreen from '../screens/OwnerStaffCreateScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';
import ManagerStaffManagementScreen from '../screens/ManagerStaffManagementScreen';
import ManagerProfileScreen from '../screens/ManagerProfileScreen';
import ManagerStaffDetailScreen from '../screens/ManagerStaffDetailScreen';
import ManagerOrderManagementScreen from '../screens/ManagerOrderManagementScreen';
import ManagerTableManagementScreen from '../screens/ManagerTableManagementScreen';
import ManagerShiftManagementScreen from '../screens/ManagerShiftManagementScreen';
import ManagerReportsScreen from '../screens/ManagerReportsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import PromoCodeScreen from '../screens/PromoCodeScreen';
import OrderModificationScreen from '../screens/OrderModificationScreen';
import MenuManagementTestScreen from '../screens/MenuManagementTestScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3b82f6',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Splash Screen */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Đăng nhập',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="UserTypeSelection"
          component={UserTypeSelectionScreen}
          options={{
            title: 'Chọn loại tài khoản',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Đăng ký',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            title: 'Quên mật khẩu',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EmailVerification"
          component={EmailVerificationScreen}
          options={{
            title: 'Xác thực email',
            headerShown: false,
          }}
        />

        {/* Main App Screens */}
        <Stack.Screen
          name="APITest"
          component={APITestScreen}
          options={{
            title: 'API Test',
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'FoodStack',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CustomerDashboard"
          component={CustomerDashboardScreen}
          options={{
            title: 'Dashboard',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="QRTest"
          component={QRTestScreen}
          options={{
            title: 'QR Test',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="QRGallery"
          component={QRGalleryScreen}
          options={{
            title: 'Thư viện QR Code',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TestMenu"
          component={TestMenuScreen}
          options={{
            title: 'Test Menu',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SimpleMenu"
          component={SimpleMenuScreen}
          options={{
            title: 'Simple Menu',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TestData"
          component={TestDataScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MenuManagementTest"
          component={MenuManagementTestScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Wallet"
          component={WalletScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Loyalty"
          component={LoyaltyScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="QRScan"
          component={QRScanScreen}
          options={{
            title: 'Quét mã QR',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="RestaurantList"
          component={RestaurantListScreen}
          options={{
            title: 'Nhà hàng',
          }}
        />
        <Stack.Screen
          name="RestaurantDetail"
          component={RestaurantDetailScreen}
          options={{
            title: 'Chi tiết nhà hàng',
          }}
        />
        <Stack.Screen
          name="RestaurantSelection"
          component={RestaurantSelectionScreen}
          options={{
            title: 'Chọn nhà hàng',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{
            title: 'Menu',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="FoodDetail"
          component={FoodDetailScreen}
          options={{
            title: 'Chi tiết món ăn',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{
            title: 'Giỏ hàng',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OrderTracking"
          component={OrderTrackingScreen}
          options={{
            title: 'Theo dõi đơn hàng',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OrderQR"
          component={OrderQRScreen}
          options={{
            title: 'QR Code Đơn Hàng',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ServiceRequest"
          component={ServiceRequestScreen}
          options={{
            title: 'Yêu cầu dịch vụ',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{
            title: 'Thanh toán',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Feedback"
          component={FeedbackScreen}
          options={{
            title: 'Đánh giá',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Reservation"
          component={ReservationScreen}
          options={{
            title: 'Đặt bàn',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OrderStatus"
          component={OrderStatusScreen}
          options={{
            title: 'Trạng thái đơn hàng',
          }}
        />
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistoryScreen}
          options={{
            title: 'Lịch sử đơn hàng',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Hồ sơ',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Offers"
          component={OffersScreen}
          options={{
            title: 'Special Offers',
            headerShown: false,
          }}
        />

        {/* Restaurant Management Screens */}
        <Stack.Screen
          name="RestaurantDashboard"
          component={RestaurantDashboardScreen}
          options={{
            title: 'Dashboard',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MenuManagement"
          component={MenuManagementScreen}
          options={{
            title: 'Quản lý Menu',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OrderManagement"
          component={OrderManagementScreen}
          options={{
            title: 'Quản lý đơn hàng',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="RestaurantStatistics"
          component={RestaurantStatisticsScreen}
          options={{
            title: 'Thống kê',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="RestaurantSettings"
          component={RestaurantSettingsScreen}
          options={{
            title: 'Cài đặt',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="KitchenDisplay"
          component={KitchenDisplayScreen}
          options={{
            title: 'Màn hình bếp',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ServiceRequests"
          component={ServiceRequestsScreen}
          options={{
            title: 'Yêu cầu dịch vụ',
            headerShown: false,
          }}
        />

        {/* Admin Screens */}
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{
            title: 'Admin Dashboard',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminRestaurants"
          component={AdminRestaurantsScreen}
          options={{
            title: 'Quản lý nhà hàng',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminUsers"
          component={AdminUsersScreen}
          options={{
            title: 'Quản lý người dùng',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminOrders"
          component={AdminOrdersScreen}
          options={{
            title: 'Quản lý đơn hàng',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminReports"
          component={AdminReportsScreen}
          options={{
            title: 'Báo cáo',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminApprovals"
          component={AdminApprovalsScreen}
          options={{
            title: 'Phê duyệt',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminSettings"
          component={AdminSettingsScreen}
          options={{
            title: 'Cài đặt',
            headerShown: false,
          }}
        />
        
        {/* Menu Management Screens */}
        <Stack.Screen
          name="AddMenuItem"
          component={AddMenuItemScreen}
          options={{
            title: 'Thêm món ăn',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditMenuItem"
          component={EditMenuItemScreen}
          options={{
            title: 'Chỉnh sửa món ăn',
            headerShown: false,
          }}
        />
        
        {/* Staff Screens */}
        <Stack.Screen
          name="StaffDashboard"
          component={StaffDashboardScreen}
          options={{
            title: 'Staff Dashboard',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffTableManagement"
          component={StaffTableManagementScreen}
          options={{
            title: 'Quản lý bàn',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffProfile"
          component={StaffProfileScreen}
          options={{
            title: 'Thông tin cá nhân',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffNotification"
          component={StaffNotificationScreen}
          options={{
            title: 'Thông báo',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffChat"
          component={StaffChatScreen}
          options={{
            title: 'Chat nhân viên',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffOrderHistory"
          component={StaffOrderHistoryScreen}
          options={{
            title: 'Lịch sử đơn hàng',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffInventory"
          component={StaffInventoryScreen}
          options={{
            title: 'Quản lý kho',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffAnalytics"
          component={StaffAnalyticsScreen}
          options={{
            title: 'Phân tích hiệu suất',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffPerformance"
          component={StaffPerformanceScreen}
          options={{
            title: 'Hiệu suất cá nhân',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffTasks"
          component={StaffTasksScreen}
          options={{
            title: 'Công việc',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffSchedule"
          component={StaffScheduleScreen}
          options={{
            title: 'Lịch làm việc',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffTraining"
          component={StaffTrainingScreen}
          options={{
            title: 'Đào tạo & Phát triển',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffOrderManagement"
          component={StaffOrderManagementScreen}
          options={{
            title: 'Quản lý đơn hàng',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffServiceRequests"
          component={StaffServiceRequestsScreen}
          options={{
            title: 'Yêu cầu dịch vụ',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StaffWorkflowDebug"
          component={StaffWorkflowDebugScreen}
          options={{
            title: 'Staff Workflow Debug',
            headerShown: false,
          }}
        />
        
        {/* Owner Screens */}
        <Stack.Screen
          name="OwnerNotification"
          component={OwnerNotificationScreen}
          options={{
            title: 'Thông báo',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OwnerChat"
          component={OwnerChatScreen}
          options={{
            title: 'Chat Nhân viên',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OwnerStaffManagement"
          component={OwnerStaffManagementScreen}
          options={{
            title: 'Quản lý Nhân viên',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OwnerStaffAnalytics"
          component={OwnerStaffAnalyticsScreen}
          options={{
            title: 'Phân tích Nhân viên',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OwnerTableManagement"
          component={OwnerTableManagementScreen}
          options={{
            title: 'Quản lý Bàn',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OwnerBranchManagement"
          component={OwnerBranchManagementScreen}
          options={{
            title: 'Quản lý Chi nhánh',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OwnerInventory"
          component={OwnerInventoryScreen}
          options={{
            title: 'Quản lý Kho',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OwnerMenuManagement"
          component={OwnerMenuManagementScreen}
          options={{
            title: 'Quản lý Menu',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OwnerStaffDetail"
          component={OwnerStaffDetailScreen}
          options={{
            title: 'Chi tiết Nhân viên',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OwnerStaffEdit"
          component={OwnerStaffEditScreen}
          options={{
            title: 'Chỉnh sửa Nhân viên',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OwnerStaffCreate"
          component={OwnerStaffCreateScreen}
          options={{
            title: 'Thêm Nhân viên',
            headerShown: false,
          }}
        />
        
        {/* Manager Screens */}
        <Stack.Screen
          name="ManagerDashboard"
          component={ManagerDashboardScreen}
          options={{
            title: 'Manager Dashboard',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManagerStaffManagement"
          component={ManagerStaffManagementScreen}
          options={{
            title: 'Quản lý Nhân viên',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManagerProfile"
          component={ManagerProfileScreen}
          options={{
            title: 'Hồ sơ Manager',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManagerStaffDetail"
          component={ManagerStaffDetailScreen}
          options={{
            title: 'Chi tiết Nhân viên',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManagerOrderManagement"
          component={ManagerOrderManagementScreen}
          options={{
            title: 'Quản lý Đơn hàng',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManagerTableManagement"
          component={ManagerTableManagementScreen}
          options={{
            title: 'Quản lý Bàn',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManagerShiftManagement"
          component={ManagerShiftManagementScreen}
          options={{
            title: 'Quản lý Ca làm',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManagerReports"
          component={ManagerReportsScreen}
          options={{
            title: 'Báo cáo Chi nhánh',
            headerShown: false,
          }}
        />
        
        {/* Customer Advanced Screens */}
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
          options={{
            title: 'Thông báo',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PromoCode"
          component={PromoCodeScreen}
          options={{
            title: 'Mã giảm giá',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OrderModification"
          component={OrderModificationScreen}
          options={{
            title: 'Chỉnh sửa đơn hàng',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;