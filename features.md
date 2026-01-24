4.1 Authentication & Onboarding

 Enforce Email Domain Restrictions

 Block free email providers (gmail.com, outlook.com, yahoo.com, icloud.com, etc.)

 Implement client-side validation

 Enforce server-side domain checks

 Return clear error messaging

 Student Email Verification

 Require university-owned domains

 Send verification email on signup

 Prevent login until verified

 Store is_verified flag in users table

 Company Email Verification

 Authenticate companies via employer domain

 Enforce one company per domain (configurable)

 Store company_domain

 Store is_verified status

 Role Assignment System

 Define fixed roles:

 student

 alumni (OB/OG)

 company

 admin

 Assign role during onboarding

 Enforce RBAC across backend and frontend

4.2 Compliance Submission Features

 Outside Qualification Permission (International Students)

 Build secure submission form

 Upload and store files

 Persist metadata in DB

 Restrict visibility to Admin only

 Japanese Language Certification Submission

 Build submission form

 Upload certification documents

 Store certification type + timestamp

 Restrict visibility to Admin only

 Admin Compliance Viewer

 Admin panel document list

 View & download submitted files

 Status management:

 pending

 verified

 rejected

 Manual review only (no auto-approval)

4.3 Profile Features

 Student Profile (International Students)

 Display name: First name only

 Fields:

 Full name

 University

 Year

 Major

 Desired job type

 Desired industry

 Self-introduction

 Languages

 Visa / residence status

 Privacy controls for sensitive fields

 Editable profile with validation

 Alumni (OB/OG) Profile

 Display name: Nickname

 Fields:

 Full name

 University

 Current company / position (or offer company)

 Industry

 Job type

 Self-introduction

 Consultation categories

 Auto-display availability

 Track updated_at for ranking

 Company Profile

 Company name

 Recruiter name

 Contact information

 Company overview

 Recruiting positions

 Functional area categories

4.4 Directory & Search Features

 Alumni Directory (Student View)

 Search and filter by:

 University

 Industry

 Job type

 Availability

 Default sort by recently updated profiles

 Company Directory (Student View)

 Categorize by functional area

 Enable keyword search

 Enable filtering

 Student Directory (Company View)

 Search and filter students

 Enforce privacy and visibility rules

4.5 Messaging Features

 Student ⇄ Alumni Messaging

 Bidirectional 1:1 messaging

 Store messages with timestamps

 Enforce role permissions

 MVP-required

 Company ⇄ Student Messaging

 Bidirectional messaging

 Shared architecture with student–alumni chat

 Admin Chat Visibility

 Read-only admin access

 Audit & attribution support

4.6 Internship Features

 Internship Listings

 Public listing page

 Display company, role, description, requirements

 Show application status

 Internship Application Flow

 Restrict applications to logged-in students

 Store:

 Student ID

 Internship ID

 Timestamp

 Status

 Action Chain Recording

 Track OB profile visits

 Track messaging interactions

 Track internship applications

 Track hiring outcome

 Persist full funnel chain in DB

4.7 Reports & Feedback Features

 Post-Meeting Feedback

 Mutual 1–5 rating system

 Require confirmed interaction

 Store bidirectional ratings

 No-Show Reports

 Allow reporting from both parties

 Require reason and details

 Timestamp all submissions

 Admin Report Management

 Report list view

 Fields:

 Timestamp

 Reporter

 Target

 Reason

 Details

 Status

 Status lifecycle:

 pending

 reviewing

 resolved

 dismissed

4.8 Admin Panel Features

 Student Action Timeline

 Unified timeline:

 OB contacts

 Meetings

 Internship applications

 Chronological sorting

 Filter by student or OB

 Chat History Reference

 Admin access to all chat threads

 Read-only mode