import { MCPClient } from '@/lib/mcp/client';
import { MCP_SERVERS } from '@/lib/mcp/config';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await (await supabase).auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { type, content, format = 'docx' } = body;

        // Determine which server to use
        let serverConfig;
        let toolName;
        let toolArgs;

        if (type === 'translate') {
            serverConfig = MCP_SERVERS['doctranslate'];
            toolName = 'translate_document'; // Hypothetical tool name
            toolArgs = { content, target_format: format };
        } else {
            // Default to document generator
            serverConfig = MCP_SERVERS['document-generator'];
            toolName = 'generate_document'; // Hypothetical tool name
            toolArgs = { content, format };
        }

        if (!serverConfig) {
            return NextResponse.json({ error: 'MCP Server not configured' }, { status: 500 });
        }

        // Initialize Client
        const client = new MCPClient(serverConfig);

        try {
            await client.connect();

            // Optional: List tools to verify discovery (can be removed in prod)
            // const tools = await client.listTools();
            // console.log('Available tools:', tools);

            const result = await client.callTool(toolName, toolArgs);

            // Process result
            // Assuming result.content contains the file data or text
            // If it's a file generation, we expect some binary or base64

            let downloadUrl = null;

            if (result && result.content) {
                for (const item of result.content) {
                    if (item.type === 'text') {
                        // If it's just text, maybe we create a file from it?
                        // Or if the tool returns base64 in text field?
                        // For now, let's assume we might receive text content to save.
                        const buffer = Buffer.from(item.text || '', 'utf-8');
                        const fileName = `generated_${Date.now()}.${format}`;

                        const { data: uploadData, error: uploadError } = await (await supabase)
                            .storage
                            .from('documents')
                            .upload(`${user.id}/${fileName}`, buffer, {
                                contentType: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            });

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = (await supabase)
                            .storage
                            .from('documents')
                            .getPublicUrl(`${user.id}/${fileName}`);

                        downloadUrl = publicUrl;
                    }
                    // Handle 'resource' or 'binary' types if MCP supports them explicitly in future
                }
            }

            return NextResponse.json({
                success: true,
                url: downloadUrl,
                raw_result: result // Return raw result for debugging 
            });

        } finally {
            client.disconnect();
        }

    } catch (error: any) {
        console.error('MCP API Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
