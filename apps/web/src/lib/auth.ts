import { auth } from '@clerk/nextjs/server';
import { db, users, eq } from './db';
import { redirect } from 'next/navigation';

export async function requireUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect('/sign-in');
  }

  const userRecords = await db.select().from(users).where(eq(users.clerkId, clerkId)).execute();
  
  if (userRecords.length === 0) {
    // Auto-create user
    const crypto = require('crypto');
    const secret = crypto.randomBytes(32).toString('hex');
    
    const newUser = await db.insert(users).values({
      clerkId,
      webhookSecret: secret,
      syncIntervalMinutes: 10,
    }).returning({ id: users.id }).execute();
    
    return newUser[0];
  }

  return userRecords[0];
}
