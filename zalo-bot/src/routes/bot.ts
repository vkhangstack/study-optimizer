import express from 'express';
import { BotController } from '../controllers/botController';

const router = express.Router();
const botController = new BotController();

// Send message
router.post('/send-message', botController.sendMessage);

// Get user profile
router.get('/user/:userId', botController.getUserProfile);

// Get conversation history
router.get('/conversation/:conversationId/messages', botController.getMessages);

// Bot configuration
router.get('/config', botController.getConfig);
router.put('/config', botController.updateConfig);

export default router;