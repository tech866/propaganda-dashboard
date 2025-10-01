# Taskmaster Development Workflow

## Overview
This command enforces the mandatory Taskmaster workflow for all development tasks in the Propaganda Dashboard project.

## Steps:

### 1. Research First
```bash
task-master research "[describe the request/feature]" --tree --files=src/
```

### 2. Create or Update Task
```bash
# For new requests:
task-master add-task --prompt="[detailed description of the request]" --research

# For existing work:
task-master show [task-id]  # Review existing context first
task-master update-task --id=[id] --prompt="[new context or changes]" --research
```

### 3. Analyze Complexity
```bash
task-master analyze-complexity --research
```

### 4. Expand into Subtasks
```bash
task-master expand --id=[task-id] --research --force
```

### 5. Begin Implementation
```bash
task-master next  # Get next available task
task-master show [subtask-id]  # Review specific subtask details
```

### 6. Update Progress
```bash
task-master update-subtask --id=[subtask-id] --prompt="[implementation notes and progress]"
```

### 7. Complete Tasks
```bash
task-master set-status --id=[subtask-id] --status=done
```

## Project Context
- **Project**: Propaganda Dashboard - Multi-tenant agency performance management
- **Tech Stack**: Next.js 15.5.4, TypeScript, Tailwind CSS, PostgreSQL, Clerk Auth
- **Status**: All 15 original tasks completed, now in enhancement/migration phase
- **APIs**: OpenAI, Perplexity, Anthropic configured for research and task management

## Required API Keys
- OPENAI_API_KEY (for research model)
- PERPLEXITY_API_KEY (for research-backed operations)
- ANTHROPIC_API_KEY (for main model)

## Memory Bank Updates
Always update the memory bank after significant changes:
```bash
task-master update-subtask --id=[id] --prompt="
## Implementation Summary
- What was implemented
- Key decisions made
- Patterns established
- Challenges overcome

## Code Changes
- Files modified: [list]
- New components: [list]
- Updated services: [list]

## Next Steps
- What needs to be done next
- Dependencies identified
- Testing requirements
"
```

## Quality Checklist
- ✅ Research completed with --research flag
- ✅ Task created/updated in Taskmaster
- ✅ Complexity analyzed
- ✅ Subtasks generated
- ✅ Project context understood
- ✅ Memory bank updated
- ✅ Code committed with task reference
