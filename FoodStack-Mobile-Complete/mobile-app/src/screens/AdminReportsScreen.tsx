import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { theme } from '../theme';

type AdminReportsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminReports'>;

interface Props {
  navigation: AdminReportsScreenNavigationProp;
}

const AdminReportsScreen: React.FC<Props> = ({ navigation }) => {
  const reportCards = [
    { title: 'Báo cáo doanh thu', icon: 'trending-up', color: '#27ae60', description: 'Thống kê doanh thu theo thời gian' },
    { title: 'Báo cáo đơn hàng', icon: 'shopping-bag', color: '#3498db', description: 'Phân tích đơn hàng và xu hướng' },
    { title: 'Báo cáo nhà hàng', icon: 'home', color: '#9b59b6', description: 'Hiệu suất các nhà hàng' },
    { title: 'Báo cáo người dùng', icon: 'users', color: '#f39c12', description: 'Thống kê người dùng và hoạt động' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Báo cáo</Text>
        <TouchableOpacity>
          <Icon name="download" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tổng quan hệ thống</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>1.2M</Text>
              <Text style={styles.summaryLabel}>Tổng doanh thu</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>156</Text>
              <Text style={styles.summaryLabel}>Đơn hàng</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>3</Text>
              <Text style={styles.summaryLabel}>Nhà hàng</Text>
            </View>
          </View>
        </View>

        <View style={styles.reportsGrid}>
          {reportCards.map((report, index) => (
            <TouchableOpacity key={index} style={styles.reportCard}>
              <View style={[styles.reportIcon, { backgroundColor: report.color }]}>
                <Icon name={report.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDescription}>{report.description}</Text>
            </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default AdminReportsScreen;