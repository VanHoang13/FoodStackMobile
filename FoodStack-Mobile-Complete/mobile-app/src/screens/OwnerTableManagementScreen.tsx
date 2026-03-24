import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import apiClient from '../services/api';

type OwnerTableManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OwnerTableManagement'>;

interface Props {
  navigation: OwnerTableManagementScreenNavigationProp;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_service';
  area: string;
  currentOrder?: {
    id: string;
    customerName: string;
    orderTime: string;
    totalAmount: number;
  };
  reservationInfo?: {
    customerName: string;
    phone: string;
    time: string;
  };
}

interface Area {
  id: string;
  name: string;
  tables: Table[];
}

const { width } = Dimensions.get('window');
const TABLE_SIZE = (width - 60) / 4; // 4 tables per row with margins

const OwnerTableManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadTableData();
  }, []);

  const loadTableData = async () => {
    try {
      // Get the first branch of the owner as a default
      const branchRes = await apiClient.get('/branches');
      const branches = branchRes.data?.data?.branches || branchRes.data?.data || branchRes.data;
      const branchList = Array.isArray(branches) ? branches : [];
      let mappedAreas: Area[] = [];

      if (branchList.length > 0) {
        const branchId = branchList[0].id;
        
        // Fetch areas and tables for this branch
        const [areasRes, tablesRes] = await Promise.all([
          apiClient.get(`/branches/${branchId}/areas`).catch(() => ({ data: { data: [] } })),
          apiClient.get(`/branches/${branchId}/tables`).catch(() => ({ data: { data: [] } }))
        ]);
        
        const apiAreas = areasRes.data?.data || areasRes.data || [];
        const apiTables = tablesRes.data?.data || tablesRes.data || [];
        const areaArray = Array.isArray(apiAreas) ? apiAreas : [];
        const tableArray = Array.isArray(apiTables) ? apiTables : [];

        // Merge tables into their respective areas
        if (areaArray.length > 0) {
          mappedAreas = areaArray.map((area: any) => {
            const areaTables = tableArray.filter((t: any) => t.area_id === area.id).map((t: any) => ({
              id: t.id,
              name: t.name || t.table_number || 'Unknown',
              capacity: t.capacity || 4,
              status: t.status ? t.status.toLowerCase() : 'available',
              area: area.name,
              currentOrder: undefined, // Requires more API calls for active orders
              reservationInfo: undefined 
            }));
            
            return {
              id: area.id,
              name: area.name,
              tables: areaTables
            };
          });
        }
      }

      // If no valid data from API, provide a UI fallback (1 Area, 1 Table)
      if (mappedAreas.length === 0) {
        mappedAreas = [
          {
            id: 'fallback_area_1',
            name: 'Khu vực Mẫu',
            tables: [
              {
                id: 'fallback_table_1',
                name: 'TB-01',
                capacity: 4,
                status: 'available',
                area: 'Khu vực Mẫu'
              }
            ]
          }
        ];
      }

      setAreas(mappedAreas);
    } catch (error) {
      console.warn('Error loading table data from API, using fallback:', error);
      setAreas([
          {
            id: 'fallback_area_1',
            name: 'Khu vực Mẫu (Fallback)',
            tables: [
              {
                id: 'fallback_table_1',
                name: 'TB-01',
                capacity: 4,
                status: 'available',
                area: 'Khu vực Mẫu (Fallback)'
              }
            ]
          }
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTableData();
    setRefreshing(false);
  };

  const handleTablePress = (table: Table) => {
    const actions = [];

    if (table.status === 'available') {
      actions.push({
        text: 'Đặt bàn',
        onPress: () => handleReserveTable(table),
      });
      actions.push({
        text: 'Đánh dấu bận',
        onPress: () => handleChangeTableStatus(table.id, 'occupied'),
      });
    }

    if (table.status === 'occupied') {
      actions.push({
        text: 'Xem đơn hàng',
        onPress: () => handleViewOrder(table),
      });
      actions.push({
        text: 'Thanh toán',
        onPress: () => handlePayment(table),
      });
      actions.push({
        text: 'Dọn bàn',
        onPress: () => handleChangeTableStatus(table.id, 'cleaning'),
      });
    }

    if (table.status === 'reserved') {
      actions.push({
        text: 'Xem đặt bàn',
        onPress: () => handleViewReservation(table),
      });
      actions.push({
        text: 'Hủy đặt bàn',
        onPress: () => handleChangeTableStatus(table.id, 'available'),
      });
      actions.push({
        text: 'Khách đã đến',
        onPress: () => handleChangeTableStatus(table.id, 'occupied'),
      });
    }

    if (table.status === 'cleaning') {
      actions.push({
        text: 'Hoàn thành dọn dẹp',
        onPress: () => handleChangeTableStatus(table.id, 'available'),
      });
    }

    if (table.status === 'out_of_service') {
      actions.push({
        text: 'Kích hoạt lại',
        onPress: () => handleChangeTableStatus(table.id, 'available'),
      });
    } else {
      actions.push({
        text: 'Tạm ngưng sử dụng',
        onPress: () => handleChangeTableStatus(table.id, 'out_of_service'),
      });
    }

    actions.push({ text: 'Hủy', style: 'cancel' });

    Alert.alert(`Bàn ${table.name}`, `Sức chứa: ${table.capacity} người`, actions as any);
  };

  const handleChangeTableStatus = (tableId: string, newStatus: Table['status']) => {
    setAreas(prev =>
      prev.map(area => ({
        ...area,
        tables: area.tables.map(table =>
          table.id === tableId
            ? { ...table, status: newStatus, currentOrder: newStatus === 'available' ? undefined : table.currentOrder }
            : table
        ),
      }))
    );

    Alert.alert('Thành công', 'Đã cập nhật trạng thái bàn');
  };

  const handleReserveTable = (table: Table) => {
    Alert.alert(
      'Đặt bàn',
      'Chức năng đặt bàn sẽ được phát triển trong phiên bản tiếp theo',
      [{ text: 'OK' }]
    );
  };

  const handleViewOrder = (table: Table) => {
    if (table.currentOrder) {
      Alert.alert(
        'Thông tin đơn hàng',
        `Khách hàng: ${table.currentOrder.customerName}\nGiờ đặt: ${table.currentOrder.orderTime}\nTổng tiền: ${formatCurrency(table.currentOrder.totalAmount)}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleViewReservation = (table: Table) => {
    if (table.reservationInfo) {
      Alert.alert(
        'Thông tin đặt bàn',
        `Khách hàng: ${table.reservationInfo.customerName}\nSĐT: ${table.reservationInfo.phone}\nGiờ đặt: ${table.reservationInfo.time}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handlePayment = (table: Table) => {
    Alert.alert(
      'Thanh toán',
      'Chức năng thanh toán sẽ được phát triển trong phiên bản tiếp theo',
      [{ text: 'OK' }]
    );
  };

  const getFilteredAreas = () => {
    if (selectedArea === 'all') {
      return areas;
    }
    return areas.filter(area => area.id === selectedArea);
  };

  const getAllTables = () => {
    return areas.flatMap(area => area.tables);
  };

  const getTableStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'occupied':
        return '#F44336';
      case 'reserved':
        return '#FF9800';
      case 'cleaning':
        return '#2196F3';
      case 'out_of_service':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const getTableStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'Trống';
      case 'occupied':
        return 'Có khách';
      case 'reserved':
        return 'Đã đặt';
      case 'cleaning':
        return 'Dọn dẹp';
      case 'out_of_service':
        return 'Tạm ngưng';
      default:
        return status;
    }
  };

  const getTableIcon = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'check-circle';
      case 'occupied':
        return 'users';
      case 'reserved':
        return 'clock';
      case 'cleaning':
        return 'refresh-cw';
      case 'out_of_service':
        return 'x-circle';
      default:
        return 'help-circle';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getTableStats = () => {
    const allTables = getAllTables();
    return {
      total: allTables.length,
      available: allTables.filter(t => t.status === 'available').length,
      occupied: allTables.filter(t => t.status === 'occupied').length,
      reserved: allTables.filter(t => t.status === 'reserved').length,
      cleaning: allTables.filter(t => t.status === 'cleaning').length,
      outOfService: allTables.filter(t => t.status === 'out_of_service').length,
    };
  };

  const stats = getTableStats();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Bàn</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Icon name="refresh-cw" size={20} color="#FF7A30" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderLeftColor: '#4CAF50' }]}>
              <Text style={styles.statNumber}>{stats.available}</Text>
              <Text style={styles.statLabel}>Trống</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#F44336' }]}>
              <Text style={styles.statNumber}>{stats.occupied}</Text>
              <Text style={styles.statLabel}>Có khách</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#FF9800' }]}>
              <Text style={styles.statNumber}>{stats.reserved}</Text>
              <Text style={styles.statLabel}>Đã đặt</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#2196F3' }]}>
              <Text style={styles.statNumber}>{stats.cleaning}</Text>
              <Text style={styles.statLabel}>Dọn dẹp</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Area Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedArea === 'all' && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedArea('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedArea === 'all' && styles.activeFilterTabText,
              ]}
            >
              Tất cả ({stats.total})
            </Text>
          </TouchableOpacity>
          {areas.map((area) => (
            <TouchableOpacity
              key={area.id}
              style={[
                styles.filterTab,
                selectedArea === area.id && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedArea(area.id)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedArea === area.id && styles.activeFilterTabText,
                ]}
              >
                {area.name} ({area.tables.length})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tables */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={[styles.tablesContainer, { opacity: fadeAnim }]}>
          {getFilteredAreas().map((area) => (
            <View key={area.id} style={styles.areaSection}>
              {selectedArea === 'all' && (
                <Text style={styles.areaTitle}>{area.name}</Text>
              )}
              
              <View style={styles.tablesGrid}>
                {area.tables.map((table) => (
                  <TouchableOpacity
                    key={table.id}
                    style={[
                      styles.tableCard,
                      { borderColor: getTableStatusColor(table.status) },
                    ]}
                    onPress={() => handleTablePress(table)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.tableHeader,
                        { backgroundColor: getTableStatusColor(table.status) + '20' },
                      ]}
                    >
                      <Icon
                        name={getTableIcon(table.status)}
                        size={16}
                        color={getTableStatusColor(table.status)}
                      />
                      <Text
                        style={[
                          styles.tableStatus,
                          { color: getTableStatusColor(table.status) },
                        ]}
                      >
                        {getTableStatusText(table.status)}
                      </Text>
                    </View>

                    <View style={styles.tableInfo}>
                      <Text style={styles.tableName}>{table.name}</Text>
                      <Text style={styles.tableCapacity}>
                        {table.capacity} người
                      </Text>
                    </View>

                    {table.currentOrder && (
                      <View style={styles.orderInfo}>
                        <Text style={styles.customerName} numberOfLines={1}>
                          {table.currentOrder.customerName}
                        </Text>
                        <Text style={styles.orderTime}>
                          {table.currentOrder.orderTime}
                        </Text>
                      </View>
                    )}

                    {table.reservationInfo && (
                      <View style={styles.reservationInfo}>
                        <Text style={styles.customerName} numberOfLines={1}>
                          {table.reservationInfo.customerName}
                        </Text>
                        <Text style={styles.reservationTime}>
                          {table.reservationInfo.time}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Chú thích:</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Trống</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Có khách</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Đã đặt</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>Dọn dẹp</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats Styles
  statsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },

  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 3,
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333',
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },

  // Filter Styles
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },

  activeFilterTab: {
    backgroundColor: '#FF7A30',
  },

  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },

  activeFilterTabText: {
    color: '#fff',
  },

  // Content Styles
  content: {
    flex: 1,
  },

  tablesContainer: {
    padding: 20,
  },

  areaSection: {
    marginBottom: 24,
  },

  areaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  // Table Card Styles
  tableCard: {
    width: TABLE_SIZE,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },

  tableStatus: {
    fontSize: 10,
    fontWeight: '600',
  },

  tableInfo: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  tableName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },

  tableCapacity: {
    fontSize: 10,
    color: '#666',
  },

  orderInfo: {
    backgroundColor: '#FFF5F5',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  reservationInfo: {
    backgroundColor: '#FFF8E1',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  customerName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  orderTime: {
    fontSize: 9,
    color: '#F44336',
  },

  reservationTime: {
    fontSize: 9,
    color: '#FF9800',
  },

  // Legend Styles
  legendContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendText: {
    fontSize: 10,
    color: '#666',
  },
});

export default OwnerTableManagementScreen;