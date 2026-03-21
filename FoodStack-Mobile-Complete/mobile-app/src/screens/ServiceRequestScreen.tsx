import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

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
}

const SERVICE_TYPES: ServiceType[] = [
  {
    id: 'call_staff',
    title: 'Gọi nhân viên',
    description: 'Yêu cầu nhân viên đến bàn',
    icon: 'user',
    color: '#3498DB',
    urgent: true,
  },
  {
    id: 'water',
    title: 'Thêm nước',
    description: 'Yêu cầu thêm nước uống',
    icon: 'droplet',
    color: '#2ECC71',
  },
  {
    id: 'napkins',
    title: 'Khăn giấy',
    description: 'Yêu cầu thêm khăn giấy',
    icon: 'file-text',
    color: '#F39C12',
  },
  {
    id: 'utensils',
    title: 'Đồ ăn',
    description: 'Yêu cầu thêm đũa, thìa, dĩa',
    icon: 'utensils',
    color: '#9B59B6',
  },
  {
    id: 'bill',
    title: 'Xin bill',
    description: 'Yêu cầu thanh toán',
    icon: 'credit-card',
    color: '#E74C3C',
    urgent: true,
  },
  {
    id: 'clean_table',
    title: 'Dọn bàn',
    description: 'Yêu cầu dọn dẹp bàn',
    icon: 'trash-2',
    color: '#34495E',
  },
  {
    id: 'complaint',
    title: 'Khiếu nại',
    description: 'Phản ánh vấn đề',
    icon: 'alert-triangle',
    color: '#E67E22',
    urgent: true,
  },
  {
    id: 'other',
    title: 'Khác',
    description: 'Yêu cầu khác',
    icon: 'more-horizontal',
    color: '#95A5A6',
  },
];

const ServiceRequestScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tableInfo } = route.params;
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleServiceRequest = async (serviceType: ServiceType) => {
    if (!tableInfo) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin bàn');
      return;
    }

    setLoading(true);
    setSelectedService(serviceType.id);

    try {
      // Simulate API call for service request
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Yêu cầu đã gửi!',
        `${serviceType.title} - Nhân viên sẽ đến bàn trong ít phút`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
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
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Yêu cầu gần đây</Text>
          <View style={styles.recentItem}>
            <View style={styles.recentIcon}>
              <Icon name="droplet" size={16} color="#2ECC71" />
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentText}>Thêm nước</Text>
              <Text style={styles.recentTime}>5 phút trước - Đã hoàn thành</Text>
            </View>
            <View style={styles.recentStatus}>
              <Icon name="check-circle" size={16} color="#2ECC71" />
            </View>
          </View>
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
});

export default ServiceRequestScreen;