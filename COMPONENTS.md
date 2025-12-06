# Component Documentation

Comprehensive guide to all components in the SAP HANA Tailwind UI Theme.

## Table of Contents

- [Buttons](#buttons)
- [Form Components](#form-components)
- [Navigation](#navigation)
- [Data Display](#data-display)
- [Overlays & Feedback](#overlays--feedback)
- [Layout Components](#layout-components)

---

## Buttons

### Primary Button

The main call-to-action button with high emphasis.

```html
<button class="btn-primary">Primary Button</button>
```

**Variants:**
```html
<button class="btn-primary">Default</button>
<button class="btn-primary btn-sm">Small</button>
<button class="btn-primary btn-lg">Large</button>
<button class="btn-primary" disabled>Disabled</button>
```

### Secondary Button

Secondary actions with medium emphasis.

```html
<button class="btn-secondary">Secondary Button</button>
```

### Outline Button

Outlined button for tertiary actions.

```html
<button class="btn-outline">Outline Button</button>
```

### Ghost Button

Text-only button for low emphasis actions.

```html
<button class="btn-ghost">Ghost Button</button>
```

### Icon Button

Button with icon only.

```html
<button class="btn-icon btn-primary">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
  </svg>
</button>
```

---

## Form Components

### Text Input

Standard text input field.

```html
<div>
  <label class="label">Email Address</label>
  <input type="email" class="input" placeholder="user@company.com">
  <p class="helper-text">We'll never share your email</p>
</div>
```

**States:**
```html
<!-- Error state -->
<input type="text" class="input input-error">
<p class="error-text">This field is required</p>

<!-- Success state -->
<input type="text" class="input input-success">
```

### Select Dropdown

Dropdown selection field.

```html
<div>
  <label class="label">Department</label>
  <select class="input">
    <option>Engineering</option>
    <option>Sales</option>
    <option>Marketing</option>
  </select>
</div>
```

### Textarea

Multi-line text input.

```html
<div>
  <label class="label">Description</label>
  <textarea class="input" rows="4" placeholder="Enter description"></textarea>
</div>
```

### Checkbox

Checkbox input for multiple selections.

```html
<label class="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" class="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary-500">
  <span class="text-sm text-text-primary">I agree to terms</span>
</label>
```

### Radio Button

Radio button for single selection.

```html
<div class="space-y-2">
  <label class="flex items-center gap-2 cursor-pointer">
    <input type="radio" name="option" class="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary-500">
    <span class="text-sm text-text-primary">Option 1</span>
  </label>
  <label class="flex items-center gap-2 cursor-pointer">
    <input type="radio" name="option" class="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary-500">
    <span class="text-sm text-text-primary">Option 2</span>
  </label>
</div>
```

### Search Field

Search input with icon.

```html
<div class="relative">
  <input type="text" placeholder="Search..." class="input pl-10">
  <svg class="w-5 h-5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
</div>
```

---

## Navigation

### Top Header

Application header with logo and user menu.

```html
<header class="bg-surface border-b border-border shadow-sm">
  <div class="flex items-center justify-between px-6 py-3">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 bg-primary rounded-md"></div>
      <span class="font-semibold text-text-primary">App Name</span>
    </div>
    <div class="flex items-center gap-4">
      <!-- User menu, notifications, etc -->
    </div>
  </div>
</header>
```

### Sidebar Navigation

Collapsible side navigation.

```html
<aside class="w-64 bg-surface border-r border-border">
  <nav class="p-4 space-y-1">
    <a href="#" class="nav-link-active">
      <svg class="w-5 h-5"><!-- icon --></svg>
      Dashboard
    </a>
    <a href="#" class="nav-link">
      <svg class="w-5 h-5"><!-- icon --></svg>
      Settings
    </a>
  </nav>
</aside>
```

### Breadcrumb

Navigation breadcrumb trail.

```html
<nav class="flex items-center gap-2 text-sm">
  <a href="#" class="text-primary hover:text-primary-600">Home</a>
  <span class="text-text-secondary">/</span>
  <a href="#" class="text-primary hover:text-primary-600">Products</a>
  <span class="text-text-secondary">/</span>
  <span class="text-text-primary">Details</span>
</nav>
```

### Tabs

Tab navigation component.

```html
<div data-tab-group>
  <div class="border-b border-border">
    <nav class="flex gap-6">
      <button data-tab-target="tab1" class="px-1 py-3 border-b-2 border-primary text-primary">Tab 1</button>
      <button data-tab-target="tab2" class="px-1 py-3 border-b-2 border-transparent text-text-secondary">Tab 2</button>
    </nav>
  </div>
  <div id="tab1" data-tab-panel class="p-4">Tab 1 content</div>
  <div id="tab2" data-tab-panel class="p-4 hidden">Tab 2 content</div>
</div>
```

---

## Data Display

### Card

Container for content grouping.

```html
<div class="card">
  <div class="card-header">
    <h3 class="text-h5 text-text-primary">Card Title</h3>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
  <div class="card-footer">
    <button class="btn-primary">Action</button>
  </div>
</div>
```

### Data Table

Sortable data table.

```html
<table class="table">
  <thead>
    <tr>
      <th data-sort>Name</th>
      <th data-sort>Email</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td><button class="btn-sm btn-outline">Edit</button></td>
    </tr>
  </tbody>
</table>
```

**Variants:**
```html
<!-- Striped table -->
<table class="table table-striped">...</table>

<!-- Dense table -->
<table class="table table-dense">...</table>
```

### Badge

Status indicator or label.

```html
<span class="badge-primary">Primary</span>
<span class="badge-success">Success</span>
<span class="badge-warning">Warning</span>
<span class="badge-error">Error</span>
```

### Stat Widget

KPI display widget.

```html
<div class="stat-widget">
  <div class="stat-value">$45,231</div>
  <div class="stat-label">Total Revenue</div>
  <div class="stat-change-positive">↑ 12.5% from last month</div>
</div>
```

### Progress Bar

Progress indicator.

```html
<div class="w-full bg-gray-200 rounded-full h-2">
  <div class="bg-primary h-2 rounded-full" style="width: 75%"></div>
</div>
```

### Avatar

User avatar component.

```html
<!-- With initials -->
<div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
  <span class="text-sm font-medium text-primary">JD</span>
</div>

<!-- With image -->
<img src="avatar.jpg" alt="User" class="w-10 h-10 rounded-full">
```

---

## Overlays & Feedback

### Modal

Modal dialog overlay.

```html
<div id="my-modal" class="modal hidden">
  <div class="modal-overlay" data-modal-close></div>
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="text-h5 text-text-primary">Modal Title</h3>
      <button data-modal-close>×</button>
    </div>
    <div class="modal-body">
      Modal content
    </div>
    <div class="modal-footer">
      <button data-modal-close class="btn-outline">Cancel</button>
      <button class="btn-primary">Confirm</button>
    </div>
  </div>
</div>

<!-- Trigger -->
<button data-modal-target="my-modal" class="btn-primary">Open Modal</button>
```

### Toast Notification

Temporary notification message.

```javascript
import { showToast } from '/src/js/components.js';

// Show toast
showToast('Operation successful!', 'success', 3000);
showToast('Warning message', 'warning');
showToast('Error occurred', 'error');
```

### Alert

Alert banner for important messages.

```html
<div class="alert-info">
  <strong>Info:</strong> This is an informational message.
</div>

<div class="alert-success">
  <strong>Success:</strong> Operation completed successfully.
</div>

<div class="alert-warning">
  <strong>Warning:</strong> Please review before proceeding.
</div>

<div class="alert-error">
  <strong>Error:</strong> Something went wrong.
</div>
```

---

## Layout Components

### Container

Responsive container with max-width.

```html
<div class="max-w-7xl mx-auto px-6">
  Content
</div>
```

### Grid

Responsive grid layout.

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

### Flex

Flexbox utilities.

```html
<div class="flex items-center justify-between gap-4">
  <div>Left</div>
  <div>Right</div>
</div>
```

---

## JavaScript Utilities

### Initialize Components

```javascript
import { initComponents } from '/src/js/components.js';

// Auto-initializes on DOM ready
// Or manually initialize:
initComponents();
```

### Individual Utilities

```javascript
import { 
  initSidebar,
  initModals,
  initDropdowns,
  initTabs,
  initTableSort,
  showToast 
} from '/src/js/components.js';

// Initialize specific components
initModals();
initTabs();

// Show toast notification
showToast('Message', 'success', 3000);
```

---

## Accessibility

All components follow WCAG AA guidelines:

- ✅ Proper color contrast ratios
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Semantic HTML
- ✅ ARIA labels where needed

## Customization

### Extending Components

You can extend components by adding custom classes:

```html
<button class="btn-primary custom-shadow hover:scale-105">
  Custom Button
</button>
```

### Creating Variants

Create new variants in `src/styles/main.css`:

```css
@layer components {
  .btn-danger {
    @apply btn bg-error text-white hover:bg-error-600;
  }
}
```

---

For more examples, see the [demo pages](../demos/) in the project.
