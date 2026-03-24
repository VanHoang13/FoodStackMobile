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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import ServiceRequestService, { ServiceRequest } from '../services/serviceRequestService';

type StaffServiceRequestsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffServiceRequests'>;

interface Props {
  navigation: StaffServiceRequestsScreenNavigationProp;
}

const StaffServiceRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const filters = [
    { key: 'ALL', label: 'Tất cả', count: 0 },
    { key: 'PENDING', label: 'Chờ xử lý', count: 0 },
    { key: 'IN_PROGRESS', label: 'Đang xử lý', count: 0 },
    { key: 'HIGH', label: 'Ưu tiên cao', count: 0 },
  ];

  useEffect(() => {
    loadServiceRequests();
    
    // Auto refresh every 15 seconds for real-time updates
    const interval = setInterval(loadServiceRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadServiceRequests = async () => {
    try {
      // Only initialize mock data if no real data exists
      const existingRequests = await ServiceRequestService.getServiceRequests();
      if (existingRequests.length === 0) {
        await ServiceRequestService.initializeMockData();
      }
      
      // Load requests from service
      const serviceRequests = await ServiceRequestService.getServiceRequests();
      setRequests(serviceRequests);
    } catch (error) {
      console.error('Error loading service requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServiceRequests();
  };

  const getFilteredRequests = () => {
    switch (selectedFilter) {
      case 'PENDING':
        return requests.filter(req => req.status === 'PENDING');
      case 'IN_PROGRESS':
        return requests.filter(req => req.status === 'IN_PROGRESS');
      case 'HIGH':
        return requests.filter(req => req.priority === 'HIGH' || req.priority === 'URGENT');
      default:
        return requests;
    }
  };

  const getRequestTypeIcon = (type: string) => {
    const icons = {
      'WATER': 'droplet',
      'CLEAN': 'trash-2',
      'ASSISTANCE': 'help-circle',
      'BILL': 'credit-card',
      'COMPLAINT': 'alert-triangle',
      'OTHER': 'more-horizontal'
    };
    return icons[type] || 'bell';
  };

  const getRequestTypeText = (type: string) => {
    const texts = {
      'WATER': 'Nước uống',
      'CLEAN': 'Dọn dẹp',
      'ASSISTANCE': 'Hỗ trợ',
      'BILL': 'Hóa đơn',
      'COMPLAINT': 'Khiếu nại',
      'OTHER': 'Khác'
    };
    return texts[type] || type;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'LOW': '#95A5A6',
      'NORMAL': '#3498DB',
      'HIGH': '#F39C12',
      'URGENT': '#E74C3C'
    };
    return colors[priority] || '#95A5A6';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': '#F39C12',
      'IN_PROGRESS': '#3498DB',
      'COMPLETED': '#27AE60'
    };
    return colors[status] || '#95A5A6';
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    
    return time.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const acceptRequest = async (requestId: string) => {
    try {
      await ServiceRequestService.acceptServiceRequest(requestId, 'Bạn');
      await loadServiceRequests(); // Refresh the list
      Alert.alert('Đã nhận', 'Bạn đã nhận yêu cầu này');
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Lỗi', 'Không thể nhận yêu cầu này');
    }
  };

  const completeRequest = async (requestId: string) => {
    try {
      await ServiceRequestService.completeServiceRequest(requestId);
      await loadServiceRequests(); // Refresh the list
      Alert.alert('Hoàn thành', 'Yêu cầu đã được hoàn thành');
    } catch (error) {
      console.error('Error completing request:', error);
      Alert.alert('Lỗi', 'Không thể hoàn thành yêu cầu này');
    }
  };

  const filteredRequests = getFilteredRequests();

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
        <Text style={styles.headerTitle}>Yêu cầu dịch vụ</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Icon name="refresh-cw" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="inbox" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Không có yêu cầu nào</Text>
          </View>
        ) : (
          filteredRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              {/* Request Header */}
              <View style={styles.requestHeader}>
                <View style={styles.requestInfo}>
                  <View style={styles.requestTypeContainer}>
                    <Icon 
                      name={getRequestTypeIcon(request.type)} 
                      size={20} 
                      color={getPriorityColor(request.priority)} 
                    />
                    <Text style={styles.requestType}>
                      {getRequestTypeText(request.type)}
                    </Text>
                  </View>
                  <Text style={styles.tableNumber}>Bàn {request.table}</Text>
                  <Text style={styles.customerName}>{request.customerName}</Text>
                </View>
                
                <View style={styles.requestMeta}>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(request.priority) }
                  ]}>
                    <Text style={styles.priorityText}>{request.priority}</Text>
                  </View>
                  <Text style={styles.requestTime}>
                    {formatTime(request.requestTime)}
                  </Text>
                </View>
              </View>

              {/* Request Message */}
              {request.message && (
                <View style={styles.requestMessage}>
                  <Text style={styles.messageText}>{request.message}</Text>
                </View>
              )}

              {/* Request Status */}
              <View style={styles.requestStatus}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(request.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {request.status === 'PENDING' ? 'Chờ xử lý' :
                     request.status === 'IN_PROGRESS' ? 'Đang xử lý' : 'Hoàn thành'}
                  </Text>
                </View>
                
                {request.assignedStaff && (
                  <Text style={styles.assignedStaff}>
                    Phụ trách: {request.assignedStaff}
                  </Text>
                )}
                
                {request.estimatedTime && request.status !== 'COMPLETED' && (
                  <Text style={styles.estimatedTime}>
                    Ước tính: {request.estimatedTime} phút
                  </Text>
                )}
              </View>

              {/* Request Actions */}
              <View style={styles.requestActions}>
                {request.status === 'PENDING' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => acceptRequest(request.id)}
                  >
                    <Icon name="check" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Nhận việc</Text>
                  </TouchableOpacity>
                )}
                
                {request.status === 'IN_PROGRESS' && request.assignedStaff === 'Bạn' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => completeRequest(request.id)}
                  >
                    <Icon name="check-circle" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Hoàn thành</Text>
                  </TouchableOpacity>
                )}
                
                {request.status === 'COMPLETED' && request.completedTime && (
                  <Text style={styles.completedTime}>
                    Hoàn thành lúc: {formatTime(request.completedTime)}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Header
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

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Filters
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    marginRight: 8,
  },

  filterChipActive: {
    backgroundColor: '#E8622A',
  },

  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  filterTextActive: {
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
    padding: 16,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },

  // Request Card
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },

  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  requestInfo: {
    flex: 1,
  },

  requestTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  requestType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },

  tableNumber: {
    fontSize: 14,
    color: '#E8622A',
    fontWeight: '600',
    marginBottom: 2,
  },

  customerName: {
    fontSize: 14,
    color: '#666',
  },

  requestMeta: {
    alignItems: 'flex-end',
  },

  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },

  priorityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

  requestTime: {
    fontSize: 12,
    color: '#999',
  },

  // Request Message
  requestMessage: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  // Request Status
  requestStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

  assignedStaff: {
    fontSize: 12,
    color: '#666',
  },

  estimatedTime: {
    fontSize: 12,
    color: '#F39C12',
    fontWeight: '500',
  },

  completedTime: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },

  // Actions
  requestActions: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },

  acceptButton: {
    backgroundColor: '#3498DB',
  },

  completeButton: {
    backgroundColor: '#27AE60',
  },

  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default StaffServiceRequestsScreen;