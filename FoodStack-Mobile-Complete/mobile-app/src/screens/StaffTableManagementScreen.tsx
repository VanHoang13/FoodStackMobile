import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type StaffTableManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffTableManagement'>;

interface Props {
  navigation: StaffTableManagementScreenNavigationProp;
}

interface Table {
  id: string;
  number: string;
  area: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  currentOrder?: {
    id: string;
    orderNumber: string;
    customerCount: number;
    startTime: string;
    totalAmount: number;
  };
  reservedFor?: {
    customerName: string;
    time: string;
    partySize: number;
  };
}

interface Area {
  id: string;
  name: string;
  tables: Table[];
}

const TABLE_STATUSES = {
  AVAILABLE: { label: 'Trống', color: '#27AE60', icon: 'check-circle' },
  OCCUPIED: { label: 'Có khách', color: '#E74C3C', icon: 'users' },
  RESERVED: { label: 'Đã đặt', color: '#F39C12', icon: 'clock' },
  CLEANING: { label: 'Dọn dẹp', color: '#95A5A6', icon: 'refresh-cw' },
};

const StaffTableManagementScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [notes, setNotes] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTableData();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Auto refresh every 30 seconds
    const interval = setInterval(loadTableData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTableData = async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockAreas: Area[] = [
        {
          id: '1',
          name: 'Khu A - Tầng trệt',
          tables: [
            {
              id: '1',
              number: 'A01',
              area: 'Khu A',
              capacity: 4,
              status: 'OCCUPIED',
              currentOrder: {
                id: '1',
                orderNumber: 'ORD-001',
                customerCount: 3,
                startTime: '10:30',
                totalAmount: 250000,
              },
            },
            {
              id: '2',
              number: 'A02',
              area: 'Khu A',
              capacity: 2,
              status: 'AVAILABLE',
            },
            {
              id: '3',
              number: 'A03',
              area: 'Khu A',
              capacity: 6,
              status: 'RESERVED',
              reservedFor: {
                customerName: 'Nguyễn Văn A',
                time: '12:00',
                partySize: 4,
              },
            },
            {
              id: '4',
              number: 'A04',
              area: 'Khu A',
              capacity: 4,
              status: 'CLEANING',
            },
          ],
        },
        {
          id: '2',
          name: 'Khu B - VIP',
          tables: [
            {
              id: '5',
              number: 'B01',
              area: 'Khu B',
              capacity: 8,
              status: 'OCCUPIED',
              currentOrder: {
                id: '2',
                orderNumber: 'ORD-002',
                customerCount: 6,
                startTime: '11:00',
                totalAmount: 450000,
              },
            },
            {
              id: '6',
              number: 'B02',
              area: 'Khu B',
              capacity: 6,
              status: 'AVAILABLE',
            },
            {
              id: '7',
              number: 'B03',
              area: 'Khu B',
              capacity: 4,
              status: 'AVAILABLE',
            },
          ],
        },
      ];
      
      setAreas(mockAreas);
    } catch (error) {
      console.error('Error loading table data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTableData();
    setRefreshing(false);
  };

  const handleTablePress = (table: Table) => {
    setSelectedTable(table);
    setNotes('');
    setShowStatusModal(true);
  };

  const updateTableStatus = async (newStatus: string) => {
    if (!selectedTable) return;

    try {
      // TODO: API call to update table status
      console.log(`Updating table ${selectedTable.number} to ${newStatus}`);
      
      // Update local state
      setAreas(prevAreas => 
        prevAreas.map(area => ({
          ...area,
          tables: area.tables.map(table => 
            table.id === selectedTable.id 
              ? { ...table, status: newStatus as any }
              : table
          ),
        }))
      );

      setShowStatusModal(false);
      setSelectedTable(null);
      
      Alert.alert('Thành công', `Đã cập nhật trạng thái bàn ${selectedTable.number}`);
    } catch (error) {
      console.error('Error updating table status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái bàn');
    }
  };

  const getFilteredTables = () => {
    if (selectedArea === 'all') {
      return areas.flatMap(area => area.tables);
    }
    const area = areas.find(a => a.id === selectedArea);
    return area ? area.tables : [];
  };

  const getStatusStats = () => {
    const allTables = areas.flatMap(area => area.tables);
    return {
      total: allTables.length,
      available: allTables.filter(t => t.status === 'AVAILABLE').length,
      occupied: allTables.filter(t => t.status === 'OCCUPIED').length,
      reserved: allTables.filter(t => t.status === 'RESERVED').length,
      cleaning: allTables.filter(t => t.status === 'CLEANING').length,
    };
  };

  const stats = getStatusStats();
  const filteredTables = getFilteredTables();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý bàn</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Icon name="refresh-cw" size={20} color="#E8622A" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Tổng bàn</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#27AE60' }]}>{stats.available}</Text>
            <Text style={styles.statLabel}>Trống</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#E74C3C' }]}>{stats.occupied}</Text>
            <Text style={styles.statLabel}>Có khách</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F39C12' }]}>{stats.reserved}</Text>
            <Text style={styles.statLabel}>Đã đặt</Text>
          </View>
        </View>

        {/* Area Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedArea === 'all' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedArea('all')}
            >
              <Text style={[
                styles.filterButtonText,
                selectedArea === 'all' && styles.filterButtonTextActive,
              ]}>
                Tất cả ({stats.total})
              </Text>
            </TouchableOpacity>
            
            {areas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.filterButton,
                  selectedArea === area.id && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedArea(area.id)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedArea === area.id && styles.filterButtonTextActive,
                ]}>
                  {area.name} ({area.tables.length})
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
                  { borderColor: TABLE_STATUSES[table.status].color }
                ]}
                onPress={() => handleTablePress(table)}
              >
                <View style={styles.tableHeader}>
                  <Text style={styles.tableNumber}>{table.number}</Text>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: TABLE_STATUSES[table.status].color }
                  ]}>
                    <Icon 
                      name={TABLE_STATUSES[table.status].icon} 
                      size={12} 
                      color="#fff" 
                    />
                  </View>
                </View>

                <Text style={styles.tableCapacity}>
                  <Icon name="users" size={12} color="#666" /> {table.capacity} chỗ
                </Text>

                <View style={[
                  styles.statusBadge,
                  { backgroundColor: TABLE_STATUSES[table.status].color }
                ]}>
                  <Text style={styles.statusText}>
                    {TABLE_STATUSES[table.status].label}
                  </Text>
                </View>

                {table.currentOrder && (
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderText}>
                      #{table.currentOrder.orderNumber}
                    </Text>
                    <Text style={styles.orderTime}>
                      {table.currentOrder.startTime}
                    </Text>
                  </View>
                )}

                {table.reservedFor && (
                  <View style={styles.reservationInfo}>
                    <Text style={styles.reservationText}>
                      {table.reservedFor.customerName}
                    </Text>
                    <Text style={styles.reservationTime}>
                      {table.reservedFor.time}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Cập nhật trạng thái bàn {selectedTable?.number}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Icon name="x" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.statusOptions}>
              {Object.entries(TABLE_STATUSES).map(([status, config]) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    selectedTable?.status === status && styles.statusOptionActive,
                  ]}
                  onPress={() => updateTableStatus(status)}
                >
                  <View style={[
                    styles.statusOptionIcon,
                    { backgroundColor: config.color }
                  ]}>
                    <Icon name={config.icon} size={16} color="#fff" />
                  </View>
                  <Text style={styles.statusOptionText}>{config.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Ghi chú (tùy chọn)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Nhập ghi chú..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('StaffDashboard')}
        >
          <Icon name="home" size={22} color="#aaa" />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('KitchenDisplay')}
        >
          <Icon name="chef-hat" size={22} color="#aaa" />
          <Text style={styles.navText}>Bếp</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Icon name="grid" size={22} color="#E8622A" />
          <Text style={[styles.navText, styles.activeNavText]}>Bàn</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ServiceRequests')}
        >
          <Icon name="bell" size={22} color="#aaa" />
          <Text style={styles.navText}>Yêu cầu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('StaffProfile')}
        >
          <Icon name="user" size={22} color="#aaa" />
          <Text style={styles.navText}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    flex: 1,
  },
  
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  
  filterButtonActive: {
    backgroundColor: '#E8622A',
  },
  
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  filterButtonTextActive: {
    color: '#fff',
  },
  
  tablesContainer: {
    paddingHorizontal: 20,
  },
  
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  tableCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    ...theme.shadows.sm,
  },
  
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  tableNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  tableCapacity: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  
  orderInfo: {
    backgroundColor: '#FFF5F0',
    borderRadius: 8,
    padding: 8,
  },
  
  orderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E8622A',
  },
  
  orderTime: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  
  reservationInfo: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 8,
  },
  
  reservationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F39C12',
  },
  
  reservationTime: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  statusOptions: {
    gap: 12,
    marginBottom: 24,
  },
  
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    gap: 12,
  },
  
  statusOptionActive: {
    backgroundColor: '#E8622A20',
    borderWidth: 2,
    borderColor: '#E8622A',
  },
  
  statusOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  statusOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  
  notesContainer: {
    marginBottom: 16,
  },
  
  notesLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  
  bottomNav: {
    height: 68,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 3,
  },
  
  activeNavItem: {
    // Active state styling handled by individual elements
  },
  
  navText: {
    fontSize: 10,
    color: '#aaa',
    fontWeight: '700',
  },
  
  activeNavText: {
    color: '#E8622A',
  },
});

export default StaffTableManagementScreen;