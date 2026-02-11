# TODO — MCP & DB (Jan 7, 2026)

- [ ] Install / point to MCP servers (document-generator + doc-translate) per `MCP_INTEGRATION_SUMMARY.md`; rerun `node scripts/test-mcp-document-generation.js`.
- [ ] Trigger a real AI call to create rows in `ai_usage_logs`; verify cost tracking and budget enforcement.
- [ ] Create a sample sourcing task (UI/API) to confirm `sourcing_tasks` statuses, including `FAILED`.
- [ ] Optionally run test scripts with `npx tsx …` or add `"type": "module"` to `package.json` to silence TS strip warnings under Node 22.


