-- Create missing tables for FoodStack

-- Service Requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
    id text NOT NULL PRIMARY KEY,
    table_id text NOT NULL,
    branch_id text NOT NULL,
    restaurant_id text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    priority text NOT NULL DEFAULT 'NORMAL',
    status text NOT NULL DEFAULT 'PENDING',
    customer_name text,
    customer_phone text,
    assigned_to text,
    notes text,
    completed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to existing tables
ALTER TABLE public.feedbacks 
ADD COLUMN IF NOT EXISTS food_quality_rating integer,
ADD COLUMN IF NOT EXISTS atmosphere_rating integer,
ADD COLUMN IF NOT EXISTS price_rating integer,
ADD COLUMN IF NOT EXISTS cleanliness_rating integer,
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS would_recommend boolean,
ADD COLUMN IF NOT EXISTS visit_again boolean,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'ACTIVE';

-- Make order_id nullable in feedbacks
ALTER TABLE public.feedbacks ALTER COLUMN order_id DROP NOT NULL;

-- Add missing columns to payments
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS customer_email text,
ADD COLUMN IF NOT EXISTS return_url text,
ADD COLUMN IF NOT EXISTS cancel_url text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS webhook_data jsonb;

-- Add restaurant_id to orders if missing
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS restaurant_id text;

-- Add updated_at to subscription_plans if missing
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Update subscription_plans data
INSERT INTO public.subscription_plans (id, name, description, price, billing_cycle, max_branches, max_tables, max_menu_items, features, is_active, created_at, updated_at) 
VALUES 
('basic-plan', 'Basic Plan', 'Perfect for small restaurants', 99000, 'MONTHLY', 1, 10, 50, '{}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('premium-plan', 'Premium Plan', 'Great for growing businesses', 299000, 'MONTHLY', 5, 100, 500, '{}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('enterprise-plan', 'Enterprise Plan', 'For large restaurant chains', 999000, 'MONTHLY', 999, 9999, 9999, '{}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    updated_at = CURRENT_TIMESTAMP;

-- Create feature limits
INSERT INTO public.subscription_feature_limits (id, subscription_plan_id, feature_name, limit_value, created_at) 
VALUES 
('basic-branches', 'basic-plan', 'max_branches', 1, CURRENT_TIMESTAMP),
('basic-tables', 'basic-plan', 'max_tables', 10, CURRENT_TIMESTAMP),
('basic-menu-items', 'basic-plan', 'max_menu_items', 50, CURRENT_TIMESTAMP),
('basic-staff', 'basic-plan', 'max_staff', 5, CURRENT_TIMESTAMP),
('premium-branches', 'premium-plan', 'max_branches', 5, CURRENT_TIMESTAMP),
('premium-tables', 'premium-plan', 'max_tables', 100, CURRENT_TIMESTAMP),
('premium-menu-items', 'premium-plan', 'max_menu_items', 500, CURRENT_TIMESTAMP),
('premium-staff', 'premium-plan', 'max_staff', 25, CURRENT_TIMESTAMP),
('enterprise-branches', 'enterprise-plan', 'max_branches', 999, CURRENT_TIMESTAMP),
('enterprise-tables', 'enterprise-plan', 'max_tables', 9999, CURRENT_TIMESTAMP),
('enterprise-menu-items', 'enterprise-plan', 'max_menu_items', 9999, CURRENT_TIMESTAMP),
('enterprise-staff', 'enterprise-plan', 'max_staff', 999, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;