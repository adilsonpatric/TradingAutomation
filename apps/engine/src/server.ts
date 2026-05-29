import express from 'express';
import cors from 'cors';
import { db, users, bots, trades, eq } from './db/sqlite-client';
import { executeTrade } from './exchange/ccxt-client';
import { Telegraf } from 'telegraf';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const telegrafBot = botToken ? new Telegraf(botToken) : null;

async function sendTelegramMessage(chatId: string, message: string) {
    if (telegrafBot) {
        try {
            await telegrafBot.telegram.sendMessage(chatId, message);
        } catch (e) {
            console.error('Failed to send telegram message', e);
        }
    }
}

app.post('/webhook', async (req, res) => {
    try {
        const { secret, botId, side, amount, price } = req.body;

        if (!secret || !botId || !side || !amount) {
            return res.status(400).json({ error: 'Missing required payload fields' });
        }

        // Validate secret
        const botRecord = await db.select().from(bots).where(eq(bots.id, botId)).execute();
        if (botRecord.length === 0) {
            return res.status(404).json({ error: 'Bot not found' });
        }
        
        const bot = botRecord[0];
        
        if (!bot.isRunning) {
            return res.status(400).json({ error: 'Bot is disabled' });
        }

        const userRecord = await db.select().from(users).where(eq(users.id, bot.userId)).execute();
        if (userRecord.length === 0 || userRecord[0].webhookSecret !== secret) {
            return res.status(401).json({ error: 'Unauthorized webhook' });
        }

        // Debounce Cooldown Check
        if (bot.cooldownSeconds > 0) {
            const now = new Date();
            if (bot.lastExecutedAt) {
                const diffSecs = (now.getTime() - new Date(bot.lastExecutedAt).getTime()) / 1000;
                if (diffSecs < bot.cooldownSeconds) {
                    console.log(`[DEBOUNCE] Rejected signal for bot ${bot.name} (Cooldown active)`);
                    return res.status(429).json({ error: `Cooldown active. Wait ${Math.ceil(bot.cooldownSeconds - diffSecs)}s` });
                }
            }
            await db.update(bots).set({ lastExecutedAt: now }).where(eq(bots.id, bot.id)).execute();
        }

        // Execute trade
        const order = await executeTrade(bot, side, amount, price);

        // Log trade
        await db.insert(trades).values({
            botId: bot.id,
            symbol: bot.pair,
            side: side,
            price: order.average || order.price || (price ? parseFloat(price) : 0),
            amount: parseFloat(amount),
        }).execute();

        // Send Telegram notification
        if (userRecord[0].telegramChatId) {
            const paperPrefix = bot.isPaperTrading ? '🧪 [PAPER TRADE] ' : '🚀 ';
            await sendTelegramMessage(userRecord[0].telegramChatId, `${paperPrefix}Executed ${bot.orderType} ${side} order for ${bot.pair} on ${bot.exchange}`);
        }

        console.log(`${bot.isPaperTrading ? '[PAPER] ' : ''}Executed ${side} order for ${bot.pair} on ${bot.exchange}`);
        res.status(200).json({ success: true, orderId: order.id });

    } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Execution Engine running on port ${PORT}`);
});
