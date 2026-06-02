import { db, users } from './src/db/sqlite-client';

async function main() {
    const allUsers = await db.select().from(users).execute();
    console.log(allUsers);
}
main();
