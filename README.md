# Pak CricScore

A production-ready cricket scores web app built with Next.js App Router, TypeScript, Tailwind CSS, and shadcn-style UI primitives.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env.local
```

3. Add your CricketData API key to `CRICKETDATA_API_KEY`.

4. Run the development server:

```bash
npm run dev
```

## Notes

- Match data is fetched securely through `/api/matches`.
- API responses are revalidated every 60 seconds.
- Pakistan matches are filtered on the server before being sent to the client.
