# Acquisitions Application - Dockerized with Neon Database

A Node.js Express application configured to work with both Neon Local (development) and Neon Cloud (production) databases using Docker.

## 🏗️ Architecture Overview

This application uses different database configurations for different environments:

- **Development**: Uses Neon Local proxy running in Docker for ephemeral database branches
- **Production**: Uses Neon Cloud database with direct connection

## 📋 Prerequisites

- Docker and Docker Compose installed
- A Neon account with a project set up
- Node.js 20+ (for local development without Docker)

### Required Neon Credentials

1. **NEON_API_KEY**: Get from [Neon Console → Account Settings → API Keys](https://console.neon.tech/app/settings/api-keys)
2. **NEON_PROJECT_ID**: Found in [Neon Console → Project Settings → General](https://console.neon.tech)
3. **PARENT_BRANCH_ID**: Your main branch ID (usually `main` branch)

## 🚀 Development Setup (Neon Local)

### 1. Configure Development Environment

Copy and configure your development environment:

```bash
# Copy the development environment template
cp .env.development .env.dev

# Edit .env.dev with your Neon credentials
# Update the following values:
# NEON_API_KEY=your_actual_neon_api_key
# NEON_PROJECT_ID=your_actual_project_id  
# PARENT_BRANCH_ID=your_parent_branch_id
# ARCJET_KEY=your_actual_arcjet_key
```

### 2. Start Development Environment

```bash
# Build and start the development environment
docker-compose --env-file .env.dev -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose --env-file .env.dev -f docker-compose.dev.yml up --build -d
```

### 3. Access the Application

- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Endpoint**: http://localhost:3000/api

### 4. Development Features

- **Hot Reloading**: Source code changes are automatically reflected
- **Ephemeral Branches**: Each container start creates a fresh database branch
- **Automatic Cleanup**: Database branches are deleted when containers stop
- **Git Branch Persistence**: Optional branch persistence per Git branch (configured via volumes)

### 5. Stop Development Environment

```bash
docker-compose -f docker-compose.dev.yml down
```

## 🌐 Production Setup (Neon Cloud)

### 1. Configure Production Environment

```bash
# Copy the production environment template
cp .env.production .env.prod

# Edit .env.prod with your production Neon Cloud URL
# Update DATABASE_URL to your actual Neon Cloud connection string
# Format: postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### 2. Deploy to Production

```bash
# Build and start the production environment
docker-compose --env-file .env.prod -f docker-compose.prod.yml up --build

# Or run in detached mode
docker-compose --env-file .env.prod -f docker-compose.prod.yml up --build -d
```

### 3. Production Features

- **Optimized Build**: Multi-stage Docker build with production optimizations
- **Security Hardened**: Read-only filesystem, non-root user, security options
- **Resource Limited**: Memory and CPU limits configured
- **Health Monitoring**: Built-in health checks and restart policies
- **Logging**: Structured logging with rotation

### 4. Stop Production Environment

```bash
docker-compose -f docker-compose.prod.yml down
```

## 🔧 Environment Variables Reference

### Development (.env.development)
```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb?sslmode=require
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
PARENT_BRANCH_ID=your_parent_branch_id_here
ARCJET_KEY=your_arcjet_key_here
DEBUG=true
ENABLE_LOGGING=true
```

### Production (.env.production)
```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require
ARCJET_KEY=your_arcjet_key_here
DEBUG=false
ENABLE_LOGGING=true
MAX_CONNECTIONS=20
CONNECTION_TIMEOUT=30000
```

## 🗄️ Database Management

### Development Database Operations

```bash
# Access the development database directly
docker exec -it acquisitions-neon-local psql -U neon -d neondb

# Run migrations in development
docker-compose --env-file .env.dev -f docker-compose.dev.yml exec app npm run db:migrate

# Generate new migrations
docker-compose --env-file .env.dev -f docker-compose.dev.yml exec app npm run db:generate
```

### Production Database Operations

```bash
# Run migrations in production
docker-compose --env-file .env.prod -f docker-compose.prod.yml exec app npm run db:migrate

# Check application logs
docker-compose -f docker-compose.prod.yml logs -f app
```

## 🔍 Troubleshooting

### Common Development Issues

1. **Neon Local not starting**:
   ```bash
   # Check if your Neon credentials are correct
   docker-compose --env-file .env.dev -f docker-compose.dev.yml logs neon-local
   ```

2. **Application can't connect to database**:
   ```bash
   # Verify network connectivity
   docker-compose --env-file .env.dev -f docker-compose.dev.yml exec app ping neon-local
   ```

3. **Permission issues with volumes** (Windows):
   ```bash
   # Ensure Docker has access to your project directory
   # Check Docker Desktop → Settings → Resources → File Sharing
   ```

### Common Production Issues

1. **Database connection timeout**:
   - Verify your Neon Cloud DATABASE_URL is correct
   - Check if your production environment has internet access
   - Ensure SSL certificates are properly configured

2. **Health check failures**:
   ```bash
   # Check application health manually
   docker-compose -f docker-compose.prod.yml exec app curl http://localhost:3000/health
   ```

## 📊 Monitoring and Logging

### View Logs

```bash
# Development logs
docker-compose -f docker-compose.dev.yml logs -f

# Production logs
docker-compose -f docker-compose.prod.yml logs -f

# Specific service logs
docker-compose -f docker-compose.dev.yml logs -f app
docker-compose -f docker-compose.dev.yml logs -f neon-local
```

### Health Checks

Both environments include health checks:
- Application health: `GET /health`
- Database health: Automatic health checks in Docker Compose

## 🚀 Deployment Strategies

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: |
          docker-compose --env-file .env.prod -f docker-compose.prod.yml up --build -d
        env:
          DATABASE_URL: ${{ secrets.NEON_DATABASE_URL }}
          ARCJET_KEY: ${{ secrets.ARCJET_KEY }}
```

### Scaling

For production scaling, consider:
- Using Docker Swarm or Kubernetes
- Load balancing multiple application instances
- Connection pooling for database connections
- Implementing caching strategies

## 🔐 Security Considerations

### Development Security
- Neon Local creates ephemeral branches (no persistent sensitive data)
- Local network isolation via Docker networks
- Environment variable isolation

### Production Security
- Non-root user execution
- Read-only filesystem
- Resource limits and security options
- Encrypted connections to Neon Cloud
- Secret management via environment variables

## 📚 Additional Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Neon Database Documentation](https://neon.com/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test in both development and production configurations
4. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.