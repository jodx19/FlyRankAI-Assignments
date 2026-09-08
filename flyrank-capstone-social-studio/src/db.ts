import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
// Strip the "file:" prefix if present - adapter expects a path
const dbPath = dbUrl.startsWith('file:') ? dbUrl.slice(5) : dbUrl;

const adapter = new PrismaBetterSqlite3({ url: dbPath });

export const prisma = new PrismaClient({ adapter });
