# SAP HANA Inspired Tailwind UI Theme

A comprehensive, production-ready Tailwind CSS component library inspired by SAP HANA/Fiori UX design principles. Built for enterprise applications with clean, neutral aesthetics and exceptional data clarity.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.0-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🎨 **SAP HANA Design System** - Complete design tokens matching SAP Fiori aesthetics
- 🧩 **40+ Components** - Buttons, forms, tables, modals, navigation, and more
- 📱 **Responsive** - Desktop-first with mobile support
- ♿ **Accessible** - WCAG AA compliant color contrasts and keyboard navigation
- 🚀 **Production Ready** - Optimized for enterprise applications
- 📦 **Framework Agnostic** - Pure HTML/CSS, works with any framework
- 🎯 **Zero Dependencies** - Only Tailwind CSS required

## 🚀 Quick Start

### Installation

```bash
# Clone or download this repository
git clone <repository-url>
cd theme

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Usage

1. **Include the CSS** in your HTML:
```html
<link rel="stylesheet" href="/src/styles/main.css">
```

2. **Use the components** from the library:
```html
<button class="btn-primary">Click Me</button>
```

3. **Add interactivity** with the JavaScript utilities:
```html
<script type="module" src="/src/js/components.js"></script>
```

## 📦 What's Included

```
theme/
├── src/
│   ├── styles/
│   │   └── main.css          # Main stylesheet with design system
│   └── js/
│       └── components.js      # Interactive component utilities
├── demos/
│   ├── login.html            # Login page demo
│   ├── dashboard.html        # Dashboard with KPIs and charts
│   ├── table.html            # Data table CRUD interface
│   └── form.html             # Multi-step form demo
├── index.html                # Component showcase
├── tailwind.config.js        # Tailwind configuration with design tokens
├── postcss.config.js         # PostCSS configuration
├── vite.config.js            # Vite build configuration
└── package.json              # Project dependencies
```

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#0A6ED1` | Main interactive elements |
| Secondary | `#21A1C4` | Accent elements |
| Success | `#0FA958` | Success states |
| Warning | `#EAB308` | Warning states |
| Error | `#DC2626` | Error states |
| Background | `#F5F6F7` | App background |
| Surface | `#FFFFFF` | Cards, containers |
| Border | `#D1D5DB` | Dividers |

### Typography

- **Font Family**: Inter (Google Fonts)
- **Heading Scale**: h1 (2.5rem) → h6 (1.125rem)
- **Body Text**: 1rem (16px)
- **Line Height**: Optimized for readability

### Spacing

- **Grid**: 4/8/16/24px rhythm
- **Border Radius**: 4-6px (medium)
- **Shadows**: Light, smooth elevation

## 🧩 Component Categories

### Buttons
- Primary, Secondary, Outline, Ghost variants
- Icon buttons
- Loading and disabled states
- Small, medium, large sizes

### Form Components
- Text inputs (text, email, password, number)
- Select dropdowns (single, multi)
- Textarea
- Checkboxes and radio buttons
- Toggle switches
- Search fields
- File upload inputs

### Navigation
- Top app header with user menu
- Collapsible sidebar navigation
- Breadcrumbs
- Tab navigation
- Drawer/offcanvas panels

### Data Display
- Sortable data tables
- Striped and dense table modes
- List groups
- KPI stat widgets
- Progress bars
- Timeline/activity feeds
- Badges and tags
- Avatars

### Overlays & Feedback
- Modal dialogs
- Toast notifications
- Alert banners (info, success, warning, error)
- Confirmation dialogs

### Dashboard Components
- Chart container wrappers
- Filter panels
- Metric summary grids
- Widget cards with actions

## 📖 Component Documentation

See [COMPONENTS.md](./COMPONENTS.md) for detailed component documentation with code examples.

## 🎯 Demo Pages

Visit these pages to see the components in action:

1. **[Login Page](./demos/login.html)** - Authentication interface
2. **[Dashboard](./demos/dashboard.html)** - Analytics dashboard with KPIs
3. **[Data Table](./demos/table.html)** - CRUD interface with sorting
4. **[Form Page](./demos/form.html)** - Multi-step form with validation

## 🔧 Customization

### Tailwind Configuration

Customize the theme by editing `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#0A6ED1', // Change primary color
        // ... other shades
      },
    },
  },
}
```

### CSS Variables

Override CSS variables in `src/styles/main.css`:

```css
:root {
  --color-primary: #0A6ED1;
  --color-secondary: #21A1C4;
  /* ... other variables */
}
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Project Structure

- `src/styles/main.css` - Main stylesheet with Tailwind layers
- `src/js/components.js` - Interactive component behaviors
- `demos/` - Demo pages showcasing components
- `tailwind.config.js` - Design tokens and Tailwind configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this theme in your projects.

## 🙏 Acknowledgments

- Inspired by SAP HANA/Fiori UX design principles
- Built with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Vite](https://vitejs.dev/)

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**Built for enterprise applications** • Clean, neutral, accessible design • Production ready
