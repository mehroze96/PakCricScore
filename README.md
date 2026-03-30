# Pak CricScore

Pak CricScore is a polished cricket scores web app focused on Pakistan fixtures. It is built with Next.js App Router, TypeScript, Tailwind CSS, and reusable UI primitives, with match data fetched securely through a server-side API route.

## Overview

The app presents Pakistan matches in a clean, mobile-friendly interface with support for live, upcoming, and completed fixtures. Data is refreshed automatically and normalized on the server before it reaches the client.

## Included Features

- Pakistan-only match feed powered by the CricketData API
- Match status tabs for `All`, `Live`, `Upcoming`, and `Completed`
- Automatic refresh every 60 seconds
- Manual retry and refresh handling for failed requests
- Loading skeletons and empty states for a smoother UX
- Responsive layout for desktop and mobile screens
- Light and dark theme support
- Server-side filtering and normalization before data is sent to the UI
- Cached API responses with revalidation to reduce unnecessary requests

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI primitives
- Lucide React icons

## Project Structure

```text
app/
  api/matches/route.ts    Server-side match proxy and caching
  layout.tsx              App shell
  page.tsx                Home page
components/
  header.tsx              Top navigation and theme controls
  matches-board.tsx       Match tabs, refresh flow, and board state
  match-card.tsx          Individual match UI
lib/
  matches.ts              Match normalization and Pakistan filtering
  types.ts                Shared data types
```

## Environment Variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Add the following values:

```bash
CRICKETDATA_API_KEY=your_api_key_here
CRICKETDATA_API_BASE_URL=https://api.cricapi.com/v1
```

`CRICKETDATA_API_BASE_URL` is optional if you want to use the default CricketData endpoint already defined in the app.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server locally:

```bash
npm run start
```

## How Data Fetching Works

- The client requests data from `/api/matches`
- The server route reads the CricketData API key from environment variables
- Match results are normalized and filtered to Pakistan fixtures before being returned
- Responses are revalidated every 60 seconds

This keeps the API key private and avoids exposing third-party credentials in the browser.

## Deployment

This project is ready to deploy on Vercel.

Before deploying, add the same environment variables in your Vercel project settings:

- `CRICKETDATA_API_KEY`
- `CRICKETDATA_API_BASE_URL` (optional)

Once the repository is connected to Vercel, the framework should be detected as Next.js automatically.

## Notes

- Match data availability depends on the CricketData API response
- Automatic refresh is configured for a 60-second interval
- The app is designed around Pakistan fixtures rather than a global multi-team scoreboard
