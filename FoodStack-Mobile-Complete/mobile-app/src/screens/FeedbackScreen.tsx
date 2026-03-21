import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type FeedbackScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Feedback'>;

interface Props {
  navigation: FeedbackScreenNavigationProp;
  route: {
    params: {
      orderId?: string;
      tableInfo?: any;
    };
  };
}

interface FeedbackCategory {
  id: string;
  title: string;
  icon: string;
  rating: number;
}

const FeedbackScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId, tableInfo } = route.params;
  const [overallRating, setOverallRating] = useState(0);
  const [categories, setCategories] = useState<FeedbackCategory[]>([
    { id: 'food_quality', title: 'Chất lượng món ăn', icon: 'utensils', rating: 0 },
    { id: 'service', title: 'Dịch vụ', icon: 'user', rating: 0 },
    { id: 'atmosphere', title: 'Không gian', icon: 'home', rating: 0 },
    { id: 'price', title: 'Giá cả', icon: 'dollar-sign', rating: 0 },
    { id: 'cleanliness', title: 'Vệ sinh', icon: 'shield', rating: 0 },
  ]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRatingPress = (rating: number, categoryId?: string) => {
    if (categoryId) {
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId ? { ...cat, rating } : cat
        )
      );
    } else {
      setOverallRating(rating);
    }
  };

  const renderStars = (rating: number, onPress: (rating: number) => void, size: number = 24) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress(star)}
            style={styles.starButton}
          >
            <Icon
              name={star <= rating ? 'star' : 'star'}
              size={size}
              color={star <= rating ? '#F39C12' : '#E0E0E0'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmitFeedback = async () => {
    if (overallRating === 0) {
      Alert.alert('Thiếu thông tin', 'Vui lòng đánh giá tổng thể');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Cảm ơn bạn!',
        'Đánh giá của bạn đã được gửi thành công. Chúng tôi sẽ cải thiện dịch vụ dựa trên phản hồi của bạn.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Submit feedback error:', error);
      Alert.alert('Lỗi', 'Không thể gửi đánh giá, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Rất tệ';
      case 2: return 'Tệ';
      case 3: return 'Bình thường';
      case 4: return 'Tốt';
      case 5: return 'Xuất sắc';
      default: return 'Chưa đánh giá';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#27AE60';
    if (rating >= 3) return '#F39C12';
    if (rating >= 2) return '#E67E22';
    if (rating >= 1) return '#E74C3C';
    return '#95A5A6';
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
        <Text style={styles.headerTitle}>Đánh giá dịch vụ</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        {tableInfo && (
          <View style={styles.restaurantInfo}>
            <LinearGradient
              colors={['#E8622A', '#D55A1F']}
              style={styles.restaurantInfoGradient}
            >
              <View style={styles.restaurantInfoContent}>
                <Icon name="home" size={20} color="#fff" />
                <View style={styles.restaurantInfoText}>
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

        {/* Overall Rating */}
        <View style={styles.overallContainer}>
          <Text style={styles.overallTitle}>Đánh giá tổng thể</Text>
          <Text style={styles.overallSubtitle}>
            Bạn cảm thấy thế nào về trải nghiệm hôm nay?
          </Text>
          
          <View style={styles.overallRatingContainer}>
            {renderStars(overallRating, (rating) => handleRatingPress(rating), 32)}
            <Text style={[styles.ratingText, { color: getRatingColor(overallRating) }]}>
              {getRatingText(overallRating)}
            </Text>
          </View>
        </View>

        {/* Category Ratings */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.categoriesTitle}>Đánh giá chi tiết</Text>
          
          {categories.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryIconContainer}>
                  <Icon name={category.icon} size={20} color="#E8622A" />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>
              
              <View style={styles.categoryRating}>
                {renderStars(
                  category.rating, 
                  (rating) => handleRatingPress(rating, category.id),
                  20
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Comment Section */}
        <View style={styles.commentContainer}>
          <Text style={styles.commentTitle}>Nhận xét thêm (tùy chọn)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Chia sẻ trải nghiệm của bạn để chúng tôi cải thiện dịch vụ..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        {/* Quick Feedback Options */}
        <View style={styles.quickFeedbackContainer}>
          <Text style={styles.quickFeedbackTitle}>Phản hồi nhanh</Text>
          <View style={styles.quickFeedbackOptions}>
            {[
              '👍 Món ăn ngon',
              '⚡ Phục vụ nhanh',
              '😊 Nhân viên thân thiện',
              '🏠 Không gian đẹp',
              '💰 Giá cả hợp lý',
              '🧹 Sạch sẽ',
            ].map((option, index) => (
              <TouchableOpacity key={index} style={styles.quickOption}>
                <Text style={styles.quickOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmitFeedback}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#ccc', '#999'] : ['#E8622A', '#D55A1F']}
              style={styles.submitButtonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="send" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.submitNote}>
            Đánh giá của bạn sẽ giúp chúng tôi cải thiện chất lượng dịch vụ
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

  // Restaurant Info
  restaurantInfo: {
    marginBottom: 16,
  },

  restaurantInfoGradient: {
    padding: 16,
  },

  restaurantInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  restaurantInfoText: {
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

  // Overall Rating
  overallContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },

  overallTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },

  overallSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  overallRatingContainer: {
    alignItems: 'center',
  },

  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },

  starButton: {
    padding: 4,
  },

  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Categories
  categoriesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },

  categoriesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  categoryRating: {
    // Stars will be positioned here
  },

  // Comment
  commentContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },

  commentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
  },

  // Quick Feedback
  quickFeedbackContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },

  quickFeedbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  quickFeedbackOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  quickOption: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  quickOptionText: {
    fontSize: 12,
    color: '#666',
  },

  // Submit
  submitContainer: {
    padding: 16,
    paddingBottom: 32,
  },

  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    ...theme.shadows.md,
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },

  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  submitNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default FeedbackScreen;