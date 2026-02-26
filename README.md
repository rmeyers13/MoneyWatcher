# MoneyWatcher 💰

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

Start the backend server:

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
│   │   ├── components/      # Reusable UI components
│   │   └── pages/           # App pages
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                  # Express backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Entry point
│   └── prisma/
│       └── schema.prisma    # Database schema
├── .gitignore
└── README.md
```

---

## Notes

- The `.env` file and `.db` database file are not committed to GitHub for security reasons. You must create the `.env` file manually after cloning.
- Do not commit any real bank statement data to the repo.
- Run `npx prisma studio` in the server folder to open a visual database browser in your browser.
