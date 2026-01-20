# Fix: Module not found 'next-auth/react'

## Problem
The `next-auth` package is not installed in `node_modules`, causing the build error.

## Solution

### Step 1: Install Dependencies

Run this command in your terminal:

```bash
cd /Users/ashwin/Desktop/GitHub/Senpai-Career-Final
npm install
```

This will install all dependencies including:
- `next-auth@^5.0.0-beta.30`
- `@supabase/supabase-js@^2.39.0`
- All other dependencies

### Step 2: Verify Installation

After running `npm install`, verify that next-auth is installed:

```bash
ls node_modules/next-auth
```

You should see the `next-auth` directory.

### Step 3: Clear Build Cache

Clear the Next.js build cache:

```bash
rm -rf .next
```

### Step 4: Restart Dev Server

```bash
npm run dev
```

## If npm install fails

If you get permission errors or other issues:

1. **Delete node_modules and package-lock.json:**
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

3. **Reinstall:**
   ```bash
   npm install
   ```

## Alternative: Use yarn

If npm doesn't work, try yarn:

```bash
yarn install
```

## Verify package.json

Your `package.json` should include:
```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.30",
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

Both packages are already in your `package.json` - you just need to install them.
