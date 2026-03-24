import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';

type SimpleMenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SimpleMenu'>;

interface Props {
  navigation: SimpleMenuScreenNavigationProp;
}

// Mock menu data - không có API calls, không có useEffect
const MOCK_MENU = {
  categories: [
    {
      id: 'cat-1',
      name: 'Món chính',
      menu_items: [
        {
          id: 'item-1',
          name: 'Phở Bò Tái',
          description: 'Phở bò tái truyền thống với nước dùng đậm đà',
          price: 85000,
          image_url: 'https://via.placeholder.com/300x200?text=Pho+Bo',
        },
        {
          id: 'item-2',
          name: 'Cơm Gà Nướng',
          description: 'Cơm gà nướng thơm ngon với nước mắm pha',
          price: 95000,
          image_url: 'https://via.placeholder.com/300x200?text=Com+Ga',
        }
      ]
    },
    {
      id: 'cat-2',
      name: 'Đồ uống',
      menu_items: [
        {
          id: 'item-3',
          name: 'Trà Đá',
          description: 'Trà đá truyền thống',
          price: 15000,
          image_url: 'https://via.placeholder.com/300x200?text=Tra+Da',
        },
        {
          id: 'item-4',
          name: 'Nước Cam',
          description: 'Nước cam tươi vắt',
          price: 25000,
          image_url: 'https://via.placeholder.com/300x200?text=Nuoc+Cam',
        }
      ]
    }
  ]
};

const SimpleMenuScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('cat-1');

  const currentCategory = MOCK_MENU.categories.find(cat => cat.id === selectedCategory);

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
        
        <Text style={styles.headerTitle}>Simple Menu</Text>
        
        <View style={styles.headerRight} />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {MOCK_MENU.categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {currentCategory?.menu_items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
              console.log('Item pressed:', item.name);
              // navigation.navigate('FoodDetail', { menuItem: item });
            }}
            activeOpacity={0.8}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.menuItemDescription}>
                    {item.description}
                  </Text>
                )}
                <Text style={styles.menuItemPrice}>
                  {item.price.toLocaleString('vi-VN')}đ
                </Text>
              </View>
              
              <View style={styles.menuItemImagePlaceholder}>
                <Icon name="image" size={24} color="#ccc" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Header styles
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
  
  // Categories styles
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  
  selectedCategoryButton: {
    backgroundColor: '#E8622A',
  },
  
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  selectedCategoryText: {
    color: '#fff',
  },
  
  // Menu styles
  menuContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  menuItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  menuItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  
  menuItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8622A',
  },
  
  menuItemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SimpleMenuScreen;