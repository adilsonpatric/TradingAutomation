import { createDbConnection, users, apiKeys, bots, trades } from 'database';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

// Load the .env file from the database package where it was configured
dotenv.config({ path: path.resolve(__dirname, '../../../../packages/database/.env') });

const dbUrl = process.env.DATABASE_URL;
const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is missing. Make sure it is set in packages/database/.env');
}

export const db = createDbConnection(dbUrl, dbAuthToken);

export { users, apiKeys, bots, trades, eq };
