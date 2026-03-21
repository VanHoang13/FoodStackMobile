-- Add missing tables for new features

-- Service Requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
    id text NOT NULL,
    table_id text NOT NULL,
    branch_id text NOT NULL,
    restaurant_id text NOT NULL,
    type text NOT NULL CHECK (type = ANY (ARRAY['CALL_STAFF'::text, 'WATER'::text, 'NAPKINS'::text, 'UTENSILS'::text, 'BILL'::text, 'CLEAN_TABLE'::text, 'COMPLAINT'::text, 'OTHER'::text])),
    description text NOT NULL,
    priority text NOT NULL DEFAULT 'NORMAL'::text CHECK (priority = ANY (ARRAY['LOW'::text, 'NORMAL'::text, 'HIGH'::text, 'URGENT'::text])),
    status text NOT NULL DEFAULT 'PENDING'::text CHECK (status = ANY (ARRAY['PENDING'::text, 'IN_PROGRESS'::text, 'COMPLETED'::text, 'CANCELLED'::text])),
    customer_name text,
    customer_phone text,
    assigned_to text,
    notes text,
    completed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT service_requests_pkey PRIMARY KEY (id),
    CONSTRAINT service_requests_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id),
    CONSTRAINT service_requests_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id),
    CONSTRAINT service_requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id)
);

-- Update feedbacks table to match new structure
ALTER TABLE public.feedbacks 
DROP CONSTRAINT IF EXISTS feedbacks_order_id_fkey;

ALTER TABLE public.feedbacks 
ALTER COLUMN order_id DROP NOT NULL;

-- Add missing columns to feedbacks
ALTER TABLE public.feedbacks 
ADD COLUMN IF NOT EXISTS food_quality_rating integer,
ADD COLUMN IF NOT EXISTS atmosphere_rating integer,
ADD COLUMN IF NOT EXISTS price_rating integer,
ADD COLUMN IF NOT EXISTS cleanliness_rating integer,
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS would_recommend boolean,
ADD COLUMN IF NOT EXISTS visit_again boolean,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'ACTIVE'::text;

-- Update subscriptions table structure
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS plan_id text,
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'MONTHLY'::text,
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS auto_renew boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS starts_at timestamp without time zone,
ADD COLUMN IF NOT EXISTS expires_at timestamp without time zone,
ADD COLUMN IF NOT EXISTS coupon_code text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp without time zone,
ADD COLUMN IF NOT EXISTS cancellation_reason text;

-- Rename columns in subscriptions to match new structure
ALTER TABLE public.subscriptions 
RENAME COLUMN start_date TO starts_at_old;
ALTER TABLE public.subscriptions 
RENAME COLUMN end_date TO expires_at_old;

-- Update payments table to support more methods
ALTER TABLE public.payments 
DROP CONSTRAINT IF EXISTS payments_method_check;

ALTER TABLE public.payments 
ADD CONSTRAINT payments_method_check 
CHECK (method = ANY (ARRAY['PAYOS'::text, 'MOMO'::text, 'ZALOPAY'::text, 'BANKING_QR'::text, 'CASH'::text, 'QR_PAY'::text, 'E_WALLET'::text]));

-- Add missing columns to payments
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS customer_email text,
ADD COLUMN IF NOT EXISTS return_url text,
ADD COLUMN IF NOT EXISTS cancel_url text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS webhook_data jsonb;

-- Add missing columns to orders for restaurant_id
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS restaurant_id text;

-- Update restaurant_id in orders based on branch
UPDATE public.orders 
SET restaurant_id = b.restaurant_id 
FROM public.branches b 
WHERE orders.branch_id = b.id 
AND orders.restaurant_id IS NULL;

-- Add foreign key constraint
ALTER TABLE public.orders 
ADD CONSTRAINT orders_restaurant_id_fkey 
FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_requests_table_id ON public.service_requests(table_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_branch_id ON public.service_requests(branch_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON public.service_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_feedbacks_restaurant_id ON public.feedbacks(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_branch_id ON public.feedbacks(branch_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Add updated_at column to subscription_plans if missing
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Insert sample subscription plans
INSERT INTO public.subscription_plans (id, name, description, price, billing_cycle, max_branches, max_tables, max_menu_items, features, is_active, created_at, updated_at) 
VALUES 
('basic-plan', 'Basic Plan', 'Perfect for small restaurants', 99000, 'MONTHLY', 1, 10, 50, '{"analytics": false, "custom_branding": false, "priority_support": false}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('premium-plan', 'Premium Plan', 'Great for growing businesses', 299000, 'MONTHLY', 5, 100, 500, '{"analytics": true, "custom_branding": true, "priority_support": false}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('enterprise-plan', 'Enterprise Plan', 'For large restaurant chains', 999000, 'MONTHLY', 999, 9999, 9999, '{"analytics": true, "custom_branding": true, "priority_support": true}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert feature limits for subscription plans (create plans first)
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