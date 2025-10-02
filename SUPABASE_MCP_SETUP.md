# Supabase MCP Setup Guide

This guide will help you complete the setup of the Supabase MCP (Model Context Protocol) server for your Propaganda Dashboard project.

## 🚀 **What's Been Done**

✅ **Supabase MCP Server Installed**
- Installed `@supabase/mcp-server-supabase` globally
- Updated `.cursor/mcp.json` with Supabase configuration

## 🔧 **Next Steps - Complete Your Setup**

### **1. Get Your Supabase Project Reference**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **General**
4. Copy your **Project Reference** (looks like: `abcdefghijklmnop`)

### **2. Generate Personal Access Token**

1. Go to [Supabase Account Settings](https://supabase.com/dashboard/account/tokens)
2. Click **Generate new token**
3. Give it a name (e.g., "MCP Server Access")
4. Copy the generated token

### **3. Update MCP Configuration**

Edit `.cursor/mcp.json` and replace the placeholder values:

```json
{
	"mcpServers": {
		"task-master-ai": {
			"command": "npx",
			"args": ["-y", "task-master-ai"],
			"env": {
				"ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
				"PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
				"OPENAI_API_KEY": "YOUR_OPENAI_KEY_HERE",
				"GOOGLE_API_KEY": "YOUR_GOOGLE_KEY_HERE",
				"XAI_API_KEY": "YOUR_XAI_KEY_HERE",
				"OPENROUTER_API_KEY": "YOUR_OPENROUTER_KEY_HERE",
				"MISTRAL_API_KEY": "YOUR_MISTRAL_KEY_HERE",
				"AZURE_OPENAI_API_KEY": "YOUR_AZURE_KEY_HERE",
				"OLLAMA_API_KEY": "YOUR_OLLAMA_API_KEY_HERE"
			}
		},
		"supabase": {
			"command": "npx",
			"args": [
				"-y",
				"@supabase/mcp-server-supabase",
				"--read-only",
				"--project-ref=YOUR_ACTUAL_PROJECT_REF"
			],
			"env": {
				"SUPABASE_ACCESS_TOKEN": "YOUR_ACTUAL_ACCESS_TOKEN"
			}
		}
	}
}
```

**Replace:**
- `YOUR_ACTUAL_PROJECT_REF` with your Supabase project reference
- `YOUR_ACTUAL_ACCESS_TOKEN` with your personal access token

### **4. Restart Cursor**

After updating the configuration:
1. Close Cursor completely
2. Reopen Cursor
3. The Supabase MCP server should now be available

## 🎯 **What You Can Do with Supabase MCP**

Once configured, you'll be able to:

### **Database Operations**
- Query your database using natural language
- Generate SQL queries
- View table schemas and relationships
- Analyze data patterns

### **Schema Management**
- Create and modify database tables
- Add indexes and constraints
- Set up relationships between tables
- Generate migration scripts

### **Data Analysis**
- Run complex queries
- Generate reports
- Analyze performance metrics
- Export data

### **Example Commands**
```
"Show me all users in the database"
"Create a table for client ad accounts"
"Generate a query to get total ad spend by client"
"Show me the database schema for the calls table"
```

## 🔒 **Security Features**

- **Read-Only Mode**: The server runs in read-only mode by default
- **Secure Token**: Uses your personal access token for authentication
- **Project Isolation**: Only accesses your specific Supabase project

## 🚨 **Troubleshooting**

### **MCP Server Not Starting**
1. Check that your project reference is correct
2. Verify your access token is valid
3. Ensure you have the latest version: `npm update -g @supabase/mcp-server-supabase`

### **Permission Errors**
1. Make sure your access token has the necessary permissions
2. Check that your Supabase project is active
3. Verify the project reference matches your dashboard

### **Connection Issues**
1. Check your internet connection
2. Verify Supabase services are operational
3. Try regenerating your access token

## 📚 **Additional Resources**

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## 🎉 **Next Steps**

Once you've completed the setup:

1. **Test the Connection**: Try asking me to query your database
2. **Explore Your Data**: Use natural language to explore your existing data
3. **Plan Migrations**: If migrating from PostgreSQL, we can help plan the migration
4. **Set Up Schema**: Create the database schema for your Meta API integration

The Supabase MCP integration will make database operations much more intuitive and allow for natural language database interactions!




