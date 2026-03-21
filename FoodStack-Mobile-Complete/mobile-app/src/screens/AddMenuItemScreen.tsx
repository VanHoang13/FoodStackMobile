import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { theme } from '../theme';
import { menuItemApi, categoryApi, storage } from '../services/api';

type AddMenuItemScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddMenuItem'>;

interface Props {
  navigation: AddMenuItemScreenNavigationProp;
  route: {
    params?: {
      categoryId?: string;
    };
  };
}

interface Category {
  id: string;
  name: string;
}

const AddMenuItemScreen: React.FC<Props> = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(route.params?.categoryId || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryApi.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error: any) {
      console.error('Error loading categories:', error);
      // Use mock categories if API fails
      setCategories([
        { id: '1', name: 'Món chính' },
        { id: '2', name: 'Đồ uống' },
        { id: '3', name: 'Tráng miệng' },
        { id: '4', name: 'Khai vị' },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để chọn hình ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn hình ảnh');
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên món và giá');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert('Lỗi', 'Giá phải là số dương');
      return;
    }

    try {
      setLoading(true);

      const menuItemData = {
        categoryId: selectedCategoryId,
        name: name.trim(),
        description: description.trim(),
        price: priceNumber,
        available: true,
      };

      console.log('🍽️ Creating menu item:', menuItemData);
      
      // Check if we're actually calling the API
      console.log('📡 Calling menuItemApi.createMenuItem...');
      const response = await menuItemApi.createMenuItem(menuItemData);
      console.log('📡 API Response:', response);

      if (response && response.success) {
        console.log('✅ Menu item created successfully:', response.data);
        
        // Store the new item locally as backup
        try {
          const newItem = {
            id: response.data?.id || Date.now().toString(),
            name: name.trim(),
            description: description.trim(),
            price: priceNumber,
            category: selectedCategoryId,
            available: true,
            image_url: imageUri || null,
            created_at: new Date().toISOString()
          };
          
          // Store in AsyncStorage as backup
          const existingItems = await storage.getItem('temp_menu_items');
          const items = existingItems ? JSON.parse(existingItems) : [];
          items.push(newItem);
          await storage.setItem('temp_menu_items', JSON.stringify(items));
          console.log('💾 Stored item locally as backup');
        } catch (storageError: any) {
          console.error('❌ Error storing item locally:', storageError);
        }
        
        // If image is selected, upload it
        if (imageUri && response.data?.id) {
          try {
            console.log('📸 Uploading image for menu item:', response.data.id);
            const imageFile = {
              uri: imageUri,
              type: 'image/jpeg',
              name: 'menu-item.jpg',
            };
            const imageResponse = await menuItemApi.uploadMenuItemImage(response.data.id, imageFile);
            console.log('📸 Image upload response:', imageResponse);
          } catch (imageError: any) {
            console.error('❌ Error uploading image:', imageError);
            // Don't fail the whole operation if image upload fails
          }
        }

        Alert.alert(
          'Thành công',
          'Đã thêm món ăn mới',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Pass the new item back to MenuManagement
              navigation.navigate('MenuManagement', {
                newItem: {
                  id: response.data?.id || Date.now().toString(),
                  name: name.trim(),
                  description: description.trim(),
                  price: priceNumber,
                  category: selectedCategoryId,
                  available: true,
                  image_url: imageUri || null,
                }
              });
            }
          }]
        );
      } else {
        console.log('❌ API returned failure:', response);
        Alert.alert('Lỗi', response?.message || 'Không thể thêm món ăn');
      }
    } catch (error: any) {
      console.error('❌ Error creating menu item:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      
      // Show more specific error message
      let errorMessage = 'Không thể thêm món ăn. ';
      if (error?.response?.status === 401) {
        errorMessage += 'Vui lòng đăng nhập lại.';
      } else if (error?.response?.status === 403) {
        errorMessage += 'Bạn không có quyền thực hiện thao tác này.';
      } else if (error?.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Vui lòng thử lại.';
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Thêm món ăn</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={styles.saveButton}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          {/* Image Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hình ảnh món ăn</Text>
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="camera" size={32} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>Chọn hình ảnh</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên món ăn *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên món ăn"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả món ăn"
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giá *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Danh mục *</Text>
            {loadingCategories ? (
              <View style={[styles.input, styles.loadingContainer]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Đang tải danh mục...</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategoryId === category.id && styles.categoryChipSelected,
                    ]}
                    onPress={() => setSelectedCategoryId(category.id)}
                    disabled={loading}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategoryId === category.id && styles.categoryChipTextSelected,
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  imageUpload: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
});

export default AddMenuItemScreen;