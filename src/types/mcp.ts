export interface JSONRPCRequest {
    jsonrpc: '2.0';
    method: string;
    params?: any;
    id?: string | number | null;
}

export interface JSONRPCResponse {
    jsonrpc: '2.0';
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    id: string | number | null;
}

export interface MCPTool {
    name: string;
    description?: string;
    inputSchema: any;
}

export interface MCPCallToolRequest {
    method: 'tools/call';
    params: {
        name: string;
        arguments: any;
    };
}

export interface MCPCallToolResult {
    content: Array<{
        type: 'text' | 'image' | 'resource';
        text?: string;
        data?: string;
        mimeType?: string;
        resource?: any;
    }>;
    isError?: boolean;
}

export interface MCPServerConfig {
    id: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
}
