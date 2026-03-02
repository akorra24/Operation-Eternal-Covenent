# Label Printing System

A multi-location label printing system built with Next.js 14+ (App Router), Supabase (Postgres + Auth + RLS), and TypeScript. This system replaces an old local-only label printer system, allowing all locations to see the same meals instantly after any admin edit.

## Features

- **Centralized Data**: All meals stored in Postgres, instantly synced across all locations
- **Role-Based Access**: Admin can create/edit/delete meals; Staff can view and print
- **Real-Time Updates**: Changes made by admins are immediately visible to all locations via Supabase Realtime
- **Label Printing**: Browser-based printing with optimized print CSS for label printers
- **Expiration Logic**: Configurable shelf life per meal with global default (7 days)
- **Search**: Search meals by title or code

## Tech Stack

- **Next.js 14+** with App Router and TypeScript
- **Supabase** for:
  - PostgreSQL database
  - Authentication (email/password)
  - Row Level Security (RLS) policies
  - Realtime subscriptions
- **Tailwind CSS** for styling

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Note your project URL and anon key from Settings > API

### 2. Set Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run SQL Migrations

**IMPORTANT**: Run these migrations in order in the Supabase SQL Editor:

1. **Initial Schema** (`001_initial_schema.sql`):
   - Open the Supabase SQL Editor (from your project dashboard)
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the SQL script
   
   This will create:
   - `profiles` table for role management
   - `meals` table for meal data
   - `settings` table for global settings
   - All RLS policies
   - Triggers for auto-updating timestamps

2. **Add Missing Fields** (`002_add_all_missing_fields.sql`):
   - Copy and paste the contents of `supabase/migrations/002_add_all_missing_fields.sql`
   - Run the SQL script
   
   This will add:
   - `weight`, `sugar`, `sodium`, `contains`, `instructions` columns to `meals` table
   - `archived` column to `meals` table (for archive functionality)
   - `produced_by` column to `settings` table
   - Index on `archived` column for faster queries

### 4. Enable Realtime (Optional but Recommended)

1. In Supabase Dashboard, go to Database > Replication
2. Enable replication for the `meals` table
3. This allows real-time updates across all locations

### 5. Create First Admin User

1. In Supabase Dashboard, go to Authentication > Users
2. Create a new user with email/password (or use the signup flow)
3. Note the user's UUID
4. Go to Table Editor > `profiles`
5. Find the user's profile row (created automatically) and update `role` to `'admin'`

Alternatively, you can run this SQL (replace `USER_UUID` with the actual UUID):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_UUID';
```

### 6. Install Dependencies

**Prerequisites**: Make sure you have Node.js 18+ installed.

```bash
npm install
# or
pnpm install
# or
yarn install
```

**Note**: Ensure you've created the `.env.local` file (step 2) before installing, as some packages may need the environment variables.

### 7. Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

The server will start on [http://localhost:3000](http://localhost:3000). You should see:
- The Next.js development server running
- Any compilation errors in the terminal
- The app will automatically reload when you make changes

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 8. Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Project Structure

```
├── app/
│   ├── admin/
│   │   └── meals/
│   │       ├── new/          # Create new meal (admin only)
│   │       └── [code]/edit/  # Edit meal (admin only)
│   ├── login/                # Authentication page
│   ├── meals/                # Meals list and search
│   │   └── [code]/           # Meal detail page
│   ├── print/
│   │   └── [code]/           # Print view with auto-print
│   ├── globals.css           # Global styles + print CSS
│   └── layout.tsx            # Root layout
├── components/
│   ├── LoginForm.tsx
│   ├── MealForm.tsx          # Create/edit meal form
│   ├── MealsList.tsx
│   ├── MealsListRealtime.tsx # Real-time wrapper
│   ├── MealsSearch.tsx
│   ├── Nav.tsx
│   └── PrintButton.tsx
├── lib/
│   ├── auth.ts               # Auth helpers and role checks
│   └── supabase/
│       ├── client.ts         # Browser Supabase client
│       └── server.ts         # Server Supabase client
├── middleware.ts             # Route protection
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── README.md
```

## Database Schema

### `meals` Table
- `code` (TEXT, PRIMARY KEY): Unique meal identifier (e.g., "AM2")
- `title` (TEXT, NOT NULL): Meal name
- `calories` (INTEGER): Calories per serving
- `protein` (NUMERIC): Protein in grams
- `carbs` (NUMERIC): Carbs in grams
- `fat` (NUMERIC): Fat in grams
- `ingredients` (TEXT): Ingredients list
- `price` (NUMERIC): Price in dollars
- `shelf_life_days` (INTEGER, NULL): Override for default shelf life
- `updated_at` (TIMESTAMPTZ): Last update timestamp
- `updated_by` (UUID): User who made the last update

### `settings` Table (Singleton)
- `id` (INTEGER, PRIMARY KEY, DEFAULT 1): Always 1
- `default_shelf_life_days` (INTEGER, DEFAULT 7): Global default shelf life
- `updated_at` (TIMESTAMPTZ): Last update timestamp

### `profiles` Table
- `id` (UUID, PRIMARY KEY): References `auth.users(id)`
- `role` (TEXT): Either 'admin' or 'staff' (default: 'staff')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Row Level Security (RLS)

RLS policies enforce:

- **Meals**: Any authenticated user can read; only admins can insert/update/delete
- **Settings**: Any authenticated user can read; only admins can update
- **Profiles**: Users can read their own profile; only admins can update roles

## Routes

- `/login` - Sign in page
- `/meals` - List all meals with search
- `/meals/[code]` - Meal detail page with print button
- `/print/[code]` - Print view (auto-triggers print dialog)
- `/admin/meals/new` - Create new meal (admin only)
- `/admin/meals/[code]/edit` - Edit meal (admin only)

## Expiration Date Calculation

When printing a label:
- Expiration date = Today + (`meal.shelf_life_days` OR `settings.default_shelf_life_days` OR 7)

## Real-Time Updates

The app uses Supabase Realtime to automatically refresh the meals list when any admin makes changes. This ensures all locations see updates instantly without manual refresh.

## Making a User an Admin

1. Sign up or create a user account
2. In Supabase Dashboard > Table Editor > `profiles`
3. Find the user's row and change `role` from `'staff'` to `'admin'`

Or run SQL:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_UUID';
```

## Print Configuration

The print view is optimized for 4" x 3" labels with 0.25" margins. Adjust the `@page` CSS in `app/globals.css` if your labels are a different size.

## Troubleshooting

### Real-time updates not working
- Ensure Realtime is enabled for the `meals` table in Supabase Dashboard > Database > Replication
- Check browser console for subscription errors

### Can't create/edit meals
- Verify your user has `role = 'admin'` in the `profiles` table
- Check RLS policies are correctly set up

### Authentication issues
- Verify environment variables are set correctly
- Check Supabase project is active and not paused

## License

MIT
