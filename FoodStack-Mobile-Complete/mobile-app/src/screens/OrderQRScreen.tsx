import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type OrderQRScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderQR'>;

interface Props {
  navigation: OrderQRScreenNavigationProp;
  route: {
    params: {
      orderId: string;
      orderNumber: string;
      tableInfo?: {
        name: string;
        area: { name: string };
      };
      restaurantName?: string;
    };
  };
}

const { width } = Dimensions.get('window');
const QR_SIZE = Math.min(width - 80, 300);

const OrderQRScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId, orderNumber, tableInfo, restaurantName } = route.params;

  const qrData = `ORDER-${orderNumber}-${orderId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}&bgcolor=FFFFFF&color=000000&margin=20`;

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Đơn hàng #${orderNumber}\nMã QR: ${qrData}\nNhà hàng: ${restaurantName || 'FoodStack'}\nBàn: ${tableInfo?.name || 'N/A'}`,
        title: `Đơn hàng #${orderNumber}`,
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Thành công', 'Đã chia sẻ QR code đơn hàng');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chia sẻ QR code');
    }
  };

  const handleSaveImage = () => {
    // Mock save functionality
    Alert.alert(
      'Lưu QR Code',
      'Chức năng lưu ảnh sẽ được triển khai trong phiên bản tiếp theo.\n\nBạn có thể chụp màn hình để lưu QR code.',
      [
        { text: 'Đóng', style: 'cancel' },
        { text: 'Chụp màn hình', onPress: () => {
          Alert.alert('Hướng dẫn', 'Nhấn nút Home + Power để chụp màn hình');
        }}
      ]
    );
  };

  const handleCopyData = () => {
    // Mock copy functionality
    Alert.alert(
      'Đã sao chép',
      `Mã đơn hàng đã được sao chép: ${qrData}`,
      [{ text: 'OK' }]
    );
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
        
        <Text style={styles.headerTitle}>QR Code Đơn Hàng</Text>
        
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Icon name="share" size={20} color="#E8622A" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Order Info */}
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{orderNumber}</Text>
          <Text style={styles.orderDescription}>
            Hiển thị mã này cho nhân viên khi cần hỗ trợ
          </Text>
          
          {tableInfo && (
            <View style={styles.tableInfo}>
              <Icon name="map-pin" size={14} color="#666" />
              <Text style={styles.tableInfoText}>
                Bàn {tableInfo.name} - {tableInfo.area.name}
              </Text>
            </View>
          )}
          
          {restaurantName && (
            <View style={styles.restaurantInfo}>
              <Icon name="home" size={14} color="#666" />
              <Text style={styles.restaurantInfoText}>{restaurantName}</Text>
            </View>
          )}
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <Image
              source={{ uri: qrUrl }}
              style={[styles.qrImage, { width: QR_SIZE, height: QR_SIZE }]}
              resizeMode="contain"
            />
            
            <View style={styles.qrOverlay}>
              <View style={styles.qrCorner} style={[styles.qrCorner, styles.qrCornerTopLeft]} />
              <View style={styles.qrCorner} style={[styles.qrCorner, styles.qrCornerTopRight]} />
              <View style={styles.qrCorner} style={[styles.qrCorner, styles.qrCornerBottomLeft]} />
              <View style={styles.qrCorner} style={[styles.qrCorner, styles.qrCornerBottomRight]} />
            </View>
          </View>
          
          <Text style={styles.qrDataText}>{qrData}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>💡 Cách sử dụng</Text>
          <Text style={styles.instructionsText}>
            • Hiển thị QR code này cho nhân viên khi cần hỗ trợ{'\n'}
            • Nhân viên có thể quét mã để xem chi tiết đơn hàng{'\n'}
            • Lưu ảnh hoặc chụp màn hình để sử dụng sau{'\n'}
            • Chia sẻ với bạn bè nếu cần thiết
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSaveImage}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#27AE60', '#2ECC71']}
              style={styles.actionButtonGradient}
            >
              <Icon name="download" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Lưu ảnh</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCopyData}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3498DB', '#2980B9']}
              style={styles.actionButtonGradient}
            >
              <Icon name="copy" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Sao chép mã</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            QR Code được tạo tự động cho đơn hàng của bạn
          </Text>
          <Text style={styles.footerSubtext}>
            Mã này có thể được sử dụng để theo dõi và hỗ trợ đơn hàng
          </Text>
        </View>
      </View>
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

  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },

  orderInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },

  orderNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#E8622A',
    marginBottom: 8,
  },

  orderDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },

  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },

  tableInfoText: {
    fontSize: 12,
    color: '#666',
  },

  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  restaurantInfoText: {
    fontSize: 12,
    color: '#666',
  },

  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },

  qrWrapper: {
    position: 'relative',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    ...theme.shadows.lg,
    marginBottom: 16,
  },

  qrImage: {
    borderRadius: 8,
  },

  qrOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    pointerEvents: 'none',
  },

  qrCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#E8622A',
    borderWidth: 3,
  },

  qrCornerTopLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },

  qrCornerTopRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },

  qrCornerBottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },

  qrCornerBottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  qrDataText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  instructions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },

  instructionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },

  instructionsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },

  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },

  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },

  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },

  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },

  footerSubtext: {
    fontSize: 10,
    color: '#ccc',
    textAlign: 'center',
  },
});

export default OrderQRScreen;