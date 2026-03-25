import { Request, Response } from 'express';
import PaymentSettings from '../models/PaymentSettings';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as fs from 'fs';
import * as path from 'path';

// Masks secret values, keeping only last 4 chars
const maskSecret = (value: string): string => {
  if (!value || value.length < 8) return '••••••••';
  return '••••••••' + value.slice(-4);
};

// @desc    Get all payment settings (admin)
// @route   GET /api/settings/payments
// @access  Private/Admin
export const getPaymentSettings = async (req: AuthRequest, res: Response) => {
  try {
    const allSettings = await PaymentSettings.find({});

    // Return all methods with their enabled status and masked keys
    const methodMap: Record<string, any> = {};
    allSettings.forEach(s => {
      const settings: Record<string, string> = {};
      if (s.settings instanceof Map) {
        s.settings.forEach((v, k) => {
          settings[k] = maskSecret(v);
        });
      }
      methodMap[s.method] = { isEnabled: s.isEnabled, settings };
    });

    res.json(methodMap);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment settings' });
  }
};

// @desc    Update payment settings for a specific method
// @route   PUT /api/settings/payments/:method
// @access  Private/Admin
export const updatePaymentSettings = async (req: AuthRequest, res: Response) => {
  try {
    const method: string = req.params.method as string;
    const { isEnabled, settings } = req.body;

    const validMethods = ['manual', 'stripe', 'paypal', 'mpesa'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const existing = await PaymentSettings.findOne({ method });

    if (existing) {
      existing.isEnabled = isEnabled !== undefined ? isEnabled : existing.isEnabled;

      // Merge settings: only update keys provided, skip empty/placeholder values
      if (settings && typeof settings === 'object') {
        Object.entries(settings).forEach(([k, v]) => {
          if (typeof v === 'string' && v !== '' && !v.startsWith('••••')) {
            (existing.settings as Map<string, string>).set(k, v);
          }
        });
      }
      await existing.save();
    } else {
      // Create new record
      const newSettings: Record<string, string> = {};
      if (settings && typeof settings === 'object') {
        Object.entries(settings).forEach(([k, v]) => {
          if (typeof v === 'string' && v !== '') {
            newSettings[k] = v;
          }
        });
      }
      await PaymentSettings.create({ method, isEnabled: isEnabled ?? false, settings: newSettings });
    }

    // Also write to .env file for the automatic gateways so they take effect immediately
    if (method !== 'manual' && settings) {
      updateEnvFile(method as string, settings);
    }

    res.json({ message: `${method} payment settings updated successfully` });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    res.status(500).json({ message: 'Error updating payment settings' });
  }
};

// Helper: updates the corresponding keys in the .env file
const updateEnvFile = (method: string, settings: Record<string, string>) => {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;

    let envContent = fs.readFileSync(envPath, 'utf-8');

    const keyMap: Record<string, Record<string, string>> = {
      stripe: {
        secretKey: 'STRIPE_SECRET_KEY',
        publishableKey: 'STRIPE_PUBLISHABLE_KEY',
        webhookSecret: 'STRIPE_WEBHOOK_SECRET',
      },
      paypal: {
        clientId: 'PAYPAL_CLIENT_ID',
        clientSecret: 'PAYPAL_CLIENT_SECRET',
        mode: 'PAYPAL_MODE',
      },
      mpesa: {
        consumerKey: 'MPESA_CONSUMER_KEY',
        consumerSecret: 'MPESA_CONSUMER_SECRET',
        passkey: 'MPESA_PASSKEY',
        shortcode: 'MPESA_SHORTCODE',
      },
    };

    const methodKeys = keyMap[method];
    if (!methodKeys) return;

    Object.entries(settings).forEach(([settingKey, settingValue]) => {
      const envKey = methodKeys[settingKey];
      if (!envKey || !settingValue || settingValue.startsWith('••••')) return;

      const regex = new RegExp(`^${envKey}=.*$`, 'm');
      const newLine = `${envKey}=${settingValue}`;
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
    });

    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log(`Updated .env for ${method}`);
  } catch (err) {
    console.error('Failed to update .env file:', err);
  }
};

// @desc    Get enabled payment methods (public — no secrets exposed)
// @route   GET /api/settings/payments/enabled
// @access  Public
export const getEnabledPaymentMethods = async (req: Request, res: Response) => {
  try {
    const allSettings = await PaymentSettings.find({});
    const enabled: Record<string, boolean> = {};
    allSettings.forEach(s => {
      enabled[s.method] = s.isEnabled;
    });
    res.json(enabled);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment methods' });
  }
};
