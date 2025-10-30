# Zalo Bot Service

A Node.js TypeScript service for building Zalo bots with webhook integration, PostgreSQL database, and Prisma ORM.
- ⚡ Bun runtime for ultra-fast performance
- 🔗 Webhook handling for real-time message processing
- 💾 PostgreSQL database with Prisma ORM
- 📝 Message logging and user management
-  Support for images, stickers, and location messages
- 📡 Broadcast messaging capabilities

- PostgreSQL database (or use Docker)
- Zalo Official Account
- ngrok or similar tool for webhook testing

### Docker Development
- Docker and Docker Compose
- Zalo Official Account
- ngrok or similar tool for webhook testing

## Installation

1. Clone the repository and navigate to the zalo-bot directory:
```bash
cd zalo-bot
```

2. Install Bun (if not already installed):
```bash
curl -fsSL https://bun.sh/install | bash
```

3. Install dependencies:
```bash
bun install
```

4. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `DATABASE_URL` - PostgreSQL connection string
- `ZALO_APP_ID` - Your Zalo app ID
- `ZALO_APP_SECRET` - Your Zalo app secret
- `ZALO_OA_ID` - Your Official Account ID
- `ZALO_OA_SECRET` - Your Official Account secret
- `WEBHOOK_SECRET` - Secret for webhook validation
- `ZALO_API_BASE_URL` - Zalo API base URL (default: https://openapi.zalo.me)
- `PORT` - Server port (default: 3000)

5. Set up the database:
```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Or run migrations (for production)
bun run db:migrate
```

## Development

### Local Development (without Docker)
Start the development server with hot reload:
```bash
bun run dev
```

### Docker Development
Start the complete development environment with PostgreSQL:
```bash
# Using the helper script
./scripts/docker-dev.sh up

# Or using docker-compose directly
docker-compose -f docker-compose-dev.yml up --build
```

The server will start on `http://localhost:3000` and PostgreSQL on `localhost:5432`.

**Docker Services:**
- **App**: Zalo Bot application with hot reload
- **PostgreSQL**: Database server
- **pgAdmin**: Database management UI at `http://localhost:8080`

### Docker Commands
```bash
# Start services
npm run docker:dev

# Stop services
npm run docker:down

# View logs
npm run docker:logs

# Access app container shell
npm run docker:shell

# View all available commands
./scripts/docker-dev.sh
```

## Production

### Local Production
```bash
bun start
```

### Docker Production
```bash
# Set production environment variables
cp .env.docker .env
# Edit .env with production values

# Start production services
docker-compose -f docker-compose.prod.yml up --build -d
```

## API Endpoints

### Webhook
- `GET /webhook` - Webhook verification
- `POST /webhook` - Webhook event handler

### Bot Management
- `POST /api/send-message` - Send message to user
- `POST /api/broadcast` - Send broadcast message
- `GET /api/users` - Get all users with pagination
- `GET /api/messages/:userId` - Get user message history

### Health Check
- `GET /health` - Service health status

## Bot Commands

The bot supports the following commands:
- `hello/hi/xin chào` - Greeting message
- `help/giúp đỡ` - Show help menu
- `info/thông tin` - Bot information
- `echo [text]` - Echo back the message
- `time/thời gian` - Show current time
- `stats/thống kê` - Show user statistics

## Webhook Setup

1. Start your local server or deploy to a hosting service
2. Use ngrok to expose your local server (for development):
```bash
ngrok http 3000
```
3. Configure the webhook URL in your Zalo Official Account dashboard:
   - Webhook URL: `https://your-domain.com/webhook`
   - Verify Token: Your `WEBHOOK_SECRET`

## Database Schema

The service includes the following models:
- **User**: Zalo user information
- **Message**: Message history with type and direction
- **Conversation**: Conversation tracking
- **BotConfig**: Bot configuration settings

## Message Types Supported

- Text messages
- Images
- Files
- Stickers
- Location sharing

## Configuration

Bot behavior can be configured through the database using the `/bot/config` endpoints:
- Welcome message
- Default responses
- Bot enable/disable
- Message length limits

## Logging

The service includes comprehensive logging for:
- Webhook events
- API calls
- Database operations
- Error tracking

## Security

- Webhook signature validation
- Request timestamp verification
- Environment variable protection
- SQL injection prevention through Prisma

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
## Doc
ker Environment

### Development Environment
The `docker-compose-dev.yml` includes:
- **Zalo Bot App**: Hot reload development server
- **PostgreSQL 15**: Database with persistent storage
- **pgAdmin**: Web-based database management
- **Health checks**: Ensures services start in correct order
- **Volume mounts**: Live code reloading

### Production Environment
The `docker-compose.prod.yml` includes:
- **Zalo Bot App**: Optimized production build
- **PostgreSQL 15**: Production database
- **Automatic migrations**: Database schema updates
- **Restart policies**: Auto-restart on failure

### Environment Variables
Create `.env` file from template:
```bash
cp .env.docker .env
```

Required variables:
- `ZALO_BOT_TOKEN`: Your Zalo bot token
- `WEBHOOK_URL`: Your public webhook URL
- `WEBHOOK_SECRET`: Webhook validation secret
- `POSTGRES_PASSWORD`: Database password (production)

### Database Access
- **Application**: `postgresql://zalo_user:zalo_password@localhost:5432/zalo_bot_db`
- **pgAdmin**: `http://localhost:8080` (admin@zalobot.com / admin123)
- **Direct access**: `./scripts/docker-dev.sh db-shell`

### Troubleshooting
```bash
# Check service status
./scripts/docker-dev.sh status

# View logs
./scripts/docker-dev.sh logs-app
./scripts/docker-dev.sh logs-db

# Reset environment
./scripts/docker-dev.sh reset

# Clean up resources
./scripts/docker-dev.sh clean
```##
 Code Quality

### Biome Configuration
The project uses Biome for fast code formatting and linting:

**Available Scripts:**
```bash
# Format code
bun run format              # Format and write changes
bun run format:check        # Check formatting without changes

# Lint code
bun run lint                # Check for linting issues
bun run lint:fix            # Fix linting issues automatically

# Combined check
bun run check               # Check both formatting and linting
bun run check:fix           # Fix both formatting and linting issues
```

**IDE Integration:**
- VS Code settings included for automatic formatting on save
- Biome extension recommended for optimal experience
- Consistent code style across the project

**Configuration:**
- `biome.json` - Main configuration file
- `.biomeignore` - Files to exclude from formatting/linting
- `.vscode/settings.json` - VS Code integration settings