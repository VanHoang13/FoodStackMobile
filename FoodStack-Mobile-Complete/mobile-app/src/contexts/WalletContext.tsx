import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  color: string;
  icon: string;
}

export interface WalletState {
  balance: number;
  loyaltyPoints: number;
  currentTier: LoyaltyTier;
  transactions: Transaction[];
  loading: boolean;
}

export interface Transaction {
  id: string;
  type: 'PAYMENT' | 'REFUND' | 'TOP_UP' | 'LOYALTY_REWARD';
  amount: number;
  description: string;
  timestamp: string;
  orderId?: string;
  loyaltyPointsEarned?: number;
}

type WalletAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BALANCE'; payload: number }
  | { type: 'SET_LOYALTY_POINTS'; payload: number }
  | { type: 'SET_TIER'; payload: LoyaltyTier }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'PROCESS_PAYMENT'; payload: { amount: number; orderId: string; description: string } }
  | { type: 'ADD_LOYALTY_POINTS'; payload: { points: number; orderId: string } }
  | { type: 'LOAD_WALLET_DATA'; payload: { balance: number; loyaltyPoints: number; transactions: Transaction[] } };

// Loyalty tiers configuration
const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Đồng',
    minPoints: 0,
    maxPoints: 999,
    benefits: ['Tích điểm cơ bản', 'Ưu đãi sinh nhật'],
    color: '#CD7F32',
    icon: 'award'
  },
  {
    id: 'silver',
    name: 'Bạc',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: ['Tích điểm x1.2', 'Ưu đãi sinh nhật', 'Giảm giá 5%'],
    color: '#C0C0C0',
    icon: 'star'
  },
  {
    id: 'gold',
    name: 'Vàng',
    minPoints: 5000,
    maxPoints: 14999,
    benefits: ['Tích điểm x1.5', 'Ưu đãi sinh nhật', 'Giảm giá 10%', 'Ưu tiên phục vụ'],
    color: '#FFD700',
    icon: 'crown'
  },
  {
    id: 'platinum',
    name: 'Bạch Kim',
    minPoints: 15000,
    maxPoints: 49999,
    benefits: ['Tích điểm x2', 'Ưu đãi sinh nhật', 'Giảm giá 15%', 'Ưu tiên phục vụ', 'Món ăn miễn phí'],
    color: '#E5E4E2',
    icon: 'gem'
  },
  {
    id: 'diamond',
    name: 'Kim Cương',
    minPoints: 50000,
    maxPoints: Infinity,
    benefits: ['Tích điểm x3', 'Ưu đãi sinh nhật', 'Giảm giá 20%', 'Ưu tiên phục vụ', 'Món ăn miễn phí', 'Phòng VIP'],
    color: '#B9F2FF',
    icon: 'diamond'
  }
];

const initialState: WalletState = {
  balance: 500000, // Mock initial balance: 500,000đ
  loyaltyPoints: 1250, // Mock initial points
  currentTier: LOYALTY_TIERS[1], // Silver tier
  transactions: [],
  loading: false,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_BALANCE':
      return { ...state, balance: action.payload };

    case 'SET_LOYALTY_POINTS': {
      const newPoints = action.payload;
      const newTier = getTierByPoints(newPoints);
      return { 
        ...state, 
        loyaltyPoints: newPoints,
        currentTier: newTier
      };
    }

    case 'SET_TIER':
      return { ...state, currentTier: action.payload };

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions].slice(0, 50) // Keep last 50 transactions
      };

    case 'PROCESS_PAYMENT': {
      const { amount, orderId, description } = action.payload;
      const newBalance = Math.max(0, state.balance - amount);
      
      const transaction: Transaction = {
        id: `txn-${Date.now()}`,
        type: 'PAYMENT',
        amount: -amount,
        description,
        timestamp: new Date().toISOString(),
        orderId
      };

      return {
        ...state,
        balance: newBalance,
        transactions: [transaction, ...state.transactions].slice(0, 50)
      };
    }

    case 'ADD_LOYALTY_POINTS': {
      const { points, orderId } = action.payload;
      const newPoints = state.loyaltyPoints + points;
      const newTier = getTierByPoints(newPoints);
      
      const transaction: Transaction = {
        id: `loyalty-${Date.now()}`,
        type: 'LOYALTY_REWARD',
        amount: 0,
        description: `Tích điểm từ đơn hàng`,
        timestamp: new Date().toISOString(),
        orderId,
        loyaltyPointsEarned: points
      };

      return {
        ...state,
        loyaltyPoints: newPoints,
        currentTier: newTier,
        transactions: [transaction, ...state.transactions].slice(0, 50)
      };
    }

    case 'LOAD_WALLET_DATA':
      const { balance, loyaltyPoints, transactions } = action.payload;
      return {
        ...state,
        balance,
        loyaltyPoints,
        currentTier: getTierByPoints(loyaltyPoints),
        transactions,
        loading: false
      };

    default:
      return state;
  }
}

function getTierByPoints(points: number): LoyaltyTier {
  return LOYALTY_TIERS.find(tier => points >= tier.minPoints && points <= tier.maxPoints) || LOYALTY_TIERS[0];
}

interface WalletContextType extends WalletState {
  processPayment: (amount: number, orderId: string, description: string) => Promise<boolean>;
  addLoyaltyPoints: (amount: number, orderId: string) => void;
  topUpWallet: (amount: number) => void;
  getNextTier: () => LoyaltyTier | null;
  getPointsToNextTier: () => number;
  getTierProgress: () => number;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Load wallet data on mount
  useEffect(() => {
    loadWalletData();
  }, []);

  // Save wallet data whenever state changes
  useEffect(() => {
    saveWalletData();
  }, [state.balance, state.loyaltyPoints, state.transactions]);

  const loadWalletData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const walletData = await AsyncStorage.getItem('wallet_data');
      if (walletData) {
        const parsed = JSON.parse(walletData);
        dispatch({ 
          type: 'LOAD_WALLET_DATA', 
          payload: {
            balance: parsed.balance || initialState.balance,
            loyaltyPoints: parsed.loyaltyPoints || initialState.loyaltyPoints,
            transactions: parsed.transactions || []
          }
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveWalletData = async () => {
    try {
      const walletData = {
        balance: state.balance,
        loyaltyPoints: state.loyaltyPoints,
        transactions: state.transactions
      };
      await AsyncStorage.setItem('wallet_data', JSON.stringify(walletData));
    } catch (error) {
      console.error('Error saving wallet data:', error);
    }
  };

  const processPayment = useCallback(async (amount: number, orderId: string, description: string): Promise<boolean> => {
    if (state.balance < amount) {
      return false; // Insufficient balance
    }

    dispatch({ 
      type: 'PROCESS_PAYMENT', 
      payload: { amount, orderId, description } 
    });

    // Calculate loyalty points (1 point per 1000đ)
    const loyaltyPoints = Math.floor(amount / 1000);
    if (loyaltyPoints > 0) {
      dispatch({ 
        type: 'ADD_LOYALTY_POINTS', 
        payload: { points: loyaltyPoints, orderId } 
      });
    }

    return true;
  }, [state.balance]);

  const addLoyaltyPoints = useCallback((amount: number, orderId: string) => {
    const points = Math.floor(amount / 1000);
    if (points > 0) {
      dispatch({ 
        type: 'ADD_LOYALTY_POINTS', 
        payload: { points, orderId } 
      });
    }
  }, []);

  const topUpWallet = useCallback((amount: number) => {
    const transaction: Transaction = {
      id: `topup-${Date.now()}`,
      type: 'TOP_UP',
      amount,
      description: 'Nạp tiền vào ví',
      timestamp: new Date().toISOString()
    };

    dispatch({ type: 'SET_BALANCE', payload: state.balance + amount });
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  }, [state.balance]);

  const getNextTier = useCallback((): LoyaltyTier | null => {
    const currentTierIndex = LOYALTY_TIERS.findIndex(tier => tier.id === state.currentTier.id);
    return currentTierIndex < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[currentTierIndex + 1] : null;
  }, [state.currentTier]);

  const getPointsToNextTier = useCallback((): number => {
    const nextTier = getNextTier();
    return nextTier ? nextTier.minPoints - state.loyaltyPoints : 0;
  }, [state.loyaltyPoints, getNextTier]);

  const getTierProgress = useCallback((): number => {
    const currentTier = state.currentTier;
    const progress = (state.loyaltyPoints - currentTier.minPoints) / (currentTier.maxPoints - currentTier.minPoints);
    return Math.min(Math.max(progress, 0), 1);
  }, [state.loyaltyPoints, state.currentTier]);

  const refreshWallet = useCallback(async () => {
    await loadWalletData();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        processPayment,
        addLoyaltyPoints,
        topUpWallet,
        getNextTier,
        getPointsToNextTier,
        getTierProgress,
        refreshWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export { LOYALTY_TIERS };