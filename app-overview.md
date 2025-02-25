# Restaurant Management Application Overview

## Project Summary
This is a web application for restaurant management built with Next.js, TypeScript, and Supabase. The application allows restaurant owners to manage menus, track table orders, and view sales insights.

## Core Features

### 1. Menu Management
- Hierarchical structure: Restaurant → Menu → Menu Group → Menu Item
- CRUD operations for menus, groups, and items
- Search and filtering capabilities

### 2. Order Management
- Table-based order system with status tracking
- Order statuses: `active`, `closed`
- Item statuses: `pending`, `preparing`, `ready`, `delivered`
- Real-time updates for kitchen staff

### 3. Kitchen View
- Dedicated interface for kitchen staff
- Items organized by status (pending, preparing, ready)
- Status updates for order items

### 4. Analytics & Insights
- Monthly revenue tracking
- Order count statistics
- Data visualization with Chart.js

### 5. Subscription System
- Tiered subscription model (free/pro)
- Trial period functionality
- Stripe integration for payments
- Different billing periods (monthly, semester, yearly)
- Custom features for premium subscribers

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Chart.js for data visualization
- React Context for state management

### Backend
- Supabase (PostgreSQL)
- Row-Level Security (RLS) for data protection
- Stored procedures for business logic
- Stripe integration for payments

### Database Schema
- `restaurants`: Core entity with user association
- `menus`, `menu_groups`, `menu_items`: Menu hierarchy
- `tables`: Restaurant tables with status tracking
- `orders`: Order management with status
- `order_items`: Individual items in orders with status tracking
- `custom_features`: Premium features for subscription tiers
- `product_prices`: Subscription pricing options

## Key Concepts

### Authentication
- Supabase Auth for user management
- AuthContext for client-side auth state

### Data Access Patterns
- Row-Level Security ensures users only access their own data
- Database functions for complex operations
- Timezone handling (America/Sao_Paulo)

### Subscription Management
- Trial functionality with automatic expiration
- Multiple billing periods
- Custom features for premium subscribers

### UI Components
- Modal dialogs for forms
- Confirmation dialogs for destructive actions
- Responsive design with sidebar navigation
- Status indicators with color coding

## Development Workflow
- Migrations for database schema changes
- TypeScript types for database entities
- Client-side components with server data fetching
- Error handling and loading states

## Environment Configuration
- Supabase URL and API keys
- Stripe integration keys
- Next.js configuration 