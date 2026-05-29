'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { saveApiKeys } from "@/actions/keys";
import { getUserPreferences, updateUserPreferences } from "@/actions/users";

export default function SettingsPage() {
  const [binanceKey, setBinanceKey] = useState("");
  const [binanceSecret, setBinanceSecret] = useState("");
  const [bybitKey, setBybitKey] = useState("");
  const [bybitSecret, setBybitSecret] = useState("");
  
  const [webhookSecret, setWebhookSecret] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      const prefs = await getUserPreferences(1);
      if (prefs) {
        setWebhookSecret(prefs.webhookSecret || "");
        setTelegramChatId(prefs.telegramChatId || "");
      }
    }
    loadPreferences();
  }, []);

  const handleSaveKeys = async (exchange: string, key: string, secret: string) => {
    if (!key || !secret) return;
    setLoading(true);
    await saveApiKeys(1, exchange, key, secret);
    setLoading(false);
    alert(`${exchange} keys saved securely!`);
    if (exchange === 'binance') { setBinanceKey(''); setBinanceSecret(''); }
    if (exchange === 'bybit') { setBybitKey(''); setBybitSecret(''); }
  };

  const handleSavePreferences = async () => {
    if (!webhookSecret) return;
    setLoading(true);
    await updateUserPreferences(1, webhookSecret, telegramChatId);
    setLoading(false);
    alert('Global preferences updated!');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your API keys and global preferences.</p>
      </div>

      <Card className="bg-card/40 backdrop-blur-sm border-primary/20 shadow-[0_0_15px_rgba(0,100,255,0.05)]">
        <CardHeader>
          <CardTitle>Global Preferences</CardTitle>
          <CardDescription>Configure your global webhook security and Telegram notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>TradingView Webhook Secret</Label>
              <Input type="text" value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} placeholder="Required payload secret" className="bg-background/50 font-mono text-sm" />
              <p className="text-xs text-muted-foreground">This secret MUST be included in your JSON payload to authorize trades.</p>
            </div>
            <div className="space-y-2">
              <Label>Telegram Chat ID</Label>
              <Input type="text" value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)} placeholder="e.g. 123456789" className="bg-background/50" />
              <p className="text-xs text-muted-foreground">The Telegram User ID where execution notifications will be sent.</p>
            </div>
          </div>
          <Button disabled={loading} onClick={handleSavePreferences} className="w-full mt-2">
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Binance API Keys</CardTitle>
            <CardDescription>Required for Binance bot execution. Keys are AES-256 encrypted.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" value={binanceKey} onChange={(e) => setBinanceKey(e.target.value)} placeholder="Enter Binance API Key" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>API Secret</Label>
              <Input type="password" value={binanceSecret} onChange={(e) => setBinanceSecret(e.target.value)} placeholder="Enter Binance API Secret" className="bg-background/50" />
            </div>
            <Button disabled={loading} onClick={() => handleSaveKeys('binance', binanceKey, binanceSecret)} className="w-full mt-2">
              Save Binance Keys
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Bybit API Keys</CardTitle>
            <CardDescription>Required for Bybit bot execution. Keys are AES-256 encrypted.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" value={bybitKey} onChange={(e) => setBybitKey(e.target.value)} placeholder="Enter Bybit API Key" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>API Secret</Label>
              <Input type="password" value={bybitSecret} onChange={(e) => setBybitSecret(e.target.value)} placeholder="Enter Bybit API Secret" className="bg-background/50" />
            </div>
            <Button disabled={loading} onClick={() => handleSaveKeys('bybit', bybitKey, bybitSecret)} className="w-full mt-2">
              Save Bybit Keys
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
