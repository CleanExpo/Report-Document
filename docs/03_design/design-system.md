# Design System

## Overview
Comprehensive design system documentation for consistent UI/UX across the application.

## Design Principles

1. **Clarity** - Clear visual hierarchy and intuitive navigation
2. **Consistency** - Uniform patterns and components
3. **Accessibility** - WCAG 2.1 AA compliant
4. **Responsiveness** - Mobile-first design
5. **Performance** - Optimized for speed

## Color Palette

### Primary Colors
```css
:root {
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
}
```

### Neutral Colors
```css
:root {
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}
```

### Semantic Colors
```css
:root {
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

## Typography

### Font Stack
```css
:root {
  --font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
}
```

### Type Scale
```css
.text-xs    { font-size: 0.75rem; line-height: 1rem; }
.text-sm    { font-size: 0.875rem; line-height: 1.25rem; }
.text-base  { font-size: 1rem; line-height: 1.5rem; }
.text-lg    { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl    { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl   { font-size: 1.5rem; line-height: 2rem; }
.text-3xl   { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl   { font-size: 2.25rem; line-height: 2.5rem; }
.text-5xl   { font-size: 3rem; line-height: 1; }
```

## Spacing System

### Base Unit: 4px
```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
}
```

## Components

### Button Component
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

// Usage
<Button variant="primary" size="md">
  Click me
</Button>
```

### Button Styles
```css
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700;
  @apply focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300;
  @apply focus:ring-gray-500;
}
```

### Form Elements

#### Input Field
```tsx
interface InputProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

<Input
  label="Email"
  type="email"
  required
  error="Invalid email"
/>
```

#### Select Dropdown
```tsx
<Select
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' }
  ]}
/>
```

### Card Component
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Layout System

### Grid System
```css
.container {
  @apply mx-auto px-4 sm:px-6 lg:px-8;
  max-width: 1280px;
}

.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-cols-12 {
  grid-template-columns: repeat(12, 1fr);
}
```

### Flexbox Utilities
```css
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
```

## Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## Icons

Using Heroicons or similar icon library:
```tsx
import { HomeIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';

<HomeIcon className="h-5 w-5" />
```

## Animation

### Transitions
```css
.transition-all {
  transition-property: all;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-colors {
  transition-property: background-color, border-color, color;
  transition-duration: 150ms;
}
```

### Keyframes
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

## Accessibility

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### ARIA Labels
```tsx
<button aria-label="Close dialog">
  <XIcon />
</button>

<nav aria-label="Main navigation">
  ...
</nav>
```

### Keyboard Navigation
- Tab order follows visual flow
- All interactive elements keyboard accessible
- Escape key closes modals
- Arrow keys navigate menus

## Dark Mode

### Color Scheme
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --text-primary: #f9fafb;
    --text-secondary: #e5e7eb;
  }
}

.dark {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

## Component Library Structure

```
components/
├── atoms/
│   ├── Button/
│   ├── Input/
│   └── Badge/
├── molecules/
│   ├── Card/
│   ├── Modal/
│   └── Dropdown/
├── organisms/
│   ├── Header/
│   ├── Footer/
│   └── Sidebar/
└── templates/
    ├── PageLayout/
    └── DashboardLayout/
```

## Usage Guidelines

### Do's
- Use semantic HTML elements
- Maintain consistent spacing
- Follow color palette
- Test on multiple devices
- Consider accessibility

### Don'ts
- Don't create custom colors without approval
- Don't override global styles
- Don't use inline styles
- Don't skip heading levels
- Don't ignore focus states

## Tools & Resources

### Design Tools
- Figma for mockups
- Storybook for component documentation
- Chrome DevTools for testing

### Testing
```bash
# Accessibility testing
npm run test:a11y

# Visual regression testing
npm run test:visual

# Responsive testing
npm run test:responsive
```