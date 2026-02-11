import { JSONRPCRequest, JSONRPCResponse, MCPServerConfig } from '@/types/mcp';
import { ChildProcess, spawn } from 'child_process';

export class MCPClient {
    private process: ChildProcess | null = null;
    private messageQueue: Map<string | number, { resolve: (res: any) => void, reject: (err: any) => void }> = new Map();
    private nextId = 1;
    private config: MCPServerConfig;

    constructor(config: MCPServerConfig) {
        this.config = config;
    }

    async connect() {
        if (this.process) return;

        console.log(`[MCP] Spawning ${this.config.command} ${this.config.args.join(' ')}`);

        // Windows requires shell: true for .cmd files
        const isWindows = process.platform === 'win32';

        this.process = spawn(this.config.command, this.config.args, {
            env: { ...process.env, ...this.config.env },
            stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
            shell: isWindows // Enable shell on Windows for .cmd files
        });

        this.process.stdout?.on('data', (data) => this.handleData(data));
        this.process.stderr?.on('data', (data) => {
            console.error(`[MCP ${this.config.id} stderr]:`, data.toString());
        });

        this.process.on('error', (err) => {
            console.error(`[MCP ${this.config.id} error]:`, err);
            this.process = null;
        });

        this.process.on('exit', (code) => {
            if (code !== 0) {
                console.error(`[MCP ${this.config.id}] process exited with code ${code}`);
            }
            this.process = null;
        });

        // Give it a moment to start
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    private handleData(data: Buffer) {
        const lines = data.toString().split('\n');
        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const response: JSONRPCResponse = JSON.parse(line);
                if (response.id && this.messageQueue.has(response.id)) {
                    const { resolve, reject } = this.messageQueue.get(response.id)!;
                    if (response.error) {
                        reject(new Error(response.error.message));
                    } else {
                        resolve(response.result);
                    }
                    this.messageQueue.delete(response.id);
                }
            } catch (e) {
                // console.warn(`[MCP ${this.config.id}] Failed to parse line: ${line.substring(0, 100)}...`);
            }
        }
    }

    async callMethod(method: string, params?: any, attempts = 3): Promise<any> {
        if (!this.process) {
            await this.connect();
        }

        let lastError;
        for (let i = 0; i < attempts; i++) {
            try {
                return await this._executeRequest(method, params);
            } catch (err) {
                console.warn(`[MCP] Attempt ${i + 1}/${attempts} failed for ${method}:`, err);
                lastError = err;
                // Exponential backoff or simple delay could go here
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));

                // Reconnect if process is dead
                if (!this.process) {
                    await this.connect();
                }
            }
        }
        throw lastError || new Error(`Failed to call ${method} after ${attempts} attempts`);
    }

    private async _executeRequest(method: string, params?: any): Promise<any> {
        const id = this.nextId++;
        const request: JSONRPCRequest = {
            jsonrpc: '2.0',
            method,
            params,
            id
        };

        return new Promise((resolve, reject) => {
            // Set a timeout
            const timeout = setTimeout(() => {
                if (this.messageQueue.has(id)) {
                    this.messageQueue.delete(id);
                    reject(new Error(`MCP Request timed out: ${method}`));
                }
            }, 30000);

            this.messageQueue.set(id, {
                resolve: (res: any) => { clearTimeout(timeout); resolve(res); },
                reject: (err: any) => { clearTimeout(timeout); reject(err); }
            });

            try {
                const msg = JSON.stringify(request) + '\n';
                if (!this.process?.stdin?.write(msg)) {
                    throw new Error('Failed to write to stdin');
                }
            } catch (err) {
                clearTimeout(timeout);
                this.messageQueue.delete(id);
                reject(err);
            }
        });
    }

    async listTools() {
        return this.callMethod('tools/list');
    }

    async callTool(name: string, args: any) {
        return this.callMethod('tools/call', { name, arguments: args });
    }

    disconnect() {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }
}
