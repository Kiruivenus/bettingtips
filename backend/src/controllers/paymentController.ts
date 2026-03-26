import { Request, Response } from 'express';
import Stripe from 'stripe';
import Payment from '../models/Payment';
import SubscriptionPlan from '../models/SubscriptionPlan';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import paypal from 'paypal-rest-sdk';

paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox', // sandbox or live
  client_id: process.env.PAYPAL_CLIENT_ID || '',
  client_secret: process.env.PAYPAL_CLIENT_SECRET || ''
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia' as any,
});

// @desc    Create a manual payment (M-PESA, Bank Transfer)
// @route   POST /api/payments/manual
// @access  Private
export const createManualPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, amount, transactionId, method } = req.body;
    
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const payment = new Payment({
      user: req.user?._id,
      plan: plan._id,
      amount: plan.price, // Use price from DB for integrity
      currency: plan.currency,
      method,
      status: 'pending',
      transactionId,
    });

    const createdPayment = await payment.save();
    res.status(201).json(createdPayment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating manual payment' });
  }
};

// @desc    Approve a manual payment
// @route   PUT /api/payments/approve/:id
// @access  Private/Admin
export const approveManualPayment = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('plan');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    const plan: any = payment.plan;

    payment.status = 'completed';
    await payment.save();

    // Assign plan to user
    const user = await User.findById(payment.user);
    if (user && plan) {
      console.log(`Assigning plan ${plan.name} to user ${user.email}`);
      user.activePlan = plan._id as any;
      
      const expiry = new Date();
      const duration = plan.durationInDays || 30; // Fallback to 30 days
      expiry.setDate(expiry.getDate() + duration);
      user.subscriptionExpiry = expiry;
      
      await user.save();
      console.log(`User ${user.email} updated successfully. Expiry: ${expiry.toISOString()}`);
    } else {
      console.warn(`Could not assign plan: User ${!!user}, Plan ${!!plan}`);
    }

    res.json(payment);
  } catch (error: any) {
    console.error('Error approving payment:', error);
    res.status(500).json({ message: 'Error approving payment' });
  }
};

// @desc    Reject a manual payment
// @route   PUT /api/payments/reject/:id
// @access  Private/Admin
export const rejectManualPayment = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.status === 'completed' || payment.status === 'declined') {
      return res.status(400).json({ message: `Payment already ${payment.status}` });
    }

    payment.status = 'declined';
    await payment.save();

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting payment' });
  }
};

// @desc    Get user payments
// @route   GET /api/payments/my-payments
// @access  Private
export const getMyPayments = async (req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find({ user: req.user?._id }).populate('plan', 'name');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments' });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
export const getAllPayments = async (req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find({}).populate('user', 'name email').populate('plan', 'name');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all payments' });
  }
};

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/stripe/create-session
// @access  Private
export const createStripeSession = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: { name: plan.name },
            unit_amount: Math.round(plan.price * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/payments/cancel`,
      client_reference_id: req.user?._id.toString(),
      metadata: { planId: plan._id.toString() },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating Stripe session' });
  }
};

// @desc    Stripe Webhook
// @route   POST /api/payments/stripe/webhook
// @access  Public
export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const planId = session.metadata?.planId;

    if (userId && planId) {
      const plan = await SubscriptionPlan.findById(planId);
      if (plan) {
        const payment = new Payment({
          user: userId,
          plan: planId,
          amount: session.amount_total ? session.amount_total / 100 : plan.price,
          currency: session.currency?.toUpperCase() || plan.currency,
          method: 'stripe',
          status: 'completed',
          transactionId: session.payment_intent as string,
        });
        await payment.save();

        const user = await User.findById(userId);
        if (user) {
          user.activePlan = plan._id as any;
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + (plan.durationInDays || 30));
          user.subscriptionExpiry = expiry;
          await user.save();
        }
      }
    }
  }

  res.status(200).json({ received: true });
};

// @desc    Create PayPal Payment
// @route   POST /api/payments/paypal/create-payment
// @access  Private
export const createPayPalPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const create_payment_json = {
      intent: 'sale',
      payer: { payment_method: 'paypal' },
      redirect_urls: {
        return_url: `${process.env.FRONTEND_URL}/dashboard/payments/paypal/success?planId=${plan._id}`,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard/payments/cancel`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: plan.name,
                sku: plan._id.toString(),
                price: plan.price.toString(),
                currency: plan.currency,
                quantity: 1,
              },
            ],
          },
          amount: { currency: plan.currency, total: plan.price.toString() },
          description: `Subscription to ${plan.name}`,
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, payment) => {
      if (error) {
        return res.status(500).json({ message: error.response?.message || 'PayPal error' });
      } else {
        const newPayment = new Payment({
          user: req.user?._id,
          plan: plan._id,
          amount: plan.price,
          currency: plan.currency,
          method: 'paypal',
          status: 'pending',
          transactionId: payment.id,
        });
        await newPayment.save();

        const approvalUrl = payment.links?.find((link) => link.rel === 'approval_url');
        res.json({ url: approvalUrl?.href });
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating PayPal payment' });
  }
};

// @desc    Execute PayPal Payment
// @route   POST /api/payments/paypal/execute-payment
// @access  Private
export const executePayPalPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId, PayerID, planId } = req.body;

    const paymentRecord = await Payment.findOne({ transactionId: paymentId });
    if (!paymentRecord) return res.status(404).json({ message: 'Payment record not found' });

    const execute_payment_json = {
      payer_id: PayerID,
      transactions: [
        { amount: { currency: paymentRecord.currency, total: paymentRecord.amount.toString() } },
      ],
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
      if (error) {
        return res.status(500).json({ message: error.response?.message || 'PayPal execute error' });
      } else {
        paymentRecord.status = 'completed';
        await paymentRecord.save();

        const plan = await SubscriptionPlan.findById(planId);
        const user = await User.findById(req.user?._id);

        if (user && plan) {
          user.activePlan = plan._id as any;
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + (plan.durationInDays || 30));
          user.subscriptionExpiry = expiry;
          await user.save();
        }

        res.json({ message: 'Payment successful', payment });
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error executing PayPal payment' });
  }
};

// @desc    Generate M-PESA Token
const generateMpesaToken = async (): Promise<string | null> => {
  try {
    const consumerKey = process.env.MPESA_CONSUMER_KEY as string;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET as string;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const response = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    const data: any = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('M-PESA token generation failed:', error);
    return null;
  }
};

// @desc    Create M-PESA Payment (STK Push)
// @route   POST /api/payments/mpesa/stk-push
// @access  Private
export const createMpesaPayment = async (req: AuthRequest, res: Response) => {
  try {
    let { phone, planId } = req.body;
    
    // Format phone to 254...
    if (phone.startsWith('0')) {
      phone = `254${phone.substring(1)}`;
    } else if (phone.startsWith('+')) {
      phone = phone.substring(1);
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const token = await generateMpesaToken();
    if (!token) return res.status(500).json({ message: 'Failed to generate M-PESA token' });

    const shortcode = process.env.MPESA_SHORTCODE as string;
    const passkey = process.env.MPESA_PASSKEY as string;
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    
    const amount = plan.price;

    const requestBody = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: `${process.env.BACKEND_URL}/api/payments/mpesa/callback`,
      AccountReference: `BettingTips-${req.user?._id.toString().substring(0, 5)}`,
      TransactionDesc: `Subscription to ${plan.name}`,
    };

    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data: any = await response.json();

    if (data.ResponseCode === '0') {
      const payment = new Payment({
        user: req.user?._id,
        plan: plan._id,
        amount,
        currency: 'KES',
        method: 'mpesa',
        status: 'pending',
        transactionId: data.CheckoutRequestID,
      });
      await payment.save();

      res.json({ message: 'STK push sent successfully', data });
    } else {
      res.status(400).json({ message: data.errorMessage || 'M-PESA request failed', data });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error processing M-PESA payment' });
  }
};

// @desc    M-PESA Callback Webhook
// @route   POST /api/payments/mpesa/callback
// @access  Public
export const mpesaCallback = async (req: Request, res: Response) => {
  try {
    const callbackData = req.body.Body?.stkCallback;
    if (!callbackData) return res.status(400).json({ message: 'Invalid callback data' });

    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = callbackData;

    const payment = await Payment.findOne({ transactionId: CheckoutRequestID });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (ResultCode === 0 && CallbackMetadata) {
      payment.status = 'completed';
      const receiptItem = CallbackMetadata.Item.find((item: any) => item.Name === 'MpesaReceiptNumber');
      if (receiptItem) {
        payment.transactionId = receiptItem.Value; 
      }
      await payment.save();

      const user = await User.findById(payment.user);
      const plan: any = await SubscriptionPlan.findById(payment.plan);
      if (user && plan) {
        user.activePlan = plan._id;
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + (plan.durationInDays || 30));
        user.subscriptionExpiry = expiry;
        await user.save();
      }
    } else {
      payment.status = 'declined';
      await payment.save();
      console.log(`M-PESA payment failed: ${ResultDesc}`);
    }

    res.status(200).json({ message: 'Callback received processed' });
  } catch (error: any) {
    console.error('M-PESA callback processing error:', error);
    res.status(500).json({ message: 'Error processing M-PESA callback' });
  }
};
