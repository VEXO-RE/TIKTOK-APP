# MCP

STATUS: FOUNDATION ONLY

Initial policy:

MCP_READONLY=true

MCP tools must not be registered unless their actual backend capability
exists and has been tested.

Future TikTok tools may include read operations for:

- account information;
- publishing status;
- editorial calendar;
- content performance.

Write tools require:

1. official capability exists;
2. account authorization exists;
3. application permissions exist;
4. backend adapter exists;
5. tests pass;
6. MCP_READONLY=false;
7. operation policy permits the action.
