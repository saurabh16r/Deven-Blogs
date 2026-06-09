import { Router, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User';
import Subscription from '../models/Subscription';
import { requireAuth, AuthRequest } from '../middlewares/auth';
import { getMockUsers, updateMockUser } from '../config/mockData';
import { recordAnalyticsEvent } from '../utils/analytics';

const router = Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

// Initialize Razorpay if keys exist
let razorpayInstance: Razorpay | null = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

// CREATE ORDER
router.post('/order', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, couponCode } = req.body; // base price ₹299 (in paise: 29900)
    let finalAmount = amount || 29900; // 299 INR in paise

    // Apply mock discount if coupon provided
    if (couponCode === 'DEVEN50') {
      finalAmount = finalAmount * 0.5;
    } else if (couponCode === 'EARLYBIRD') {
      finalAmount = finalAmount * 0.7;
    }

    if (!razorpayInstance) {
      console.log('⚠️ Razorpay keys missing. Simulating Razorpay Order.');
      res.json({
        id: `mock-order-id-${Date.now()}`,
        amount: finalAmount,
        currency: 'INR',
        isMock: true,
        key: 'mock-key-id-deven',
      });
      return;
    }

    const options = {
      amount: finalAmount,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      isMock: false,
      key: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating Razorpay Order', error: (error as Error).message });
  }
});

// VERIFY PAYMENT (RAZORPAY SIGNATURE CHECK)
router.post('/verify', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days duration

    if (isMock || process.env.MOCK_MODE === 'true' || !razorpayInstance) {
      // Handle mock verification
      if (process.env.MOCK_MODE === 'true') {
        const mockUsers = getMockUsers();
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
          user.isSubscribed = true;
          user.subscriptionExpiresAt = expiryDate.toISOString();
        }
      } else {
        await User.findByIdAndUpdate(userId, {
          isSubscribed: true,
          subscriptionExpiresAt: expiryDate,
        });
      }

      await recordAnalyticsEvent({
        eventType: 'subscription_purchased',
        userId,
        amount: 299,
      });

      res.json({ message: 'Mock payment verified successfully', success: true });
      return;
    }

    // Real Signature Check
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      res.status(400).json({ message: 'Invalid payment signature', success: false });
      return;
    }

    // Save Subscription info
    await Subscription.create({
      userId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: 299,
      status: 'active',
      startDate: new Date(),
      endDate: expiryDate,
    });

    await User.findByIdAndUpdate(userId, {
      isSubscribed: true,
      subscriptionExpiresAt: expiryDate,
    });

    await recordAnalyticsEvent({
      eventType: 'subscription_purchased',
      userId,
      amount: 299,
    });

    res.json({ message: 'Payment verified and subscription activated', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed', error: (error as Error).message });
  }
});

// DIRECT SIMULATED UPGRADE FOR FASTER DEVELOPMENT
router.post('/mock-upgrade', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        user.isSubscribed = true;
        user.subscriptionExpiresAt = expiryDate.toISOString();
      }
      await recordAnalyticsEvent({
        eventType: 'subscription_purchased',
        userId,
        amount: 299,
      });
      res.json({ message: 'Subscribed successfully (Mock Mode)', isSubscribed: true });
      return;
    }

    await User.findByIdAndUpdate(userId, {
      isSubscribed: true,
      subscriptionExpiresAt: expiryDate,
    });
    await recordAnalyticsEvent({
      eventType: 'subscription_purchased',
      userId,
      amount: 299,
    });

    res.json({ message: 'Subscribed successfully (Real DB Mode)', isSubscribed: true });
  } catch (error) {
    res.status(500).json({ message: 'Mock upgrade failed', error: (error as Error).message });
  }
});

export default router;
