import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import OwnerStaffApiService from '../services/ownerStaffApiService';

type OwnerStaffAnalyticsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OwnerStaffAnalytics'>;

interface Props {
  navigation: OwnerStaffAnalyticsScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const OwnerStaffAnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load analytics and performance data from API
      const [analytics, performance] = await Promise.all([
        OwnerStaffApiService.getStaffAnalytics({ period: selectedPeriod }),
        OwnerStaffApiService.getStaffPerformance({ period: selectedPeriod })
      ]);
      
      setAnalyticsData(analytics);
      setPerformanceData(performance);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu phân tích. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      
      const report = await OwnerStaffApiService.generateStaffReport({
        type: selectedPeriod === 'TODAY' ? 'DAILY' : selectedPeriod === 'WEEK' ? 'WEEKLY' : 'MONTHLY',
        format: 'JSON'
      });
      
      Alert.alert(
        'Báo cáo đã tạo',
        'Báo cáo hiệu suất nhân viên đã được tạo thành công.',
        [
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Lỗi', 'Không thể tạo báo cáo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'TODAY': return 'Hôm nay';
      case 'WEEK': return 'Tuần này';
      case 'MONTH': return 'Tháng này';
      default: return period;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phân tích Nhân viên</Text>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={handleGenerateReport}
        >
          <Icon name="download" size={20} color="#FF7A30" />
        </TouchableOpacity>
      </View>

      {/* Period Filter */}
      <View style={styles.periodContainer}>
        {(['TODAY', 'WEEK', 'MONTH'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.activePeriodButton,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.activePeriodButtonText,
              ]}
            >
              {getPeriodText(period)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* KPI Overview - 2 trên 2 dưới */}
        {performanceData?.kpis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng quan Hiệu suất</Text>
            
            {/* Hàng trên - 2 KPI đầu */}
            <View style={styles.kpiRow}>
              {performanceData.kpis.slice(0, 2).map((kpi: any) => (
                <View key={kpi.id} style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <View style={[styles.kpiIconBg, { backgroundColor: kpi.color + '15' }]}>
                      <Icon name={kpi.icon} size={14} color={kpi.color} />
                    </View>
                    <View style={[styles.trendChip, { backgroundColor: kpi.color + '10' }]}>
                      <Icon 
                        name={kpi.trend === 'up' ? 'trending-up' : kpi.trend === 'down' ? 'trending-down' : 'minus'} 
                        size={8} 
                        color={kpi.color} 
                      />
                      <Text style={[styles.trendText, { color: kpi.color }]}>
                        {kpi.trendValue > 0 ? '+' : ''}{kpi.trendValue}%
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.kpiValue, { color: kpi.color }]}>
                    {formatNumber(kpi.value)}{kpi.unit}
                  </Text>
                  <Text style={styles.kpiLabel}>{kpi.name}</Text>
                  
                  <View style={styles.kpiProgress}>
                    <View 
                      style={[
                        styles.kpiProgressFill, 
                        { 
                          width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%`,
                          backgroundColor: kpi.color 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.kpiTarget}>
                    Mục tiêu: {formatNumber(kpi.target)}{kpi.unit}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Hàng dưới - 2 KPI cuối */}
            <View style={styles.kpiRow}>
              {performanceData.kpis.slice(2, 4).map((kpi: any) => (
                <View key={kpi.id} style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <View style={[styles.kpiIconBg, { backgroundColor: kpi.color + '15' }]}>
                      <Icon name={kpi.icon} size={14} color={kpi.color} />
                    </View>
                    <View style={[styles.trendChip, { backgroundColor: kpi.color + '10' }]}>
                      <Icon 
                        name={kpi.trend === 'up' ? 'trending-up' : kpi.trend === 'down' ? 'trending-down' : 'minus'} 
                        size={8} 
                        color={kpi.color} 
                      />
                      <Text style={[styles.trendText, { color: kpi.color }]}>
                        {kpi.trendValue > 0 ? '+' : ''}{kpi.trendValue}%
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.kpiValue, { color: kpi.color }]}>
                    {formatNumber(kpi.value)}{kpi.unit}
                  </Text>
                  <Text style={styles.kpiLabel}>{kpi.name}</Text>
                  
                  <View style={styles.kpiProgress}>
                    <View 
                      style={[
                        styles.kpiProgressFill, 
                        { 
                          width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%`,
                          backgroundColor: kpi.color 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.kpiTarget}>
                    Mục tiêu: {formatNumber(kpi.target)}{kpi.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Performance Metrics - Horizontal Cards */}
        {analyticsData?.performance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chỉ số Hiệu suất</Text>
            
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <View style={[styles.metricIconBg, { backgroundColor: '#FF7A30' + '15' }]}>
                  <Icon name="shopping-bag" size={14} color="#FF7A30" />
                </View>
                <Text style={[styles.metricNumber, { color: '#FF7A30' }]}>
                  {formatNumber(analyticsData.performance.ordersProcessed || 0)}
                </Text>
                <Text style={styles.metricText}>Đơn hàng</Text>
              </View>
              
              <View style={styles.metricCard}>
                <View style={[styles.metricIconBg, { backgroundColor: '#27AE60' + '15' }]}>
                  <Icon name="clock" size={14} color="#27AE60" />
                </View>
                <Text style={[styles.metricNumber, { color: '#27AE60' }]}>
                  {analyticsData.performance.averageProcessingTime?.toFixed(1) || '0.0'}m
                </Text>
                <Text style={styles.metricText}>Thời gian TB</Text>
              </View>
              
              <View style={styles.metricCard}>
                <View style={[styles.metricIconBg, { backgroundColor: '#F39C12' + '15' }]}>
                  <Icon name="star" size={14} color="#F39C12" />
                </View>
                <Text style={[styles.metricNumber, { color: '#F39C12' }]}>
                  {analyticsData.performance.customerSatisfaction?.toFixed(1) || '0.0'}/5
                </Text>
                <Text style={styles.metricText}>Hài lòng</Text>
              </View>
              
              <View style={styles.metricCard}>
                <View style={[styles.metricIconBg, { backgroundColor: '#9B59B6' + '15' }]}>
                  <Icon name="trending-up" size={14} color="#9B59B6" />
                </View>
                <Text style={[styles.metricNumber, { color: '#9B59B6' }]}>
                  {analyticsData.performance.efficiency || 0}%
                </Text>
                <Text style={styles.metricText}>Hiệu suất</Text>
              </View>
            </View>
          </View>
        )}

        {/* Two Column Layout - Category Performance & Goals */}
        <View style={styles.section}>
          <View style={styles.twoColumnLayout}>
            {/* Left Column - Category Performance */}
            <View style={styles.columnLeft}>
              <View style={styles.columnHeader}>
                <Icon name="bar-chart" size={16} color="#FF7A30" />
                <Text style={styles.columnTitle}>Hiệu suất Danh mục</Text>
              </View>
              
              {analyticsData?.trends?.categoryPerformance?.slice(0, 3).map((category: any, index: number) => (
                <View key={index} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category.category}</Text>
                    <Text style={styles.categoryOrders}>{formatNumber(category.orders)} đơn</Text>
                  </View>
                  <Text style={styles.categoryRevenue}>
                    {formatCurrency(category.revenue)}
                  </Text>
                  <View style={styles.categoryProgressBar}>
                    <View 
                      style={[
                        styles.categoryProgressFill, 
                        { width: `${Math.min((category.orders / 50) * 100, 100)}%` }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Right Column - Goals Progress */}
            <View style={styles.columnRight}>
              <View style={styles.columnHeader}>
                <Icon name="target" size={16} color="#27AE60" />
                <Text style={styles.columnTitle}>Tiến độ Mục tiêu</Text>
              </View>
              
              {analyticsData?.goals && (
                <>
                  <View style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                      <Icon name="shopping-cart" size={12} color="#FF7A30" />
                      <Text style={styles.goalName}>Đơn hàng</Text>
                    </View>
                    <View style={styles.goalStats}>
                      <Text style={styles.goalCurrent}>
                        {formatNumber(analyticsData.goals.ordersActual)}
                      </Text>
                      <Text style={styles.goalTarget}>
                        /{formatNumber(analyticsData.goals.ordersTarget)}
                      </Text>
                    </View>
                    <View style={styles.goalProgressBar}>
                      <View 
                        style={[
                          styles.goalProgressFill, 
                          { 
                            width: `${Math.min((analyticsData.goals.ordersActual / analyticsData.goals.ordersTarget) * 100, 100)}%`,
                            backgroundColor: '#FF7A30'
                          }
                        ]} 
                      />
                    </View>
                  </View>

                  <View style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                      <Icon name="clock" size={12} color="#27AE60" />
                      <Text style={styles.goalName}>Thời gian</Text>
                    </View>
                    <View style={styles.goalStats}>
                      <Text style={styles.goalCurrent}>
                        {analyticsData.goals.timeActual}m
                      </Text>
                      <Text style={styles.goalTarget}>
                        /{analyticsData.goals.timeTarget}m
                      </Text>
                    </View>
                    <View style={styles.goalProgressBar}>
                      <View 
                        style={[
                          styles.goalProgressFill, 
                          { 
                            width: `${Math.min((analyticsData.goals.timeTarget / analyticsData.goals.timeActual) * 100, 100)}%`,
                            backgroundColor: '#27AE60'
                          }
                        ]} 
                      />
                    </View>
                  </View>

                  <View style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                      <Icon name="star" size={12} color="#F39C12" />
                      <Text style={styles.goalName}>Hài lòng</Text>
                    </View>
                    <View style={styles.goalStats}>
                      <Text style={styles.goalCurrent}>
                        {analyticsData.goals.satisfactionActual}/5
                      </Text>
                      <Text style={styles.goalTarget}>
                        /{analyticsData.goals.satisfactionTarget}/5
                      </Text>
                    </View>
                    <View style={styles.goalProgressBar}>
                      <View 
                        style={[
                          styles.goalProgressFill, 
                          { 
                            width: `${Math.min((analyticsData.goals.satisfactionActual / analyticsData.goals.satisfactionTarget) * 100, 100)}%`,
                            backgroundColor: '#F39C12'
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Ranking & Achievements - Side by Side */}
        {performanceData?.ranking && (
          <View style={styles.section}>
            <View style={styles.twoColumnLayout}>
              {/* Left Column - Ranking */}
              <View style={styles.columnLeft}>
                <View style={styles.columnHeader}>
                  <Icon name="award" size={16} color="#F39C12" />
                  <Text style={styles.columnTitle}>Xếp hạng</Text>
                </View>
                
                <View style={styles.rankingCard}>
                  <View style={styles.rankingBadge}>
                    <Text style={styles.rankingPosition}>#{performanceData.ranking.position}</Text>
                  </View>
                  <Text style={styles.rankingTotal}>
                    / {performanceData.ranking.totalStaff} nhân viên
                  </Text>
                  <Text style={styles.rankingScore}>
                    {formatNumber(performanceData.ranking.score)} điểm
                  </Text>
                  
                  {performanceData.ranking.change !== 0 && (
                    <View style={styles.rankingChange}>
                      <Icon 
                        name={performanceData.ranking.change > 0 ? 'trending-up' : 'trending-down'} 
                        size={12} 
                        color={performanceData.ranking.change > 0 ? '#27AE60' : '#E74C3C'} 
                      />
                      <Text style={[
                        styles.rankingChangeText,
                        { color: performanceData.ranking.change > 0 ? '#27AE60' : '#E74C3C' }
                      ]}>
                        {performanceData.ranking.change > 0 ? '+' : ''}{performanceData.ranking.change}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Right Column - Achievements */}
              <View style={styles.columnRight}>
                <View style={styles.columnHeader}>
                  <Icon name="trophy" size={16} color="#E67E22" />
                  <Text style={styles.columnTitle}>Thành tích</Text>
                </View>
                
                {performanceData.achievements?.slice(0, 2).map((achievement: any) => (
                  <View key={achievement.id} style={styles.achievementCard}>
                    <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '15' }]}>
                      <Icon name={achievement.icon} size={12} color={achievement.color} />
                    </View>
                    <View style={styles.achievementInfo}>
                      <Text style={styles.achievementTitle}>{achievement.title}</Text>
                      <Text style={styles.achievementDesc}>{achievement.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  reportButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Period Filter
  periodContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },

  activePeriodButton: {
    backgroundColor: '#FF7A30',
  },

  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  activePeriodButtonText: {
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
  },

  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  // KPI Layout - 2 trên 2 dưới
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  kpiCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },

  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  kpiIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },

  trendText: {
    fontSize: 8,
    fontWeight: '600',
  },

  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },

  kpiLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 6,
  },

  kpiProgress: {
    height: 3,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 4,
  },

  kpiProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  kpiTarget: {
    fontSize: 8,
    color: '#999',
  },

  // Metrics Row - Horizontal Layout
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },

  metricCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },

  metricIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  metricNumber: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },

  metricText: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },

  // Two Column Layout
  twoColumnLayout: {
    flexDirection: 'row',
    gap: 12,
  },

  columnLeft: {
    flex: 1,
  },

  columnRight: {
    flex: 1,
  },

  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },

  columnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },

  // Category Cards
  categoryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },

  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },

  categoryOrders: {
    fontSize: 9,
    color: '#666',
  },

  categoryRevenue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#27AE60',
    marginBottom: 4,
  },

  categoryProgressBar: {
    height: 3,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },

  categoryProgressFill: {
    height: '100%',
    backgroundColor: '#FF7A30',
    borderRadius: 2,
  },

  // Goal Cards
  goalCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },

  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },

  goalName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },

  goalStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },

  goalCurrent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },

  goalTarget: {
    fontSize: 9,
    color: '#666',
  },

  goalProgressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },

  goalProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Ranking Card
  rankingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },

  rankingBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F39C12' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  rankingPosition: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F39C12',
  },

  rankingTotal: {
    fontSize: 9,
    color: '#666',
    marginBottom: 4,
  },

  rankingScore: {
    fontSize: 10,
    color: '#666',
    marginBottom: 6,
  },

  rankingChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  rankingChangeText: {
    fontSize: 9,
    fontWeight: '600',
  },

  // Achievement Cards
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    gap: 6,
  },

  achievementIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  achievementInfo: {
    flex: 1,
  },

  achievementTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  achievementDesc: {
    fontSize: 8,
    color: '#666',
    lineHeight: 10,
  },
});

export default OwnerStaffAnalyticsScreen;