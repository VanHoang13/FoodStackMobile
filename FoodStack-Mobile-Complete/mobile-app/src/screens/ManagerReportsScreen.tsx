import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type ManagerReportsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManagerReports'>;

interface Props {
  navigation: ManagerReportsScreenNavigationProp;
}

interface ReportData {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  dailyOrders: number;
  weeklyOrders: number;
  monthlyOrders: number;
  avgOrderValue: number;
  topSellingItems: MenuItem[];
  staffPerformance: StaffPerformance[];
  customerSatisfaction: number;
  tableUtilization: number;
}

interface MenuItem {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface StaffPerformance {
  id: string;
  name: string;
  ordersServed: number;
  avgServiceTime: string;
  customerRating: number;
}

const { width } = Dimensions.get('window');

const ManagerReportsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      // Mock data for branch reports
      const mockData: ReportData = {
        dailyRevenue: 2850000,
        weeklyRevenue: 18500000,
        monthlyRevenue: 75200000,
        dailyOrders: 45,
        weeklyOrders: 312,
        monthlyOrders: 1248,
        avgOrderValue: 63333,
        topSellingItems: [
          { id: '1', name: 'Phở Bò Tái', quantity: 28, revenue: 1120000 },
          { id: '2', name: 'Cơm Gà Nướng', quantity: 22, revenue: 880000 },
          { id: '3', name: 'Bún Chả', quantity: 18, revenue: 720000 },
          { id: '4', name: 'Bánh Mì Thịt', quantity: 15, revenue: 450000 },
          { id: '5', name: 'Chè Ba Màu', quantity: 12, revenue: 240000 },
        ],
        staffPerformance: [
          { id: '1', name: 'Nguyễn Văn A', ordersServed: 18, avgServiceTime: '12m 30s', customerRating: 4.8 },
          { id: '2', name: 'Trần Thị B', ordersServed: 15, avgServiceTime: '14m 15s', customerRating: 4.6 },
          { id: '3', name: 'Lê Văn C', ordersServed: 12, avgServiceTime: '16m 45s', customerRating: 4.4 },
        ],
        customerSatisfaction: 4.7,
        tableUtilization: 78.5,
      };
      
      setReportData(mockData);
    } catch (error) {
      console.error('Error loading report data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getPeriodData = () => {
    if (!reportData) return { revenue: 0, orders: 0 };
    
    switch (selectedPeriod) {
      case 'daily':
        return { revenue: reportData.dailyRevenue, orders: reportData.dailyOrders };
      case 'weekly':
        return { revenue: reportData.weeklyRevenue, orders: reportData.weeklyOrders };
      case 'monthly':
        return { revenue: reportData.monthlyRevenue, orders: reportData.monthlyOrders };
      default:
        return { revenue: 0, orders: 0 };
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'daily': return 'Hôm nay';
      case 'weekly': return 'Tuần này';
      case 'monthly': return 'Tháng này';
      default: return '';
    }
  };

  if (!reportData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải báo cáo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const periodData = getPeriodData();

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
              <Text style={styles.headerTitle}>Báo cáo Chi nhánh</Text>
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
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'daily', label: 'Hôm nay' },
              { key: 'weekly', label: 'Tuần này' },
              { key: 'monthly', label: 'Tháng này' },
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.key as any)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.key && styles.periodButtonTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Chỉ số chính - {getPeriodLabel()}</Text>
          
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.revenueCard]}>
              <Icon name="dollar-sign" size={24} color="#27AE60" />
              <Text style={styles.metricValue}>{formatCurrency(periodData.revenue)}</Text>
              <Text style={styles.metricLabel}>Doanh thu</Text>
            </View>
            
            <View style={[styles.metricCard, styles.ordersCard]}>
              <Icon name="shopping-bag" size={24} color="#3498DB" />
              <Text style={styles.metricValue}>{periodData.orders}</Text>
              <Text style={styles.metricLabel}>Đơn hàng</Text>
            </View>
            
            <View style={[styles.metricCard, styles.avgCard]}>
              <Icon name="trending-up" size={24} color="#F39C12" />
              <Text style={styles.metricValue}>{formatCurrency(reportData.avgOrderValue)}</Text>
              <Text style={styles.metricLabel}>Giá trị TB/đơn</Text>
            </View>
            
            <View style={[styles.metricCard, styles.satisfactionCard]}>
              <Icon name="star" size={24} color="#E74C3C" />
              <Text style={styles.metricValue}>{reportData.customerSatisfaction}/5</Text>
              <Text style={styles.metricLabel}>Hài lòng KH</Text>
            </View>
          </View>
        </View>

        {/* Top Selling Items */}
        <View style={styles.topItemsContainer}>
          <Text style={styles.sectionTitle}>Món bán chạy nhất</Text>
          
          {reportData.topSellingItems.map((item, index) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemStats}>
                  Số lượng: {item.quantity} • Doanh thu: {formatCurrency(item.revenue)}
                </Text>
              </View>
              <View style={styles.itemProgress}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${(item.quantity / reportData.topSellingItems[0].quantity) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Staff Performance */}
        <View style={styles.staffContainer}>
          <Text style={styles.sectionTitle}>Hiệu suất nhân viên</Text>
          
          {reportData.staffPerformance.map((staff) => (
            <View key={staff.id} style={styles.staffCard}>
              <View style={styles.staffInfo}>
                <Text style={styles.staffName}>{staff.name}</Text>
                <Text style={styles.staffStats}>
                  {staff.ordersServed} đơn • {staff.avgServiceTime} TB
                </Text>
              </View>
              <View style={styles.staffRating}>
                <Icon name="star" size={16} color="#F39C12" />
                <Text style={styles.ratingText}>{staff.customerRating}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Metrics */}
        <View style={styles.additionalContainer}>
          <Text style={styles.sectionTitle}>Chỉ số khác</Text>
          
          <View style={styles.additionalGrid}>
            <View style={styles.additionalCard}>
              <Icon name="grid" size={20} color="#9B59B6" />
              <Text style={styles.additionalValue}>{reportData.tableUtilization}%</Text>
              <Text style={styles.additionalLabel}>Sử dụng bàn</Text>
            </View>
            
            <View style={styles.additionalCard}>
              <Icon name="clock" size={20} color="#E67E22" />
              <Text style={styles.additionalValue}>18m 30s</Text>
              <Text style={styles.additionalLabel}>Thời gian phục vụ TB</Text>
            </View>
          </View>
        </View>

        {/* Export Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={() => {
              // Handle export functionality
              alert('Xuất báo cáo PDF');
            }}
          >
            <Icon name="download" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Xuất PDF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={() => {
              // Handle share functionality
              alert('Chia sẻ báo cáo');
            }}
          >
            <Icon name="share" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Chia sẻ</Text>
          </TouchableOpacity>
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  // Period Selector
  periodContainer: {
    marginBottom: 24,
  },

  periodButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  periodButtonActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },

  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  periodButtonTextActive: {
    color: '#fff',
  },

  // Metrics
  metricsContainer: {
    marginBottom: 24,
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },

  ordersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },

  avgCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },

  satisfactionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },

  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },

  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Top Items
  topItemsContainer: {
    marginBottom: 24,
  },

  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  itemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  itemStats: {
    fontSize: 12,
    color: '#666',
  },

  itemProgress: {
    width: 60,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#3498DB',
  },

  // Staff Performance
  staffContainer: {
    marginBottom: 24,
  },

  staffCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  staffInfo: {
    flex: 1,
  },

  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  staffStats: {
    fontSize: 12,
    color: '#666',
  },

  staffRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F39C12',
  },

  // Additional Metrics
  additionalContainer: {
    marginBottom: 24,
  },

  additionalGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  additionalCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  additionalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },

  additionalLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },

  exportButton: {
    backgroundColor: '#27AE60',
  },

  shareButton: {
    backgroundColor: '#3498DB',
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ManagerReportsScreen;