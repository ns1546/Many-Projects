import Database from 'better-sqlite3'
import path from 'path'

// The saas.db file is located in the platform-admin directory
const dbPath = path.resolve(process.cwd(), '../platform-admin/saas.db')
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

export default db
