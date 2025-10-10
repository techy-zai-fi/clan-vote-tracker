-- Add 'All' value to the batch_type enum
ALTER TYPE public.batch_type ADD VALUE IF NOT EXISTS 'All';