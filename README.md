# NBA Stats 

## Getting Started

Step 1: Connect to the database:

Run the following command to connect to the database:

```bash
psql -U postgres
```

Step 2: Create the database:

```sql
CREATE DATABASE nba_stats;
```

Step 3: Setup the database:

```bash
npm run setup-db   
```

Amend the dbCONFIG in setupDatabase.ts & db.ts to match your local database.

Step 4: Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

