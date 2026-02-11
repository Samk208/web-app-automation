DO $pgvector$
BEGIN
    -- pgvector requires superuser; skip locally if we don't have it to keep migrations running
    IF NOT (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) THEN
        RAISE NOTICE 'Skipping pgvector extension setup because % is not a superuser', current_user;
        RETURN;
    END IF;

    -- Enable the pgvector extension to work with embedding vectors
    CREATE EXTENSION IF NOT EXISTS vector;

    -- Add embedding column to startup_programs table
    -- precise dimensionality depends on the model (1536 for text-embedding-3-small)
    ALTER TABLE startup_programs
        ADD COLUMN IF NOT EXISTS embedding vector(1536);

    -- Create a function to search for grants by similarity
    CREATE OR REPLACE FUNCTION match_grants (
        query_embedding vector(1536),
        match_threshold float,
        match_count int
    )
    RETURNS TABLE (
        id uuid,
        name text,
        category text,
        funding_amount text,
        similarity float
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
        RETURN QUERY
        SELECT
            startup_programs.id,
            startup_programs.name,
            startup_programs.category,
            startup_programs.funding_amount,
            1 - (startup_programs.embedding <=> query_embedding) AS similarity
        FROM startup_programs
        WHERE 1 - (startup_programs.embedding <=> query_embedding) > match_threshold
        ORDER BY startup_programs.embedding <=> query_embedding
        LIMIT match_count;
    END;
    $$;
END
$pgvector$;
