import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'
import { parse } from 'csv-parse/sync'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const RAW_DIR = path.join(__dirname, 'raw_csv_data')
const CLEANED_DIR = path.join(__dirname, 'cleaned_csv_data')

const MONTH_MAP: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04',
  MAY: '05', JUN: '06', JUL: '07', AUG: '08',
  SEP: '09', OCT: '10', NOV: '11', DEC: '12'
}

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve))
}

function parseDate(raw: string, year: string): string {
  const month = raw.slice(0, 3).toUpperCase()
  const day = raw.slice(3).padStart(2, '0')
  return `${year}-${MONTH_MAP[month]}-${day}`
}

function cleanAmount(raw: string): number {
  return parseFloat(raw.replace(/[",]/g, '')) || 0
}

function cleanDescription(raw: string): string {
  // Remove UUIDs (long hex strings with dashes)
  return raw.replace(/~\s*[a-f0-9\-]{10,}/gi, '').trim()
}

function cleanFallbackDescription(raw: string): string {
  // Used for main row descriptions only — fixes jammed text
  let cleaned = cleanDescription(raw)
  cleaned = cleaned.replace(/([A-Z])(?=[A-Z][a-z])|([a-z])(?=[A-Z])/g, '$1$2 ')
  cleaned = cleaned.replace(/FROM\/TO(\d)/g, 'FROM/TO $1')
  return cleaned.trim()
}

interface Transaction {
  date: string
  description: string
  fallbackDescription: string
  continuationLines: string[]
  amount: number
  type: string
  balance: number
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  const fileName = await prompt(rl, 'Enter the raw CSV filename (e.g. test.csv): ')
  const month = await prompt(rl, 'What month is this statement from? (e.g. January): ')
  const year = await prompt(rl, 'What year is this statement from? (e.g. 2025): ')
  const account = await prompt(rl, 'What account is this for? (e.g. PrimarySavings): ')

  rl.close()

  const inputFile = path.join(RAW_DIR, fileName.trim())

  if (!fs.existsSync(inputFile)) {
    console.error(`SFile not found in raw_csv_data: ${fileName.trim()}`)
    process.exit(1)
  }

  const accountSlug = account.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
  const monthSlug = month.replace(/\s+/g, '_')
  const outputFileName = `${accountSlug}_${monthSlug}_${year}.csv`

  if (!fs.existsSync(CLEANED_DIR)) fs.mkdirSync(CLEANED_DIR, { recursive: true })

  const outputPath = path.join(CLEANED_DIR, outputFileName)

  const rawContent = fs.readFileSync(inputFile, 'utf-8')
  const rows: string[][] = parse(rawContent, {
    relax_column_count: true,
    skip_empty_lines: false
  })

  const dataRows = rows.slice(1)
  const transactions: Transaction[] = []
  let currentTransaction: Transaction | null = null

  for (const row of dataRows) {
    const [date = '', description = '', withdrawals = '', deposits = '', balance = ''] = row

    const isMainRow = date && date.trim() !== ''

    if (isMainRow) {
      if (currentTransaction) transactions.push(currentTransaction)

      const withdrawal = withdrawals ? cleanAmount(withdrawals) : 0
      const deposit = deposits ? cleanAmount(deposits) : 0
      const amount = withdrawal !== 0 ? withdrawal : deposit
      const type = withdrawal !== 0 ? 'withdrawal' : 'deposit'

      currentTransaction = {
        date: parseDate(date.trim(), year.trim()),
        description: '',
        fallbackDescription: cleanFallbackDescription(description),
        continuationLines: [],
        amount,
        type,
        balance: cleanAmount(balance)
      }
    } else if (currentTransaction && description && description.trim() !== '') {
      // Collect continuation lines separately
      const extra = cleanDescription(description.trim())
      if (extra) currentTransaction.continuationLines.push(extra)
    }
  }

  if (currentTransaction) transactions.push(currentTransaction)

  // Resolve final description — prefer continuation lines, fall back to main row description
  for (const t of transactions) {
    t.description = t.continuationLines.length > 0
      ? t.continuationLines.join(' - ')
      : t.fallbackDescription
  }

  const header = 'date,description,amount,type,balance\n'
  const csvLines = transactions.map(t =>
    `${t.date},"${t.description}",${t.amount},${t.type},${t.balance}`
  )

  fs.writeFileSync(outputPath, header + csvLines.join('\n'), 'utf-8')

  console.log(`\nParsed ${transactions.length} transactions`)
  console.log(`Saved to: cleaned_csv_data/${outputFileName}`)
}

main().catch(console.error)