# Senpai Career

A membership-based platform for international students in Japan, connecting them with OB/OG (alumni), internships, and new graduate opportunities.

## Overview

Senpai Career provides international students with a fair start line for job hunting in Japan through:
- **OB/OG Consultations**: Connect with alumni and working professionals for career guidance
- **Long-term Internships**: Discover internship opportunities aligned with interests
- **New Graduate Recruiting**: Access new graduate positions from companies seeking international talent

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for profile pictures, resumes, compliance documents)
- **Payment Processing**: Stripe
- **Email**: Resend API
- **Animations**: Framer Motion
- **Runtime**: Node.js 18+

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)
- **Supabase Account** (for database and authentication)
- **Stripe Account** (for payment processing)
- **Resend Account** (for email services)

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

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Resend Email Configuration (for password reset)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Stripe Payment Configuration (for credits purchase)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### Setting Up Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings → API
4. Copy your **Project URL** to `NEXT_PUBLIC_SUPABASE_URL`
5. Copy your **anon/public key** to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy your **service_role key** to `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

**Database Setup:**
1. Run the SQL scripts in the `scripts/` directory:
   - `schema.sql` - Creates all database tables, types, triggers, and RLS policies
   - `storage-setup.sql` - Sets up Supabase Storage buckets and policies
   - `enable-realtime.sql` - Enables Realtime subscriptions for messages and threads (required for real-time messaging)
2. Execute these in the Supabase SQL Editor in order

**Enable Realtime for Messages:**
1. Run `scripts/enable-realtime.sql` in the Supabase SQL Editor
2. This adds the `messages` and `threads` tables to the Realtime publication
3. This is required for real-time message updates to work
4. Alternatively, you can enable it manually in Supabase Dashboard → Database → Replication → Add tables to publication

#### Getting Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in the dashboard
3. Add it to `RESEND_API_KEY` in `.env.local`
4. Set `RESEND_FROM_EMAIL` to your verified email or domain

#### Getting Stripe API Keys

See `STRIPE_SETUP_GUIDE.txt` for detailed Stripe configuration instructions.

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Create Your First Account

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click "Sign Up" and choose a role:
   - **Student**: For international students seeking opportunities
   - **OB/OG**: For working professionals and job-offer holders
   - **Company**: For companies looking to recruit students

3. Fill out the registration form and accept the Terms of Service

## Creating an Admin Account

To access the admin dashboard:

1. Create a regular account (any role) through the signup page
2. In Supabase Dashboard → Table Editor → `users` table
3. Find your user entry and change the `role` field to `'admin'`
4. Save the changes
5. Log out and log back in
6. Navigate to `/dashboard` - you'll be automatically redirected to `/dashboard/admin`

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
├── app/                          # Next.js App Router pages
│   ├── about/                   # About Us and OB Visit pages
│   ├── admin/                   # Admin dashboard and management
│   │   ├── compliance/          # Compliance document review
│   │   ├── reports/             # User reports management
│   │   ├── users/               # User management
│   │   ├── student-actions/     # Student activity tracking
│   │   ├── meetings/            # Meeting reviews
│   │   └── chats/               # Message monitoring
│   ├── api/                     # API routes
│   │   ├── admin/               # Admin endpoints
│   │   ├── auth/                # Authentication endpoints
│   │   ├── bookings/            # Booking management
│   │   ├── messages/            # Messaging system
│   │   ├── notifications/       # Notifications system
│   │   ├── payment/             # Stripe payment processing
│   │   ├── profile/              # Profile management
│   │   ├── upload/              # File uploads (Supabase Storage)
│   │   └── ...
│   ├── company/                 # Company-specific pages
│   │   ├── internships/         # Internship management
│   │   ├── students/            # Student browsing
│   │   └── profile/              # Company profile
│   ├── dashboard/               # Role-based dashboards
│   ├── credits/                 # Credit purchase page
│   ├── internships/             # Internship listings
│   ├── messages/                # Messaging interface
│   ├── obog/                    # OB/OG profiles and bookings
│   ├── profile/                 # User profile management
│   ├── recruiting/              # New graduate listings
│   ├── student/                 # Student-specific pages
│   │   ├── profile/             # Student profile with compliance
│   │   ├── history/             # Browsing history
│   │   └── saved/               # Saved items
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── AdminLayout.tsx          # Admin page layout
│   ├── AppLayout.tsx            # Main app layout
│   ├── SidebarLayout.tsx        # Sidebar navigation
│   ├── Header.tsx                # Global navigation
│   ├── Avatar.tsx               # User avatar component
│   ├── ReviewModal.tsx           # Review submission modal
│   ├── MultiSelectDropdown.tsx   # Multi-select component
│   ├── ui/                       # Reusable UI components
│   └── ...
├── contexts/                     # React contexts
│   ├── AuthContext.tsx           # Authentication context
│   └── LanguageContext.tsx       # Language switching (EN/JP)
├── lib/                          # Utility functions
│   ├── supabase/               # Supabase client setup
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts        # Middleware helpers
│   ├── auth-server.ts            # Server-side authentication
│   ├── users.ts                  # User management
│   ├── messages.ts               # Messaging utilities
│   ├── notifications.ts          # Notification management
│   ├── applications.ts           # Application management
│   ├── reports.ts                 # Report management
│   └── ...
├── scripts/                      # SQL scripts
│   ├── schema.sql                # Main database schema
│   ├── storage-setup.sql         # Storage bucket setup
│   ├── clear-all-data.sql        # Data cleanup script
│   └── disable-rls.sql           # RLS disable guide
├── types/                         # TypeScript definitions
│   └── index.ts                  # Type interfaces
└── public/                        # Static assets
    └── uploads/                   # Legacy uploads (migrated to Supabase)
```

## Features

### Authentication & User Management
- ✅ Multi-role authentication (Student, OB/OG, Company, Admin)
- ✅ Email/password authentication with Supabase Auth
- ✅ Password reset via email
- ✅ Profile customization with image uploads
- ✅ Account deletion with cascade cleanup
- ✅ User settings management
- ✅ Notification preferences

### Credit System & Payments
- ✅ Credit-based messaging system (10 credits per message)
- ✅ Stripe integration for credit purchases
- ✅ Role-based pricing (Companies: 15 JPY/credit, Others: 30 JPY/credit)
- ✅ One-time and recurring payment options
- ✅ Credit balance tracking
- ✅ Payment webhook handling

### OB/OG System
- ✅ OB/OG profile listings with search and filters
- ✅ Detailed OB/OG profiles
- ✅ Student-to-OB/OG messaging
- ✅ Availability calendar management
- ✅ Booking system for consultations
- ✅ Meeting management and status tracking
- ✅ Post-meeting reviews and evaluations

### Internship & Recruiting
- ✅ Internship listings with company details
- ✅ New graduate position listings
- ✅ Company posting and management
- ✅ Application system with status tracking
- ✅ Bilingual content (English/Japanese)
- ✅ Application viewing and management

### Messaging System
- ✅ Unified inbox for all roles
- ✅ Real-time message threads
- ✅ Message read status
- ✅ Company-to-student messaging
- ✅ Thread-based conversations
- ✅ Message history

### Compliance & Verification
- ✅ Student compliance document submission
- ✅ Outside qualification permission upload
- ✅ Japanese language certification upload
- ✅ Admin compliance review system
- ✅ Document status management (pending, approved, rejected)
- ✅ Secure document storage in Supabase Storage

### Notifications
- ✅ Bell notification dropdown
- ✅ Unread notification count
- ✅ Notification types: messages, listings, system, meetings, applications
- ✅ Mark as read functionality
- ✅ Notification settings per type
- ✅ Email notification queue system

### Reviews System
- ✅ Post-session reviews (1-5 stars)
- ✅ Review comments
- ✅ Average rating calculation
- ✅ One review per user pair
- ✅ Review display on profiles

### Admin Features
- ✅ Admin dashboard with statistics
- ✅ User management (view, ban/unban)
- ✅ Strike management (auto-ban at 2 strikes)
- ✅ Reports management with status tracking
- ✅ Compliance document review
- ✅ Student action tracking (contacts, meetings, applications)
- ✅ Meeting review system
- ✅ Message monitoring
- ✅ User search and filtering

### Safety & Moderation
- ✅ User reporting system
- ✅ Admin review of reports
- ✅ Strike system for violations
- ✅ Automatic banning for repeat offenders
- ✅ Report status workflow

### Student Features
- ✅ Browsing history tracking
- ✅ Saved items (internships, OB/OG profiles)
- ✅ Profile management
- ✅ Compliance document submission
- ✅ Application tracking

### Internationalization
- ✅ English/Japanese language switching
- ✅ Translated UI elements
- ✅ Translated content (listings, forms, etc.)
- ✅ Language context management

### File Storage
- ✅ Supabase Storage integration
- ✅ Profile picture uploads
- ✅ Resume uploads
- ✅ Compliance document storage
- ✅ Secure file access with RLS policies
- ✅ Public URL generation

## User Roles

### Student
- Browse OB/OG profiles
- Message OB/OG mentors (10 credits per message)
- View internship and new-grad listings
- Submit applications
- Submit reviews
- Report users
- Submit compliance documents
- Track browsing history
- Save favorite items

### OB/OG
- Create detailed profile
- Set availability calendar
- Receive messages from students
- Manage bookings
- Provide career guidance
- Manage profile information
- View meeting requests

### Company
- Create company profile
- Post internship and new-grad positions
- Browse and filter student profiles
- Send messages to students
- Manage listings
- View applications
- Manage company profile

### Admin
- Access admin dashboard
- Manage all users
- Review and handle reports
- Apply/remove strikes
- Ban/unban users
- Review compliance documents
- Monitor student activity
- Review flagged meetings
- Monitor messages

## Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:
- `users` - User accounts and authentication
- `student_profiles` - Student-specific information
- `obog_profiles` - OB/OG profile information
- `company_profiles` - Company information
- `internships` - Internship and new-grad listings
- `applications` - Job applications
- `messages` - Individual messages
- `threads` - Message threads
- `bookings` - OB/OG consultation bookings
- `availability` - OB/OG availability slots
- `reports` - User reports
- `reviews` - User reviews
- `notifications` - User notifications
- `saved_items` - Saved internships/profiles
- `browsing_history` - Student browsing history
- `user_settings` - User preferences
- `notification_settings` - Notification preferences

## Development

### Adding New Features

1. **API Routes**: Add new routes in `app/api/`
2. **Pages**: Create new pages in `app/`
3. **Components**: Add reusable components in `components/`
4. **Types**: Define TypeScript interfaces in `types/index.ts`
5. **Utilities**: Add helper functions in `lib/`
6. **Database**: Update `scripts/schema.sql` for schema changes

### Database Migrations

1. Make changes to `scripts/schema.sql`
2. Run the updated SQL in Supabase SQL Editor
3. Update TypeScript types in `types/index.ts` if needed
4. Update API routes and components as needed

### Styling

The application uses Tailwind CSS with custom gradient theme:
- Gradient colors: `#f26aa3` → `#f59fc1` → `#6fd3ee` → `#4cc3e6`
- Custom classes: `.gradient-text`, `.card-gradient`, `.btn-primary`, `.btn-secondary`
- All styles defined in `app/globals.css`
- Mobile-responsive design throughout

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
1. Check that Supabase environment variables are set correctly in `.env.local`
2. Verify your Supabase project is active and accessible
3. Ensure RLS policies are properly configured
4. Clear browser cookies and try again
5. Restart the development server

### Email Not Sending

If password reset emails aren't sending:
1. Verify `RESEND_API_KEY` is correct in `.env.local`
2. Check that `RESEND_FROM_EMAIL` is a verified email/domain in Resend
3. Check Resend dashboard for API usage and errors

### Database Connection Issues

1. Verify Supabase URL and keys are correct
2. Check that `schema.sql` has been run
3. Verify RLS policies allow necessary operations
4. Check Supabase dashboard for connection status

### Stripe Payment Issues

1. Verify Stripe keys are correct (test vs. production)
2. Check webhook endpoint is configured correctly
3. Use Stripe CLI for local webhook testing
4. Check Stripe dashboard for payment logs

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Set the following in your production environment:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret!)
- `NEXT_PUBLIC_BASE_URL` - Your production domain (e.g., `https://senpaicareer.com`)
- `RESEND_API_KEY` - Your production Resend API key
- `RESEND_FROM_EMAIL` - Your verified production email/domain
- `STRIPE_SECRET_KEY` - Your production Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your production Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Your production Stripe webhook secret

### Database Setup

1. Run `scripts/schema.sql` in production Supabase instance
2. Run `scripts/storage-setup.sql` for file storage
3. Verify all RLS policies are active
4. Test authentication and data access

## Security Notes

⚠️ **Important for Production**:
- Never commit `.env.local` to version control
- Use strong, randomly generated secrets
- Implement rate limiting for API routes
- Add CSRF protection
- Use HTTPS in production
- Regularly update dependencies
- Monitor Supabase logs for suspicious activity
- Set up proper error logging and monitoring
- Review and test RLS policies regularly
- Keep Stripe webhook secret secure

## Support

For issues, questions, or contributions:
- Email: info@senpaicareer.com
- Create an issue in the repository

## License

ISC
