import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type ManagerTableManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManagerTableManagement'>;

interface Props {
  navigation: ManagerTableManagementScreenNavigationProp;
}

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrder?: string;
  reservationTime?: string;
  customerName?: string;
  estimatedTime?: string;
}

const ManagerTableManagementScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'available' | 'occupied' | 'reserved' | 'cleaning'>('all');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      // Mock data for branch tables
      const mockTables: Table[] = [
        { id: '1', number: 1, capacity: 2, status: 'occupied', currentOrder: '#501', estimatedTime: '15 phút' },
        { id: '2', number: 2, capacity: 4, status: 'available' },
        { id: '3', number: 3, capacity: 2, status: 'reserved', reservationTime: '19:30', customerName: 'Nguyễn Văn A' },
        { id: '4', number: 4, capacity: 6, status: 'occupied', currentOrder: '#502', estimatedTime: '25 phút' },
        { id: '5', number: 5, capacity: 4, status: 'cleaning' },
        { id: '6', number: 6, capacity: 2, status: 'available' },
        { id: '7', number: 7, capacity: 8, status: 'reserved', reservationTime: '20:00', customerName: 'Trần Thị B' },
        { id: '8', number: 8, capacity: 4, status: 'occupied', currentOrder: '#503', estimatedTime: '10 phút' },
        { id: '9', number: 9, capacity: 2, status: 'available' },
        { id: '10', number: 10, capacity: 6, status: 'available' },
        { id: '11', number: 11, capacity: 4, status: 'cleaning' },
        { id: '12', number: 12, capacity: 2, status: 'occupied', currentOrder: '#504', estimatedTime: '30 phút' },
      ];
      
      setTables(mockTables);
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTables();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#27AE60';
      case 'occupied': return '#E74C3C';
      case 'reserved': return '#F39C12';
      case 'cleaning': return '#95A5A6';
      default: return '#95A5A6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Trống';
      case 'occupied': return 'Có khách';
      case 'reserved': return 'Đã đặt';
      case 'cleaning': return 'Dọn dẹp';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return 'check-circle';
      case 'occupied': return 'users';
      case 'reserved': return 'clock';
      case 'cleaning': return 'refresh-cw';
      default: return 'help-circle';
    }
  };

  const filteredTables = selectedFilter === 'all' 
    ? tables 
    : tables.filter(table => table.status === selectedFilter);

  const getTableStats = () => {
    const available = tables.filter(t => t.status === 'available').length;
    const occupied = tables.filter(t => t.status === 'occupied').length;
    const reserved = tables.filter(t => t.status === 'reserved').length;
    const cleaning = tables.filter(t => t.status === 'cleaning').length;
    
    return { available, occupied, reserved, cleaning, total: tables.length };
  };

  const stats = getTableStats();

  const handleTableAction = (table: Table, action: string) => {
    Alert.alert(
      `Bàn ${table.number}`,
      `Bạn muốn ${action} bàn này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: () => {
            // Handle table action
            Alert.alert('Thành công', `Đã ${action} bàn ${table.number}`);
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#3498DB', '#2980B9']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Quản lý Bàn</Text>
              <Text style={styles.headerSubtitle}>Chi nhánh Quận 1</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Icon name="refresh-cw" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderLeftColor: '#27AE60' }]}>
              <Text style={styles.statNumber}>{stats.available}</Text>
              <Text style={styles.statLabel}>Trống</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#E74C3C' }]}>
              <Text style={styles.statNumber}>{stats.occupied}</Text>
              <Text style={styles.statLabel}>Có khách</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#F39C12' }]}>
              <Text style={styles.statNumber}>{stats.reserved}</Text>
              <Text style={styles.statLabel}>Đã đặt</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#95A5A6' }]}>
              <Text style={styles.statNumber}>{stats.cleaning}</Text>
              <Text style={styles.statLabel}>Dọn dẹp</Text>
            </View>
          </View>
        </View>

        {/* Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: 'Tất cả', count: stats.total },
              { key: 'available', label: 'Trống', count: stats.available },
              { key: 'occupied', label: 'Có khách', count: stats.occupied },
              { key: 'reserved', label: 'Đã đặt', count: stats.reserved },
              { key: 'cleaning', label: 'Dọn dẹp', count: stats.cleaning },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter.key as any)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === filter.key && styles.filterButtonTextActive,
                  ]}
                >
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tables Grid */}
        <View style={styles.tablesContainer}>
          <View style={styles.tablesGrid}>
            {filteredTables.map((table) => (
              <TouchableOpacity
                key={table.id}
                style={[
                  styles.tableCard,
                  { borderLeftColor: getStatusColor(table.status) }
                ]}
                onPress={() => {
                  Alert.alert(
                    `Bàn ${table.number}`,
                    `Sức chứa: ${table.capacity} người\nTrạng thái: ${getStatusText(table.status)}${
                      table.currentOrder ? `\nĐơn hàng: ${table.currentOrder}` : ''
                    }${
                      table.estimatedTime ? `\nThời gian còn lại: ${table.estimatedTime}` : ''
                    }${
                      table.reservationTime ? `\nGiờ đặt: ${table.reservationTime}` : ''
                    }${
                      table.customerName ? `\nKhách hàng: ${table.customerName}` : ''
                    }`,
                    [
                      { text: 'Đóng', style: 'cancel' },
                      ...(table.status === 'occupied' ? [
                        { text: 'Thanh toán', onPress: () => handleTableAction(table, 'thanh toán') }
                      ] : []),
                      ...(table.status === 'available' ? [
                        { text: 'Đặt bàn', onPress: () => handleTableAction(table, 'đặt') }
                      ] : []),
                      ...(table.status === 'cleaning' ? [
                        { text: 'Hoàn thành', onPress: () => handleTableAction(table, 'hoàn thành dọn dẹp') }
                      ] : []),
                    ]
                  );
                }}
              >
                <View style={styles.tableHeader}>
                  <Text style={styles.tableNumber}>Bàn {table.number}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(table.status) }]}>
                    <Icon name={getStatusIcon(table.status)} size={12} color="#fff" />
                  </View>
                </View>
                
                <Text style={styles.tableCapacity}>👥 {table.capacity} người</Text>
                <Text style={[styles.tableStatus, { color: getStatusColor(table.status) }]}>
                  {getStatusText(table.status)}
                </Text>
                
                {table.currentOrder && (
                  <Text style={styles.tableOrder}>📋 {table.currentOrder}</Text>
                )}
                
                {table.estimatedTime && (
                  <Text style={styles.tableTime}>⏱️ {table.estimatedTime}</Text>
                )}
                
                {table.reservationTime && (
                  <Text style={styles.tableReservation}>🕐 {table.reservationTime}</Text>
                )}
                
                {table.customerName && (
                  <Text style={styles.tableCustomer}>👤 {table.customerName}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header
  header: {
    marginBottom: 20,
  },

  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Stats
  statsContainer: {
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Filter
  filterContainer: {
    marginBottom: 20,
  },

  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  filterButtonActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },

  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  filterButtonTextActive: {
    color: '#fff',
  },

  // Tables
  tablesContainer: {
    marginBottom: 20,
  },

  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  tableCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  tableNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tableCapacity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  tableStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  tableOrder: {
    fontSize: 12,
    color: '#E74C3C',
    marginBottom: 2,
  },

  tableTime: {
    fontSize: 12,
    color: '#F39C12',
    marginBottom: 2,
  },

  tableReservation: {
    fontSize: 12,
    color: '#F39C12',
    marginBottom: 2,
  },

  tableCustomer: {
    fontSize: 12,
    color: '#666',
  },
});

export default ManagerTableManagementScreen;