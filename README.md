# Senpai Career

A membership-based platform for international students in Japan, connecting them with OB/OG (alumni), internships, and new graduate opportunities.

## Overview

Senpai Career provides international students with a fair start line for job hunting in Japan through:
- **OB/OG Consultations**: Connect with alumni and working professionals for career guidance
- **Long-term Internships**: Discover internship opportunities aligned with interests
- **New Graduate Recruiting**: Access new graduate positions from companies seeking international talent

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: NextAuth.js v5 (beta)
- **Email**: Resend API
- **Runtime**: Node.js 18+

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SenpaiCareer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local  # If you have an example file
# OR create manually:
touch .env.local
```

Add the following environment variables to `.env.local`:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Resend Email Configuration (for password reset)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Stripe Payment Configuration (for credits purchase)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### Generating NEXTAUTH_SECRET

Generate a secure secret key:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET` value.

#### Getting Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in the dashboard
3. Add it to `RESEND_API_KEY` in `.env.local`
4. Set `RESEND_FROM_EMAIL` to your verified email or domain

#### Getting Stripe API Keys (for Credits Payment)

1. Sign up at [stripe.com](https://stripe.com)
2. Go to Developers → API keys
3. Copy your **Secret key** (starts with `sk_test_` for test mode) to `STRIPE_SECRET_KEY`
4. Copy your **Publishable key** (starts with `pk_test_` for test mode) to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. For webhooks:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Set endpoint URL to: `https://yourdomain.com/api/payment/webhook` (or use Stripe CLI for local testing)
   - Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
   - Copy the **Signing secret** (starts with `whsec_`) to `STRIPE_WEBHOOK_SECRET`

**Note:** For local development, use Stripe CLI to forward webhooks:
```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
```

### 4. Initialize Data Directory

The application uses JSON files for data storage. The `data/` directory should already exist with the following files:
- `users.json` - User accounts
- `internships.json` - Internship and new-grad listings
- `reports.json` - User reports
- `notifications.json` - User notifications (auto-created)
- `reviews.json` - User reviews (auto-created)
- `password-reset-tokens.json` - Password reset tokens (auto-created)

If these files don't exist, they will be created automatically on first run.

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 6. Create Your First Account

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click "Sign Up" and choose a role:
   - **Student**: For international students seeking opportunities
   - **OB/OG**: For working professionals and job-offer holders
   - **Company**: For companies looking to recruit students

3. Fill out the registration form and accept the Terms of Service

## Creating an Admin Account

To access the admin dashboard:

1. Create a regular account (any role) through the signup page
2. Open `data/users.json` in your editor
3. Find your user entry and change the `role` field to `"admin"`
4. Save the file
5. Log out and log back in
6. Navigate to `/dashboard` - you'll be automatically redirected to `/dashboard/admin`

Example admin user entry:
```json
{
  "email": "admin@example.com",
  "password": "$2b$10$...",
  "name": "Admin User",
  "role": "admin",
  "id": "user_1234567890_abcdef",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

## Available Scripts

### Development

```bash
npm run dev
```
Starts the development server with hot-reload at `http://localhost:3000`

### Production Build

```bash
npm run build
```
Creates an optimized production build

```bash
npm start
```
Starts the production server (run after `npm run build`)

### Linting

```bash
npm run lint
```
Runs ESLint to check for code issues

## Project Structure

```
SenpaiCareer/
├── app/                      # Next.js App Router pages
│   ├── about/               # About Us page
│   ├── admin/               # Admin dashboard and management
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── messages/       # Messaging system
│   │   ├── notifications/  # Notifications system
│   │   ├── reviews/        # Reviews system
│   │   └── ...
│   ├── company/            # Company-specific pages
│   ├── dashboard/          # Role-based dashboards
│   ├── internship/         # Internship listings
│   ├── messages/           # Messaging interface
│   ├── ob-visit/           # OB/OG Visit page
│   ├── profile/            # User profile management
│   ├── recruiting/         # New graduate listings
│   ├── signup/             # Registration pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── Header.tsx          # Global navigation
│   ├── Avatar.tsx          # User avatar component
│   ├── ReviewModal.tsx     # Review submission modal
│   └── ...
├── contexts/               # React contexts
│   └── LanguageContext.tsx # Language switching (EN/JP)
├── data/                   # JSON data storage
│   ├── users.json          # User accounts
│   ├── internships.json    # Job listings
│   ├── reports.json        # User reports
│   └── ...
├── lib/                    # Utility functions
│   ├── auth.ts             # NextAuth configuration
│   ├── users.ts            # User management
│   ├── notifications.ts    # Notification management
│   └── ...
├── types/                  # TypeScript definitions
│   └── index.ts            # Type interfaces
└── public/                 # Static assets
    └── uploads/            # User-uploaded images
```

## Features

### Authentication & User Management
- ✅ Multi-role authentication (Student, OB/OG, Company, Admin)
- ✅ Email/password authentication with NextAuth.js
- ✅ Password reset via email
- ✅ Profile customization with image uploads
- ✅ Account deletion

### OB/OG System
- ✅ OB/OG profile listings
- ✅ Detailed OB/OG profiles
- ✅ Student-to-OB/OG messaging
- ✅ Profile search and filtering

### Internship & Recruiting
- ✅ Internship listings with company details
- ✅ New graduate position listings
- ✅ Company posting and management
- ✅ Bilingual content (English/Japanese)

### Messaging System
- ✅ Unified inbox for all roles
- ✅ Real-time message threads
- ✅ Message read status
- ✅ Company-to-student messaging

### Notifications
- ✅ Bell notification dropdown
- ✅ Unread notification count
- ✅ Notification types: messages, listings, system
- ✅ Mark as read functionality

### Reviews System
- ✅ Post-session reviews (1-5 stars)
- ✅ Review comments
- ✅ Average rating calculation
- ✅ One review per user pair

### Admin Features
- ✅ Admin dashboard with statistics
- ✅ User management (view, ban/unban)
- ✅ Strike management (auto-ban at 2 strikes)
- ✅ Reports management
- ✅ User search and filtering

### Safety & Moderation
- ✅ User reporting system
- ✅ Admin review of reports
- ✅ Strike system for violations
- ✅ Automatic banning for repeat offenders

### Internationalization
- ✅ English/Japanese language switching
- ✅ Translated UI elements
- ✅ Translated content (listings, forms, etc.)

## User Roles

### Student
- Browse OB/OG profiles
- Message OB/OG mentors
- View internship and new-grad listings
- Submit reviews
- Report users

### OB/OG
- Create detailed profile
- Receive messages from students
- Provide career guidance
- Manage profile information

### Company
- Create company profile
- Post internship and new-grad positions
- Browse and filter student profiles
- Send messages to students
- Manage listings

### Admin
- Access admin dashboard
- Manage all users
- Review and handle reports
- Apply/remove strikes
- Ban/unban users

## Development

### Adding New Features

1. **API Routes**: Add new routes in `app/api/`
2. **Pages**: Create new pages in `app/`
3. **Components**: Add reusable components in `components/`
4. **Types**: Define TypeScript interfaces in `types/index.ts`
5. **Utilities**: Add helper functions in `lib/`

### Data Storage

The application uses JSON files for data storage in the `data/` directory:
- All data files are automatically created if they don't exist
- Data persists between server restarts
- For production, consider migrating to a database (PostgreSQL, MongoDB, etc.)

### Styling

The application uses Tailwind CSS with custom gradient theme:
- Gradient colors: `#f26aa3` → `#f59fc1` → `#6fd3ee` → `#4cc3e6`
- Custom classes: `.gradient-text`, `.card-gradient`, `.btn-primary`, `.btn-secondary`
- All styles defined in `app/globals.css`

### Language Support

To add new translations:
1. Open `contexts/LanguageContext.tsx`
2. Add translation keys to both `en` and `ja` objects
3. Use `t("key")` in components to display translated text

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Authentication Errors

If you encounter authentication errors:
1. Check that `NEXTAUTH_SECRET` is set in `.env.local`
2. Clear browser cookies and try again
3. Restart the development server

### Email Not Sending

If password reset emails aren't sending:
1. Verify `RESEND_API_KEY` is correct in `.env.local`
2. Check that `RESEND_FROM_EMAIL` is a verified email/domain in Resend
3. Check Resend dashboard for API usage and errors

### Data Not Persisting

Ensure the `data/` directory exists and is writable:
```bash
mkdir -p data
chmod 755 data
```

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Set the following in your production environment:
- `NEXTAUTH_SECRET` - Use a strong, randomly generated secret
- `NEXTAUTH_URL` - Your production domain (e.g., `https://senpaicareer.com`)
- `RESEND_API_KEY` - Your production Resend API key
- `RESEND_FROM_EMAIL` - Your verified production email/domain

### Database Migration

For production, consider migrating from JSON files to a proper database:
- PostgreSQL (recommended)
- MongoDB
- MySQL

Update the `lib/` files to use database queries instead of file system operations.

## Security Notes

⚠️ **Important for Production**:
- Never commit `.env.local` to version control
- Use strong, randomly generated secrets
- Implement rate limiting for API routes
- Add CSRF protection
- Use HTTPS in production
- Regularly update dependencies
- Implement proper database with connection pooling
- Add input validation and sanitization
- Set up proper error logging and monitoring

## Support

For issues, questions, or contributions:
- Email: info@senpaicareer.com
- Create an issue in the repository

## License

ISC
