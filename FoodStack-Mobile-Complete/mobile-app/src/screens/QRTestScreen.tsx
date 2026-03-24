import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { publicApi } from '../services/api';

type QRTestScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QRTest'>;

interface Props {
  navigation: QRTestScreenNavigationProp;
}

const QRTestScreen: React.FC<Props> = ({ navigation }) => {
  const testQRTokens = [
    {
      id: 'qr-token-table-1',
      name: 'Bàn B01 (4 chỗ)',
      description: 'Tầng 1 - Chi nhánh Hoàn Kiếm',
      qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=qr-token-table-1'
    },
    {
      id: 'qr-token-table-2',
      name: 'Bàn B02 (2 chỗ)',
      description: 'Tầng 1 - Chi nhánh Hoàn Kiếm',
      qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=qr-token-table-2'
    },
    {
      id: 'qr-token-table-3',
      name: 'Bàn B03 (6 chỗ)',
      description: 'Tầng 1 - Chi nhánh Hoàn Kiếm',
      qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=qr-token-table-3'
    }
  ];

  const handleTestQR = async (qrToken: string, tableName: string) => {
    try {
      console.log('🧪 Testing QR token:', qrToken);
      
      const response = await publicApi.scanQR(qrToken);
      
      if (response.success && response.data) {
        Alert.alert(
          'QR Test Thành Công!',
          `Bàn: ${response.data.table.name}\nNhà hàng: ${response.data.restaurant.name}\nChi nhánh: ${response.data.branch.name}`,
          [
            { text: 'OK', style: 'default' },
            {
              text: 'Tiếp tục đặt món',
              style: 'default',
              onPress: () => {
                navigation.navigate('Menu', {
                  tableInfo: response.data,
                  sessionToken: `session-${Date.now()}`,
                  branchId: response.data.branch.id
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', 'Không thể quét QR code');
      }
    } catch (error) {
      console.error('QR test error:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server');
    }
  };

  const handleDirectMenu = () => {
    // Navigate directly to menu with mock data
    const mockTableInfo = {
      table: {
        id: 'table-1',
        name: 'B01',
        capacity: 4,
        status: 'AVAILABLE'
      },
      branch: {
        id: 'branch-1',
        name: 'Chi nhánh Hoàn Kiếm',
        address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
        phone: '0901234567'
      },
      restaurant: {
        id: 'restaurant-1',
        name: 'Nhà Hàng Phố Cổ',
        logo_url: 'https://via.placeholder.com/200x200?text=Pho+Co'
      }
    };

    navigation.navigate('Menu', {
      tableInfo: mockTableInfo,
      sessionToken: `session-${Date.now()}`,
      branchId: 'branch-1'
    });
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
          
          <Text style={styles.headerTitle}>QR Code Test</Text>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>🧪 Hướng dẫn test</Text>
          <Text style={styles.instructionsText}>
            1. Nhấn vào QR code để test API{'\n'}
            2. Hoặc nhấn "Vào Menu Trực Tiếp" để bỏ qua QR{'\n'}
            3. Kiểm tra xem menu có load được không
          </Text>
        </View>

        {/* Direct Menu Button */}
        <TouchableOpacity
          style={styles.directMenuButton}
          onPress={handleDirectMenu}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4CAF50', '#388E3C']}
            style={styles.directMenuGradient}
          >
            <Icon name="menu" size={24} color="#fff" />
            <Text style={styles.directMenuText}>Vào Menu Trực Tiếp</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* QR Codes */}
        <Text style={styles.sectionTitle}>QR Codes Test</Text>
        
        {testQRTokens.map((qr) => (
          <TouchableOpacity
            key={qr.id}
            style={styles.qrCard}
            onPress={() => handleTestQR(qr.id, qr.name)}
            activeOpacity={0.8}
          >
            <View style={styles.qrCardContent}>
              <Image
                source={{ uri: qr.qrUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
              
              <View style={styles.qrInfo}>
                <Text style={styles.qrName}>{qr.name}</Text>
                <Text style={styles.qrDescription}>{qr.description}</Text>
                <Text style={styles.qrToken}>Token: {qr.id}</Text>
              </View>
            </View>
            
            <View style={styles.testButton}>
              <Text style={styles.testButtonText}>Test QR</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Debug Info */}
        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>🔧 Debug Info</Text>
          <Text style={styles.debugText}>
            • Backend: 192.168.1.99:3000{'\n'}
            • API có fallback mock data{'\n'}
            • Menu sẽ hiển thị ngay cả khi backend offline{'\n'}
            • QR tokens sẽ trả về mock data nếu cần
          </Text>
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
  
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
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
  
  directMenuButton: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  
  directMenuGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  
  directMenuText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 16,
  },
  
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  
  qrCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  qrImage: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  
  qrInfo: {
    flex: 1,
  },
  
  qrName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  
  qrDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  qrToken: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  
  testButton: {
    backgroundColor: '#E8622A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-end',
  },
  
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  
  debugCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  
  debugTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 8,
  },
  
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});

export default QRTestScreen;