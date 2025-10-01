# Example Taskmaster Workflow Implementation

## Scenario: User requests "Add dark mode toggle to the dashboard"

### Step 1: Research First
```bash
task-master research "Next.js 15 dark mode implementation best practices with Tailwind CSS and theme switching" --tree --files=src/
```

### Step 2: Create Task
```bash
task-master add-task --prompt="Implement dark mode toggle for the Propaganda Dashboard using Next.js 15, Tailwind CSS, and React Context. The toggle should persist user preference, work across all components, and maintain the existing design system colors." --research
```

### Step 3: Analyze Complexity
```bash
task-master analyze-complexity --research
```

### Step 4: Expand into Subtasks
```bash
task-master expand --id=[new-task-id] --research --force
```

### Step 5: Review Subtasks
```bash
task-master show [task-id]  # See all subtasks
```

### Step 6: Begin Implementation
```bash
task-master next  # Get next available subtask
task-master show [subtask-id]  # Review specific subtask details
```

### Step 7: Update Progress
```bash
task-master update-subtask --id=[subtask-id] --prompt="
## Implementation Progress
- Created ThemeProvider component with React Context
- Implemented useTheme hook for theme state management
- Added theme toggle button to navigation header
- Updated Tailwind config for dark mode classes

## Code Changes
- New file: src/components/theme-provider.tsx
- New file: src/hooks/useTheme.ts
- Modified: src/components/layout/Header.tsx
- Modified: tailwind.config.js

## Next Steps
- Test theme persistence across page refreshes
- Update remaining components for dark mode support
- Add theme transition animations
"
```

### Step 8: Complete Subtasks
```bash
task-master set-status --id=[subtask-id] --status=done
```

### Step 9: Move to Next Subtask
```bash
task-master next  # Get next subtask
```

## Project-Specific Context for This Example

### Current Architecture
- **Authentication**: Clerk with agency organizations
- **Database**: PostgreSQL with multi-tenant structure  
- **Frontend**: Next.js 15.5.4 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **State Management**: React Context + custom hooks

### Design System Colors
- **Primary**: bg-primary, text-primary
- **Background**: bg-background, text-foreground
- **Muted**: text-muted-foreground
- **Border**: border-border
- **Accent Colors**: Blue, Green, Red, Yellow variants
- **Gradient**: bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900

### Key Components to Update
- Header navigation
- Dashboard components
- Form components
- Modal dialogs
- Data tables
- Charts and graphs

### Integration Points
- Clerk authentication UI
- Supabase client components
- Chart.js visualizations
- Form validation components

## Expected Subtasks for Dark Mode Implementation

1. **Create Theme Context and Provider**
   - Set up React Context for theme state
   - Implement theme persistence with localStorage
   - Create ThemeProvider component

2. **Update Tailwind Configuration**
   - Configure dark mode classes
   - Update color palette for dark theme
   - Ensure design system consistency

3. **Create Theme Toggle Component**
   - Design toggle button UI
   - Implement theme switching logic
   - Add smooth transitions

4. **Update Core Layout Components**
   - Header navigation
   - Sidebar navigation
   - Main content areas
   - Footer components

5. **Update Dashboard Components**
   - KPI cards
   - Data tables
   - Charts and graphs
   - Filter components

6. **Update Form Components**
   - Input fields
   - Buttons
   - Select dropdowns
   - Modal dialogs

7. **Test and Polish**
   - Cross-browser testing
   - Mobile responsiveness
   - Accessibility compliance
   - Performance optimization

## Memory Bank Update Template

```bash
task-master update-subtask --id=[id] --prompt="
## Dark Mode Implementation Summary
- Implemented comprehensive dark mode support across the Propaganda Dashboard
- Used React Context for theme state management
- Maintained existing design system consistency
- Added smooth transitions and animations

## Technical Decisions
- Chose React Context over Zustand for simplicity
- Used localStorage for theme persistence
- Implemented CSS custom properties for dynamic theming
- Maintained Tailwind CSS utility-first approach

## Code Architecture
- ThemeProvider: Central theme state management
- useTheme hook: Theme state access and manipulation
- Theme toggle: Reusable toggle component
- Updated components: All major UI components

## Testing Results
- ✅ Theme persistence across page refreshes
- ✅ Smooth transitions between themes
- ✅ All components render correctly in dark mode
- ✅ Accessibility standards maintained
- ✅ Mobile responsiveness preserved

## Performance Impact
- Minimal bundle size increase (~2KB)
- No runtime performance degradation
- Smooth 60fps transitions
- Efficient re-renders with React Context

## Next Steps
- Monitor user feedback on dark mode
- Consider adding more theme variants
- Optimize for reduced motion preferences
- Add theme-aware chart colors
"
```

## Quality Assurance Checklist

### Before Starting
- ✅ Research completed with current best practices
- ✅ Task created with detailed description
- ✅ Complexity analyzed and understood
- ✅ Subtasks generated with clear scope
- ✅ Project context and architecture reviewed

### During Implementation
- ✅ Following subtask breakdown systematically
- ✅ Updating progress after each significant change
- ✅ Testing functionality as development progresses
- ✅ Maintaining code quality and consistency
- ✅ Documenting decisions and patterns

### After Completion
- ✅ All subtasks marked as complete
- ✅ Memory bank updated with comprehensive notes
- ✅ Code committed with descriptive messages
- ✅ Testing completed across all scenarios
- ✅ Documentation updated if needed
- ✅ Next task identified and ready

## Common Patterns for This Project

### Component Structure
```typescript
// Example: Theme-aware component
import { useTheme } from '@/hooks/useTheme'

export function DashboardCard({ title, value }: Props) {
  const { theme } = useTheme()
  
  return (
    <div className="bg-background border-border text-foreground">
      {/* Component content */}
    </div>
  )
}
```

### Context Usage
```typescript
// Example: Theme context consumption
const { theme, toggleTheme, isDark } = useTheme()
```

### Styling Patterns
```typescript
// Example: Theme-aware styling
className="bg-background text-foreground border-border hover:bg-muted"
```

This workflow ensures every development task is properly researched, planned, tracked, and documented while maintaining the high quality standards of the Propaganda Dashboard project.
