
// Simple script to test the API locally
// Usage: ts-node scripts/test-mcp.ts

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function main() {
    console.log("Testing MCP API...");

    // Note: This requires a valid session or disabled auth in the API for testing
    // For a CLI test, we might mock the auth or login first.
    // Here we'll just show the fetch structure.

    const res = await fetch('http://localhost:3000/api/mcp/document-generator', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Cookie': '...auth cookie...' 
        },
        body: JSON.stringify({
            type: 'generation',
            content: 'Create a business plan for a coffee shop in Seoul.',
            format: 'docx'
        })
    });

    const data = await res.json();
    console.log('Response:', data);
}

// main();
