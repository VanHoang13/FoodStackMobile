import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { theme } from '../theme';

type AdminOrdersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminOrders'>;

interface Props {
  navigation: AdminOrdersScreenNavigationProp;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  restaurant: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
}

const AdminOrdersScreen: React.FC<Props> = ({ navigation }) => {
  const [orders] = useState<AdminOrder[]>([
    { id: '1', orderNumber: 'ORD-001', restaurant: 'Mobile Test Restaurant', customer: 'John Doe', total: 125000, status: 'COMPLETED', createdAt: '2026-03-21' },
    { id: '2', orderNumber: 'ORD-002', restaurant: 'Phở Bò Gia Truyền', customer: 'Jane Smith', total: 89000, status: 'PREPARING', createdAt: '2026-03-21' },
    { id: '3', orderNumber: 'ORD-003', restaurant: 'Downtown Branch', customer: 'Mike Johnson', total: 156000, status: 'PAID', createdAt: '2026-03-20' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#27ae60';
      case 'PREPARING': return '#f39c12';
      case 'PAID': return '#3498db';
      case 'CANCELLED': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const renderOrder = ({ item }: { item: AdminOrder }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.restaurant}>{item.restaurant}</Text>
      <Text style={styles.customer}>Khách: {item.customer}</Text>
      <View style={styles.orderFooter}>
        <Text style={styles.total}>{item.total.toLocaleString()}đ</Text>
        <Text style={styles.date}>{item.createdAt}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Quản lý đơn hàng</Text>
        <TouchableOpacity>
          <Icon name="filter" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Tổng đơn hàng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}đ</Text>
          <Text style={styles.statLabel}>Tổng doanh thu</Text>
        </View>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
      />
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  restaurant: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  customer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

export default AdminOrdersScreen;