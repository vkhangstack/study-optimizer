#!/usr/bin/env bun

import { PrismaClient } from '@prisma/client';
import ZaloBot from 'node-zalo-bot';
import { BotService } from '../services/botService';

const prisma = new PrismaClient();
const TOKEN = process.env.ZALO_BOT_TOKEN || "YOUR_ZALO_BOT_TOKEN";
const bot = new ZaloBot(TOKEN);
const botService = new BotService(bot, prisma);

async function sendBroadcast() {
  const message = process.argv[2];
  
  if (!message) {
    console.error('Usage: bun run src/scripts/broadcast.ts "Your message here"');
    process.exit(1);
  }

  try {
    console.log('Sending broadcast message...');
    await botService.sendBroadcastMessage(message);
    console.log('Broadcast sent successfully!');
  } catch (error) {
    console.error('Error sending broadcast:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

sendBroadcast();