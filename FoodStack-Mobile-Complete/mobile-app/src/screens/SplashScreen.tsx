import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    console.log('🔄 SplashScreen: Auth state check');
    console.log('  - isLoading:', isLoading);
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - user role:', user?.role);
    
    const timer = setTimeout(() => {
      if (!isLoading) {
        console.log('🚀 SplashScreen: Navigating...');
        if (isAuthenticated && user) {
          console.log('✅ User authenticated, going to Home');
          navigation.replace('Home');
        } else {
          console.log('❌ User not authenticated, going to Login');
          navigation.replace('Login');
        }
      }
    }, 1500); // Reduced from 2000 to 1500

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, user, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FoodStack</Text>
      <Text style={styles.subtitle}>Mobile App</Text>
      <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;