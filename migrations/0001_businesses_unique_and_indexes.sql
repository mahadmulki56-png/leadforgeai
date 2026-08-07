-- Migration: Add unique constraints and performance indexes on Businesses table
-- Description: Enforces unique (provider, providerBusinessId) constraint to prevent duplicate provider records
--              and adds performance indexes for normalizedName, phone, and domain search lookups.

-- 1. Unique constraint for provider + providerBusinessId
ALTER TABLE businesses 
ADD CONSTRAINT uq_businesses_provider_business_id UNIQUE (provider, provider_business_id);

-- 2. Performance Index for normalizedName
CREATE INDEX IF NOT EXISTS idx_businesses_normalized_name ON businesses (normalized_name);

-- 3. Performance Index for phone
CREATE INDEX IF NOT EXISTS idx_businesses_phone ON businesses (phone);

-- 4. Performance Index for domain
CREATE INDEX IF NOT EXISTS idx_businesses_domain ON businesses (domain);
