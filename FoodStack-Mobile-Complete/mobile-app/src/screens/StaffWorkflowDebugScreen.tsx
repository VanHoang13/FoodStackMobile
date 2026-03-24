import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import ServiceRequestService from '../services/serviceRequestService';
import StaffOrderService from '../services/staffOrderService';
import OrderIntegrationService from '../services/orderIntegrationService';

type StaffWorkflowDebugScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffWorkflowDebug'>;

interface Props {
  navigation: StaffWorkflowDebugScreenNavigationProp;
}

const StaffWorkflowDebugScreen: React.FC<Props> = ({ navigation }) => {
  const [serviceRequestsCount, setServiceRequestsCount] = useState(0);
  const [staffOrdersCount, setStaffOrdersCount] = useState(0);
  const [customerOrdersCount, setCustomerOrdersCount] = useState(0);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const serviceRequests = await ServiceRequestService.getServiceRequests();
      const staffOrders = await StaffOrderService.getOrders();
      const customerOrders = await OrderIntegrationService.getCustomerOrders();
      
      setServiceRequestsCount(serviceRequests.length);
      setStaffOrdersCount(staffOrders.length);
      setCustomerOrdersCount(customerOrders.length);
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      'Xóa tất cả dữ liệu',
      'Bạn có chắc muốn xóa tất cả dữ liệu workflow? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'foodstack_service_requests',
                'foodstack_staff_orders',
                'foodstack_customer_orders'
              ]);
              
              Alert.alert('Thành công', 'Đã xóa tất cả dữ liệu workflow');
              loadCounts();
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Lỗi', 'Không thể xóa dữ liệu');
            }
          }
        }
      ]
    );
  };

  const initializeMockData = async () => {
    try {
      await ServiceRequestService.initializeMockData();
      await StaffOrderService.initializeMockData();
      
      Alert.alert('Thành công', 'Đã khởi tạo dữ liệu mẫu');
      loadCounts();
    } catch (error) {
      console.error('Error initializing mock data:', error);
      Alert.alert('Lỗi', 'Không thể khởi tạo dữ liệu mẫu');
    }
  };

  const createTestServiceRequest = async () => {
    try {
      await ServiceRequestService.createServiceRequest({
        table: 'TEST-01',
        customerName: 'Test Customer',
        type: 'WATER',
        priority: 'NORMAL',
        message: 'Test service request from debug screen',
        customerPhone: '0901234567'
      });
      
      Alert.alert('Thành công', 'Đã tạo yêu cầu dịch vụ test');
      loadCounts();
    } catch (error) {
      console.error('Error creating test service request:', error);
      Alert.alert('Lỗi', 'Không thể tạo yêu cầu dịch vụ test');
    }
  };

  const createTestOrder = async () => {
    try {
      const testCartItems = [
        {
          menuItem: { id: '1', name: 'Phở Bò', price: 85000 },
          quantity: 1,
          notes: 'Test order from debug'
        }
      ];

      const testOrderData = {
        customerName: 'Test Customer',
        table: 'TEST-01',
        totalAmount: 85000,
        customerPhone: '0901234567'
      };

      await OrderIntegrationService.createStaffOrderFromCart(testCartItems, testOrderData);
      
      Alert.alert('Thành công', 'Đã tạo đơn hàng test');
      loadCounts();
    } catch (error) {
      console.error('Error creating test order:', error);
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng test');
    }
  };

  const viewStorageData = async () => {
    try {
      const serviceRequests = await ServiceRequestService.getServiceRequests();
      const staffOrders = await StaffOrderService.getOrders();
      
      console.log('=== SERVICE REQUESTS ===');
      console.log(JSON.stringify(serviceRequests, null, 2));
      console.log('=== STAFF ORDERS ===');
      console.log(JSON.stringify(staffOrders, null, 2));
      
      Alert.alert('Debug Info', 'Dữ liệu đã được in ra console. Mở React Native Debugger để xem.');
    } catch (error) {
      console.error('Error viewing storage data:', error);
      Alert.alert('Lỗi', 'Không thể xem dữ liệu');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="back" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Workflow Debug</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Data Counts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dữ liệu hiện tại</Text>
          
          <View style={styles.countCard}>
            <Text style={styles.countLabel}>Service Requests</Text>
            <Text style={styles.countValue}>{serviceRequestsCount}</Text>
          </View>
          
          <View style={styles.countCard}>
            <Text style={styles.countLabel}>Staff Orders</Text>
            <Text style={styles.countValue}>{staffOrdersCount}</Text>
          </View>
          
          <View style={styles.countCard}>
            <Text style={styles.countLabel}>Customer Orders</Text>
            <Text style={styles.countValue}>{customerOrdersCount}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hành động</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={loadCounts}>
            <Icon name="refresh-cw" size={20} color="#3498DB" />
            <Text style={styles.actionButtonText}>Refresh Counts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={viewStorageData}>
            <Icon name="eye" size={20} color="#9B59B6" />
            <Text style={styles.actionButtonText}>View Storage Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={createTestServiceRequest}>
            <Icon name="bell" size={20} color="#2ECC71" />
            <Text style={styles.actionButtonText}>Create Test Service Request</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={createTestOrder}>
            <Icon name="shopping-bag" size={20} color="#F39C12" />
            <Text style={styles.actionButtonText}>Create Test Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={initializeMockData}>
            <Icon name="database" size={20} color="#34495E" />
            <Text style={styles.actionButtonText}>Initialize Mock Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={clearAllData}>
            <Icon name="trash-2" size={20} color="#E74C3C" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('StaffServiceRequests')}
          >
            <Icon name="bell" size={20} color="#E8622A" />
            <Text style={styles.actionButtonText}>Staff Service Requests</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('StaffOrderManagement')}
          >
            <Icon name="chef-hat" size={20} color="#E8622A" />
            <Text style={styles.actionButtonText}>Staff Order Management</Text>
          </TouchableOpacity>
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  headerRight: {
    width: 40,
  },

  content: {
    flex: 1,
    padding: 16,
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  countCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  countLabel: {
    fontSize: 14,
    color: '#666',
  },

  countValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8622A',
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
    gap: 12,
  },

  dangerButton: {
    backgroundColor: '#FFF5F5',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  dangerText: {
    color: '#E74C3C',
  },
});

export default StaffWorkflowDebugScreen;