# Supabase MCP Setup

I have automatically generated an MCP configuration file for you at `.cursor/mcp.json`. This configuration allows your IDE (like Cursor) or AI assistant to use the Supabase MCP server to interact with your database.

## 1. Get Your Service Role Key
To enable full functionality, you need your Supabase **Service Role Key** (secret). The `anon` key found in the code is public and has limited permissions.

1.  Go to your Supabase Project Settings: [https://supabase.com/dashboard/project/tstboympleybwbdwicik/settings/api](https://supabase.com/dashboard/project/tstboympleybwbdwicik/settings/api)
2.  Find the `service_role` key under the **Project API keys** section.
3.  Copy the key.

## 2. Update Configuration
1.  Open the file `.cursor/mcp.json` in your editor.
2.  Replace the placeholder `INSERT_YOUR_SERVICE_ROLE_KEY_HERE` with the key you just copied.
3.  Save the file.

## 3. Restart
Restart your IDE or reload the window to activate the new MCP server.

## Troubleshooting
If you are using a different tool (like Claude Desktop instead of Cursor), you may need to add the following configuration to your tool's config file (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server"
      ],
      "env": {
        "SUPABASE_URL": "https://tstboympleybwbdwicik.supabase.co",
        "SUPABASE_SERVICE_KEY": "YOUR_SERVICE_ROLE_KEY"
      }
    }
  }
}
```
