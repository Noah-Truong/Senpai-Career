# Senpai Career MVP
# Plan B - Development Tasks & Schedule

**Created:** January 24, 2025  
**Project:** Senpai Career MVP - Additional Features  
**Timeline:** 7 Days

---

## Overview

This document outlines the development tasks for implementing Plan B features for Senpai Career MVP. The project includes corporate OB roles, direct messaging, Stripe payment integration, company pages, and filtering functionality.

---

## Features to Implement

| Feature | Description |
|---------|-------------|
| Corporate OB Role | New user role for company-affiliated alumni |
| DM Function | Direct messaging from Corporate OB to students |
| Payment System | Stripe integration with pay-per-message billing (¥500/message) |
| Company List Page | Display companies ranked by number of registered OBs |
| Company Detail Page | Show company info and affiliated OB list |
| Filter Function | Search filtering by university, language, industry, and job type |

---

## Day 1: Database Design + Corporate OB Role

### Morning: Database Design

**Task 1.1: Create Companies Table**
```sql
companies
├── id (uuid, primary key)
├── name (text, not null)
├── logo_url (text)
├── industry (text)
├── description (text)
├── website (text)
├── created_at (timestamp)
└── updated_at (timestamp)
```

**Task 1.2: Create Corporate OBs Table**
```sql
corporate_obs
├── id (uuid, primary key)
├── user_id (uuid, foreign key → users)
├── company_id (uuid, foreign key → companies)
├── is_verified (boolean, default false)
└── created_at (timestamp)
```

**Task 1.3: Update Users Table**
- [ ] Add role field to support 'alumni' | 'corporate_ob' distinction
- [ ] Create migration script

**Task 1.4: Supabase RLS Policies**
- [ ] Set up Row Level Security policies for companies table
- [ ] Set up RLS policies for corporate_obs table
- [ ] Test access control for different user roles

---

### Afternoon: Corporate OB Role Implementation

**Task 1.5: Role Detection Helper**
- [ ] Create `isCorporateOB(userId)` helper function
- [ ] Create `getCorporateOBCompany(userId)` helper function
- [ ] Add TypeScript types for corporate OB

**Task 1.6: Permission Control Middleware**
- [ ] Create middleware to check corporate OB status
- [ ] Implement route protection for corporate OB features
- [ ] Add permission checks to relevant API endpoints

**Task 1.7: Admin Panel - Corporate OB Assignment**
- [ ] Create admin UI to assign corporate OB role to users
- [ ] Create API endpoint: `POST /api/admin/corporate-ob`
- [ ] Add company selection dropdown
- [ ] Implement verification toggle

**Task 1.8: Corporate OB Badge Component**
- [ ] Design badge component (company logo + verified indicator)
- [ ] Create `<CorporateOBBadge />` React component
- [ ] Add styling variants (small, medium, large)

**Task 1.9: Profile Display**
- [ ] Display company logo on corporate OB profiles
- [ ] Show company name with link to company page
- [ ] Add "Official Corporate OB" label

---

### Day 1 Completion Criteria
✅ Database tables created and migrated  
✅ Admin can assign corporate OB role to users  
✅ Corporate OB badge displays correctly on profiles  

---

## Day 2: DM Function (Foundation)

### Morning: Message Database & APIs

**Task 2.1: Create Messages Table**
```sql
messages
├── id (uuid, primary key)
├── conversation_id (uuid, foreign key)
├── sender_id (uuid, foreign key → users)
├── content (text, not null)
├── is_read (boolean, default false)
├── created_at (timestamp)
└── updated_at (timestamp)
```

**Task 2.2: Create Conversations Table**
```sql
conversations
├── id (uuid, primary key)
├── corporate_ob_id (uuid, foreign key → users)
├── student_id (uuid, foreign key → users)
├── last_message_at (timestamp)
├── status (text: 'active' | 'archived')
├── created_at (timestamp)
└── updated_at (timestamp)
```

**Task 2.3: Message Send API**
- [ ] Create endpoint: `POST /api/messages`
- [ ] Request body: `{ conversationId, content }`
- [ ] Validate sender is participant in conversation
- [ ] Update conversation's `last_message_at`
- [ ] Return created message object

**Task 2.4: Message Fetch API**
- [ ] Create endpoint: `GET /api/messages/[conversationId]`
- [ ] Implement pagination (limit, offset)
- [ ] Return messages sorted by created_at DESC
- [ ] Include sender info in response

**Task 2.5: Conversations List API**
- [ ] Create endpoint: `GET /api/conversations`
- [ ] Return conversations for current user
- [ ] Include last message preview
- [ ] Include unread count per conversation
- [ ] Sort by last_message_at DESC

---

### Afternoon: Realtime Setup

**Task 2.6: Supabase Realtime Configuration**
- [ ] Enable Realtime on messages table
- [ ] Enable Realtime on conversations table
- [ ] Configure broadcast settings

**Task 2.7: Realtime Message Listener**
- [ ] Create `useMessages(conversationId)` hook
- [ ] Subscribe to new messages in conversation
- [ ] Auto-append new messages to UI
- [ ] Handle connection errors gracefully

**Task 2.8: Unread Count Logic**
- [ ] Create `getUnreadCount(userId)` function
- [ ] Create `useUnreadCount()` hook with realtime updates
- [ ] Display unread badge in navigation

**Task 2.9: Mark as Read API**
- [ ] Create endpoint: `PATCH /api/messages/read`
- [ ] Request body: `{ conversationId }`
- [ ] Mark all messages in conversation as read
- [ ] Update only messages where user is receiver

---

### Day 2 Completion Criteria
✅ Messages can be sent and stored in database  
✅ Messages appear in realtime without page refresh  
✅ Unread count updates automatically  

---

## Day 3: DM Function (UI + Restrictions)

### Morning: Message UI

**Task 3.1: Conversations List Page**
- [ ] Create page: `/corporate-ob/messages`
- [ ] Fetch and display all conversations
- [ ] Show: recipient name, avatar, last message preview
- [ ] Show: timestamp, unread badge
- [ ] Implement click to open conversation

**Task 3.2: Conversation List Component**
- [ ] Create `<ConversationList />` component
- [ ] Create `<ConversationItem />` component
- [ ] Add loading skeleton state
- [ ] Add empty state ("No conversations yet")

**Task 3.3: Message Detail Page**
- [ ] Create page: `/corporate-ob/messages/[conversationId]`
- [ ] Display conversation header (recipient info)
- [ ] Load message history with infinite scroll
- [ ] Auto-scroll to latest message

**Task 3.4: Message Input Form**
- [ ] Create `<MessageInput />` component
- [ ] Text input with send button
- [ ] Handle Enter key to send
- [ ] Disable while sending (loading state)
- [ ] Clear input after successful send

**Task 3.5: Message Bubble UI**
- [ ] Create `<MessageBubble />` component
- [ ] Different styling for sent vs received
- [ ] Display timestamp
- [ ] Show read status for sent messages

---

### Afternoon: Corporate OB Restriction Logic

**Task 3.6: DM Initiation Button**
- [ ] Add "Send Message" button on student profiles
- [ ] Only visible to corporate OB users
- [ ] Create new conversation if none exists
- [ ] Redirect to conversation page

**Task 3.7: Student-side Restrictions**
- [ ] Students can only receive DMs (cannot initiate)
- [ ] Students can reply to existing conversations
- [ ] Hide "Start Conversation" for students

**Task 3.8: Student Messages Page**
- [ ] Integrate DM into existing `/student/messages`
- [ ] Display conversations with corporate OBs
- [ ] Same UI components, different permissions

**Task 3.9: In-app Notifications**
- [ ] Show notification badge on messages nav item
- [ ] Toast notification for new messages
- [ ] Optional: browser push notification setup

**Task 3.10: Email Notifications (Optional)**
- [ ] Send email when new DM received
- [ ] Include message preview
- [ ] Link to conversation

---

### Day 3 Completion Criteria
✅ Corporate OB can send DM to any student  
✅ Student can view and reply to DMs  
✅ Students cannot initiate new conversations  
✅ New message notifications work  

---

## Day 4: Stripe Payment System (Foundation)

### Morning: Stripe Setup

**Task 4.1: Install Stripe SDK**
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

**Task 4.2: Environment Configuration**
- [ ] Add to `.env.local`:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- [ ] Add to production environment variables

**Task 4.3: Stripe Customer Creation API**
- [ ] Create endpoint: `POST /api/stripe/customer`
- [ ] Create Stripe customer for company
- [ ] Store `stripe_customer_id` in companies table
- [ ] Return customer object

**Task 4.4: Update Companies Table**
```sql
ALTER TABLE companies ADD COLUMN stripe_customer_id text;
```

**Task 4.5: Payment Method Registration Page**
- [ ] Create page: `/corporate-ob/billing/payment-methods`
- [ ] Display current payment methods
- [ ] Add new payment method button

---

### Afternoon: Payment Method Management

**Task 4.6: Stripe Elements Integration**
- [ ] Set up Stripe Elements provider
- [ ] Create `<CardInput />` component using CardElement
- [ ] Style to match app design
- [ ] Handle validation errors

**Task 4.7: Save Payment Method API**
- [ ] Create endpoint: `POST /api/stripe/payment-method`
- [ ] Create SetupIntent for saving card
- [ ] Attach payment method to customer
- [ ] Return saved payment method details

**Task 4.8: List Payment Methods**
- [ ] Create endpoint: `GET /api/stripe/payment-methods`
- [ ] Return all payment methods for customer
- [ ] Include card brand, last 4 digits, expiry

**Task 4.9: Delete Payment Method**
- [ ] Create endpoint: `DELETE /api/stripe/payment-method/[id]`
- [ ] Detach payment method from customer
- [ ] Handle errors (e.g., cannot delete default)

**Task 4.10: Default Payment Method**
- [ ] Create endpoint: `PATCH /api/stripe/default-payment-method`
- [ ] Set default payment method for customer
- [ ] Update UI to show default indicator

---

### Day 4 Completion Criteria
✅ Companies can register credit cards via Stripe  
✅ Payment methods are listed and manageable  
✅ Default payment method can be set  

---

## Day 5: Pay-per-Message Billing + History

### Morning: Billing Logic

**Task 5.1: Create Charges Table**
```sql
charges
├── id (uuid, primary key)
├── company_id (uuid, foreign key)
├── corporate_ob_id (uuid, foreign key → users)
├── message_id (uuid, foreign key → messages)
├── amount (integer, not null) -- in yen
├── stripe_payment_intent_id (text)
├── status (text: 'pending' | 'succeeded' | 'failed')
├── created_at (timestamp)
└── updated_at (timestamp)
```

**Task 5.2: Charge on Message Send**
- [ ] Modify `POST /api/messages` endpoint
- [ ] Before saving message, create charge
- [ ] Amount: ¥500 per message
- [ ] If charge fails, reject message send

**Task 5.3: Stripe PaymentIntent Creation**
- [ ] Create PaymentIntent for ¥500
- [ ] Use customer's default payment method
- [ ] Confirm payment immediately
- [ ] Store payment intent ID in charges table

**Task 5.4: Error Handling**
- [ ] Handle card declined errors
- [ ] Handle insufficient funds
- [ ] Handle expired card
- [ ] Return user-friendly error messages

**Task 5.5: Send Block on Payment Failure**
- [ ] If no valid payment method, block sending
- [ ] Show error UI: "Please add a payment method"
- [ ] Link to payment method settings

---

### Afternoon: Billing History & Dashboard

**Task 5.6: Billing History Page**
- [ ] Create page: `/corporate-ob/billing`
- [ ] Display charges in table format
- [ ] Columns: Date, Amount, Recipient, Status
- [ ] Implement pagination

**Task 5.7: Billing History API**
- [ ] Create endpoint: `GET /api/billing/history`
- [ ] Return charges for current corporate OB's company
- [ ] Support date range filtering
- [ ] Support pagination

**Task 5.8: Monthly Summary**
- [ ] Calculate total charges per month
- [ ] Display monthly breakdown
- [ ] Show message count per month

**Task 5.9: Dashboard Widget**
- [ ] Create `<BillingWidget />` component
- [ ] Show current month's total spend
- [ ] Show message count this month
- [ ] Add to corporate OB dashboard

**Task 5.10: CSV Export (Optional)**
- [ ] Create endpoint: `GET /api/billing/export`
- [ ] Generate CSV of billing history
- [ ] Include all charge details

---

### Day 5 Completion Criteria
✅ ¥500 is charged when corporate OB sends DM  
✅ Message is blocked if payment fails  
✅ Billing history displays correctly  
✅ Monthly totals are calculated  

---

## Day 6: Company Pages + Filters

### Morning: Company Pages

**Task 6.1: Company List Page**
- [ ] Create page: `/companies`
- [ ] Fetch companies with OB count
- [ ] Sort by OB count descending (exposure logic)

**Task 6.2: Company Card Component**
- [ ] Create `<CompanyCard />` component
- [ ] Display: logo, name, industry, OB count
- [ ] Link to company detail page
- [ ] Add hover effects

**Task 6.3: Pagination**
- [ ] Implement pagination (20 companies per page)
- [ ] Create `<Pagination />` component
- [ ] Update URL with page parameter

**Task 6.4: Company Detail Page**
- [ ] Create page: `/companies/[id]`
- [ ] Fetch company info and affiliated OBs

**Task 6.5: Company Info Section**
- [ ] Display company logo (large)
- [ ] Display company name, industry
- [ ] Display description
- [ ] Display website link

**Task 6.6: Affiliated OB List Section**
- [ ] List all corporate OBs for this company
- [ ] Use existing OB card component
- [ ] Link to OB profiles

---

### Afternoon: Filter Function

**Task 6.7: Filter UI Component**
- [ ] Create `<FilterPanel />` component
- [ ] Collapsible on mobile
- [ ] Clear all filters button

**Task 6.8: University Filter**
- [ ] Create searchable dropdown for universities
- [ ] Load university list from database/config
- [ ] Support multiple selection
- [ ] Show selected count

**Task 6.9: Language Filter**
- [ ] Create checkbox list for languages
- [ ] Languages: Japanese, English, Chinese, Korean, etc.
- [ ] Support multiple selection

**Task 6.10: Industry Filter**
- [ ] Create dropdown/checkbox list for industries
- [ ] Industries: IT, Finance, Consulting, Manufacturing, etc.
- [ ] Support multiple selection
- [ ] Show selected count

**Task 6.11: Job Type Filter**
- [ ] Create dropdown/checkbox list for job types
- [ ] Job types: Engineering, Sales, Marketing, HR, etc.
- [ ] Support multiple selection
- [ ] Show selected count

**Task 6.12: Filter API Integration**
- [ ] Modify `GET /api/alumni` to accept filter params
- [ ] Query: `?university=xxx&language=xxx&industry=xxx&jobType=xxx`
- [ ] Return filtered results

**Task 6.13: URL Query Parameters**
- [ ] Sync filters with URL
- [ ] Enable sharing filtered results
- [ ] Persist filters on page refresh

**Task 6.14: Filter Reset**
- [ ] Add "Clear Filters" button
- [ ] Reset all filters to default
- [ ] Update URL accordingly

---

### Day 6 Completion Criteria
✅ Company list displays sorted by OB count  
✅ Company detail page shows info and OB list  
✅ University filter works correctly  
✅ Language filter works correctly  
✅ Industry filter works correctly  
✅ Job type filter works correctly  
✅ Filters can be combined  

---

## Day 7: Testing + Bug Fixes + Deployment

### Morning: Comprehensive Testing

**Task 7.1: Corporate OB Role Testing**
- [ ] Test role assignment via admin panel
- [ ] Verify badge displays on all relevant pages
- [ ] Test permission restrictions

**Task 7.2: DM Function Testing**
- [ ] Test message send/receive flow
- [ ] Test realtime updates
- [ ] Test conversation creation
- [ ] Verify students cannot initiate DMs

**Task 7.3: Payment Flow Testing**
- [ ] Test with Stripe test cards:
  - `4242424242424242` - Success
  - `4000000000000002` - Declined
  - `4000000000009995` - Insufficient funds
- [ ] Verify charges are recorded
- [ ] Test payment method management

**Task 7.4: Billing History Testing**
- [ ] Verify all charges appear in history
- [ ] Test pagination
- [ ] Verify monthly calculations

**Task 7.5: Company Pages Testing**
- [ ] Verify sorting by OB count
- [ ] Test company detail page
- [ ] Verify OB list on company page

**Task 7.6: Filter Testing**
- [ ] Test university filter
- [ ] Test language filter
- [ ] Test industry filter
- [ ] Test job type filter
- [ ] Test filter combinations (all 4 together)
- [ ] Test URL parameter persistence
- [ ] Test filter reset

**Task 7.7: Responsive Testing**
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test on tablets
- [ ] Verify all UI is usable on small screens

---

### Afternoon: Bug Fixes & Deployment

**Task 7.8: Bug Fixes**
- [ ] Fix all bugs found during testing
- [ ] Address edge cases
- [ ] Improve error handling where needed

**Task 7.9: Production Environment Setup**
- [ ] Set production environment variables
- [ ] Configure production Stripe keys
- [ ] Verify database connections

**Task 7.10: Vercel Deployment**
- [ ] Deploy to Vercel production
- [ ] Run database migrations on production
- [ ] Verify build succeeds

**Task 7.11: Stripe Production Mode**
- [ ] Switch from test to live API keys
- [ ] Verify webhook endpoints
- [ ] Test one real transaction (refund after)

**Task 7.12: Final Verification**
- [ ] Complete end-to-end flow test on production
- [ ] Verify all features work
- [ ] Check error logging

**Task 7.13: Delivery Report**
- [ ] Document completed features
- [ ] Note any known issues
- [ ] Provide handoff documentation

---

### Day 7 Completion Criteria
✅ All features pass testing  
✅ Bugs are fixed  
✅ Production deployment successful  
✅ Stripe live mode working  
✅ Project delivered  

---

## Technical Specifications

### Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Realtime:** Supabase Realtime
- **Payments:** Stripe
- **Hosting:** Vercel

### API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/corporate-ob` | Assign corporate OB role |
| GET | `/api/conversations` | List conversations |
| GET | `/api/messages/[id]` | Get messages in conversation |
| POST | `/api/messages` | Send message (with billing) |
| PATCH | `/api/messages/read` | Mark messages as read |
| POST | `/api/stripe/customer` | Create Stripe customer |
| GET | `/api/stripe/payment-methods` | List payment methods |
| POST | `/api/stripe/payment-method` | Add payment method |
| DELETE | `/api/stripe/payment-method/[id]` | Remove payment method |
| PATCH | `/api/stripe/default-payment-method` | Set default payment method |
| GET | `/api/billing/history` | Get billing history |
| GET | `/api/companies` | List companies |
| GET | `/api/companies/[id]` | Get company details |
| GET | `/api/alumni` | List alumni (with filters: university, language, industry, jobType) |

### Database Schema Summary

```
companies
├── id, name, logo_url, industry, description
├── website, stripe_customer_id
└── created_at, updated_at

corporate_obs
├── id, user_id, company_id
├── is_verified
└── created_at

conversations
├── id, corporate_ob_id, student_id
├── last_message_at, status
└── created_at, updated_at

messages
├── id, conversation_id, sender_id
├── content, is_read
└── created_at, updated_at

charges
├── id, company_id, corporate_ob_id, message_id
├── amount, stripe_payment_intent_id, status
└── created_at, updated_at
```

---

## Pre-Development Checklist

Before starting development, ensure the following are ready:

- [ ] Stripe account created and API keys obtained
- [ ] University list data prepared
- [ ] Language list finalized
- [ ] Industry list finalized (IT, Finance, Consulting, etc.)
- [ ] Job type list finalized (Engineering, Sales, Marketing, etc.)
- [ ] Sample company data for testing
- [ ] Access to Supabase dashboard
- [ ] Access to Vercel dashboard

---

## Daily Standup Schedule

| Day | Focus | Deliverable |
|-----|-------|-------------|
| Day 1 | Database + Corporate OB Role | Role assignment working |
| Day 2 | DM Foundation | Realtime messaging working |
| Day 3 | DM UI + Restrictions | Complete DM feature |
| Day 4 | Stripe Foundation | Payment method registration |
| Day 5 | Billing Logic | Pay-per-message working |
| Day 6 | Company Pages + Filters | All pages complete |
| Day 7 | Testing + Deployment | Production launch |

---

## Contact

For questions or blockers, contact the project manager immediately.

---

*— End of Document —*
