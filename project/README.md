# CivicResolve — Complete Citizen & Officer Frontend

A complete React/Vite frontend for the CivicResolve civic complaint system.

## Citizen system

- Citizen signup/login
- Citizen dashboard
- Submit complaint
- My complaints
- Search complaints
- Status tracking
- Upvote/support reports
- Profile page
- Visible Logout button
- Responsive mobile navigation

## Officer system

- Officer signup/login
- Officer command center
- All complaints queue
- Search and status filtering
- Update complaint status:
  - Pending
  - In Progress
  - Resolved
- Add officer remarks
- Upvote/support visibility
- Profile page
- Visible Logout button
- Responsive mobile navigation

## Icons

All interface icons use Lucide React. No AI-generated icon artwork is used.

## Backend

The frontend proxies `/api` to ``.

Run the fixed CivicResolve backend first, then:

```bash
npm install
npm run dev
```

Open:

`https://mern-hackathon-backend.vercel.app`

## Build

```bash
npm run build
```

## Logout

The header contains a visible **Logout** button. Logout clears the stored JWT/user session and returns to the public landing page.
