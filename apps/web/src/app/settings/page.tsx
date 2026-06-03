'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { addApiKey, deleteApiKey, getApiKeys } from "@/actions/keys";
import { getUserPreferences, updateUserPreferences } from "@/actions/users";
import { Activity, Plus, Trash2, Eye, EyeOff, Settings2, Link2, Send, Server, Key, Link } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ApiKey {
  id: number;
  name: string;
  exchange: string;
  apiKey: string;
  apiSecret: string;
}

export default function SettingsPage() {
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [webhookDomain, setWebhookDomain] = useState("");
  const [syncIntervalMinutes, setSyncIntervalMinutes] = useState<number>(10);
  const [notifyTradeEntry, setNotifyTradeEntry] = useState<boolean>(true);
  const [notifyTradeClose, setNotifyTradeClose] = useState<boolean>(true);
  const [notifyTpSl, setNotifyTpSl] = useState<boolean>(true);
  const [portaiqApiKey, setPortaiqApiKey] = useState("");
  const [portaiqUrl, setPortaiqUrl] = useState("");

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);

  // New Key Form
  const [newName, setNewName] = useState("");
  const [newExchange, setNewExchange] = useState("bybit");
  const [newKey, setNewKey] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [testStatus, setTestStatus] = useState<Record<number, { testing: boolean, result: string, expiresAt: string }>>({});

  const loadData = async () => {
    const prefs = await getUserPreferences(1);
    if (prefs) {
      setWebhookSecret(prefs.webhookSecret || "");
      setTelegramBotToken(prefs.telegramBotToken || "");
      setTelegramChatId(prefs.telegramChatId || "");
      setWebhookDomain(prefs.webhookDomain || "");
      if (prefs.syncIntervalMinutes) setSyncIntervalMinutes(prefs.syncIntervalMinutes);
      setNotifyTradeEntry(prefs.notifyTradeEntry ?? true);
      setNotifyTradeClose(prefs.notifyTradeClose ?? true);
      setNotifyTpSl(prefs.notifyTpSl ?? true);
      setPortaiqApiKey(prefs.portaiqApiKey || "");
      setPortaiqUrl(prefs.portaiqUrl || "");
    }
    const list = await getApiKeys(1);
    setKeys(list as ApiKey[]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddKey = async () => {
    if (!newName || !newKey || !newSecret) return;
    setLoading(true);
    await addApiKey(1, newName, newExchange, newKey, newSecret);
    setLoading(false);
    setNewName("");
    setNewKey("");
    setNewSecret("");
    loadData();
  };

  const handleDeleteKey = async (id: number) => {
    setLoading(true);
    await deleteApiKey(1, id);
    setLoading(false);
    toast.success('Subaccount deleted successfully');
    loadData();
  };

  const handleSavePreferences = async () => {
    if (!webhookSecret) {
        toast.error("TradingView Webhook Secret is required.");
        return;
    }
    setLoading(true);
    await updateUserPreferences(1, {
      webhookSecret, 
      telegramBotToken, 
      telegramChatId, 
      webhookDomain,
      syncIntervalMinutes,
      notifyTradeEntry,
      notifyTradeClose,
      notifyTpSl,
      portaiqApiKey,
      portaiqUrl
    });
    setLoading(false);
    toast.success('Global preferences updated!');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your integrations, API keys, and global preferences.</p>
        </div>
        <Button disabled={loading} onClick={handleSavePreferences} className="gap-2">
            <Server className="w-4 h-4" />
            Save All Preferences
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          {/* PortaIQ / StockIQ Integration */}
          <Card className="bg-card/40 backdrop-blur-sm border-primary/20 shadow-[0_0_15px_rgba(0,100,255,0.05)]">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Activity className="w-5 h-5" />
                <CardTitle>PortaIQ / StockIQ</CardTitle>
              </div>
              <CardDescription>Sync your automated trades to your main Trading Journal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" value={portaiqApiKey} onChange={(e) => setPortaiqApiKey(e.target.value)} placeholder="Generate this in StockIQ Settings" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>API Endpoint URL</Label>
                  <Input type="text" value={portaiqUrl} onChange={(e) => setPortaiqUrl(e.target.value)} placeholder="e.g. http://localhost:3001/api/journal/trades" className="bg-background/50 font-mono text-sm" />
                </div>
            </CardContent>
          </Card>

          {/* Telegram Notifications */}
          <Card className="bg-card/40 backdrop-blur-sm border-primary/20 shadow-[0_0_15px_rgba(0,100,255,0.05)]">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Send className="w-5 h-5" />
                <CardTitle>Telegram Notifications</CardTitle>
              </div>
              <CardDescription>Receive instant alerts when bots execute trades.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label>Bot Token</Label>
                  <div className="relative">
                    <Input type={showTelegramToken ? "text" : "password"} value={telegramBotToken} onChange={(e) => setTelegramBotToken(e.target.value)} placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ" className="bg-background/50 pr-10" />
                    <button
                      type="button"
                      onClick={() => setShowTelegramToken(!showTelegramToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showTelegramToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
              </div>
              <div className="space-y-2">
                  <Label>Chat ID</Label>
                  <Input type="text" value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)} placeholder="e.g. 123456789" className="bg-background/50" />
              </div>

              <div className="pt-2 space-y-3">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notifyEntry" checked={notifyTradeEntry} onChange={e => setNotifyTradeEntry(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                    <Label htmlFor="notifyEntry" className="cursor-pointer">Trade Entries (Webhooks)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notifyClose" checked={notifyTradeClose} onChange={e => setNotifyTradeClose(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                    <Label htmlFor="notifyClose" className="cursor-pointer">Trade Closures (Webhooks)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notifyTpSl" checked={notifyTpSl} onChange={e => setNotifyTpSl(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                    <Label htmlFor="notifyTpSl" className="cursor-pointer">Take Profit / Stop Loss (Background Sync)</Label>
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* TradingView Webhook Config */}
          <Card className="bg-card/40 backdrop-blur-sm border-primary/20 shadow-[0_0_15px_rgba(0,100,255,0.05)]">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Link className="w-5 h-5" />
                <CardTitle>TradingView Webhooks</CardTitle>
              </div>
              <CardDescription>Security and routing for incoming webhook signals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="relative">
                  <Input type={showWebhookSecret ? "text" : "password"} value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} placeholder="Required payload secret" className="bg-background/50 font-mono text-sm pr-10" />
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Webhook Domain</Label>
                <Input type="text" value={webhookDomain} onChange={(e) => setWebhookDomain(e.target.value)} placeholder="e.g. http://your-ip:4000" className="bg-background/50 font-mono text-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Engine Config */}
          <Card className="bg-card/40 backdrop-blur-sm border-primary/20 shadow-[0_0_15px_rgba(0,100,255,0.05)]">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Settings2 className="w-5 h-5" />
                <CardTitle>Engine Configuration</CardTitle>
              </div>
              <CardDescription>Control the background execution engine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Exchange Sync Interval (Minutes)</Label>
                <Input type="number" min={1} max={120} value={syncIntervalMinutes} onChange={(e) => setSyncIntervalMinutes(Number(e.target.value))} className="bg-background/50" />
                <p className="text-xs text-muted-foreground">How often the background worker checks the exchange for TP/SL hits.</p>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Connected Subaccounts */}
      <Card className="bg-card/40 backdrop-blur-sm border-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Key className="w-5 h-5" />
            <CardTitle>Connected Subaccounts</CardTitle>
          </div>
          <CardDescription>Add the API keys for each subaccount you want to trade with.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="grid grid-cols-1 gap-4">
            {keys.map((key) => (
              <div key={key.id} className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-lg bg-background/50 border border-white/5">
                <div>
                  <h3 className="font-semibold text-lg">{key.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{key.exchange} Exchange</p>
                </div>
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="destructive" size="sm" disabled={loading} />}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Subaccount Connection?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this subaccount connection? Running bots using it may fail and they won't be able to execute trades.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteKey(key.id)} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            
            {keys.length === 0 && (
              <div className="text-center p-8 text-muted-foreground border border-dashed border-white/10 rounded-lg">
                No subaccounts connected yet. Add one below.
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/10">
            <h3 className="font-semibold mb-4 text-foreground/80">Add New Subaccount</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subaccount Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. TradeAuto_BTC" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Exchange</Label>
                <Select value={newExchange} onValueChange={setNewExchange}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select Exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="binance">Binance</SelectItem>
                    <SelectItem value="bybit">Bybit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input type="password" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="API Key" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>API Secret</Label>
                <Input type="password" value={newSecret} onChange={(e) => setNewSecret(e.target.value)} placeholder="API Secret" className="bg-background/50" />
              </div>
            </div>
            <Button disabled={loading || !newName || !newKey || !newSecret} onClick={handleAddKey} className="w-full mt-4 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Subaccount
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
