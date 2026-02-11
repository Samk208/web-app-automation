#!/bin/bash

# Install Node dependencies
npm install @modelcontextprotocol/sdk

# Note: The following MCP servers run via npx, so explicit global installation is not strictly required 
# if you use `npx -y package-name`.
# However, to ensure they are cached:

# 1. Document Generator
# npm install -g thiagotw10-document-generator-mcp

# 2. Famano Office
# npm install -g famano-office

# 3. DocTranslate
# npm install -g doctranslate-io-mcp

echo "MCP Integration dependencies setup complete."
