import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import ServiceRequestService, { ServiceRequest } from '../services/serviceRequestService';

type ServiceRequestScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceRequest'>;

interface Props {
  navigation: ServiceRequestScreenNavigationProp;
  route: {
    params: {
      tableInfo?: any;
    };
  };
}

interface ServiceType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  urgent?: boolean;
  type: ServiceRequest['type'];
  priority: ServiceRequest['priority'];
}

const SERVICE_TYPES: ServiceType[] = [
  {
    id: 'call_staff',
    title: 'Gọi nhân viên',
    description: 'Yêu cầu nhân viên đến bàn',
    icon: 'user',
    color: '#3498DB',
    urgent: true,
    type: 'ASSISTANCE',
    priority: 'HIGH',
  },
  {
    id: 'water',
    title: 'Thêm nước',
    description: 'Yêu cầu thêm nước uống',
    icon: 'droplet',
    color: '#2ECC71',
    type: 'WATER',
    priority: 'NORMAL',
  },
  {
    id: 'napkins',
    title: 'Khăn giấy',
    description: 'Yêu cầu thêm khăn giấy',
    icon: 'file-text',
    color: '#F39C12',
    type: 'OTHER',
    priority: 'LOW',
  },
  {
    id: 'utensils',
    title: 'Đồ ăn',
    description: 'Yêu cầu thêm đũa, thìa, dĩa',
    icon: 'utensils',
    color: '#9B59B6',
    type: 'OTHER',
    priority: 'NORMAL',
  },
  {
    id: 'bill',
    title: 'Xin bill',
    description: 'Yêu cầu thanh toán',
    icon: 'credit-card',
    color: '#E74C3C',
    urgent: true,
    type: 'BILL',
    priority: 'HIGH',
  },
  {
    id: 'clean_table',
    title: 'Dọn bàn',
    description: 'Yêu cầu dọn dẹp bàn',
    icon: 'trash-2',
    color: '#34495E',
    type: 'CLEAN',
    priority: 'NORMAL',
  },
  {
    id: 'complaint',
    title: 'Khiếu nại',
    description: 'Phản ánh vấn đề',
    icon: 'alert-triangle',
    color: '#E67E22',
    urgent: true,
    type: 'COMPLAINT',
    priority: 'URGENT',
  },
  {
    id: 'other',
    title: 'Khác',
    description: 'Yêu cầu khác',
    icon: 'more-horizontal',
    color: '#95A5A6',
    type: 'OTHER',
    priority: 'NORMAL',
  },
];

const ServiceRequestScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tableInfo } = route.params;
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([]);
  const [showCustomMessage, setShowCustomMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    loadRecentRequests();
  }, []);

  const loadRecentRequests = async () => {
    try {
      const requests = await ServiceRequestService.getServiceRequests();
      // Show only recent requests from this table (mock filter)
      const tableRequests = requests
        .filter(req => req.table === tableInfo?.table?.name)
        .slice(0, 3);
      setRecentRequests(tableRequests);
    } catch (error) {
      console.error('Error loading recent requests:', error);
    }
  };

  const handleServiceRequest = async (serviceType: ServiceType) => {
    if (!tableInfo) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin bàn');
      return;
    }

    // Show custom message input for certain types
    if (serviceType.id === 'complaint' || serviceType.id === 'other') {
      setSelectedService(serviceType.id);
      setShowCustomMessage(true);
      return;
    }

    await submitServiceRequest(serviceType, '');
  };

  const submitServiceRequest = async (serviceType: ServiceType, message?: string) => {
    setLoading(true);

    try {
      const request = await ServiceRequestService.createServiceRequest({
        table: tableInfo?.table?.name || 'B01', // Fallback table name
        customerName: 'Khách hàng', // In real app, get from auth context
        type: serviceType.type,
        priority: serviceType.priority,
        message: message || serviceType.description,
        customerPhone: '0901234567', // In real app, get from auth context
        branchId: tableInfo?.branch?.id || 'branch_1',
        restaurantId: tableInfo?.restaurant?.id || tableInfo?.branch?.restaurant?.id || 'restaurant_1',
      });

      Alert.alert(
        'Yêu cầu đã gửi!',
        `${serviceType.title} - Nhân viên sẽ đến bàn trong ít phút`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowCustomMessage(false);
              setCustomMessage('');
              loadRecentRequests(); // Refresh recent requests
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Service request error:', error);
      Alert.alert(
        'Lỗi',
        'Không thể gửi yêu cầu, vui lòng thử lại'
      );
    } finally {
      setLoading(false);
      setSelectedService(null);
    }
  };

  const handleCustomMessageSubmit = () => {
    const serviceType = SERVICE_TYPES.find(s => s.id === selectedService);
    if (serviceType && customMessage.trim()) {
      submitServiceRequest(serviceType, customMessage.trim());
    } else {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung yêu cầu');
    }
  };

  const getRequestStatusText = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'COMPLETED': return 'Đã hoàn thành';
      default: return status;
    }
  };

  const getRequestStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'PENDING': return '#F39C12';
      case 'IN_PROGRESS': return '#3498DB';
      case 'COMPLETED': return '#2ECC71';
      default: return '#95A5A6';
    }
  };

  const formatTimeAgo = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    return time.toLocaleDateString('vi-VN');
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
        <Text style={styles.headerTitle}>Yêu cầu dịch vụ</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Table Info */}
        {tableInfo && (
          <View style={styles.tableInfo}>
            <LinearGradient
              colors={['#E8622A', '#D55A1F']}
              style={styles.tableInfoGradient}
            >
              <View style={styles.tableInfoContent}>
                <Icon name="map-pin" size={20} color="#fff" />
                <View style={styles.tableInfoText}>
                  <Text style={styles.restaurantName}>
                    {tableInfo.restaurant?.name || tableInfo.branch?.restaurant?.name}
                  </Text>
                  <Text style={styles.tableDetails}>
                    Bàn {tableInfo.table?.name} - {tableInfo.table?.area?.name || 'Khu vực chính'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Chọn dịch vụ cần hỗ trợ</Text>
          <Text style={styles.instructionsText}>
            Nhân viên sẽ nhận được thông báo và đến bàn của bạn trong thời gian sớm nhất
          </Text>
        </View>

        {/* Service Options */}
        <View style={styles.servicesContainer}>
          {SERVICE_TYPES.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                service.urgent && styles.serviceCardUrgent,
              ]}
              onPress={() => handleServiceRequest(service)}
              disabled={loading}
            >
              <View style={styles.serviceCardContent}>
                <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
                  {loading && selectedService === service.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Icon name={service.icon} size={24} color="#fff" />
                  )}
                </View>
                
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>

                {service.urgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>Ưu tiên</Text>
                  </View>
                )}

                <Icon name="chevron-right" size={20} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencyContainer}>
          <Text style={styles.emergencyTitle}>Trường hợp khẩn cấp</Text>
          <TouchableOpacity style={styles.emergencyButton}>
            <LinearGradient
              colors={['#E74C3C', '#C0392B']}
              style={styles.emergencyButtonGradient}
            >
              <Icon name="phone" size={20} color="#fff" />
              <Text style={styles.emergencyButtonText}>Gọi trực tiếp: 0123 456 789</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Requests */}
        {recentRequests.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.recentTitle}>Yêu cầu gần đây</Text>
            {recentRequests.map((request) => (
              <View key={request.id} style={styles.recentItem}>
                <View style={styles.recentIcon}>
                  <Icon 
                    name={SERVICE_TYPES.find(s => s.type === request.type)?.icon || 'bell'} 
                    size={16} 
                    color={getRequestStatusColor(request.status)} 
                  />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentText}>
                    {SERVICE_TYPES.find(s => s.type === request.type)?.title || request.type}
                  </Text>
                  <Text style={styles.recentTime}>
                    {formatTimeAgo(request.requestTime)} - {getRequestStatusText(request.status)}
                  </Text>
                  {request.message && (
                    <Text style={styles.recentMessage}>{request.message}</Text>
                  )}
                </View>
                <View style={styles.recentStatus}>
                  <Icon 
                    name={request.status === 'COMPLETED' ? 'check-circle' : 
                          request.status === 'IN_PROGRESS' ? 'clock' : 'alert-circle'} 
                    size={16} 
                    color={getRequestStatusColor(request.status)} 
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Custom Message Modal */}
        {showCustomMessage && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {SERVICE_TYPES.find(s => s.id === selectedService)?.title}
              </Text>
              <Text style={styles.modalSubtitle}>
                Vui lòng mô tả chi tiết yêu cầu của bạn:
              </Text>
              
              <TextInput
                style={styles.messageInput}
                placeholder="Nhập nội dung yêu cầu..."
                value={customMessage}
                onChangeText={setCustomMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowCustomMessage(false);
                    setCustomMessage('');
                    setSelectedService(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleCustomMessageSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
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

  headerRight: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
  },

  // Table Info
  tableInfo: {
    marginBottom: 16,
  },

  tableInfoGradient: {
    padding: 16,
  },

  tableInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  tableInfoText: {
    flex: 1,
  },

  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },

  tableDetails: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  // Instructions
  instructionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },

  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },

  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Services
  servicesContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },

  serviceCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  serviceCardUrgent: {
    backgroundColor: '#FFF9F5',
  },

  serviceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },

  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  serviceInfo: {
    flex: 1,
  },

  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  serviceDescription: {
    fontSize: 14,
    color: '#666',
  },

  urgentBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  urgentText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },

  // Emergency
  emergencyContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },

  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  emergencyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  emergencyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },

  emergencyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Recent Requests
  recentContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 32,
  },

  recentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  recentInfo: {
    flex: 1,
  },

  recentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  recentTime: {
    fontSize: 12,
    color: '#666',
  },

  recentStatus: {
    // Empty for now
  },

  recentMessage: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },

  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButton: {
    backgroundColor: '#f0f0f0',
  },

  submitButton: {
    backgroundColor: '#E8622A',
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ServiceRequestScreen;