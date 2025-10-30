# Database Initialization Scripts

This directory contains SQL scripts that initialize the PostgreSQL database when the Docker container starts for the first time.

## Script Execution Order

The scripts are executed in alphabetical order by PostgreSQL's `docker-entrypoint-initdb.d` mechanism:

1. **`01-init.sql`** - Basic database setup
   - Creates extensions (uuid-ossp, pgcrypto)
   - Sets up user permissions
   - Creates utility functions for timestamps

2. **`02-seed-data.sql`** - Seed data preparation
   - Prepares templates for default bot configurations
   - Note: Actual data insertion happens after Prisma schema

3. **`03-indexes.sql`** - Performance optimizations
   - Creates index creation functions
   - Optimizes queries for users, messages, conversations
   - Indexes are created after Prisma applies schema

4. **`04-functions.sql`** - Utility functions
   - Message statistics functions
   - Cleanup functions
   - Active user counting
   - Bot configuration management

5. **`99-post-init.sql`** - Final setup
   - Database views (created after schema)
   - Maintenance functions
   - Completion logging

## Important Notes

### Prisma Integration
- These scripts prepare the database environment
- Actual table creation is handled by Prisma (`bunx prisma db push`)
- Some functions are templated and become active after Prisma schema application

### Development vs Production
- These scripts are designed for development environment
- Production should use Prisma migrations instead of `db push`
- Seed data should be handled by application logic in production

### Script Modifications
- Scripts can be modified before first container startup
- Changes to existing containers require volume reset: `docker-compose down -v`
- New scripts are only executed on fresh database initialization

### Index Creation Notes
- `03-indexes.sql` creates a function for index creation (without CONCURRENTLY)
- `post-prisma-indexes.sql` can be run manually after Prisma schema application
- Application automatically creates indexes during initialization
- CONCURRENTLY cannot be used inside functions, so regular CREATE INDEX is used

## Usage

### First Time Setup
```bash
# Start fresh development environment
docker-compose -f docker-compose-dev.yml up --build

# The scripts will run automatically during PostgreSQL initialization
```

### Reset Database
```bash
# Stop and remove volumes
docker-compose -f docker-compose-dev.yml down -v

# Start fresh (scripts will run again)
docker-compose -f docker-compose-dev.yml up --build
```

### Manual Execution
```bash
# Access PostgreSQL container
docker-compose -f docker-compose-dev.yml exec postgres psql -U zalo_user -d zalo_bot_db

# Run specific functions
SELECT database_maintenance();
SELECT get_message_stats();
```

## Customization

### Adding New Scripts
1. Create new `.sql` file with appropriate number prefix
2. Follow naming convention: `NN-description.sql`
3. Include `\echo` statements for logging
4. Test with fresh container startup

### Modifying Existing Scripts
1. Stop containers: `docker-compose down -v`
2. Edit script files
3. Restart: `docker-compose up --build`
4. Verify changes in logs

## Troubleshooting

### Script Errors
- Check container logs: `docker-compose logs postgres`
- Scripts stop execution on first error
- Fix errors and reset database volume

### Permission Issues
- Ensure `zalo_user` has proper permissions
- Check `01-init.sql` for permission grants
- Verify database connection from application

### Performance Issues
- Run `ANALYZE` after schema changes
- Check if indexes are created properly
- Use `database_maintenance()` function periodically