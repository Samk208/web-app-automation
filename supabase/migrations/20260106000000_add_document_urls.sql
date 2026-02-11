-- Add document_url column to business_plans and proposals tables
-- This stores the Supabase Storage signed URL for downloadable documents

-- Business Plans table
ALTER TABLE business_plans
ADD COLUMN IF NOT EXISTS document_url TEXT;

COMMENT ON COLUMN business_plans.document_url IS 'Supabase Storage signed URL for downloadable DOCX file';

-- Proposals table
ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS document_url TEXT;

COMMENT ON COLUMN proposals.document_url IS 'Supabase Storage signed URL for downloadable DOCX file';

-- Create storage buckets if they don't exist
-- Note: This is handled in the application code, but documenting here for reference
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('business-plans', 'business-plans', false),
--        ('proposals', 'proposals', false)
-- ON CONFLICT (id) DO NOTHING;

-- Add indexes for faster document URL lookups
CREATE INDEX IF NOT EXISTS idx_business_plans_document_url
ON business_plans(document_url)
WHERE document_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_proposals_document_url
ON proposals(document_url)
WHERE document_url IS NOT NULL;
