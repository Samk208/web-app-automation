import { MCPClient } from '../src/lib/mcp/client';
import { MCP_SERVERS } from '../src/lib/mcp/config';

async function verify() {
    console.log("Starting MCP Verification...");

    // Test Document Generator
    const config = MCP_SERVERS['document-generator'];
    console.log(`[Test] Testing connection to ${config.id}...`);

    const client = new MCPClient(config);

    try {
        await client.connect();
        console.log(`[Test] Connected to ${config.id}`);

        // Try to list tools (if supported) or just wait a bit to ensure it doesn't crash
        // Most MCP servers support 'tools/list'
        console.log(`[Test] Listing tools...`);
        try {
            // We need to bypass the strict type requiring 'tools/list' if it's not in our simple types yet
            // but our client.callMethod takes string.
            const tools = await client.listTools();
            console.log(`[Test] Tools available:`, JSON.stringify(tools, null, 2));
        } catch (e: any) {
            console.warn(`[Test] Failed to list tools (might not be supported or server error):`, e.message);
        }

    } catch (e: any) {
        console.error(`[Test] Failed to connect to ${config.id}:`, e.message);
    } finally {
        client.disconnect();
        console.log(`[Test] Disconnected from ${config.id}`);
    }
}

// Check if we can run this directly with ts-node
if (require.main === module) {
    verify().catch(console.error);
}
