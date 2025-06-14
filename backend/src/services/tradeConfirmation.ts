import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface TradeConfirmation {
  id: string;
  tradeOfferId: string;
  userSteamId: string;
  type: 'deposit' | 'withdrawal';
  items: Array<{
    assetid: string;
    name: string;
    market_hash_name: string;
    estimated_value: number;
  }>;
  totalValue: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  confirmationCode: string;
  createdAt: number;
  expiresAt: number;
  confirmedAt?: number;
  cancelledAt?: number;
}

export class TradeConfirmationService {
  private confirmations: Map<string, TradeConfirmation> = new Map();
  private readonly CONFIRMATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  private readonly SECRET_KEY = process.env.TRADE_CONFIRMATION_SECRET || 'change-this-secret-key';

  /**
   * Create a new trade confirmation
   */
  createConfirmation(
    tradeOfferId: string,
    userSteamId: string,
    type: 'deposit' | 'withdrawal',
    items: Array<{
      assetid: string;
      name: string;
      market_hash_name: string;
      estimated_value: number;
    }>
  ): TradeConfirmation {
    const id = uuidv4();
    const now = Date.now();
    const totalValue = items.reduce((sum, item) => sum + item.estimated_value, 0);
    
    const confirmation: TradeConfirmation = {
      id,
      tradeOfferId,
      userSteamId,
      type,
      items,
      totalValue,
      status: 'pending',
      confirmationCode: this.generateConfirmationCode(id, userSteamId, now),
      createdAt: now,
      expiresAt: now + this.CONFIRMATION_TIMEOUT
    };

    this.confirmations.set(id, confirmation);
    
    // Auto-cleanup expired confirmations
    setTimeout(() => {
      this.expireConfirmation(id);
    }, this.CONFIRMATION_TIMEOUT);

    return confirmation;
  }

  /**
   * Get confirmation by ID
   */
  getConfirmation(id: string): TradeConfirmation | null {
    const confirmation = this.confirmations.get(id);
    
    if (!confirmation) {
      return null;
    }

    // Check if expired
    if (Date.now() > confirmation.expiresAt && confirmation.status === 'pending') {
      confirmation.status = 'expired';
      this.confirmations.set(id, confirmation);
    }

    return confirmation;
  }

  /**
   * Confirm a trade with confirmation code
   */
  confirmTrade(id: string, confirmationCode: string): {
    success: boolean;
    confirmation?: TradeConfirmation;
    error?: string;
  } {
    const confirmation = this.getConfirmation(id);
    
    if (!confirmation) {
      return { success: false, error: 'Confirmation not found' };
    }

    if (confirmation.status !== 'pending') {
      return { success: false, error: `Trade is already ${confirmation.status}` };
    }

    if (Date.now() > confirmation.expiresAt) {
      confirmation.status = 'expired';
      this.confirmations.set(id, confirmation);
      return { success: false, error: 'Confirmation has expired' };
    }

    if (!this.verifyConfirmationCode(confirmationCode, id, confirmation.userSteamId, confirmation.createdAt)) {
      return { success: false, error: 'Invalid confirmation code' };
    }

    confirmation.status = 'confirmed';
    confirmation.confirmedAt = Date.now();
    this.confirmations.set(id, confirmation);

    return { success: true, confirmation };
  }

  /**
   * Cancel a trade confirmation
   */
  cancelConfirmation(id: string, reason?: string): {
    success: boolean;
    confirmation?: TradeConfirmation;
    error?: string;
  } {
    const confirmation = this.getConfirmation(id);
    
    if (!confirmation) {
      return { success: false, error: 'Confirmation not found' };
    }

    if (confirmation.status !== 'pending') {
      return { success: false, error: `Trade is already ${confirmation.status}` };
    }

    confirmation.status = 'cancelled';
    confirmation.cancelledAt = Date.now();
    this.confirmations.set(id, confirmation);

    return { success: true, confirmation };
  }

  /**
   * Get all confirmations for a user
   */
  getUserConfirmations(userSteamId: string): TradeConfirmation[] {
    return Array.from(this.confirmations.values())
      .filter(conf => conf.userSteamId === userSteamId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get pending confirmations
   */
  getPendingConfirmations(): TradeConfirmation[] {
    return Array.from(this.confirmations.values())
      .filter(conf => conf.status === 'pending' && Date.now() <= conf.expiresAt)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Generate secure confirmation code
   */
  private generateConfirmationCode(confirmationId: string, userSteamId: string, timestamp: number): string {
    const data = `${confirmationId}-${userSteamId}-${timestamp}`;
    return crypto.createHmac('sha256', this.SECRET_KEY).update(data).digest('hex').substring(0, 16);
  }

  /**
   * Verify confirmation code
   */
  private verifyConfirmationCode(
    providedCode: string,
    confirmationId: string,
    userSteamId: string,
    timestamp: number
  ): boolean {
    const expectedCode = this.generateConfirmationCode(confirmationId, userSteamId, timestamp);
    return crypto.timingSafeEqual(
      Buffer.from(providedCode, 'hex'),
      Buffer.from(expectedCode, 'hex')
    );
  }

  /**
   * Expire a confirmation
   */
  private expireConfirmation(id: string): void {
    const confirmation = this.confirmations.get(id);
    if (confirmation && confirmation.status === 'pending') {
      confirmation.status = 'expired';
      this.confirmations.set(id, confirmation);
    }
  }

  /**
   * Clean up old confirmations (older than 24 hours)
   */
  cleanupOldConfirmations(): number {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    let cleanedCount = 0;

    for (const [id, confirmation] of this.confirmations.entries()) {
      if (confirmation.createdAt < cutoffTime) {
        this.confirmations.delete(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get confirmation statistics
   */
  getStats(): {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    expired: number;
    totalValue: number;
  } {
    const confirmations = Array.from(this.confirmations.values());
    
    return {
      total: confirmations.length,
      pending: confirmations.filter(c => c.status === 'pending').length,
      confirmed: confirmations.filter(c => c.status === 'confirmed').length,
      cancelled: confirmations.filter(c => c.status === 'cancelled').length,
      expired: confirmations.filter(c => c.status === 'expired').length,
      totalValue: confirmations
        .filter(c => c.status === 'confirmed')
        .reduce((sum, c) => sum + c.totalValue, 0)
    };
  }
}

export default TradeConfirmationService; 