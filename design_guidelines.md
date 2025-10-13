# HRMSWorld.com Design Guidelines

## Design Approach
**Bootstrap 5 Framework-Based Design** - Static UI prototype using Bootstrap 5 components exclusively. No JavaScript frameworks or backend integration. Focus on professional, clean, and minimal design aesthetic suitable for HR management systems.

## Core Design Principles
- **Professional Simplicity**: Clean, card-based layouts with airy spacing
- **Responsive-First**: Mobile, tablet, and desktop optimization using Bootstrap grid
- **Minimal Shadows**: Subtle depth, avoiding heavy visual effects
- **Consistent Component Usage**: Navbar, sidebar, cards, modals, forms, tables, badges, tooltips

## Color Palette

**Primary Colors:**
- **Black**: #000000 or deep charcoal for backgrounds, headers, sidebar, and text accents
- **Green**: #00C853 (or similar vibrant green) for buttons, highlights, interactive elements, and focus states

**Usage:**
- Backgrounds: Black/dark charcoal tones
- Interactive Elements: Green for all CTAs, active states, badges
- Text: White on dark backgrounds, black on light cards
- Accents: Green for borders, hover states, progress indicators

## Typography
- Use Bootstrap's default professional font stack
- Simple, readable hierarchy with clear heading differentiation
- Consistent sizing across similar components

## Layout System

**Spacing:** Bootstrap's default spacing utilities (p-3, m-4, g-3 for gutters)
**Container Structure:**
- Full-width dark header/navbar
- Sidebar navigation (for dashboards)
- Main content area with card-based modules
- Consistent padding within cards and sections

## Component Library

**Navigation:**
- Fixed top navbar with logo and user menu
- Sidebar navigation for dashboard pages
- Breadcrumb navigation where appropriate

**Cards & Containers:**
- White/light cards on dark backgrounds for content sections
- Rounded corners (Bootstrap default)
- Minimal drop shadow for depth

**Forms:**
- Clean input fields with green focus states
- Clear labels and helper text
- Validation states using green for success

**Buttons:**
- Primary: Green background (#00C853) with white text
- Secondary: Outline green with hover fill
- Consistent padding and sizing across CTAs

**Data Display:**
- Tables with striped rows and hover states
- Calendar views for attendance/leave tracking
- Kanban-style cards for workflows
- List groups for notifications and notices

**Modals & Overlays:**
- Bootstrap modals for detailed views (payslips, notices)
- Toast notifications for UI feedback
- Dropdown menus for quick actions

## Key Features & Interactions

**Interactive Cost Calculator (Home Page):**
- Numeric input for employee count
- Real-time calculation display (minimum 10 employees)
- Tiered pricing: ≤10 (₹275), 10-25 (₹225), 25-50 (₹200), 50-100 (₹150), 100+ (Contact Sales)
- Annual cost breakdown with prominent CTA buttons

**Dashboard Widgets:**
- Summary stat cards with icons
- Quick action buttons in green
- Recent activity feeds
- Notification center with bell icon dropdown

**Mock Data Integration:**
- Sample employee records for directory
- Placeholder payslips and notices
- Demo attendance records and leave balances
- Example workflow cards

## Page-Specific Requirements

**Home Page:** Hero section with headline, product highlights, interactive calculator, and dual CTAs (Get Quote, Request Demo)

**Login Pages:** Centered forms on dark background, green submit buttons, company/employee variants

**Dashboards:** Sidebar navigation, overview cards, quick stats, module access tiles

**HRMS Modules:** Consistent card layouts - forms for input, tables for data display, modals for details

**White-label Section:** Logo upload interface, green theme variant selector, preview cards

## Mobile Responsiveness
- Stack sidebar navigation to hamburger menu
- Single-column card layouts on mobile
- Touch-friendly button sizing
- Responsive tables (horizontal scroll or card transformation)
- Calculator remains functional and clear on small screens

## Images & Media
- Placeholder images for employee photos, document uploads
- Mock profile pictures in directory
- Android/iOS app promotion graphics
- White-label branding preview images
- No large hero images - focus on functional UI demonstration

## Accessibility & Quality
- Maintain consistent dark theme with proper contrast ratios
- Green elements should be vibrant and clearly visible against black
- Form inputs clearly labeled with appropriate focus states
- All interactive elements have adequate touch targets (44px minimum)