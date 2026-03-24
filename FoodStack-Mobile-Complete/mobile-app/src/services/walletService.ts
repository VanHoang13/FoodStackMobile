import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet, WalletTransaction } from '../types';

const WALLET_STORAGE_KEY = 'foodstack_wallet';
const WALLET_TRANSACTIONS_KEY = 'foodstack_wallet_transactions';

// Default wallet data
const DEFAULT_WALLET: Wallet = {
  id: 'wallet-1',
  user_id: 'user-123',
  balance: 500000, // 500,000 VND starting balance
  transactions: []
};

export class WalletService {
  /**
   * Get wallet data from storage
   */
  static async getWallet(): Promise<Wallet> {
    try {
      const walletData = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      if (walletData) {
        const wallet = JSON.parse(walletData);
        // Load transactions separately
        const transactions = await this.getTransactions();
        return { ...wallet, transactions };
      }
      
      // Return default wallet if none exists
      await this.saveWallet(DEFAULT_WALLET);
      return DEFAULT_WALLET;
    } catch (error) {
      console.error('Error loading wallet:', error);
      return DEFAULT_WALLET;
    }
  }

  /**
   * Save wallet data to storage
   */
  static async saveWallet(wallet: Wallet): Promise<void> {
    try {
      // Save wallet without transactions (save separately)
      const { transactions, ...walletWithoutTransactions } = wallet;
      await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletWithoutTransactions));
      
      // Save transactions separately
      if (transactions && transactions.length > 0) {
        await this.saveTransactions(transactions);
      }
    } catch (error) {
      console.error('Error saving wallet:', error);
    }
  }

  /**
   * Update wallet balance
   */
  static async updateBalance(newBalance: number, transaction?: WalletTransaction): Promise<Wallet> {
    try {
      const wallet = await this.getWallet();
      const updatedWallet = {
        ...wallet,
        balance: newBalance,
        updated_at: new Date().toISOString()
      };

      // Add transaction if provided
      if (transaction) {
        await this.addTransaction(transaction);
        updatedWallet.transactions = await this.getTransactions();
      }

      await this.saveWallet(updatedWallet);
      return updatedWallet;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  }

  /**
   * Deduct amount from wallet (for payments)
   */
  static async deductAmount(amount: number, orderId: string, description: string = 'Thanh toán đơn hàng'): Promise<Wallet> {
    try {
      const wallet = await this.getWallet();
      
      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const transaction: WalletTransaction = {
        id: `txn-${Date.now()}`,
        wallet_id: wallet.id,
        type: 'DEBIT',
        amount: amount,
        description: description,
        reference_id: orderId,
        reference_type: 'ORDER',
        balance_before: wallet.balance,
        balance_after: wallet.balance - amount,
        created_at: new Date().toISOString()
      };

      return await this.updateBalance(wallet.balance - amount, transaction);
    } catch (error) {
      console.error('Error deducting from wallet:', error);
      throw error;
    }
  }

  /**
   * Add amount to wallet (for top-ups)
   */
  static async addAmount(amount: number, description: string = 'Nạp tiền vào ví'): Promise<Wallet> {
    try {
      const wallet = await this.getWallet();

      const transaction: WalletTransaction = {
        id: `txn-${Date.now()}`,
        wallet_id: wallet.id,
        type: 'CREDIT',
        amount: amount,
        description: description,
        reference_type: 'TOP_UP',
        balance_before: wallet.balance,
        balance_after: wallet.balance + amount,
        created_at: new Date().toISOString()
      };

      return await this.updateBalance(wallet.balance + amount, transaction);
    } catch (error) {
      console.error('Error adding to wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet transactions
   */
  static async getTransactions(): Promise<WalletTransaction[]> {
    try {
      const transactionsData = await AsyncStorage.getItem(WALLET_TRANSACTIONS_KEY);
      if (transactionsData) {
        return JSON.parse(transactionsData);
      }
      return [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  /**
   * Save transactions to storage
   */
  static async saveTransactions(transactions: WalletTransaction[]): Promise<void> {
    try {
      // Keep only last 100 transactions to avoid storage bloat
      const limitedTransactions = transactions.slice(-100);
      await AsyncStorage.setItem(WALLET_TRANSACTIONS_KEY, JSON.stringify(limitedTransactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  /**
   * Add a single transaction
   */
  static async addTransaction(transaction: WalletTransaction): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      transactions.push(transaction);
      await this.saveTransactions(transactions);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }

  /**
   * Reset wallet to default (for testing)
   */
  static async resetWallet(): Promise<Wallet> {
    try {
      await AsyncStorage.removeItem(WALLET_STORAGE_KEY);
      await AsyncStorage.removeItem(WALLET_TRANSACTIONS_KEY);
      await this.saveWallet(DEFAULT_WALLET);
      return DEFAULT_WALLET;
    } catch (error) {
      console.error('Error resetting wallet:', error);
      return DEFAULT_WALLET;
    }
  }

  /**
   * Check if wallet has sufficient balance
   */
  static async hasSufficientBalance(amount: number): Promise<boolean> {
    try {
      const wallet = await this.getWallet();
      return wallet.balance >= amount;
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }
}