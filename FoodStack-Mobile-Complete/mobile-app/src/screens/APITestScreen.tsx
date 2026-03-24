import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiBaseUrl } from '../services/api-config';
import { storage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const APITestScreen = () => {
  const [message, setMessage] = useState('Ready to test backend connection');
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const API_BASE_URL = getApiBaseUrl();

  const testConnection = async () => {
    try {
      setMessage('Testing connection...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      console.log('🔗 Testing connection to:', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setMessage('✅ Backend connection successful!');
        Alert.alert('Success', `Connected to backend successfully!\n\nURL: ${API_BASE_URL}`);
      } else {
        setMessage('❌ Backend connection failed');
        Alert.alert('Connection Failed', `Failed to connect to backend\n\nURL: ${API_BASE_URL}\nStatus: ${response.status}`);
      }
    } catch (error: any) {
      console.error('❌ Connection error:', error);
      setMessage('❌ Connection error: ' + error.message);
      Alert.alert('Network Error', `Network error: ${error.message}\n\nURL: ${API_BASE_URL}`);
    }
  };

  const testBypassAdmin = async () => {
    try {
      const adminData = {
        accessToken: 'fake-admin-token',
        refreshToken: 'fake-admin-refresh',
        user: {
          id: 'admin-001',
          email: 'admin@mobile.test',
          fullName: 'Mobile Admin',
          role: 'ADMIN'
        }
      };
      
      await storage.setItem('access_token', adminData.accessToken);
      await storage.setItem('refresh_token', adminData.refreshToken);
      await storage.setItem('user_data', JSON.stringify(adminData.user));
      
      Alert.alert('✅ Admin Login', 'Logged in as ADMIN\n\nReal credentials:\n📧 admin@mobile.test\n🔑 123456\n\nTest admin features:\n- User management\n- System settings\n- All restaurants access');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const testBypassOwner = async () => {
    try {
      const ownerData = {
        accessToken: 'fake-owner-token',
        refreshToken: 'fake-owner-refresh',
        user: {
          id: 'owner-001',
          email: 'owner@mobile.test',
          fullName: 'Mobile Restaurant Owner',
          role: 'RESTAURANT_OWNER',
          restaurantId: 'mobile-test-restaurant'
        }
      };
      
      await storage.setItem('access_token', ownerData.accessToken);
      await storage.setItem('refresh_token', ownerData.refreshToken);
      await storage.setItem('user_data', JSON.stringify(ownerData.user));
      
      Alert.alert('✅ Owner Login', 'Logged in as RESTAURANT_OWNER\n\nReal credentials:\n📧 owner@mobile.test\n🔑 123456\n\nTest owner features:\n- Restaurant dashboard\n- Branch management\n- Staff management\n- Analytics');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const testBypassManager = async () => {
    try {
      const managerData = {
        accessToken: 'fake-manager-token',
        refreshToken: 'fake-manager-refresh',
        user: {
          id: 'manager-001',
          email: 'manager@mobile.test',
          fullName: 'Mobile Manager',
          role: 'MANAGER',
          restaurantId: 'mobile-test-restaurant',
          branchId: 'mobile-test-branch'
        }
      };
      
      console.log('🔧 Setting up Manager bypass login...');
      
      // Clear existing auth data first
      await logout();
      
      // Wait a bit for logout to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set manager data
      await storage.setItem('access_token', managerData.accessToken);
      await storage.setItem('refresh_token', managerData.refreshToken);
      await storage.setItem('user_data', JSON.stringify(managerData.user));
      
      console.log('✅ Manager data stored in storage');
      
      Alert.alert(
        '✅ Manager Login Success', 
        'Logged in as MANAGER\n\n📧 manager@mobile.test\n🔑 123456\n\n🎯 Manager Features:\n- Branch management\n- Staff coordination\n- Order processing\n- Performance tracking\n\n🔄 App will reload to Manager Dashboard...', 
        [
          {
            text: 'Go to Manager Dashboard',
            onPress: async () => {
              console.log('🚀 Navigating to Manager Dashboard...');
              
              // Force navigate directly to ManagerDashboard
              navigation.reset({
                index: 0,
                routes: [{ name: 'ManagerDashboard' }],
              });
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Bypass login error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const testBypassStaff = async () => {
    try {
      const staffData = {
        accessToken: 'fake-staff-token',
        refreshToken: 'fake-staff-refresh',
        user: {
          id: 'staff-001',
          email: 'staff@mobile.test',
          fullName: 'Mobile Staff',
          role: 'STAFF',
          restaurantId: 'mobile-test-restaurant',
          branchId: 'mobile-test-branch'
        }
      };
      
      await storage.setItem('access_token', staffData.accessToken);
      await storage.setItem('refresh_token', staffData.refreshToken);
      await storage.setItem('user_data', JSON.stringify(staffData.user));
      
      Alert.alert('✅ Staff Login', 'Logged in as STAFF\n\nReal credentials:\n📧 staff@mobile.test\n🔑 123456\n\nTest staff features:\n- Order processing\n- Table management\n- Customer service\n- Basic operations');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const testBypassCustomer = async () => {
    try {
      const customerData = {
        accessToken: 'fake-customer-token',
        refreshToken: 'fake-customer-refresh',
        user: {
          id: 'customer-001',
          email: 'customer@mobile.test',
          fullName: 'Mobile Customer',
          role: 'CUSTOMER'
        }
      };
      
      await storage.setItem('access_token', customerData.accessToken);
      await storage.setItem('refresh_token', customerData.refreshToken);
      await storage.setItem('user_data', JSON.stringify(customerData.user));
      
      Alert.alert('✅ Customer Login', 'Logged in as CUSTOMER\n\nReal credentials:\n📧 customer@mobile.test\n🔑 123456\n\nTest customer features:\n- QR scanning: mobile-test-qr-123\n- Menu browsing\n- Order placement\n- Order history');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <Text style={styles.title}>FoodStack API Test</Text>
        <Text style={styles.subtitle}>Backend: {API_BASE_URL}</Text>
        
        {/* MANAGER ACCESS - TOP PRIORITY */}
        <View style={styles.managerSection}>
          <Text style={styles.managerSectionTitle}>🎯 MANAGER ACCESS</Text>
          <TouchableOpacity
            style={styles.quickManagerAccess}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'ManagerDashboard' }],
              });
            }}
          >
            <LinearGradient
              colors={['#3498DB', '#2980B9']}
              style={styles.quickManagerGradient}
            >
              <Text style={styles.quickManagerIcon}>👨‍💼</Text>
              <Text style={styles.quickManagerTitle}>MANAGER DASHBOARD</Text>
              <Text style={styles.quickManagerSubtitle}>Truy cập ngay lập tức</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusMessage}>{message}</Text>
        </View>

        {/* Current User Debug */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>🔍 Current User Debug:</Text>
          <Text style={styles.debugText}>
            Email: {user?.email || 'Not logged in'}{'\n'}
            Name: {user?.fullName || 'N/A'}{'\n'}
            Role: {user?.role || 'N/A'}{'\n'}
            ID: {user?.id || 'N/A'}
          </Text>
          {user?.role && user.role !== 'MANAGER' && (
            <Text style={styles.debugWarning}>
              ⚠️ Current role is "{user.role}", not "MANAGER"
            </Text>
          )}
          {user?.role === 'MANAGER' && (
            <Text style={styles.debugSuccess}>
              ✅ Role is MANAGER - should redirect to ManagerDashboard
            </Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.button} onPress={testConnection}>
          <Text style={styles.buttonText}>Test Backend Connection</Text>
        </TouchableOpacity>
        
        <View style={styles.roleSection}>
          <Text style={styles.roleSectionTitle}>🎭 Test Different Roles:</Text>
          
          <TouchableOpacity style={[styles.roleButton, styles.adminRole]} onPress={testBypassAdmin}>
            <Text style={styles.roleButtonText}>👑 Login as ADMIN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.directAdminRole]} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'AdminDashboard' }],
            });
          }}>
            <Text style={styles.roleButtonText}>🎯 Direct Admin Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.ownerRole]} onPress={testBypassOwner}>
            <Text style={styles.roleButtonText}>🏪 Login as OWNER</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.directOwnerRole]} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'RestaurantDashboard' }],
            });
          }}>
            <Text style={styles.roleButtonText}>🎯 Direct Owner Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.managerRole]} onPress={testBypassManager}>
            <Text style={styles.roleButtonText}>👨‍💼 Login as MANAGER</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.directManagerRole]} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'ManagerDashboard' }],
            });
          }}>
            <Text style={styles.roleButtonText}>🎯 Direct Manager Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.staffRole]} onPress={testBypassStaff}>
            <Text style={styles.roleButtonText}>👥 Login as STAFF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.directStaffRole]} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'StaffDashboard' }],
            });
          }}>
            <Text style={styles.roleButtonText}>🎯 Direct Staff Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.customerRole]} onPress={testBypassCustomer}>
            <Text style={styles.roleButtonText}>👤 Login as CUSTOMER</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.directCustomerRole]} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }}>
            <Text style={styles.roleButtonText}>🎯 Direct Customer Home</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Instructions:</Text>
          <Text style={styles.infoText}>
            🎯 DIRECT ACCESS (Recommended):{'\n'}
            • Click "🎯 Direct [Role] Dashboard" buttons{'\n'}
            • Instantly access any role without authentication{'\n'}
            • Perfect for testing and development{'\n'}
            {'\n'}
            🔐 BYPASS LOGIN (With Auth):{'\n'}
            • Click "Login as [ROLE]" buttons{'\n'}
            • Sets up mock authentication{'\n'}
            • May require app reload{'\n'}
            {'\n'}
            🌐 REAL LOGIN:{'\n'}
            • Test backend connection first{'\n'}
            • Use real credentials if backend is running
          </Text>
        </View>
        
        <View style={styles.realLoginSection}>
          <Text style={styles.realLoginTitle}>🔐 Manager System Test:</Text>
          
          <TouchableOpacity style={[styles.button, styles.managerTestButton]} onPress={testBypassManager}>
            <Text style={styles.buttonText}>🚀 Test Manager Dashboard</Text>
          </TouchableOpacity>
          
          <Text style={styles.realLoginNote}>
            Click above to login as Manager and test:{'\n'}
            • Manager Dashboard (Blue theme){'\n'}
            • Branch-specific management{'\n'}
            • Staff management for branch{'\n'}
            • Order management{'\n'}
            📧 manager@mobile.test | 🔑 123456
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  roleSection: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
  },
  roleSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 6,
  },
  roleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adminRole: {
    backgroundColor: '#DC3545',
  },
  directAdminRole: {
    backgroundColor: '#A71E2A',
  },
  ownerRole: {
    backgroundColor: '#6F42C1',
  },
  directOwnerRole: {
    backgroundColor: '#5A2D91',
  },
  managerRole: {
    backgroundColor: '#FD7E14',
  },
  directManagerRole: {
    backgroundColor: '#3498DB',
  },
  staffRole: {
    backgroundColor: '#20C997',
  },
  directStaffRole: {
    backgroundColor: '#17A085',
  },
  customerRole: {
    backgroundColor: '#0D6EFD',
  },
  directCustomerRole: {
    backgroundColor: '#0B5ED7',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  realLoginSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  realLoginTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  managerTestButton: {
    backgroundColor: '#3498DB',
  },
  realLoginNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },
  debugContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  debugWarning: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 8,
    fontWeight: '600',
  },
  debugSuccess: {
    fontSize: 12,
    color: '#27ae60',
    marginTop: 8,
    fontWeight: '600',
  },

  // Quick Manager Access
  quickManagerAccess: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  quickManagerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  quickManagerIcon: {
    fontSize: 24,
    marginBottom: 6,
  },

  quickManagerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },

  quickManagerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },

  // Manager Section
  managerSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#3498DB',
  },

  managerSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default APITestScreen;