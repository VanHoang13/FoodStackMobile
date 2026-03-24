import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { branchApi } from '../services/api';

type TestMenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TestMenu'>;

interface Props {
  navigation: TestMenuScreenNavigationProp;
}

const TestMenuScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testMenuAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🧪 Testing menu API...');
      const response = await branchApi.getBranchMenu('branch-1');
      console.log('✅ Menu API response:', response);
      setMenuData(response);
    } catch (err) {
      console.error('❌ Menu API error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testMenuAPI();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Test Menu API</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.testButton} onPress={testMenuAPI}>
          <Text style={styles.testButtonText}>Test Menu API</Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E8622A" />
            <Text style={styles.loadingText}>Loading menu...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error:</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {menuData && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>Menu Data:</Text>
            <Text style={styles.dataText}>{JSON.stringify(menuData, null, 2)}</Text>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  backButton: {
    padding: 8,
  },

  backButtonText: {
    fontSize: 16,
    color: '#E8622A',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
  },

  content: {
    flex: 1,
    padding: 16,
  },

  testButton: {
    backgroundColor: '#E8622A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },

  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },

  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c62828',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: '#c62828',
  },

  dataContainer: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
  },

  dataTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 8,
  },

  dataText: {
    fontSize: 12,
    color: '#2e7d32',
    fontFamily: 'monospace',
  },
});

export default TestMenuScreen;