import { createDbConnection, users } from './index';
import dotenv from 'dotenv';
dotenv.config();

async function migrateUser() {
    const db = createDbConnection(process.env.DATABASE_URL!, process.env.DATABASE_AUTH_TOKEN!);
    const allUsers = await db.select().from(users).execute();
    console.log("Found users:", allUsers.map(u => ({ id: u.id, clerkId: u.clerkId })));

    const oldUser = allUsers.find(u => u.id === 1);
    const newUser = allUsers.find(u => u.clerkId !== null && u.id !== 1);

    if (oldUser && newUser && newUser.clerkId) {
        console.log(`Migrating clerkId ${newUser.clerkId} to old user id 1`);
        
        const { eq } = require('drizzle-orm');
        
        // Delete user 2 FIRST to avoid unique constraint violation
        await db.delete(users).where(eq(users.id, newUser.id)).execute();
        
        // Update user 1 with clerkId
        await db.update(users).set({ clerkId: newUser.clerkId }).where(eq(users.id, 1)).execute();
        
        console.log("Migration complete.");
    } else {
        console.log("No migration needed or old user / new user not found.");
    }
}

migrateUser().catch(console.error);
