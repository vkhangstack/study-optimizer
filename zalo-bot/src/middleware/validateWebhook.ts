import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function validateWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.headers['x-zalo-signature'] as string;
    const timestamp = req.headers['x-zalo-timestamp'] as string;
    
    if (!signature || !timestamp) {
      logger.warn('Missing webhook signature or timestamp');
      return res.status(401).json({ error: 'Missing signature or timestamp' });
    }

    // Verify timestamp (prevent replay attacks)
    const currentTime = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp);
    const timeDiff = Math.abs(currentTime - requestTime);
    
    if (timeDiff > 300) { // 5 minutes tolerance
      logger.warn('Webhook timestamp too old', { timeDiff });
      return res.status(401).json({ error: 'Request timestamp too old' });
    }

    // Verify signature
    const webhookSecret = Bun.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const rawBody = JSON.stringify(req.body);
    const hasher = new Bun.CryptoHasher('sha256', webhookSecret);
    hasher.update(rawBody + timestamp);
    const expectedSignature = hasher.digest('hex');

    const providedSignature = signature.replace('sha256=', '');

    if (expectedSignature !== providedSignature) {
      logger.warn('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    logger.info('Webhook signature validated successfully');
    next();
  } catch (error) {
    logger.error('Webhook validation error:', error);
    res.status(500).json({ error: 'Webhook validation failed' });
  }
}