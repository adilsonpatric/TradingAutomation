import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Connection logic will be invoked by the consumers (apps/web or apps/engine)
export const createDbConnection = (url: string, authToken?: string) => {
  const client = createClient({
    url,
    authToken,
  });
  return drizzle(client, { schema });
};

export * from './schema';
export * from './encryption';
