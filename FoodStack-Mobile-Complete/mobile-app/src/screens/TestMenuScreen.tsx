import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type TestMenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TestMenu'>;

interface Props {
  navigation: TestMenuScreenNavigationProp;
}

const TestMenuScreen: React.FC<Props> = ({ navigation }) => {
  
  const testDirectMenu = () => {
    // Create mock table info for testing
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
        logo_url: 'https://via.placeholder.com/200x200?text=Restaurant'
      }
    };

    // Navigate directly to menu
    navigation.navigate('Menu', {
      branchId: 'branch-1',
      tableInfo: mockTableInfo,
      restaurantId: 'restaurant-1'
    });
  };

  const testRestaurantSelection = () => {
    navigation.navigate('RestaurantSelection');
  };

  const testQRScan = () => {
    navigation.navigate('QRScan');
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <Icon name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Menu System</Text>
          <View style={styles.backButton} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Menu System Testing</Text>
        <Text style={styles.subtitle}>
          Test different ways to access the menu system
        </Text>

        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Direct Menu Access</Text>
          <Text style={styles.sectionDescription}>
            Skip QR scan and go directly to menu with mock data
          </Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={testDirectMenu}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.testButtonGradient}
            >
              <Icon name="restaurant" size={20} color="#fff" />
              <Text style={styles.testButtonText}>Test Direct Menu</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Restaurant Selection</Text>
          <Text style={styles.sectionDescription}>
            Test the restaurant selection flow
          </Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={testRestaurantSelection}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.testButtonGradient}
            >
              <Icon name="store" size={20} color="#fff" />
              <Text style={styles.testButtonText}>Test Restaurant Selection</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>QR Code Scan</Text>
          <Text style={styles.sectionDescription}>
            Test the full QR code scanning flow
          </Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={testQRScan}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.testButtonGradient}
            >
              <Icon name="qr-code" size={20} color="#fff" />
              <Text style={styles.testButtonText}>Test QR Scan</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Icon name="info" size={18} color="#FF7A30" />
          <Text style={styles.infoText}>
            Use "Test Direct Menu" to bypass any network or QR scanning issues and test the menu directly.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },

  testSection: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },

  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },

  testButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },

  testButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  testButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  infoBox: {
    backgroundColor: '#FFF5F0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A30',
    marginTop: 16,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default TestMenuScreen;