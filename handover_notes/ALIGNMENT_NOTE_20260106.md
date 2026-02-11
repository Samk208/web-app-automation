# Handover Note: Documentation Alignment (2026-01-06)

## Context
We have updated the core project documentation (`gemini.md`, `product_directives.md`, `workflow_specs.md`) to align with the new **Production-Grade Agent Transformation Plan**.

## Source of Truth
The **[PRODUCTION_GRADE_AGENT_TRANSFORMATION_PLAN.md](../PRODUCTION_GRADE_AGENT_TRANSFORMATION_PLAN.md)** is now the definitive guide for:
*   **Architecture**: n8n + LangGraph + MCP + Supabase.
*   **Agent Directives**: How specific agents (HWP Converter, KakaoTalk CRM, etc.) should be implemented using these new tools.

## Key Changes
*   **n8n**: Now explicitly the visual workflow engine.
*   **LangGraph**: Recognized as the agentic logic layer.
*   **MCP**: The standard for tool/context integration.
*   **Philosophy**: "Compose over Code" - leveraging pre-built components whenever possible.

Please refer to `PRODUCTION_GRADE_AGENT_TRANSFORMATION_PLAN.md` for specific implementation details.
