-- Create storage buckets for document and diagram storage
-- This is required for Business Plan Master and other document-generating agents

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'business-plans',
    'business-plans',
    false,
    52428800, -- 50MB
    ARRAY['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'text/markdown', 'text/plain']
  ),
  (
    'proposals',
    'proposals',
    false,
    52428800, -- 50MB
    ARRAY['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'text/markdown', 'text/plain']
  ),
  (
    'diagrams',
    'diagrams',
    true, -- Public for easy embedding
    10485760, -- 10MB
    ARRAY['image/png', 'image/svg+xml', 'image/jpeg']
  )
ON CONFLICT (id) DO NOTHING;
