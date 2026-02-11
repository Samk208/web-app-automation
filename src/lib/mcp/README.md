# MCP (Model Context Protocol) Integration

This directory contains the MCP server integration for document generation and translation.

## Overview

MCP servers provide specialized capabilities through a standardized protocol (JSONRPC 2.0 over stdio). We use three MCP servers:

1. **document-generator** - Creates and converts documents (DOCX, PDF)
2. **doctranslate** - Professional translation services
3. **famano-office** - Advanced Office document processing

## Architecture

```
┌─────────────────────┐
│  Server Actions     │
│  (business-plan.ts) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  document-helpers   │  ← High-level API
│  - generateKoreanDocx
│  - translateToKorean
│  - uploadToStorage
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MCP Client        │  ← Protocol handler
│  - spawn process
│  - JSONRPC messages
│  - retry/timeout
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MCP Servers       │  ← NPM packages
│  - document-generator
│  - doctranslate
│  - famano-office
└─────────────────────┘
```

## Files

- **`client.ts`** - Core MCP client implementation (JSONRPC, stdio)
- **`config.ts`** - MCP server configurations
- **`document-helpers.ts`** - High-level document generation API
- **`index.ts`** - Public API exports

## Usage

### Generate Korean DOCX

```typescript
import { generateAndUploadDocument } from '@/lib/mcp/document-helpers';

const result = await generateAndUploadDocument(markdownContent, {
  organizationId: '123',
  resourceId: 'plan-456',
  resourceType: 'business-plan',
  title: '사업계획서',
  template: 'government', // Korean govt standard
});

console.log(result.downloadUrl); // Signed URL for download
```

### Translate to Korean

```typescript
import { translateToKorean } from '@/lib/mcp/document-helpers';

const translated = await translateToKorean({
  text: 'Business plan for AI startup',
  targetLanguage: 'ko',
  tone: 'formal',
  context: 'Government grant application',
});
```

### Direct MCP Client Usage

```typescript
import { getMCPClient } from '@/lib/mcp';

const client = getMCPClient('document-generator');
await client.connect();

const tools = await client.listTools();
const result = await client.callTool('create_document', {
  format: 'docx',
  content: 'Hello World',
});

client.disconnect();
```

## Templates

### Korean Government Template
```typescript
{
  font: '바탕체', // Batang
  fontSize: 11,
  lineSpacing: 1.6,
  margins: { top: 30, bottom: 30, left: 20, right: 20 }
}
```

### Business Template
```typescript
{
  font: '맑은 고딕', // Malgun Gothic
  fontSize: 11,
  lineSpacing: 1.5,
  margins: { top: 25, bottom: 25, left: 25, right: 25 }
}
```

### Proposal Template
```typescript
{
  font: '나눔고딕', // Nanum Gothic
  fontSize: 10.5,
  lineSpacing: 1.5,
  margins: { top: 20, bottom: 20, left: 30, right: 30 }
}
```

## Storage

Documents are uploaded to Supabase Storage:

- **Bucket**: `business-plans` or `proposals`
- **Path**: `{organizationId}/{resourceId}/{filename}.docx`
- **Access**: Signed URLs (7-day expiry)

## Error Handling

All MCP operations include:

- ✅ Automatic retry (3 attempts with exponential backoff)
- ✅ 30-second timeout per request
- ✅ Graceful fallback (non-fatal errors logged)
- ✅ Process cleanup on disconnect

## Testing

Run the MCP test suite:

```bash
node scripts/test-mcp-document-generation.js
```

## Troubleshooting

### MCP server not responding

```bash
# Test manually
npx -y thiagotw10-document-generator-mcp

# Then send JSONRPC request:
{"jsonrpc":"2.0","method":"tools/list","id":1}
```

### Document generation fails

- Check logs: `logger.error("Document generation failed")`
- Verify MCP server is installed: `npm list -g thiagotw10-document-generator-mcp`
- Check Supabase storage bucket exists

### Upload fails

- Verify Supabase credentials in `.env.local`
- Check bucket permissions (RLS policies)
- Ensure storage quota not exceeded

## Configuration

MCP servers are configured in `config.ts`:

```typescript
export const MCP_SERVERS = {
  'document-generator': {
    id: 'document-generator',
    command: 'npx',
    args: ['-y', 'thiagotw10-document-generator-mcp'],
  },
  // ...
};
```

## Integration Status

| Agent | Status | Download URL |
|-------|--------|--------------|
| Business Plan Master | ✅ Integrated | `business_plans.document_url` |
| Proposal Architect | ✅ Integrated | `proposals.document_url` |
| HWP Converter | 🚧 Pending | Via worker queue |
| Grant Scout | 📅 Planned | TBD |

## Next Steps

1. **Test with real data** - Generate a business plan and verify DOCX
2. **Add PDF export** - Use `convertDocxToPdf()` helper
3. **Optimize templates** - Fine-tune Korean fonts and margins
4. **Add more formats** - Support HWP, HTML, Markdown export
5. **Implement caching** - Cache translated content for 24h

## Resources

- [MCP Specification](https://modelcontextprotocol.io/introduction)
- [document-generator NPM](https://www.npmjs.com/package/thiagotw10-document-generator-mcp)
- [doctranslate NPM](https://www.npmjs.com/package/doctranslate-io-mcp)
