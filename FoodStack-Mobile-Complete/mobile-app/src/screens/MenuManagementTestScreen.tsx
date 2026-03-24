import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import MenuManagementService, { MenuCategory, MenuItem } from '../services/menuManagementService';

type MenuManagementTestScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MenuManagementTest'>;

interface Props {
  navigation: MenuManagementTestScreenNavigationProp;
}

const MenuManagementTestScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    totalItems: 0,
    availableItems: 0,
    featuredItems: 0,
    avgPrice: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await MenuManagementService.initializeMockData();
      
      const [categoriesData, itemsData, statsData] = await Promise.all([
        MenuManagementService.getCategories(),
        MenuManagementService.getItems(),
        MenuManagementService.getMenuStats()
      ]);
      
      setCategories(categoriesData);
      setItems(itemsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    }
  };

  const testToggleAvailability = async () => {
    if (items.length > 0) {
      const firstItem = items[0];
      try {
        const updatedItem = await MenuManagementService.toggleItemAvailability(firstItem.id);
        if (updatedItem) {
          Alert.alert('Thành công', `Đã thay đổi trạng thái "${firstItem.name}" thành ${updatedItem.is_available ? 'có sẵn' : 'hết hàng'}`);
          loadData(); // Reload data
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể thay đổi trạng thái');
      }
    }
  };

  const testToggleFeatured = async () => {
    if (items.length > 0) {
      const firstItem = items[0];
      try {
        const updatedItem = await MenuManagementService.toggleItemFeatured(firstItem.id);
        if (updatedItem) {
          Alert.alert('Thành công', `Đã thay đổi trạng thái nổi bật "${firstItem.name}" thành ${updatedItem.is_featured ? 'nổi bật' : 'bình thường'}`);
          loadData(); // Reload data
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể thay đổi trạng thái nổi bật');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
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
        <Text style={styles.headerTitle}>Menu Management Test</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalCategories}</Text>
              <Text style={styles.statLabel}>Danh mục</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalItems}</Text>
              <Text style={styles.statLabel}>Tổng món</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.availableItems}</Text>
              <Text style={styles.statLabel}>Có sẵn</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.featuredItems}</Text>
              <Text style={styles.statLabel}>Nổi bật</Text>
            </View>
          </View>
        </View>

        {/* Test Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Actions</Text>
          <TouchableOpacity style={styles.testButton} onPress={testToggleAvailability}>
            <Text style={styles.testButtonText}>Test Toggle Availability</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={testToggleFeatured}>
            <Text style={styles.testButtonText}>Test Toggle Featured</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={() => navigation.navigate('OwnerMenuManagement')}
          >
            <Text style={styles.testButtonText}>Go to Owner Menu Management</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục ({categories.length})</Text>
          {categories.map(category => (
            <View key={category.id} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
          ))}
        </View>

        {/* Items Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Món ăn (5 đầu tiên)</Text>
          {items.slice(0, 5).map(item => (
            <View key={item.id} style={styles.itemPreview}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
              </View>
              <View style={styles.itemStatus}>
                {item.is_featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.badgeText}>Nổi bật</Text>
                  </View>
                )}
                <View style={[
                  styles.availabilityBadge,
                  item.is_available ? styles.available : styles.unavailable
                ]}>
                  <Text style={styles.badgeText}>
                    {item.is_available ? 'Có sẵn' : 'Hết hàng'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E8622A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#E8622A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
  },
  itemPreview: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  itemPrice: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
  },
  itemStatus: {
    alignItems: 'flex-end',
  },
  featuredBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  availabilityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  available: {
    backgroundColor: '#E8F5E8',
  },
  unavailable: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
  },
});

export default MenuManagementTestScreen;