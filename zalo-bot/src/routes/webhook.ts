import express from 'express';
import { WebhookController } from '../controllers/webhookController';
import { validateWebhook } from '../middleware/validateWebhook';

const router = express.Router();
const webhookController = new WebhookController();

// Webhook verification endpoint
router.get('/', webhookController.verify);

// Webhook event handler
router.post('/', validateWebhook, webhookController.handleEvent);

export default router;