'use server'

import { db, users, eq } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function getUserPreferences() {
    return await requireUser();
}

export async function updateUserPreferences(preferences: {
    webhookSecret?: string;
    webhookDomain?: string;
    telegramBotToken?: string;
    telegramChatId?: string;
    syncIntervalMinutes?: number;
    notifyTradeEntry?: boolean;
    notifyTradeClose?: boolean;
    notifyTpSl?: boolean;
    portaiqApiKey?: string;
    portaiqUrl?: string;
}) {
    const user = await requireUser();
    await db.update(users).set({
        webhookSecret: preferences.webhookSecret,
        telegramBotToken: preferences.telegramBotToken,
        telegramChatId: preferences.telegramChatId,
        webhookDomain: preferences.webhookDomain,
        syncIntervalMinutes: preferences.syncIntervalMinutes,
        notifyTradeEntry: preferences.notifyTradeEntry,
        notifyTradeClose: preferences.notifyTradeClose,
        notifyTpSl: preferences.notifyTpSl,
        portaiqApiKey: preferences.portaiqApiKey,
        portaiqUrl: preferences.portaiqUrl
    }).where(eq(users.id, user.id)).execute();
}
