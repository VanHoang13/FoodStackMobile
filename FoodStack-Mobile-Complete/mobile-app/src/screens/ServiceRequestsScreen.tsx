import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { serviceRequestApi } from '../services/api';
import { theme } from '../theme';
import Icon from '../components/Icon';

type ServiceRequestsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceRequests'>;

interface Props {
  navigation: ServiceRequestsScreenNavigationProp;
}

interface ServiceRequest {
  id: string;
  type: string;
  status: string;
  priority: string;
  description?: string;
  table: {
    id: string;
    name: string;
    area: string;
  };
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  staffResponse?: string;
  assignedStaff?: {
    id: string;
    name: string;
  };
}

const SERVICE_TYPES = {
  CALL_STAFF: { label: 'Gọi nhân viên', icon: 'user', color: '#3498DB' },
  WATER: { label: 'Thêm nước', icon: 'droplet', color: '#2ECC71' },
  NAPKINS: { label: 'Khăn giấy', icon: 'file-text', color: '#F39C12' },
  UTENSILS: { label: 'Đồ ăn', icon: 'utensils', color: '#9B59B6' },
  BILL: { label: 'Xin bill', icon: 'credit-card', color: '#E74C3C' },
  CLEAN_TABLE: { label: 'Dọn bàn', icon: 'trash-2', color: '#34495E' },
  COMPLAINT: { label: 'Khiếu nại', icon: 'alert-triangle', color: '#E67E22' },
  OTHER: { label: 'Khác', icon: 'more-horizontal', color: '#95A5A6' },
};

const REQUEST_STATUSES = {
  PENDING: { label: 'Chờ xử lý', color: '#F39C12', icon: 'clock' },
  IN_PROGRESS: { label: 'Đang xử lý', color: '#3498DB', icon: 'play' },
  COMPLETED: { label: 'Hoàn thành', color: '#27AE60', icon: 'check-circle' },
  CANCELLED: { label: 'Đã hủy', color: '#E74C3C', icon: 'x-circle' },
};

const PRIORITY_COLORS = {
  LOW: '#95A5A6',
  NORMAL: '#3498DB',
  HIGH: '#E67E22',
  URGENT: '#E74C3C',
};

const ServiceRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  // Mock branch ID - in real app, get from auth context
  const branchId = 'branch-1';

  useEffect(() => {
    loadServiceRequests();
    
    // Set up real-time updates
    const interval = setInterval(loadServiceRequests, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [selectedStatus]);

  const loadServiceRequests = async () => {
    try {
      // Simulate API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock service requests data
      const mockRequests: ServiceRequest[] = [
        {
          id: '1',
          type: 'CALL_STAFF',
          status: 'PENDING',
          priority: 'HIGH',
          description: 'Cần hỗ trợ gọi món thêm',
          table: { id: 't1', name: 'B05', area: 'VIP' },
          customerName: 'Nguyễn Văn A',
          customerPhone: '0123456789',
          createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        },
        {
          id: '2',
          type: 'WATER',
          status: 'IN_PROGRESS',
          priority: 'NORMAL',
          table: { id: 't2', name: 'A12', area: 'Chính' },
          createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
          assignedStaff: { id: 's1', name: 'Trần Thị B' },
        },
        {
          id: '3',
          type: 'BILL',
          status: 'PENDING',
          priority: 'URGENT',
          table: { id: 't3', name: 'C08', area: 'Ngoài trời' },
          customerPhone: '0987654321',
          createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
        },
        {
          id: '4',
          type: 'COMPLAINT',
          status: 'COMPLETED',
          priority: 'HIGH',
          description: 'Món ăn bị lạnh, cần thay thế',
          table: { id: 't4', name: 'B12', area: 'VIP' },
          createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
          resolvedAt: new Date(Date.now() - 15 * 60000).toISOString(),
          staffResponse: 'Đã thay thế món mới và xin lỗi khách hàng',
          assignedStaff: { id: 's2', name: 'Lê Văn C' },
        },
      ];
      
      // Filter by status
      const filteredRequests = mockRequests.filter(req => 
        selectedStatus === 'ALL' || req.status === selectedStatus
      );
      
      setRequests(filteredRequests);
    } catch (error) {
      console.error('❌ Load service requests error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadServiceRequests();
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string, response?: string) => {
    setProcessingRequests(prev => new Set(prev).add(requestId));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: newStatus,
                staffResponse: response,
                resolvedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
                assignedStaff: { id: 'current-staff', name: 'Bạn' }
              }
            : req
        )
      );

      const statusLabel = REQUEST_STATUSES[newStatus as keyof typeof REQUEST_STATUSES]?.label;
      Alert.alert('Thành công', `Yêu cầu đã chuyển sang trạng thái: ${statusLabel}`);
    } catch (error) {
      console.error('❌ Update request status error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái yêu cầu');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleAcceptRequest = (request: ServiceRequest) => {
    Alert.alert(
      'Nhận yêu cầu',
      `Bạn có muốn nhận yêu cầu "${SERVICE_TYPES[request.type as keyof typeof SERVICE_TYPES]?.label}" từ bàn ${request.table.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Nhận', 
          onPress: () => handleUpdateStatus(request.id, 'IN_PROGRESS')
        },
      ]
    );
  };

  const handleCompleteRequest = (request: ServiceRequest) => {
    Alert.prompt(
      'Hoàn thành yêu cầu',
      'Nhập ghi chú (tùy chọn):',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Hoàn thành', 
          onPress: (response) => handleUpdateStatus(request.id, 'COMPLETED', response)
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const statusCounts = {
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    IN_PROGRESS: requests.filter(r => r.status === 'IN_PROGRESS').length,
    COMPLETED: requests.filter(r => r.status === 'COMPLETED').length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8622A" />
          <Text style={styles.loadingText}>Đang tải yêu cầu dịch vụ...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Icon name="refresh-cw" size={20} color="#E8622A" />
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'PENDING', label: 'Chờ xử lý' },
            { key: 'IN_PROGRESS', label: 'Đang xử lý' },
            { key: 'COMPLETED', label: 'Hoàn thành' },
            { key: 'ALL', label: 'Tất cả' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedStatus === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(filter.key)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedStatus === filter.key && styles.filterButtonTextActive,
              ]}>
                {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Requests List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Không có yêu cầu</Text>
            <Text style={styles.emptyMessage}>
              {selectedStatus === 'ALL' 
                ? 'Chưa có yêu cầu dịch vụ nào'
                : `Không có yêu cầu ở trạng thái "${REQUEST_STATUSES[selectedStatus as keyof typeof REQUEST_STATUSES]?.label}"`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.requestsContainer}>
            {requests.map((request) => {
              const serviceType = SERVICE_TYPES[request.type as keyof typeof SERVICE_TYPES];
              const statusInfo = REQUEST_STATUSES[request.status as keyof typeof REQUEST_STATUSES];
              const isProcessing = processingRequests.has(request.id);
              
              return (
                <View key={request.id} style={styles.requestCard}>
                  {/* Request Header */}
                  <View style={styles.requestHeader}>
                    <View style={styles.requestInfo}>
                      <View style={styles.serviceTypeContainer}>
                        <View style={[styles.serviceIcon, { backgroundColor: serviceType.color }]}>
                          <Icon name={serviceType.icon} size={16} color="#fff" />
                        </View>
                        <Text style={styles.serviceTypeText}>{serviceType.label}</Text>
                      </View>
                      
                      <View style={styles.requestMeta}>
                        <View style={styles.tableInfo}>
                          <Icon name="map-pin" size={12} color="#666" />
                          <Text style={styles.tableText}>
                            Bàn {request.table.name} - {request.table.area}
                          </Text>
                        </View>
                        <Text style={styles.requestTime}>{formatTime(request.createdAt)}</Text>
                      </View>
                    </View>

                    <View style={styles.requestStatus}>
                      <View style={[
                        styles.priorityBadge,
                        { backgroundColor: PRIORITY_COLORS[request.priority as keyof typeof PRIORITY_COLORS] }
                      ]}>
                        <Text style={styles.priorityText}>{request.priority}</Text>
                      </View>
                      
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: statusInfo.color }
                      ]}>
                        <Icon name={statusInfo.icon} size={10} color="#fff" />
                        <Text style={styles.statusText}>{statusInfo.label}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Request Details */}
                  {request.description && (
                    <View style={styles.requestDescription}>
                      <Text style={styles.descriptionText}>{request.description}</Text>
                    </View>
                  )}

                  {/* Customer Info */}
                  {(request.customerName || request.customerPhone) && (
                    <View style={styles.customerInfo}>
                      {request.customerName && (
                        <View style={styles.customerRow}>
                          <Icon name="user" size={12} color="#666" />
                          <Text style={styles.customerText}>{request.customerName}</Text>
                        </View>
                      )}
                      {request.customerPhone && (
                        <View style={styles.customerRow}>
                          <Icon name="phone" size={12} color="#666" />
                          <Text style={styles.customerText}>{request.customerPhone}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Staff Response */}
                  {request.staffResponse && (
                    <View style={styles.staffResponse}>
                      <Text style={styles.responseLabel}>Phản hồi:</Text>
                      <Text style={styles.responseText}>{request.staffResponse}</Text>
                      {request.assignedStaff && (
                        <Text style={styles.staffName}>- {request.assignedStaff.name}</Text>
                      )}
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    {request.status === 'PENDING' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleAcceptRequest(request)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Icon name="check" size={14} color="#fff" />
                            <Text style={styles.actionButtonText}>Nhận yêu cầu</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                    
                    {request.status === 'IN_PROGRESS' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.completeButton]}
                        onPress={() => handleCompleteRequest(request)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Icon name="check-circle" size={14} color="#fff" />
                            <Text style={styles.actionButtonText}>Hoàn thành</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
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

  // Filter
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    marginRight: 8,
  },

  filterButtonActive: {
    backgroundColor: '#E8622A',
  },

  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },

  filterButtonTextActive: {
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
  },

  requestsContainer: {
    padding: 16,
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

  serviceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },

  serviceIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  serviceTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  requestMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  tableText: {
    fontSize: 12,
    color: '#666',
  },

  requestTime: {
    fontSize: 12,
    color: '#666',
  },

  requestStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },

  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },

  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },

  // Request Details
  requestDescription: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  customerInfo: {
    marginBottom: 12,
    gap: 4,
  },

  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  customerText: {
    fontSize: 12,
    color: '#666',
  },

  staffResponse: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },

  responseText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },

  staffName: {
    fontSize: 12,
    color: '#2E7D32',
    fontStyle: 'italic',
  },

  // Actions
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },

  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },

  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default ServiceRequestsScreen;