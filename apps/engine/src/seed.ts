import { db, users, bots } from './db/sqlite-client';

async function seed() {
    console.log('Seeding database...');
    
    try {
        // Create a mock user
        const userResult = await db.insert(users).values({
            webhookSecret: 'my_super_secret',
            telegramChatId: ''
        }).returning({ id: users.id }).execute();
        
        const userId = userResult[0].id;
        console.log(`Created User ID: ${userId}`);

        // Create a mock bot
        const botResult = await db.insert(bots).values({
            userId: userId,
            name: 'Test BTC Scalper',
            exchange: 'binance',
            pair: 'BTC/USDT',
            tradeSizePercent: 10,
            isRunning: true,
        }).returning({ id: bots.id }).execute();
        
        const botId = botResult[0].id;
        console.log(`Created Bot ID: ${botId}`);

        console.log('\n--- Test Configuration ---');
        console.log(`To test the webhook, use the following JSON payload:`);
        console.log(JSON.stringify({
            secret: "my_super_secret",
            botId: botId,
            side: "buy",
            amount: "0.001"
        }, null, 2));
        
        console.log('\nDone seeding!');
        process.exit(0);
    } catch (e) {
        console.error('Failed to seed:', e);
        process.exit(1);
    }
}

seed();
