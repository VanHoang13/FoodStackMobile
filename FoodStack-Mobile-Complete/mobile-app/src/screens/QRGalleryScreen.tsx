import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type QRGalleryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QRGallery'>;

interface Props {
  navigation: QRGalleryScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const QR_SIZE = (width - 60) / 2;

const QRGalleryScreen: React.FC<Props> = ({ navigation }) => {
  // Mock QR codes for different purposes
  const qrCodes = [
    {
      id: 'table-qr-1',
      title: 'Bàn B01 - Tầng 1',
      type: 'table',
      data: 'qr-token-table-1',
      description: 'QR code để quét bàn và xem menu',
      color: '#E8622A',
      icon: 'qr',
      action: () => {
        navigation.navigate('QRTest');
      }
    },
    {
      id: 'order-qr-1',
      title: 'Đơn hàng #ORD1234',
      type: 'order',
      data: 'ORDER-ORD1234-order-123',
      description: 'QR code đơn hàng để theo dõi',
      color: '#3498DB',
      icon: 'shopping-bag',
      action: () => {
        navigation.navigate('OrderQR', {
          orderId: 'order-123',
          orderNumber: 'ORD1234',
          tableInfo: {
            name: 'B01',
            area: { name: 'Tầng 1' }
          },
          restaurantName: 'Nhà Hàng Phố Cổ'
        });
      }
    },
    {
      id: 'payment-qr-1',
      title: 'Thanh toán #PAY5678',
      type: 'payment',
      data: 'PAYMENT-PAY5678-207000',
      description: 'QR code thanh toán 207,000đ',
      color: '#27AE60',
      icon: 'credit-card',
      action: () => {
        Alert.alert(
          'QR Thanh toán',
          'Đây là QR code mẫu cho thanh toán\nSố tiền: 207,000đ\nMã: PAY5678',
          [{ text: 'OK' }]
        );
      }
    },
    {
      id: 'feedback-qr-1',
      title: 'Đánh giá dịch vụ',
      type: 'feedback',
      data: 'FEEDBACK-restaurant-1-branch-1',
      description: 'QR code để đánh giá nhà hàng',
      color: '#F39C12',
      icon: 'star',
      action: () => {
        Alert.alert(
          'QR Đánh giá',
          'Đây là QR code mẫu để đánh giá dịch vụ\nNhà hàng: Phố Cổ\nChi nhánh: Hoàn Kiếm',
          [{ text: 'OK' }]
        );
      }
    },
    {
      id: 'loyalty-qr-1',
      title: 'Tích điểm thành viên',
      type: 'loyalty',
      data: 'LOYALTY-customer-123-points',
      description: 'QR code tích điểm khách hàng',
      color: '#9B59B6',
      icon: 'gift',
      action: () => {
        Alert.alert(
          'QR Tích điểm',
          'Đây là QR code mẫu cho tích điểm\nKhách hàng: #123\nĐiểm hiện tại: 1,250',
          [{ text: 'OK' }]
        );
      }
    },
    {
      id: 'wifi-qr-1',
      title: 'WiFi Nhà hàng',
      type: 'wifi',
      data: 'WIFI:T:WPA;S:FoodStack_Guest;P:foodstack2024;H:false;;',
      description: 'QR code kết nối WiFi',
      color: '#1ABC9C',
      icon: 'wifi',
      action: () => {
        Alert.alert(
          'QR WiFi',
          'Đây là QR code mẫu để kết nối WiFi\nTên mạng: FoodStack_Guest\nMật khẩu: foodstack2024',
          [{ text: 'OK' }]
        );
      }
    }
  ];

  const getQRUrl = (data: string, color: string) => {
    const colorHex = color.replace('#', '');
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}&bgcolor=FFFFFF&color=${colorHex}&margin=10`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#FF7A30', '#E8622A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="back" size={20} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Thư viện QR Code</Text>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.description}>
          <Text style={styles.descriptionTitle}>🎯 Các loại QR Code</Text>
          <Text style={styles.descriptionText}>
            Khám phá các loại QR code khác nhau được sử dụng trong hệ thống FoodStack
          </Text>
        </View>

        {/* QR Grid */}
        <View style={styles.qrGrid}>
          {qrCodes.map((qr) => (
            <TouchableOpacity
              key={qr.id}
              style={styles.qrCard}
              onPress={qr.action}
              activeOpacity={0.8}
            >
              <View style={styles.qrCardHeader}>
                <View style={[styles.qrTypeIcon, { backgroundColor: qr.color }]}>
                  <Icon name={qr.icon} size={16} color="#fff" />
                </View>
                <Text style={styles.qrCardTitle}>{qr.title}</Text>
              </View>

              <View style={styles.qrImageContainer}>
                <Image
                  source={{ uri: getQRUrl(qr.data, qr.color) }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
                
                <View style={styles.qrOverlay}>
                  <View style={[styles.qrCorner, styles.qrCornerTopLeft, { borderColor: qr.color }]} />
                  <View style={[styles.qrCorner, styles.qrCornerTopRight, { borderColor: qr.color }]} />
                  <View style={[styles.qrCorner, styles.qrCornerBottomLeft, { borderColor: qr.color }]} />
                  <View style={[styles.qrCorner, styles.qrCornerBottomRight, { borderColor: qr.color }]} />
                </View>
              </View>

              <Text style={styles.qrDescription}>{qr.description}</Text>
              
              <View style={styles.qrData}>
                <Text style={styles.qrDataText} numberOfLines={2}>
                  {qr.data}
                </Text>
              </View>

              <View style={[styles.qrActionButton, { backgroundColor: qr.color }]}>
                <Text style={styles.qrActionText}>Xem chi tiết</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📱 Hướng dẫn sử dụng</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>
              • <Text style={styles.instructionBold}>QR Bàn:</Text> Quét để xem menu và đặt món
            </Text>
            <Text style={styles.instructionItem}>
              • <Text style={styles.instructionBold}>QR Đơn hàng:</Text> Theo dõi trạng thái đơn hàng
            </Text>
            <Text style={styles.instructionItem}>
              • <Text style={styles.instructionBold}>QR Thanh toán:</Text> Thanh toán nhanh chóng
            </Text>
            <Text style={styles.instructionItem}>
              • <Text style={styles.instructionBold}>QR Đánh giá:</Text> Đánh giá dịch vụ nhà hàng
            </Text>
            <Text style={styles.instructionItem}>
              • <Text style={styles.instructionBold}>QR Tích điểm:</Text> Tích lũy điểm thưởng
            </Text>
            <Text style={styles.instructionItem}>
              • <Text style={styles.instructionBold}>QR WiFi:</Text> Kết nối WiFi tự động
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
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

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },

  headerRight: {
    width: 40,
  },

  content: {
    flex: 1,
    padding: 16,
  },

  description: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.sm,
  },

  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },

  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  qrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  qrCard: {
    width: QR_SIZE,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    ...theme.shadows.sm,
  },

  qrCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },

  qrTypeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  qrCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },

  qrImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },

  qrImage: {
    width: QR_SIZE - 40,
    height: QR_SIZE - 40,
    borderRadius: 8,
  },

  qrOverlay: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    bottom: 0,
    pointerEvents: 'none',
  },

  qrCorner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderWidth: 2,
  },

  qrCornerTopLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },

  qrCornerTopRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },

  qrCornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },

  qrCornerBottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  qrDescription: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },

  qrData: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 6,
    marginBottom: 8,
  },

  qrDataText: {
    fontSize: 8,
    color: '#999',
    fontFamily: 'monospace',
    textAlign: 'center',
  },

  qrActionButton: {
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },

  qrActionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  instructions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },

  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  instructionsList: {
    gap: 8,
  },

  instructionItem: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },

  instructionBold: {
    fontWeight: '600',
    color: '#333',
  },
});

export default QRGalleryScreen;