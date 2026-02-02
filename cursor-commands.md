# Cursor AI Commands - Bug Fixes & Improvements

## Instructions for Use
Copy each section below and paste into Cursor AI's chat. Execute sections in order for best results.

---

## 8.6 Color Accessibility Fix

```
Fix color-blind accessibility issue:
- Find all instances where green and red colors are used together in the UI
- Separate these color combinations to ensure accessibility
- Use alternative color pairings that are distinguishable for color-blind users
- Consider using blue/orange or other accessible color combinations
- Add color-blind safe palette to global CSS variables
```

---

## 8.7 Enable Message Sending

```
Implement messaging functionality:
- Create a messaging system that allows sending messages to students
- Ensure Admin permissions are properly configured to enable this feature
- Add message composition interface
- Implement message delivery system
- Add message history/inbox functionality
- Include validation and error handling
```

---

## 8.8 Fix Filter Button

```
Debug and fix filter functionality:
- Locate the buggy filter button component
- Debug the filtering logic to identify the issue
- Fix the filter button to work correctly
- Ensure filters apply properly to the data
- Remove "My Page" reference from this section/component
- Test all filter combinations to ensure proper functionality
```

---

## 8.9 Card Alignment Fix

```
Fix card alignment issues:
- Find all card components with misalignment issues
- Fix the card grid/flexbox layout
- Ensure consistent spacing between cards
- Make cards responsive across different screen sizes
- Apply proper CSS grid or flexbox alignment
- Test on mobile, tablet, and desktop viewports
```

---

## 8.10 Filter Status Indicator

```
Add visual indicator for active filters:
- Create a visual indicator that shows when filters are actively applied
- Display which specific filters are currently active
- Add a "Clear filters" button when filters are applied
- Show filter count or active filter tags
- Make the indicator prominent and easy to understand
- Update indicator in real-time as filters change
```

---

## 8.11 Enable Salary Input

```
Fix salary input in internships form:
- Locate the internships/new form component
- Enable the salary input field
- Ensure proper validation for salary input (numbers only, reasonable ranges)
- Add appropriate formatting (currency symbol, thousand separators)
- Make sure the field saves correctly to the database
- Test form submission with salary data
```

---

## 8.12 Implement Pagination

```
Add pagination for long lists:
- Identify all pages/components with long lists that need pagination
- Implement pagination component with:
  - Page numbers
  - Previous/Next buttons
  - Items per page selector (10, 25, 50, 100)
  - Total count display
- Add proper state management for current page
- Ensure data fetching works with pagination parameters
- Make pagination responsive for mobile devices
```

---

## 8.13 Fix Edit Page Loading

```
Debug and fix edit page functionality:
- Identify why the edit page doesn't load
- Check for:
  - Route configuration issues
  - Data fetching errors
  - Component mounting issues
  - Permission/authentication problems
- Fix the identified issue
- Add proper loading states
- Add error handling and error messages
- Test edit functionality thoroughly
```

---

## 8.14 Fix Calendar Component

```
Debug and fix calendar:
IMPORTANT: First verify this is an actual bug and not user error
- Test the calendar functionality to confirm the issue
- If confirmed as a bug:
  - Debug the calendar component
  - Check date selection, navigation, and event display
  - Fix any JavaScript errors
  - Ensure proper date formatting
  - Test timezone handling if applicable
- Add user guidance/tooltips if it's a UX issue
```

---

## 8.15 Single Heading Cleanup

```
Reduce multiple headings to one:
- Find pages with multiple H1 or main headings
- Consolidate to a single, clear heading per page
- Ensure proper heading hierarchy (H1 → H2 → H3)
- Update page structure to be semantically correct
- Improve readability and SEO
```

---

## 9.1 Remove Credit Purchase Button (Student View)

```
Remove credit purchase from student page:
- Locate the credit purchase button on the student-logged-in page
- Remove this button from the student view
- Ensure this feature remains available for appropriate user roles
- Verify the removal doesn't break any layout
- Test with student-role accounts to confirm it's hidden
```

---

## 9.2 Fix Reload Login Bug

```
Fix session persistence on page reload:
- Debug why page reload redirects to login
- Check session/token storage (localStorage, sessionStorage, cookies)
- Fix authentication state persistence
- Ensure refresh tokens are properly handled
- Test that login state persists after:
  - Manual page refresh
  - Browser back/forward navigation
  - Closing and reopening tabs
- Add proper session timeout handling
```

---

## 9.3 Fix Stripe Back Button Bug

```
Fix Stripe Checkout return flow:
- Debug the issue when user clicks back button from Stripe Checkout
- Properly handle Stripe return URLs (success, cancel)
- Implement proper state management for checkout flow
- Handle edge cases:
  - User clicks browser back button
  - User clicks Stripe's back button
  - Network errors during checkout
- Add loading states during Stripe redirect
- Test complete checkout flow including back button scenarios
```

---

## 9.4 Fix File Upload Issues

```
Debug and fix file upload functionality:
- Identify what's causing buggy uploads
- Check for:
  - File size limits
  - Allowed file types validation
  - Server-side upload handling
  - Progress indicators
  - Error handling
- Fix the identified issues
- Add proper validation and user feedback
- Implement upload progress indicator
- Add retry mechanism for failed uploads
- Test with various file types and sizes
```

---

## Global CSS Variables Setup

```
Create centralized global CSS variables:

1. Create a new file: src/styles/globals.css (or update existing)

2. Add comprehensive CSS variables for:

/* ========== COLORS ========== */
:root {
  /* Primary Colors */
  --color-primary: #3B82F6;
  --color-primary-hover: #2563EB;
  --color-primary-light: #DBEAFE;
  
  /* Secondary Colors */
  --color-secondary: #8B5CF6;
  --color-secondary-hover: #7C3AED;
  
  /* Semantic Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Neutral Colors */
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  --color-background: #FFFFFF;
  --color-background-secondary: #F9FAFB;
  --color-border: #E5E7EB;
  
  /* Color-blind Accessible Alternatives */
  --color-accessible-blue: #0077BB;
  --color-accessible-orange: #EE7733;
  --color-accessible-cyan: #33BBEE;
  --color-accessible-magenta: #EE3377;
  
  /* ========== TYPOGRAPHY ========== */
  /* Font Families */
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  --font-mono: 'Courier New', Courier, monospace;
  
  /* Font Sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  
  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* ========== SPACING ========== */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  --spacing-3xl: 4rem;     /* 64px */
  
  /* ========== BORDERS ========== */
  --border-radius-sm: 0.25rem;   /* 4px */
  --border-radius-md: 0.5rem;    /* 8px */
  --border-radius-lg: 0.75rem;   /* 12px */
  --border-radius-xl: 1rem;      /* 16px */
  --border-radius-full: 9999px;
  
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-width-thick: 4px;
  
  /* ========== SHADOWS ========== */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* ========== TRANSITIONS ========== */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
  
  /* ========== BREAKPOINTS (for JS usage) ========== */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* ========== CARD STYLES ========== */
.card {
  background-color: var(--color-background);
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.card-body {
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

/* ========== BUTTON STYLES ========== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}

.btn-secondary:hover {
  background-color: var(--color-secondary-hover);
  box-shadow: var(--shadow-md);
}

.btn-outline {
  background-color: transparent;
  border: var(--border-width-medium) solid var(--color-primary);
  color: var(--color-primary);
}

.btn-outline:hover {
  background-color: var(--color-primary-light);
}

.btn-success {
  background-color: var(--color-success);
  color: white;
}

.btn-warning {
  background-color: var(--color-warning);
  color: white;
}

.btn-error {
  background-color: var(--color-error);
  color: white;
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.btn-lg {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

3. Update all existing CSS files to use these variables instead of hardcoded values

4. Search and replace:
   - All HEX color codes with CSS variables
   - All hardcoded font sizes with CSS variables
   - All hardcoded spacing values with CSS variables
   - All button styles to use the new button classes
   - All card styles to use the new card classes

5. Import globals.css in your main app file (e.g., App.js, _app.js, or index.js)
```

---

## Final Testing Checklist

```
After implementing all fixes, test the following:

1. Color Accessibility
   - [ ] No green/red combinations exist
   - [ ] All color combinations pass WCAG AA standards

2. Messaging System
   - [ ] Admins can send messages to students
   - [ ] Messages are delivered successfully
   - [ ] Message history is accessible

3. Filters
   - [ ] All filter buttons work correctly
   - [ ] Active filters are clearly indicated
   - [ ] "My Page" is removed from filter section

4. UI Components
   - [ ] Cards are properly aligned on all screen sizes
   - [ ] Single heading on each page
   - [ ] Pagination works on all list pages

5. Forms
   - [ ] Salary input works in internship forms
   - [ ] Edit page loads correctly
   - [ ] File uploads work properly

6. Calendar
   - [ ] Calendar functionality verified and working

7. Student Page
   - [ ] Credit purchase button removed for students
   - [ ] Page doesn't redirect to login on refresh
   - [ ] Stripe back button doesn't cause bugs

8. Global CSS
   - [ ] All colors use CSS variables
   - [ ] All fonts use CSS variables
   - [ ] All buttons use standardized classes
   - [ ] All cards use standardized classes
   - [ ] Styles are consistent across the application

9. Cross-browser Testing
   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari
   - [ ] Edge

10. Responsive Testing
    - [ ] Mobile (320px - 767px)
    - [ ] Tablet (768px - 1023px)
    - [ ] Desktop (1024px+)
```

---

## Notes for Developer

- Execute commands in the order presented
- Test each fix before moving to the next
- Commit changes after each major section
- Update documentation as needed
- Consider creating a separate branch for these fixes
- Run full test suite after all fixes are complete

---

## Priority Order Recommendation

**High Priority (Fix First):**
1. 9.2 - Fix Reload Login Bug (affects all users)
2. 8.13 - Fix Edit Not Loading (critical functionality)
3. 9.4 - Fix Buggy Uploads (core feature)
4. 8.7 - Enable Message Sending (requested feature)

**Medium Priority:**
5. Global CSS Variables (improves maintainability)
6. 8.12 - Add Pagination (improves UX)
7. 8.10 - Show Filter Status (improves UX)
8. 9.3 - Fix Stripe Back Button Bug (payment flow)

**Lower Priority:**
9. 8.6 - Color Accessibility (important but non-blocking)
10. 8.9 - Align Cards (visual fix)
11. 8.11 - Salary Input (form enhancement)
12. 9.1 - Remove Credit Purchase Button (role-specific)
13. 8.8 - Fix Filter Button + Remove "My Page"
14. 8.14 - Fix Calendar (verify if real issue first)
15. 8.15 - Single Heading (cleanup task)
