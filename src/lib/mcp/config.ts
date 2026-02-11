import { MCPServerConfig } from '@/types/mcp';

const isWin = process.platform === 'win32';
const npx = isWin ? 'npx.cmd' : 'npx';

export const MCP_SERVERS: Record<string, MCPServerConfig> = {
    'document-generator': {
        id: 'document-generator',
        command: npx,
        args: ['-y', 'thiagotw10-document-generator-mcp'],
    },
    'famano-office': {
        id: 'famano-office',
        command: npx, // Assuming it's runnable via npx or we might need python
        args: ['-y', 'famano-office'], // Validation needed if this package strictly exists or needs git clone
    },
    'doctranslate': {
        id: 'doctranslate',
        command: npx,
        args: ['-y', 'doctranslate-io-mcp'],
    }
};

// Fallback for python based servers if npx doesn't work directly
/*
export const PYTHON_MCP_SERVERS = {
    'famano-office': {
        id: 'famano-office',
        command: 'python',
        args: ['path/to/famano-office/server.py']
    }
}
*/
