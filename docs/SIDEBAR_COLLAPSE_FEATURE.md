# Sidebar Collapse Feature

## 📋 Overview

Added expand/collapse functionality to the dashboard sidebar menu, allowing users to maximize screen space while maintaining quick access to navigation items.

## ✨ Features

### 1. **Toggle Button**
- Located at the bottom of the sidebar footer
- **Expanded state**: Shows ChevronLeft icon + "Contraer" text
- **Collapsed state**: Shows only ChevronRight icon
- Smooth icon transitions

### 2. **Dynamic Width**
- **Expanded**: `md:w-72` (288px / 18rem)
- **Collapsed**: `md:w-20` (80px / 5rem)
- Smooth transition with `transition-all duration-300 ease-in-out`

### 3. **Responsive Design**
- **Desktop only**: Feature uses `md:` prefix (min-width: 768px)
- **Mobile**: Always shows full sidebar (slide-in drawer)
- **Tablet**: Collapsible at 768px and above

### 4. **Visual States**

#### Expanded State (Default)
```
┌─────────────────────────────────────┐
│  📚  Biblioteca Virtual             │  <- Full logo + text
├─────────────────────────────────────┤
│  📊  Dashboard                      │  <- Icon + text
│  📚  Biblioteca                     │
│  📝  Administrar Libros             │
│  👥  Administrar Autores            │
│  📁  Administrar Categorías         │
│  💳  Planes                         │
│  👤  Perfil                         │
├─────────────────────────────────────┤
│  ⚙️  Configuración                  │
│  ◀  Contraer                        │  <- Toggle button
└─────────────────────────────────────┘
```

#### Collapsed State
```
┌────────┐
│   📚   │  <- Icon only
├────────┤
│   📊   │  [Dashboard] <- Tooltip on hover
│   📚   │
│   📝   │
│   👥   │
│   📁   │
│   💳   │
│   👤   │
├────────┤
│   ⚙️   │
│   ▶    │  <- Toggle button
└────────┘
```

### 5. **Tooltips**
- Appear on hover when sidebar is collapsed
- Display full label text
- Positioned to the right of icon (`left-full ml-2`)
- Fade in/out with opacity transitions
- `z-50` ensures they appear above other content

### 6. **LocalStorage Persistence**
- **Key**: `sidebarCollapsed`
- **Values**: `'true'` | `'false'`
- **Behavior**:
  - Loads saved state on mount
  - Saves new state on toggle
  - Persists across browser sessions
  - Survives page refreshes

## 🔧 Implementation

### File Modified
**Path**: `frontend/src/app/(dashboard)/layout.tsx`

### Key Changes

#### 1. New State Variable
```tsx
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
```

#### 2. Load from localStorage
```tsx
useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
        setIsSidebarCollapsed(savedState === 'true')
    }
}, [])
```

#### 3. Toggle Function
```tsx
const toggleSidebarCollapse = () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
}
```

#### 4. Dynamic Sidebar Width
```tsx
<aside className={`
    fixed inset-y-0 left-0 z-50 transform bg-card shadow-xl transition-all duration-300 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    md:static md:translate-x-0
    ${isSidebarCollapsed ? "md:w-20" : "md:w-72"}
    w-72
    border-r border-border
`}>
```

#### 5. Conditional Logo Display

**Expanded Logo:**
```tsx
<div className={`flex items-center space-x-3 transition-opacity duration-200 ${isSidebarCollapsed ? "md:opacity-0 md:hidden" : "opacity-100"}`}>
    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
        <BookOpen className="h-6 w-6 text-white" />
    </div>
    <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
        Biblioteca Virtual
    </span>
</div>
```

**Collapsed Logo:**
```tsx
<div className={`flex items-center justify-center w-full transition-opacity duration-200 ${isSidebarCollapsed ? "md:opacity-100" : "md:opacity-0 md:hidden"}`}>
    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
        <BookOpen className="h-6 w-6 text-white" />
    </div>
</div>
```

#### 6. Nav Items with Tooltips
```tsx
{navItems.map((item) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    return (
        <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsSidebarOpen(false)}
            className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group relative
                ${isActive
                    ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30"
                    : "text-foreground hover:bg-muted hover:text-primary"
                }
                ${isSidebarCollapsed ? "md:justify-center md:px-2" : ""}
            `}
            title={isSidebarCollapsed ? item.label : undefined}
        >
            <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />

            {/* Text label - hidden when collapsed */}
            <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${isSidebarCollapsed ? "md:opacity-0 md:absolute md:invisible" : "opacity-100"}`}>
                {item.label}
            </span>

            {/* Tooltip for collapsed state */}
            {isSidebarCollapsed && (
                <span className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {item.label}
                </span>
            )}
        </Link>
    )
})}
```

#### 7. Settings Link (Similar Pattern)
```tsx
<Link
    href="/settings"
    className={`
        flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-all group relative
        ${isSidebarCollapsed ? "md:justify-center md:px-2" : ""}
    `}
    title={isSidebarCollapsed ? "Configuración" : undefined}
>
    <Settings className="h-5 w-5 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
    <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${isSidebarCollapsed ? "md:opacity-0 md:absolute md:invisible" : "opacity-100"}`}>
        Configuración
    </span>

    {/* Tooltip for collapsed state */}
    {isSidebarCollapsed && (
        <span className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            Configuración
        </span>
    )}
</Link>
```

#### 8. Toggle Button
```tsx
<button
    onClick={toggleSidebarCollapse}
    className={`
        hidden md:flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-all group
        ${isSidebarCollapsed ? "justify-center px-2" : ""}
    `}
    title={isSidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
>
    {isSidebarCollapsed ? (
        <ChevronRight className="h-5 w-5 flex-shrink-0" />
    ) : (
        <>
            <ChevronLeft className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium text-sm">Contraer</span>
        </>
    )}
</button>
```

### Icons Added
```tsx
import {
    BookOpen,
    LogOut,
    User,
    Menu,
    X,
    LayoutDashboard,
    Library,
    CreditCard,
    Search,
    Bell,
    Settings,
    ChevronDown,
    Moon,
    Sun,
    FileEdit,
    Users,
    FolderOpen,
    ChevronLeft,    // NEW
    ChevronRight    // NEW
} from "lucide-react"
```

## 🎨 CSS Classes Used

### Conditional Width
- `md:w-72` - Expanded width (288px)
- `md:w-20` - Collapsed width (80px)

### Transitions
- `transition-all duration-300 ease-in-out` - Smooth width changes
- `transition-opacity duration-200` - Fade in/out for text

### Visibility Control
- `md:opacity-0` - Hidden on desktop
- `md:opacity-100` - Visible on desktop
- `md:hidden` - Display none on desktop
- `md:block` - Display block on desktop
- `md:invisible` - Invisible but takes space
- `md:absolute` - Positioned absolutely

### Layout
- `md:justify-center` - Center icons when collapsed
- `md:px-2` - Reduced padding when collapsed

### Tooltip Styling
```css
.absolute left-full ml-2 px-2 py-1
bg-popover text-popover-foreground
text-sm rounded-md shadow-lg
opacity-0 group-hover:opacity-100
transition-opacity whitespace-nowrap
pointer-events-none z-50
```

## 🚀 Usage

### Apply Changes
```bash
# Run the automated script
APPLY_SIDEBAR_COLLAPSE.bat
```

### Manual Steps
```bash
# Restart frontend
docker compose restart frontend

# Wait for startup
timeout /t 15

# Open dashboard
start http://localhost:3000/dashboard
```

## ✅ Verification Checklist

### Visual Checks
- [ ] Toggle button visible at bottom of sidebar
- [ ] Sidebar shows full width (288px) by default
- [ ] Logo + "Biblioteca Virtual" text visible when expanded
- [ ] All nav items show icon + text when expanded

### Collapse Functionality
- [ ] Click toggle button
- [ ] Sidebar animates smoothly to narrow width (80px)
- [ ] Logo text fades out, only icon remains
- [ ] Nav item text fades out, only icons remain
- [ ] Icons are centered in collapsed sidebar
- [ ] Toggle button shows ChevronRight icon only

### Tooltips
- [ ] Hover over collapsed nav item icons
- [ ] Tooltip appears to the right of icon
- [ ] Tooltip shows full label text
- [ ] Tooltip fades in smoothly
- [ ] Tooltip disappears when not hovering

### Expand Functionality
- [ ] Click toggle button again
- [ ] Sidebar animates back to full width
- [ ] Logo text fades in
- [ ] Nav item text fades in
- [ ] Toggle button shows ChevronLeft + "Contraer" text

### Persistence
- [ ] Collapse sidebar
- [ ] Refresh page (F5)
- [ ] Sidebar remains collapsed
- [ ] Open DevTools → Application → Local Storage
- [ ] Verify `sidebarCollapsed: "true"` exists
- [ ] Expand sidebar
- [ ] Verify `sidebarCollapsed: "false"` in localStorage

### Responsive Behavior
- [ ] Resize browser to mobile width (<768px)
- [ ] Sidebar becomes slide-in drawer
- [ ] Toggle button hidden on mobile
- [ ] Resize back to desktop
- [ ] Sidebar returns to collapsible mode
- [ ] Previous state (collapsed/expanded) restored

### Active States
- [ ] Navigate to different pages
- [ ] Active page has gradient background
- [ ] Active state visible in both expanded/collapsed modes
- [ ] Hover effects work on inactive items

## 🐛 Troubleshooting

### Sidebar Not Collapsing
**Cause**: Frontend not restarted after code changes

**Solution**:
```bash
docker compose restart frontend
# Wait 15 seconds
# Hard refresh browser: Ctrl + Shift + R
```

### Tooltips Not Showing
**Cause**: CSS specificity or z-index issues

**Check**:
```javascript
// Browser DevTools Console
document.querySelector('.group-hover\\:opacity-100')
// Should return tooltip element
```

**Verify Styles**:
- `z-50` on tooltip
- `group` class on parent Link
- `group-hover:opacity-100` on tooltip

### State Not Persisting
**Cause**: localStorage not accessible or blocked

**Check**:
```javascript
// Browser Console
localStorage.getItem('sidebarCollapsed')
// Should return "true" or "false"

// Try setting manually
localStorage.setItem('sidebarCollapsed', 'true')
// Refresh page
```

**Clear and Retry**:
```javascript
localStorage.clear()
location.reload()
```

### Width Transition Jumpy
**Cause**: Missing transition classes

**Verify**:
```tsx
<aside className="transition-all duration-300 ease-in-out">
```

**Check computed styles**:
```javascript
// Browser DevTools Elements tab
// Select <aside> element
// Check Computed styles for:
// - transition-property: all
// - transition-duration: 300ms
// - transition-timing-function: ease-in-out
```

## 📊 Data Flow

### Initial Load
```
Component Mount
  ↓
useEffect runs
  ↓
localStorage.getItem('sidebarCollapsed')
  ↓
Parse value: 'true' | 'false' | null
  ↓
setIsSidebarCollapsed(booleanValue)
  ↓
Re-render with correct state
  ↓
Apply width: md:w-20 or md:w-72
```

### Toggle Action
```
User clicks toggle button
  ↓
toggleSidebarCollapse() called
  ↓
const newState = !isSidebarCollapsed
  ↓
setIsSidebarCollapsed(newState)
  ↓
localStorage.setItem('sidebarCollapsed', String(newState))
  ↓
React re-renders
  ↓
Tailwind applies new width class
  ↓
CSS transition animates width change
  ↓
Text opacity transitions simultaneously
```

### Tooltip Interaction
```
User hovers over nav item
  ↓
:hover pseudo-class activates
  ↓
group-hover:opacity-100 applies to tooltip
  ↓
Tooltip fades in (transition-opacity)
  ↓
User moves mouse away
  ↓
opacity-0 restored
  ↓
Tooltip fades out
```

## 💡 Design Decisions

### Why localStorage?
- **Pros**:
  - Simple API
  - Persists across sessions
  - No backend required
  - Works offline
- **Cons**:
  - Only client-side
  - Not synchronized across devices
  - Limited to 5-10MB

**Alternative**: Could use user preferences API endpoint for cross-device sync

### Why md: Breakpoint?
- **Mobile (<768px)**: Limited screen space, full sidebar needed for context
- **Tablet/Desktop (≥768px)**: Enough space to show collapsed sidebar
- Matches Tailwind's default `md:` breakpoint (768px)

### Why 80px Collapsed Width?
- **Icon size**: 20px (h-5 w-5)
- **Padding**: 8px each side (px-2 = 0.5rem = 8px)
- **Total**: 20 + 8 + 8 = 36px minimum
- **80px**: Provides comfortable spacing and hover target

### Why Tooltips Instead of Icons Only?
- **Accessibility**: Screen readers can announce labels
- **Discoverability**: Users can learn what each icon means
- **Consistency**: Matches common UI patterns (VS Code, Discord, etc.)

## 🎯 Future Enhancements

### 1. Keyboard Shortcuts
```tsx
useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'b') {
            toggleSidebarCollapse()
        }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
}, [])
```

### 2. Animation Preferences
```tsx
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

<aside className={`
    ${prefersReducedMotion ? '' : 'transition-all duration-300'}
`}>
```

### 3. Auto-Collapse on Small Screens
```tsx
useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 1024 && !isSidebarCollapsed) {
            setIsSidebarCollapsed(true)
        }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
}, [isSidebarCollapsed])
```

### 4. Sync with Backend
```tsx
const toggleSidebarCollapse = async () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))

    // Sync with backend
    try {
        await api.patch('/users/me/preferences/', {
            sidebar_collapsed: newState
        })
    } catch (error) {
        console.error('Failed to sync sidebar state', error)
    }
}
```

## 📚 Related Files

```
frontend/src/app/(dashboard)/
├── layout.tsx                 # ✅ MODIFIED - Added collapse functionality
├── dashboard/
│   └── page.tsx              # Uses layout
├── library/
│   └── page.tsx              # Uses layout
├── admin/
│   ├── books/page.tsx        # Uses layout
│   ├── authors/page.tsx      # Uses layout
│   └── categories/page.tsx   # Uses layout
├── plans/
│   └── page.tsx              # Uses layout
└── profile/
    └── page.tsx              # Uses layout
```

All pages under `(dashboard)` group inherit this layout and benefit from the collapsible sidebar.

## 🔍 Testing

### Manual Testing Script
```javascript
// Browser Console (F12)

// 1. Test initial state
console.log('Initial collapsed:', localStorage.getItem('sidebarCollapsed'))

// 2. Test toggle function
document.querySelector('button[title*="sidebar"]').click()
console.log('After toggle:', localStorage.getItem('sidebarCollapsed'))

// 3. Test persistence
location.reload()
// Check if sidebar maintains state after reload

// 4. Test tooltip visibility
const tooltips = document.querySelectorAll('.group-hover\\:opacity-100')
console.log('Tooltips found:', tooltips.length)

// 5. Measure width
const sidebar = document.querySelector('aside')
console.log('Sidebar width:', sidebar.offsetWidth, 'px')

// 6. Clear state
localStorage.removeItem('sidebarCollapsed')
location.reload()
```

### Automated Testing (Future)
```tsx
// __tests__/layout.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import DashboardLayout from '../layout'

describe('DashboardLayout - Sidebar Collapse', () => {
    it('should toggle sidebar collapsed state', () => {
        render(<DashboardLayout><div>Test</div></DashboardLayout>)

        const toggleButton = screen.getByTitle(/sidebar/i)
        const sidebar = screen.getByRole('complementary')

        // Initially expanded
        expect(sidebar).toHaveClass('md:w-72')

        // Click to collapse
        fireEvent.click(toggleButton)
        expect(sidebar).toHaveClass('md:w-20')

        // Click to expand
        fireEvent.click(toggleButton)
        expect(sidebar).toHaveClass('md:w-72')
    })

    it('should persist state in localStorage', () => {
        const { rerender } = render(<DashboardLayout><div>Test</div></DashboardLayout>)

        const toggleButton = screen.getByTitle(/sidebar/i)
        fireEvent.click(toggleButton)

        expect(localStorage.getItem('sidebarCollapsed')).toBe('true')

        // Simulate page reload
        rerender(<DashboardLayout><div>Test</div></DashboardLayout>)

        const sidebar = screen.getByRole('complementary')
        expect(sidebar).toHaveClass('md:w-20')
    })
})
```

## 📖 References

- [Tailwind CSS Transitions](https://tailwindcss.com/docs/transition-property)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [React useState Hook](https://react.dev/reference/react/useState)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Lucide React Icons](https://lucide.dev/guide/packages/lucide-react)

---

**Date**: 2025-12-28
**Feature**: Collapsible Sidebar
**Status**: ✅ Implemented
**Next Action**: Run `APPLY_SIDEBAR_COLLAPSE.bat` to restart frontend and test
