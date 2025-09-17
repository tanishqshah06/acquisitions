# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server with auto-reload using Node.js `--watch` flag
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without making changes

### Database Operations
- `npm run db:generate` - Generate Drizzle migrations from schema changes
- `npm run db:migrate` - Apply pending migrations to the database
- `npm run db:studio` - Launch Drizzle Studio for database visualization and management

## Project Architecture

### Technology Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Validation**: Zod schemas
- **Authentication**: JWT with bcrypt password hashing
- **Logging**: Winston with file-based logging

### Directory Structure & Import Aliases
The project uses Node.js subpath imports for clean module resolution:
- `#config/*` → `./src/config/*` - Database connection, logger configuration
- `#controllers/*` → `./src/controllers/*` - HTTP request handlers
- `#middleware/*` → `./src/middleware/*` - Express middleware functions
- `#models/*` → `./src/models/*` - Drizzle database schemas
- `#routes/*` → `./src/routes/*` - Express route definitions
- `#services/*` → `./src/services/*` - Business logic layer
- `#utils/*` → `./src/utils/*` - Utility functions (JWT, cookies, formatters)
- `#validations/*` → `./src/validations/*` - Zod validation schemas

### Application Flow
1. **Entry Point**: `src/index.js` loads environment variables and starts the server
2. **Server Setup**: `src/server.js` initializes the Express app on configured port
3. **App Configuration**: `src/app.js` sets up middleware stack (helmet, cors, morgan, cookie-parser)
4. **Request Flow**: Routes → Controllers → Services → Database Models

### Database Architecture
- **Connection**: Neon serverless PostgreSQL via `@neondatabase/serverless`
- **Schema Management**: Drizzle ORM with migrations in `./drizzle/` directory
- **Models**: Currently implements `users` table with authentication fields
- **Configuration**: Database URL and schema paths defined in `drizzle.config.js`

### Authentication System
- **Password Security**: bcrypt hashing with salt rounds (10)
- **Token Management**: JWT tokens stored in HTTP-only cookies
- **Validation**: Zod schemas for input validation with detailed error formatting
- **User Roles**: Supports 'user' and 'admin' roles with enum validation

### Logging Strategy
- **Library**: Winston logger with file and console transports
- **Log Files**: `logs/combined.log` and `logs/error.log`
- **HTTP Logging**: Morgan middleware integrated with Winston
- **Structured Logging**: Consistent logging patterns across controllers and services

### Code Style & Quality
- **ESLint**: Configured for ES2022 modules with custom rules (2-space indent, single quotes, semicolons required)
- **Prettier**: Enforces consistent formatting (single quotes, trailing commas, 80 char width)
- **Import Style**: ES modules throughout with path aliases for internal imports