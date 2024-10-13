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


sometimes nba_salaries doesnt load all rows, please create table using this, then import data from csv

CREATE TABLE nba_salaries (
    "rank" INTEGER,
    "name" TEXT,
    "position" TEXT,
    "team" TEXT,
    "salary" NUMERIC,
    "season" INTEGER
);


sometimes nba_team_stats doesnt load all rows, please create table using this, then import data from csv

CREATE TABLE nba_team_stats (
    franchise VARCHAR(100),
    league VARCHAR(10),
    from_years VARCHAR(10),
    to_years VARCHAR(10),
    number_of_years INT,
    games_played INT,
    games_wins INT,
    games_losses INT,
    win_loss_percentage DECIMAL(5,3),
    playoff_appearances INT,
    division_titles INT,
    conference_titles INT,
    championships INT
);

