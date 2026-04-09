# Quick Start Guide - Anatolia Spring

## Initial Setup (5 minutes)

### 1. Configure Supabase Connection
- Create a free account at https://supabase.com
- Create a new project
- Go to Settings → API to get your credentials
- Update `.env.local` with your Supabase credentials:
  ```env
  VITE_SUPABASE_URL=your-project-url
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

### 2. Initialize Database
- Open your Supabase project dashboard
- Go to SQL Editor
- Copy and paste the entire contents of `supabase_schema.sql`
- Run the query

### 3. Run Development Server
- Option A: Use VS Code Tasks
  - Open Terminal (Ctrl+`)
  - Run: `npm run dev`
- Option B: Use keyboard shortcut
  - Ctrl+Shift+B to run the default build task

### 4. Access the App
- Open browser to `http://localhost:5173`
- Start adding bottle sales!

## Deployment to Vercel

### Prerequisites
- GitHub account
- Project pushed to GitHub

### Steps
1. Connect your GitHub repo to Vercel (vercel.com/new)
2. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy! Vercel will automatically run `npm run build` and serve your app

## Features Overview

### Dashboard
- **Daily Stats**: Real-time summary of bottles sold, total sales, expenses, and net sales
- **Transaction Log**: Complete audit trail with timestamps
- **Expense Tracker**: Monitor Water Station and House expenses
- **Payroll Summary**: Automatic calculation of 20% salary split (after expense deductions)

### Quick Add Interface
- **+/- Buttons**: Increment/decrement bottle count
- **Number Input**: Type quantity directly
- **One-Click Submission**: Add bottles with a single click

### Expense Tracking
- **Water Station Expenses**: Log water station-related costs
- **House Expenses**: Track house-related expenses
- **Automatic Deduction**: Expenses automatically deduct from total sales
- **Detailed History**: View all expenses with timestamps and descriptions
- **Real-time Payroll Impact**: Payroll calculations automatically adjust based on expenses

### Dealer Management
- Add new dealers by name
- View all registered dealers
- Delete dealers (archival recommended for transparency)

### Payroll Calculation
- 20% of net sales = salary pool (net = total sales - expenses)
- Maximum ₱10 per bottle counted for salary
- Automatic 55/45 split between two people
- Separate dealer sales tracking

## Tips for Success

1. **Transparent Records**: Every transaction is timestamped - no data loss
2. **Use Batch Entry**: For multiple bottles, use the number input instead of clicking ±
3. **Regular Backups**: Supabase automatically backs up your data
4. **Mobile Friendly**: Used on tablets for easy on-the-job entry

## Troubleshooting

### "Supabase not configured" warning
- Check your `.env.local` file exists
- Verify the keys are correct
- The app will fallback to local storage

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version: `node --version` (requires v16+)
- Clear node_modules: `rm -r node_modules && npm install`

### Port 5173 already in use
- The dev server will automatically use the next available port
- Check the terminal output for the actual URL

## File Structure

```
AnatoliaSpring/
├── .env.local                 # Your Supabase credentials (private)
├── .env.local.example         # Template for env variables
├── supabase_schema.sql        # Database initialization script
├── vercel.json                # Vercel deployment config
├── package.json               # Dependencies
├── src/
│   ├── components/            # React components
│   ├── utils/                 # Helper functions
│   ├── types/                 # TypeScript interfaces
│   ├── App.tsx                # Main app
│   └── main.tsx               # Entry point
└── dist/                      # Production build (after npm run build)
```

## Support & Learning

- React Docs: https://react.dev
- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev
- Vercel Docs: https://vercel.com/docs
- Tailwind CSS: https://tailwindcss.com

---

**Happy tracking! Your transparent bottle sales system is ready to go.** 🍾
