# MoneyWatcher 

A personal finance app for parsing, categorizing, and visualizing bank statements.

---

## Tech Stack

- **Frontend:** React + TypeScript, Tailwind CSS, Recharts
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite via Prisma ORM
- **Build Tool:** Vite

---

## Prerequisites

Before setting up the project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- A code editor like [VS Code](https://code.visualstudio.com/)

---

## Cloning the Repo

```bash
git clone https://github.com/rmeyers13/MoneyWatcher.git
cd MoneyWatcher
```

---

## Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```
DATABASE_URL="file:./dev.db"
```

Run Prisma migrations to create the SQLite database:

```bash
npx prisma migrate dev
```

Start the backend server (NOT IMPLEMENTED):

```bash
npx nodemon src/index.ts
```

The server will run on `http://localhost:3000` by default.

---

## Frontend Setup

Open a new terminal window and run:

```bash
cd client
npm install
npm run dev
```

The app will run on `http://localhost:5173` by default.

---

## Folder Structure

```
MoneyWatcher/
├── client/                  # React frontend
│   ├── src/
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                  # Express backend
│   ├── src/
│   │   ├── raw_csv_data/        # Place raw exported CSVs here
│   │   ├── cleaned_csv_data/    # Cleaned CSVs are output here
│   │   ├── dcu_csv_cleanup.ts   # CSV parser script
│   └── prisma/
│       └── schema.prisma        # Database schema
├── .gitignore
└── README.md
```

---

## Importing Bank Statements

### Step 1 — Convert PDF to CSV using Tabula

If your bank only provides PDF statements, use **[Tabula](https://tabula.technology/)** to convert them to CSV. Tabula runs entirely on your local machine and never uploads your data anywhere.

**Setting up Tabula:**

1. Download Tabula from [https://tabula.technology/](https://tabula.technology/)
2. Tabula requires Java — if you don't have it, download it from [https://www.java.com/en/download/](https://www.java.com/en/download/)
3. Extract the Tabula zip and run the application (`tabula.exe` on Windows)
4. Tabula will open in your browser automatically at `http://127.0.0.1:8080`

**Extracting your transactions:**

1. Click **Browse** and upload your bank statement PDF
2. Click **Import**
3. Draw a selection box around the transaction table on the page
4. Click **Preview & Export Extracted Data**
5. Select **CSV** as the format and click **Export**
6. Save the exported file into `server/src/raw_csv_data/`

---

### Step 2 — Run the CSV Parser

Once your raw CSV is in `server/src/raw_csv_data/`, run the parser from the `server` folder:

```bash
node --loader ts-node/esm src/dcu_csv_cleanup.ts
```

The parser will prompt you for the following:

```
Enter the raw CSV filename (e.g. statement.csv):
What month is this statement from? (e.g. January):
What year is this statement from? (e.g. 2025):
What account is this for? (e.g. PrimarySavings):
```

The cleaned CSV will be automatically saved to `server/src/cleaned_csv_data/` with a filename like:

```
PrimarySavings_January_2025.csv
```

**What the parser does:**
- Merges multiline transaction descriptions into a single row
- Strips internal transaction UUIDs from descriptions
- Combines withdrawal and deposit columns into a single signed amount
- Strips commas from currency values
- Converts dates like `JAN06` to `2025-01-06`

---

## Notes

- The `.env` file and `.db` database file are not committed to GitHub for security reasons. You must create the `.env` file manually after cloning.
- Do not commit any real bank statement data to the repo. The `raw_csv_data/` and `cleaned_csv_data/` folders are gitignored.
- Run `npx prisma studio` in the server folder to open a visual database browser in your browser.
