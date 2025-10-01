# Taskmaster Quick Reference

## 🚀 Essential Commands

### Daily Workflow
```bash
# Start your day
task-master next                    # Get next task to work on
task-master show [id]              # View task details

# During development
task-master update-subtask --id=[id] --prompt="[progress notes]"
task-master set-status --id=[id] --status=done

# End of day
task-master list --status=pending  # See remaining work
```

### For New Requests
```bash
# 1. Research first
task-master research "[your request]" --tree --files=src/

# 2. Create task
task-master add-task --prompt="[detailed description]" --research

# 3. Analyze complexity
task-master analyze-complexity --research

# 4. Break into subtasks
task-master expand --id=[new-task-id] --research --force

# 5. Start working
task-master next
```

### Project Management
```bash
task-master list                   # All tasks
task-master list --status=pending # Pending tasks only
task-master complexity-report     # View complexity analysis
task-master generate              # Update task files
```

## 🔧 Configuration

### Required API Keys (in .env or .cursor/mcp.json)
- `OPENAI_API_KEY` - For research model
- `PERPLEXITY_API_KEY` - For research operations  
- `ANTHROPIC_API_KEY` - For main model

### MCP Configuration (.cursor/mcp.json)
```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "OPENAI_API_KEY": "your_key_here",
        "PERPLEXITY_API_KEY": "your_key_here", 
        "ANTHROPIC_API_KEY": "your_key_here"
      }
    }
  }
}
```

## 📋 Workflow Checklist

### Before Starting Any Work
- [ ] Research completed with `--research` flag
- [ ] Task created/updated in Taskmaster
- [ ] Complexity analyzed
- [ ] Subtasks generated
- [ ] Project context understood

### During Implementation
- [ ] Following subtask breakdown
- [ ] Updating progress regularly
- [ ] Logging decisions and patterns
- [ ] Testing as you go

### After Completion
- [ ] All subtasks marked complete
- [ ] Memory bank updated
- [ ] Code committed with task reference
- [ ] Next task identified

## 🎯 Project Context

**Propaganda Dashboard**: Multi-tenant agency performance management system
- **Tech Stack**: Next.js 15.5.4, TypeScript, Tailwind CSS, PostgreSQL, Clerk Auth
- **Status**: All 15 original tasks completed, now in enhancement phase
- **Architecture**: Multi-tenant with role-based access (CEO, Admin, Sales)

## 🚨 Important Notes

- **NEVER** make code changes without creating/updating tasks first
- **ALWAYS** use `--research` flag for AI-powered operations
- **ALWAYS** update memory bank after significant changes
- **ALWAYS** break down complex tasks into subtasks
- **ALWAYS** understand project context before starting

## 📞 Need Help?

- Check `.cursor/rules/taskmaster_workflow.mdc` for full workflow
- See `.cursor/commands/example-taskmaster-workflow.md` for examples
- Review `.taskmaster/docs/project-memory.md` for project context
