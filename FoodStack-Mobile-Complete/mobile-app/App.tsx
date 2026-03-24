import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './src/contexts/CartContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}