// Standalone verification script to test MCP connection without relying on local imports or build steps
import { ChildProcess, spawn } from 'child_process';

interface MCPServerConfig {
    id: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
}

const isWin = process.platform === 'win32';
const npx = isWin ? 'npx.cmd' : 'npx';

const MCP_SERVERS: Record<string, MCPServerConfig> = {
    'document-generator': {
        id: 'document-generator',
        command: npx,
        args: ['-y', 'thiagotw10-document-generator-mcp'],
    }
};

class SimpleMCPClient {
    private process: ChildProcess | null = null;
    private config: MCPServerConfig;

    constructor(config: MCPServerConfig) {
        this.config = config;
    }

    async connect() {
        console.log(`[MCP] Spawning ${this.config.command} ${this.config.args.join(' ')}`);

        this.process = spawn(this.config.command, this.config.args, {
            env: { ...process.env, ...this.config.env },
            stdio: ['pipe', 'pipe', 'pipe']
        });

        this.process.stdout?.on('data', (data) => console.log(`[STDOUT] ${data}`));
        this.process.stderr?.on('data', (data) => console.log(`[STDERR] ${data}`));

        this.process.on('error', (err) => console.error(`[ERROR] ${err}`));
        this.process.on('exit', (code) => console.log(`[EXIT] Code: ${code}`));

        // Give it a moment to start
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    disconnect() {
        this.process?.kill();
    }
}

async function verify() {
    const config = MCP_SERVERS['document-generator'];
    const client = new SimpleMCPClient(config);
    await client.connect();
    console.log("Process spawned and waited for 5s. If no errors above, it likely started.");
    client.disconnect();
}

verify();
