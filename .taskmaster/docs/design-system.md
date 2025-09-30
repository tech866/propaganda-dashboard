# Modern Design System Documentation

## Overview
This document outlines the comprehensive design system implemented for the propaganda dashboard, focusing on a modern dark theme aesthetic with glassmorphism effects and premium visual design.

## Color Palette

### Primary Colors
- **Background**: `oklch(0.08 0 0)` - Deep dark background
- **Foreground**: `oklch(0.95 0 0)` - High contrast text
- **Card**: `oklch(0.12 0 0)` - Slightly lighter for cards
- **Primary**: `oklch(0.7 0.2 264)` - Modern indigo brand color

### Status Colors
- **Success**: `oklch(0.65 0.15 142)` - Green for positive states
- **Warning**: `oklch(0.75 0.15 85)` - Orange for warnings
- **Destructive**: `oklch(0.65 0.22 25)` - Red for errors/danger
- **Info**: `oklch(0.7 0.15 220)` - Blue for informational states

### UI Elements
- **Border**: `oklch(0.2 0 0)` - Subtle borders
- **Input**: `oklch(0.15 0 0)` - Input backgrounds
- **Muted**: `oklch(0.6 0 0)` - Muted text color

## Typography Scale

### Display & Headings
```css
.text-display    /* 4xl md:5xl lg:6xl font-bold tracking-tight */
.text-h1         /* 3xl md:4xl font-semibold tracking-tight */
.text-h2         /* 2xl md:3xl font-semibold tracking-tight */
.text-h3         /* xl md:2xl font-semibold tracking-tight */
.text-h4         /* lg md:xl font-semibold tracking-tight */
```

### Body Text
```css
.text-body-lg    /* lg leading-relaxed */
.text-body       /* base leading-relaxed */
.text-body-sm    /* sm leading-relaxed */
.text-caption    /* xs leading-relaxed text-muted-foreground */
```

## Spacing System

### Section Spacing
```css
.space-section   /* py-8 md:py-12 */
.space-card      /* p-6 md:p-8 */
.space-component /* p-4 md:p-6 */
.space-element   /* p-2 md:p-3 */
```

## Component Classes

### Cards
```css
.card-modern     /* Modern card with glassmorphism */
.card-glass      /* Glass effect card */
```

### Buttons
```css
.btn-modern              /* Base modern button */
.btn-primary-modern      /* Primary button variant */
.btn-secondary-modern    /* Secondary button variant */
```

### Inputs
```css
.input-modern    /* Modern input with focus states */
```

### KPI/Metric Cards
```css
.kpi-card-modern     /* KPI card container */
.kpi-value          /* Large metric value */
.kpi-label          /* Metric label */
.kpi-delta          /* Delta indicator */
.kpi-delta-positive /* Positive delta styling */
.kpi-delta-negative /* Negative delta styling */
```

### Tables
```css
.table-modern    /* Modern table with hover effects */
```

### Navigation
```css
.nav-item-modern     /* Navigation item */
.nav-item-modern.active /* Active navigation state */
```

### Layout
```css
.sidebar-modern  /* Modern sidebar */
.header-modern   /* Modern header with backdrop blur */
```

## Utility Classes

### Gradients
```css
.gradient-primary     /* Primary brand gradient */
.gradient-success     /* Success state gradient */
.gradient-warning     /* Warning state gradient */
.gradient-destructive /* Error state gradient */
.gradient-info        /* Info state gradient */
```

### Animations
```css
.animate-fade-in      /* Fade in animation */
.animate-slide-up     /* Slide up animation */
.animate-scale-in     /* Scale in animation */
```

### Shadows
```css
.shadow-modern        /* Modern card shadow */
.shadow-modern-hover  /* Hover shadow effect */
.shadow-glass         /* Glass effect shadow */
```

### Borders
```css
.border-modern        /* Modern border */
.border-glass         /* Glass effect border */
```

### Backdrop Effects
```css
.backdrop-modern      /* 20px backdrop blur */
.backdrop-glass       /* 40px backdrop blur */
```

### Status Badges
```css
.badge-status         /* Base badge */
.badge-success        /* Success badge */
.badge-warning        /* Warning badge */
.badge-destructive    /* Error badge */
.badge-info           /* Info badge */
.badge-muted          /* Muted badge */
```

## Design Principles

### 1. Modern Dark Theme
- Deep dark backgrounds with high contrast text
- Subtle borders and muted secondary elements
- Glassmorphism effects for depth and premium feel

### 2. Accessibility
- WCAG AA compliant color contrast ratios
- Focus-visible states for keyboard navigation
- Semantic color usage for status indicators

### 3. Responsive Design
- Mobile-first approach
- Adaptive spacing and typography
- Consistent breakpoints (768px, 1024px, 1280px)

### 4. Performance
- Hardware-accelerated animations
- Efficient backdrop-filter usage
- Optimized shadow and blur effects

### 5. Consistency
- 8px spacing grid system
- Consistent border radius (12px for cards, 8px for inputs)
- Unified animation timing (300ms for interactions)

## Usage Guidelines

### When to Use Each Component
- **card-modern**: For main content containers and data displays
- **card-glass**: For overlay elements and modals
- **btn-modern**: For primary actions and CTAs
- **input-modern**: For all form inputs and search fields
- **kpi-card-modern**: For metric displays and dashboard KPIs
- **table-modern**: For data tables and lists
- **nav-item-modern**: For navigation elements

### Color Usage
- Use primary colors for brand elements and CTAs
- Use status colors consistently for their semantic meaning
- Use muted colors for secondary information
- Maintain high contrast for text readability

### Animation Guidelines
- Use fade-in for page transitions
- Use slide-up for card appearances
- Use scale-in for button interactions
- Keep animations subtle and purposeful

## Implementation Notes

### CSS Custom Properties
All colors are defined as CSS custom properties using OKLCH color space for better perceptual uniformity and easier theme switching.

### Tailwind Integration
The design system integrates seamlessly with Tailwind CSS v4, using the new inline theme configuration and custom utility classes.

### Browser Support
- Modern browsers with backdrop-filter support
- Graceful degradation for older browsers
- Progressive enhancement approach

## Next Steps

1. **Component Implementation**: Apply these classes to existing components
2. **Layout Refactoring**: Update layout components with modern styling
3. **Dashboard Modernization**: Apply design system to dashboard pages
4. **Form Styling**: Update all forms with modern input styling
5. **Chart Theming**: Apply consistent theming to chart components
6. **Testing**: Verify accessibility and responsive behavior across devices

