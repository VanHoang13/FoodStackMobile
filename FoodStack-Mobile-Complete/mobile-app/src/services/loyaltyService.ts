import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoyaltyProgram, LoyaltyTransaction, LoyaltyTier } from '../types';

const LOYALTY_STORAGE_KEY = 'foodstack_loyalty';
const LOYALTY_TRANSACTIONS_KEY = 'foodstack_loyalty_transactions';

// Loyalty tiers configuration
const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Đồng',
    min_points: 0,
    max_points: 999,
    benefits: ['Tích điểm cơ bản', 'Ưu đãi sinh nhật'],
    color: '#CD7F32',
    icon: 'award'
  },
  {
    id: 'silver',
    name: 'Bạc',
    min_points: 1000,
    max_points: 2999,
    benefits: ['Giảm 5% mọi đơn hàng', 'Tích điểm x1.2', 'Ưu đãi sinh nhật'],
    color: '#C0C0C0',
    icon: 'award'
  },
  {
    id: 'gold',
    name: 'Vàng',
    min_points: 3000,
    max_points: 9999,
    benefits: ['Giảm 10% mọi đơn hàng', 'Tích điểm x1.5', 'Ưu tiên đặt bàn', 'Ưu đãi sinh nhật'],
    color: '#FFD700',
    icon: 'star'
  },
  {
    id: 'platinum',
    name: 'Bạch Kim',
    min_points: 10000,
    benefits: ['Giảm 15% mọi đơn hàng', 'Tích điểm x2', 'Ưu tiên đặt bàn', 'Món tặng sinh nhật', 'Hỗ trợ VIP'],
    color: '#E5E4E2',
    icon: 'crown'
  }
];

// Default loyalty program data
const DEFAULT_LOYALTY: LoyaltyProgram = {
  id: 'loyalty-1',
  user_id: 'user-123',
  current_points: 1250,
  total_earned_points: 5670,
  current_tier: LOYALTY_TIERS[1], // Silver
  next_tier: LOYALTY_TIERS[2], // Gold
  points_to_next_tier: 1750, // 3000 - 1250
  transactions: []
};

export class LoyaltyService {
  /**
   * Get loyalty program data from storage
   */
  static async getLoyaltyProgram(): Promise<LoyaltyProgram> {
    try {
      const loyaltyData = await AsyncStorage.getItem(LOYALTY_STORAGE_KEY);
      if (loyaltyData) {
        const loyalty = JSON.parse(loyaltyData);
        // Load transactions separately
        const transactions = await this.getTransactions();
        // Recalculate tier info in case tiers changed
        const updatedLoyalty = this.recalculateTierInfo({ ...loyalty, transactions });
        return updatedLoyalty;
      }
      
      // Return default loyalty if none exists
      await this.saveLoyaltyProgram(DEFAULT_LOYALTY);
      return DEFAULT_LOYALTY;
    } catch (error) {
      console.error('Error loading loyalty program:', error);
      return DEFAULT_LOYALTY;
    }
  }

  /**
   * Save loyalty program data to storage
   */
  static async saveLoyaltyProgram(loyalty: LoyaltyProgram): Promise<void> {
    try {
      // Save loyalty without transactions (save separately)
      const { transactions, ...loyaltyWithoutTransactions } = loyalty;
      await AsyncStorage.setItem(LOYALTY_STORAGE_KEY, JSON.stringify(loyaltyWithoutTransactions));
      
      // Save transactions separately
      if (transactions && transactions.length > 0) {
        await this.saveTransactions(transactions);
      }
    } catch (error) {
      console.error('Error saving loyalty program:', error);
    }
  }

  /**
   * Add points to loyalty program
   */
  static async addPoints(points: number, orderId: string, orderAmount: number, description: string = 'Tích điểm từ đơn hàng'): Promise<{ loyalty: LoyaltyProgram; tierUpgraded: boolean; newTier?: LoyaltyTier }> {
    try {
      const loyalty = await this.getLoyaltyProgram();
      const oldTier = loyalty.current_tier;
      
      const transaction: LoyaltyTransaction = {
        id: `lty-${Date.now()}`,
        loyalty_program_id: loyalty.id,
        type: 'EARN',
        points: points,
        description: description,
        reference_id: orderId,
        reference_type: 'ORDER',
        order_amount: orderAmount,
        created_at: new Date().toISOString()
      };

      const newTotalPoints = loyalty.current_points + points;
      const newTotalEarned = loyalty.total_earned_points + points;

      // Recalculate tier info
      const updatedLoyalty = this.recalculateTierInfo({
        ...loyalty,
        current_points: newTotalPoints,
        total_earned_points: newTotalEarned,
        updated_at: new Date().toISOString()
      });

      // Add transaction
      await this.addTransaction(transaction);
      updatedLoyalty.transactions = await this.getTransactions();

      await this.saveLoyaltyProgram(updatedLoyalty);

      // Check if tier was upgraded
      const tierUpgraded = oldTier.id !== updatedLoyalty.current_tier.id;

      return {
        loyalty: updatedLoyalty,
        tierUpgraded,
        newTier: tierUpgraded ? updatedLoyalty.current_tier : undefined
      };
    } catch (error) {
      console.error('Error adding loyalty points:', error);
      throw error;
    }
  }

  /**
   * Redeem points (for future use)
   */
  static async redeemPoints(points: number, description: string = 'Đổi điểm lấy ưu đãi'): Promise<LoyaltyProgram> {
    try {
      const loyalty = await this.getLoyaltyProgram();
      
      if (loyalty.current_points < points) {
        throw new Error('Insufficient points');
      }

      const transaction: LoyaltyTransaction = {
        id: `lty-${Date.now()}`,
        loyalty_program_id: loyalty.id,
        type: 'REDEEM',
        points: points,
        description: description,
        reference_type: 'REDEMPTION',
        created_at: new Date().toISOString()
      };

      const newTotalPoints = loyalty.current_points - points;

      // Recalculate tier info
      const updatedLoyalty = this.recalculateTierInfo({
        ...loyalty,
        current_points: newTotalPoints,
        updated_at: new Date().toISOString()
      });

      // Add transaction
      await this.addTransaction(transaction);
      updatedLoyalty.transactions = await this.getTransactions();

      await this.saveLoyaltyProgram(updatedLoyalty);
      return updatedLoyalty;
    } catch (error) {
      console.error('Error redeeming loyalty points:', error);
      throw error;
    }
  }

  /**
   * Recalculate tier information based on current points
   */
  static recalculateTierInfo(loyalty: LoyaltyProgram): LoyaltyProgram {
    const currentPoints = loyalty.current_points;
    
    // Find current tier
    let currentTier = LOYALTY_TIERS[0]; // Default to bronze
    for (const tier of LOYALTY_TIERS) {
      if (currentPoints >= tier.min_points && (!tier.max_points || currentPoints <= tier.max_points)) {
        currentTier = tier;
        break;
      }
    }

    // Find next tier
    const currentTierIndex = LOYALTY_TIERS.findIndex(t => t.id === currentTier.id);
    const nextTier = currentTierIndex < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[currentTierIndex + 1] : undefined;

    // Calculate points to next tier
    const pointsToNextTier = nextTier ? nextTier.min_points - currentPoints : 0;

    return {
      ...loyalty,
      current_tier: currentTier,
      next_tier: nextTier,
      points_to_next_tier: pointsToNextTier
    };
  }

  /**
   * Get loyalty transactions
   */
  static async getTransactions(): Promise<LoyaltyTransaction[]> {
    try {
      const transactionsData = await AsyncStorage.getItem(LOYALTY_TRANSACTIONS_KEY);
      if (transactionsData) {
        return JSON.parse(transactionsData);
      }
      return [];
    } catch (error) {
      console.error('Error loading loyalty transactions:', error);
      return [];
    }
  }

  /**
   * Save transactions to storage
   */
  static async saveTransactions(transactions: LoyaltyTransaction[]): Promise<void> {
    try {
      // Keep only last 100 transactions to avoid storage bloat
      const limitedTransactions = transactions.slice(-100);
      await AsyncStorage.setItem(LOYALTY_TRANSACTIONS_KEY, JSON.stringify(limitedTransactions));
    } catch (error) {
      console.error('Error saving loyalty transactions:', error);
    }
  }

  /**
   * Add a single transaction
   */
  static async addTransaction(transaction: LoyaltyTransaction): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      transactions.push(transaction);
      await this.saveTransactions(transactions);
    } catch (error) {
      console.error('Error adding loyalty transaction:', error);
    }
  }

  /**
   * Calculate points earned from order amount
   */
  static calculatePointsFromAmount(amount: number): number {
    // 1 point per 1000 VND
    return Math.floor(amount / 1000);
  }

  /**
   * Get all available tiers
   */
  static getTiers(): LoyaltyTier[] {
    return LOYALTY_TIERS;
  }

  /**
   * Reset loyalty program to default (for testing)
   */
  static async resetLoyaltyProgram(): Promise<LoyaltyProgram> {
    try {
      await AsyncStorage.removeItem(LOYALTY_STORAGE_KEY);
      await AsyncStorage.removeItem(LOYALTY_TRANSACTIONS_KEY);
      await this.saveLoyaltyProgram(DEFAULT_LOYALTY);
      return DEFAULT_LOYALTY;
    } catch (error) {
      console.error('Error resetting loyalty program:', error);
      return DEFAULT_LOYALTY;
    }
  }

  /**
   * Get tier progress percentage
   */
  static getTierProgress(loyalty: LoyaltyProgram): number {
    if (!loyalty.next_tier) return 100; // Max tier reached
    
    const currentTierMin = loyalty.current_tier.min_points;
    const nextTierMin = loyalty.next_tier.min_points;
    const currentPoints = loyalty.current_points;
    
    const progress = ((currentPoints - currentTierMin) / (nextTierMin - currentTierMin)) * 100;
    return Math.min(100, Math.max(0, progress));
  }
}