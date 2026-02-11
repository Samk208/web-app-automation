-- Storage RLS Policies for Business Plan Master
-- Allows authenticated users to upload/access their organization's files

-- Note: RLS on storage.objects is already enabled by default in Supabase
-- We just need to add our custom policies

DO $policies$
BEGIN
    -- If we don't have privileges to manage storage.objects, skip gracefully
    -- Determine if the current role owns storage.objects; if not, skip to avoid failures
    IF NOT (
        SELECT relowner = (SELECT oid FROM pg_roles WHERE rolname = current_user)
        FROM pg_class
        WHERE relname = 'objects'
          AND relnamespace = 'storage'::regnamespace
    ) THEN
        RAISE NOTICE 'Skipping storage RLS policies migration because current role % lacks ownership on storage.objects', current_user;
        RETURN;
    END IF;

    -- ============================================================================
    -- BUSINESS-PLANS BUCKET POLICIES
    -- ============================================================================
    DROP POLICY IF EXISTS "Users can upload to their org folder in business-plans" ON storage.objects;
    CREATE POLICY "Users can upload to their org folder in business-plans"
        ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (
            bucket_id = 'business-plans' AND
            (storage.foldername(name))[1] IN (
                SELECT organization_id::text
                FROM memberships
                WHERE user_id = auth.uid()
            )
        );

    DROP POLICY IF EXISTS "Users can read from their org folder in business-plans" ON storage.objects;
    CREATE POLICY "Users can read from their org folder in business-plans"
        ON storage.objects FOR SELECT TO authenticated
        USING (
            bucket_id = 'business-plans' AND
            (storage.foldername(name))[1] IN (
                SELECT organization_id::text
                FROM memberships
                WHERE user_id = auth.uid()
            )
        );

    DROP POLICY IF EXISTS "Users can delete from their org folder in business-plans" ON storage.objects;
    CREATE POLICY "Users can delete from their org folder in business-plans"
        ON storage.objects FOR DELETE TO authenticated
        USING (
            bucket_id = 'business-plans' AND
            (storage.foldername(name))[1] IN (
                SELECT organization_id::text
                FROM memberships
                WHERE user_id = auth.uid()
            )
        );

    -- ============================================================================
    -- PROPOSALS BUCKET POLICIES
    -- ============================================================================
    DROP POLICY IF EXISTS "Users can upload to their org folder in proposals" ON storage.objects;
    CREATE POLICY "Users can upload to their org folder in proposals"
        ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (
            bucket_id = 'proposals' AND
            (storage.foldername(name))[1] IN (
                SELECT organization_id::text
                FROM memberships
                WHERE user_id = auth.uid()
            )
        );

    DROP POLICY IF EXISTS "Users can read from their org folder in proposals" ON storage.objects;
    CREATE POLICY "Users can read from their org folder in proposals"
        ON storage.objects FOR SELECT TO authenticated
        USING (
            bucket_id = 'proposals' AND
            (storage.foldername(name))[1] IN (
                SELECT organization_id::text
                FROM memberships
                WHERE user_id = auth.uid()
            )
        );

    DROP POLICY IF EXISTS "Users can delete from their org folder in proposals" ON storage.objects;
    CREATE POLICY "Users can delete from their org folder in proposals"
        ON storage.objects FOR DELETE TO authenticated
        USING (
            bucket_id = 'proposals' AND
            (storage.foldername(name))[1] IN (
                SELECT organization_id::text
                FROM memberships
                WHERE user_id = auth.uid()
            )
        );

    -- ============================================================================
    -- DIAGRAMS BUCKET POLICIES (Public bucket)
    -- ============================================================================
    DROP POLICY IF EXISTS "Users can upload to their org folder in diagrams" ON storage.objects;
    CREATE POLICY "Users can upload to their org folder in diagrams"
        ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (
            bucket_id = 'diagrams' AND
            (storage.foldername(name))[1] IN (
                SELECT organization_id::text
                FROM memberships
                WHERE user_id = auth.uid()
            )
        );

    DROP POLICY IF EXISTS "Public read access to diagrams" ON storage.objects;
    CREATE POLICY "Public read access to diagrams"
        ON storage.objects FOR SELECT TO public
        USING (bucket_id = 'diagrams');

    DROP POLICY IF EXISTS "Users can delete from their org folder in diagrams" ON storage.objects;
    CREATE POLICY "Users can delete from their org folder in diagrams"
        ON storage.objects FOR DELETE TO authenticated
        USING (
            bucket_id = 'diagrams' AND
            (storage.foldername(name))[1] IN (
                SELECT organization_id::text
                FROM memberships
                WHERE user_id = auth.uid()
            )
        );

    -- ============================================================================
    -- SERVICE ROLE BYPASS (for background jobs)
    -- ============================================================================
    DROP POLICY IF EXISTS "Service role has full access to business-plans" ON storage.objects;
    CREATE POLICY "Service role has full access to business-plans"
        ON storage.objects FOR ALL TO service_role
        USING (bucket_id = 'business-plans')
        WITH CHECK (bucket_id = 'business-plans');

    DROP POLICY IF EXISTS "Service role has full access to proposals" ON storage.objects;
    CREATE POLICY "Service role has full access to proposals"
        ON storage.objects FOR ALL TO service_role
        USING (bucket_id = 'proposals')
        WITH CHECK (bucket_id = 'proposals');

    DROP POLICY IF EXISTS "Service role has full access to diagrams" ON storage.objects;
    CREATE POLICY "Service role has full access to diagrams"
        ON storage.objects FOR ALL TO service_role
        USING (bucket_id = 'diagrams')
        WITH CHECK (bucket_id = 'diagrams');
END
$policies$;
