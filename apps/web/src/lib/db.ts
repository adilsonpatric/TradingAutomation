import { createDbConnection, users, apiKeys, bots, trades } from 'database';
import { eq, desc, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

// Since Next.js runs from apps/web, we need to point it to packages/database/.env
dotenv.config({ path: path.resolve(process.cwd(), '../../packages/database/.env') });

const dbUrl = process.env.DATABASE_URL;
const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is missing.');
}

export const db = createDbConnection(dbUrl, dbAuthToken);

export { users, apiKeys, bots, trades, eq, desc, and };
