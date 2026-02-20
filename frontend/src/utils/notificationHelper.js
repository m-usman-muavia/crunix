/**
 * Notification utility for frontend
 * These functions trigger notifications for user actions
 */

import API_BASE_URL from '../config/api';

/**
 * Create a notification (for actions not handled by backend)
 */
export const createFrontendNotification = async (type, message, amount = 0) => {
  try {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      console.warn('No auth token available for notification');
      return;
    }

    // POST to a notifications endpoint if available
    // For now we'll just log - backend should handle most notifications
    console.log('Notification:', { type, message, amount });
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

/**
 * Notification types and messages
 */
export const notificationMessages = {
  DAILY_INCOME_COLLECTED: (amount) => ({
    type: 'daily_income',
    message: `You've collected $${amount} in daily income! Keep earning.`,
  }),
  
  REFERRAL_SIGNUP: (referralName) => ({
    type: 'referral_signup',
    message: `New referral signed up! ${referralName || 'Your referral'} is now a member.`,
  }),
  
  REFERRAL_ACTIVATED: (referralName) => ({
    type: 'plan_activated',
    message: `${referralName || 'Your referral'} has activated an investment plan!`,
  }),
  
  REFERRAL_INCOME: (amount, referralName) => ({
    type: 'referral_earning',
    message: `You earned $${amount} referral commission from ${referralName || 'a referral'}!`,
    amount,
  }),

  PLAN_PURCHASED: (planName, amount) => ({
    type: 'plan_activated',
    message: `You've successfully invested in "${planName}" for $${amount}. Start earning daily!`,
    amount,
  }),

  BONUS_REDEEMED: (bonusAmount) => ({
    type: 'general',
    message: `Bonus code redeemed! $${bonusAmount} added to your bonus balance.`,
    amount: bonusAmount,
  }),

  DEPOSIT_SUBMITTED: (amount, ref) => ({
    type: 'deposit_request_sent',
    message: `Deposit of $${amount} submitted. Reference: ${ref}`,
    amount,
  }),

  WITHDRAWAL_SUBMITTED: (amount) => ({
    type: 'withdrawal_request_sent',
    message: `Withdrawal request of $${amount} submitted. Awaiting approval.`,
    amount,
  }),

  INCOME_AUTO_COLLECTED: (amount) => ({
    type: 'daily_income',
    message: `Auto-collected $${amount} daily income from your active plans.`,
    amount,
  }),
};

export default createFrontendNotification;
