# 📦 Introduction

This SDK package is developed based on [`node-telegram-bot-api`](https://github.com/yagop/node-telegram-bot-api) – a popular open-source library for Telegram Bot, licensed under [MIT License](https://github.com/yagop/node-telegram-bot-api/blob/master/LICENSE.md).

This SDK version is customized and extended to meet the requirements for building Zalo Bot. All modifications comply with the MIT license and retain the original author's copyright.

# node-zalo-bot

Node.js library for building Zalo bots, inspired by node-telegram-bot-api.

---

## Installation

```bash
npm install node-zalo-bot
```

## Environment Configuration

Create a `.env` file based on the `.env.example` template:

```
BOT_TOKEN=your_zalo_bot_token
```

- `BOT_TOKEN`: Your Zalo bot token.

---

## Bot Initialization

```js
const ZaloBot = require('node-zalo-bot');
require('dotenv').config();

const bot = new ZaloBot(process.env.BOT_TOKEN, {
  polling: true, // or false if using webhook
});
```

---

## API

### Events

#### `bot.on(event, callback)`
Listen to events such as `'message'`, `'text'`, `'photo'`, `'sticker'`, etc.

```js
bot.on('message', (msg, metadata) => {
  console.log('Received message:', msg);
});
```

#### `bot.onText(regexp, callback)`
Listen to text messages that match a regular expression.

```js
bot.onText(/\/start (.+)/, (msg, match) => {
  // match[1] is the part that matches (.+)
});
```

---

### Sending and Receiving Messages

#### `bot.sendMessage(chatId, text, [options])`
Send a text message.

```js
bot.sendMessage(chatId, 'Hello!');
```

#### `bot.sendSticker(chatId, sticker, [options])`
Send a sticker.

#### `bot.sendChatAction(chatId, action, [options])`
Tell the user that something is happening on the bot's side. The status is set for 5 seconds or less (when a message arrives from your bot, Zalo clients clear its typing status).

**Available actions:**
- `'typing'` - for text messages
- `'upload_photo'` - for photos (Coming soon)
```js
// Show typing indicator
bot.sendChatAction(chatId, 'typing');
```

---

### Polling & Webhook

#### `bot.startPolling([options])`
Start receiving updates via polling.

#### `bot.isPolling()`
Check if the bot is currently polling.

#### `bot.setWebHook(url, [options])`
Register webhook with Zalo.

#### `bot.deleteWebHook([options])`
Delete webhook.

#### `bot.getWebHookInfo([options])`
Get current webhook information.

---

### Get Bot & Update Information

#### `bot.getMe([options])`
Get bot information.

#### `bot.getUpdates([options])`
Get new updates (used for polling).

---

### Error Handling

Errors are clearly categorized:
- `ZaloBot.errors.BaseError`
- `ZaloBot.errors.FatalError`
- `ZaloBot.errors.ParseError`
- `ZaloBot.errors.ZaloError`

---

## Usage Examples

### Bot with Polling

```js
const ZaloBot = require('node-zalo-bot');
require('dotenv').config();

const bot = new ZaloBot(process.env.BOT_TOKEN, {
  polling: true
});

bot.on('message', (msg) => {
  bot.sendMessage(msg.chat.id, 'Chào bạn!');
});

bot.onText(/\/start (.+)/, (msg, match) => {
  bot.sendMessage(msg.chat.id, `Bạn vừa gửi: ${match[1]}`);
});
```

### Bot with Webhook

```js
const ZaloBot = require('node-zalo-bot');
const express = require('express');
require('dotenv').config();

const WEBHOOK_URL = "https://your-ngrok-or-domain/webhook";
const WEBHOOK_SECRET_TOKEN = "YOUR_WEBHOOK_SECRET_TOKEN";

const app = express();
const bot = new ZaloBot(process.env.BOT_TOKEN, {
  polling: false, // Disable polling when using webhook
});

// Middleware to parse JSON
app.use(express.json());

// Route to receive webhook from Zalo
app.post('/webhook', (req, res) => {
  if (req.headers['x-bot-api-secret-token'] !== WEBHOOK_SECRET_TOKEN) {
    console.log('Unauthorized request', req.headers);
    return res.status(403).json({ message: "Unauthorized" });
  }
  const update = req.body;
  bot.processUpdate(update);
  res.sendStatus(200);
});

// Handle messages
bot.on('message', (msg) => {
  bot.sendMessage(msg.chat.id, 'Xin chào!');
});

// Register webhook with Zalo
bot.setWebHook(WEBHOOK_URL, {
  secret_token: WEBHOOK_SECRET_TOKEN  
}).then(() => {
  console.log('Webhook configured successfully');
}).catch((error) => {
    console.error('Error registering webhook:', error);
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## References
- [Zalo Bot API Docs](https://bot.zapps.me/docs/)
