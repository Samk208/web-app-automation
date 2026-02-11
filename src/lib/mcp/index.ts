/**
 * MCP (Model Context Protocol) Integration
 * Main entry point for MCP server operations
 */

export { MCPClient } from './client';
export { MCP_SERVERS } from './config';
export {
  generateKoreanDocx,
  translateToKorean,
  uploadToStorage,
  generateAndUploadDocument,
  convertDocxToPdf,
} from './document-helpers';

import { MCPClient } from './client';
import { MCP_SERVERS } from './config';

/**
 * Get an MCP client instance for a specific server
 * Auto-connects on first use
 */
export function getMCPClient(serverId: keyof typeof MCP_SERVERS): MCPClient {
  const config = MCP_SERVERS[serverId];
  if (!config) {
    throw new Error(`MCP server not found: ${serverId}`);
  }
  return new MCPClient(config);
}

/**
 * List all available MCP servers
 */
export function listAvailableMCPServers() {
  return Object.keys(MCP_SERVERS);
}
