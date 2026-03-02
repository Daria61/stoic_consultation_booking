# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a consultation booking application built with Next.js 16 that allows users to book time slots for consultations. The application uses Google Sheets as a backend database for managing availability and bookings, with email confirmations sent via SMTP.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Google Sheets Integration

The application uses Google Sheets as its database with two sheets:
- **Options sheet**: Contains columns `[ID, Date, Time, Available, Email, Phone, Timestamp, Payment_Status, Confirm_Email]`
  - Tracks available time slots and their booking status
  - Available slots have `Available="TRUE"` and empty `Email` field
  - Booked slots are marked with `Available="FALSE"` and populated contact fields
- **Booked sheet**: Append-only log of all bookings with columns `[Date, Time, Email, Phone, Timestamp, Status]`

### API Routes

Three main API endpoints handle the booking flow:

1. **`/api/available`** (GET): Returns list of dates that have available time slots
   - Queries Options sheet for rows where `Available="TRUE"` and `Email` is empty
   - Returns unique dates sorted

2. **`/api/available_times?date=YYYY-MM-DD`** (GET): Returns available times for a specific date
   - Filters Options sheet by selected date and availability criteria
   - Returns unique times sorted

3. **`/api/book`** (POST): Books a time slot with race condition protection
   - Request body: `{ time, email, phone, date }`
   - Atomic booking flow:
     1. Finds the matching row in Options sheet
     2. Checks if slot is still available (`Available="TRUE"`)
     3. Claims slot by updating to `Available="FALSE"` with user details
     4. Appends booking record to Booked sheet
     5. Sends confirmation email via nodemailer
     6. Updates email status to "sent"
   - Returns 409 Conflict if slot was already booked

### Google Sheets Authentication

All API routes authenticate with Google Sheets using a service account:
- Credentials stored in `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable (JSON string)
- Uses `googleapis` package with scope `https://www.googleapis.com/auth/spreadsheets`

### Email Service

Email confirmations are sent via `lib/mailer.ts` using nodemailer:
- SMTP configuration from environment variables
- Sends Mongolian-language booking confirmation with payment instructions
- Includes consultation details, pricing (150,000₮), bank account info, and location

### UI Flow

The main page (`app/page.tsx`) implements a 3-step wizard:
1. **InformationSection**: Displays consultation information
2. **RegistrationSection**: User selects date/time and provides contact info
3. **SuccessSection**: Confirmation screen with booking details

State management is handled with React useState, progressing through steps sequentially.

### Component Structure

- `components/`: Contains reusable UI components
  - Main components: `InformationSection.tsx`, `RegistrationSection.tsx`, `SuccessSection.tsx`, `Loader.tsx`
  - `components/ui/`: shadcn/ui components (Button, Input, Select, Calendar, etc.)
- `lib/`: Utility functions
  - `lib/mailer.ts`: Email service wrapper
  - `lib/utils.ts`: General utilities (likely includes cn() for class merging)

### Styling

- Uses Tailwind CSS v4 with PostCSS
- Custom design with fixed mobile-first layout (480px width container)
- Dark/light theme support via `next-themes`
- Toast notifications via `sonner`

## Environment Variables

Required environment variables (see `.env`):
```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
SPREADSHEET_ID=your-google-sheet-id
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

## Path Aliases

TypeScript path alias configured:
- `@/*` maps to root directory (e.g., `@/components`, `@/lib`)

## Important Notes

- The application is written with Mongolian language UI text and email templates
- Payment is manual bank transfer with instructions in confirmation email
- The booking system has basic race condition handling but uses Google Sheets (not ideal for high-concurrency scenarios)
- Client-side components use `"use client"` directive (Next.js App Router)
- Error messages use toast notifications, with Mongolian text "Хуваарь авахад алдаа гарлаа" for fetch errors
