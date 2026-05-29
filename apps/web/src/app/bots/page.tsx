'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Power, PowerOff, Settings2, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { getBots, createBot } from "@/actions/bots";

export default function BotsPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [exchange, setExchange] = useState("binance");
  const [pair, setPair] = useState("");
  const [marketType, setMarketType] = useState("spot");
  const [isPaperTrading, setIsPaperTrading] = useState("false");
  const [leverage, setLeverage] = useState("1");
  const [orderType, setOrderType] = useState("market");
  const [sizeType, setSizeType] = useState("percentage");
  const [size, setSize] = useState("");
  const [cooldown, setCooldown] = useState("0");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");

  const loadBots = async () => {
    const data = await getBots();
    setBots(data);
  };

  useEffect(() => {
    loadBots();
  }, []);

  const handleCreate = async () => {
    if (!name || !exchange || !pair || !size) return;
    await createBot(
      1, 
      name, 
      exchange, 
      pair, 
      marketType, 
      isPaperTrading === "true", 
      parseInt(leverage) || 1, 
      orderType, 
      sizeType, 
      parseFloat(size), 
      parseInt(cooldown) || 0,
      sl ? parseFloat(sl) : null,
      tp ? parseFloat(tp) : null
    );
    setIsOpen(false);
    loadBots();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bots & Strategies</h1>
          <p className="text-muted-foreground">Manage your trading automation endpoints and sizes.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="gap-2"><Plus className="w-4 h-4" /> New Bot</Button>} />
          <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Advanced Bot</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bot Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. BTC Scalper" />
                </div>
                <div className="space-y-2">
                  <Label>Exchange</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={exchange} onChange={e => setExchange(e.target.value)}>
                    <option value="binance" className="bg-background">Binance</option>
                    <option value="bybit" className="bg-background">Bybit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trading Pair</Label>
                  <Input value={pair} onChange={e => setPair(e.target.value)} placeholder="e.g. BTC/USDT" />
                </div>
                <div className="space-y-2">
                  <Label>Market Type</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={marketType} onChange={e => setMarketType(e.target.value)}>
                    <option value="spot" className="bg-background">Spot</option>
                    <option value="futures" className="bg-background">Futures</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Size Type</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={sizeType} onChange={e => setSizeType(e.target.value)}>
                    <option value="percentage" className="bg-background">% of Portfolio</option>
                    <option value="fixed" className="bg-background">Fixed Amount (USDT)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Trade Size</Label>
                  <Input type="number" value={size} onChange={e => setSize(e.target.value)} placeholder={sizeType === 'percentage' ? "e.g. 10%" : "e.g. 100 USDT"} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Order Type</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={orderType} onChange={e => setOrderType(e.target.value)}>
                    <option value="market" className="bg-background">Market</option>
                    <option value="limit" className="bg-background">Limit</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Leverage (x)</Label>
                  <Input type="number" value={leverage} onChange={e => setLeverage(e.target.value)} disabled={marketType === 'spot'} placeholder="e.g. 10" />
                </div>
                <div className="space-y-2">
                  <Label>Cooldown (sec)</Label>
                  <Input type="number" value={cooldown} onChange={e => setCooldown(e.target.value)} placeholder="e.g. 60" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label className="text-red-400">Stop Loss (%)</Label>
                  <Input type="number" value={sl} onChange={e => setSl(e.target.value)} placeholder="Leave blank to disable" />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-400">Take Profit (%)</Label>
                  <Input type="number" value={tp} onChange={e => setTp(e.target.value)} placeholder="Leave blank to disable" />
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label className="flex items-center gap-2 cursor-pointer bg-secondary/50 p-2 rounded-md">
                  <input type="checkbox" checked={isPaperTrading === "true"} onChange={e => setIsPaperTrading(e.target.checked ? "true" : "false")} className="rounded border-gray-300" />
                  <span className="font-medium flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-500" /> Enable Paper Trading (No Real Orders)</span>
                </Label>
              </div>

            </div>
            <DialogFooter>
              <Button onClick={handleCreate} className="w-full">Create Bot</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {bots.length === 0 && (
          <div className="col-span-full text-center py-12 border border-dashed rounded-lg text-muted-foreground">
            No bots configured. Click "New Bot" to get started.
          </div>
        )}
        
        {bots.map(bot => (
          <Card key={bot.id} className={`backdrop-blur-sm ${bot.isRunning ? 'bg-card/40 border-primary/20' : 'bg-card/20 opacity-70'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {bot.name}
                  {bot.isPaperTrading && <Badge variant="outline" className="text-amber-500 border-amber-500/50">Paper Trade</Badge>}
                  {bot.isRunning ? 
                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Running</Badge> : 
                    <Badge variant="secondary">Stopped</Badge>
                  }
                </CardTitle>
                <CardDescription className="capitalize mt-1">
                  {bot.exchange} • {bot.marketType} {bot.leverage > 1 ? `(${bot.leverage}x)` : ''}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon"><Settings2 className="w-4 h-4" /></Button>
                {bot.isRunning ? (
                  <Button variant="destructive" size="icon"><PowerOff className="w-4 h-4" /></Button>
                ) : (
                  <Button variant="default" size="icon" className="bg-emerald-500"><Power className="w-4 h-4" /></Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-secondary/30 p-3 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Pair</Label>
                  <div className="text-sm font-medium">{bot.pair}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Order</Label>
                  <div className="text-sm font-medium capitalize">{bot.orderType}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Size</Label>
                  <div className="text-sm font-medium">{bot.tradeSizePercent}{bot.sizeType === 'percentage' ? '%' : ' USDT'}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">SL / TP</Label>
                  <div className="text-sm font-medium">
                    {bot.slPercent ? <span className="text-red-400">{bot.slPercent}%</span> : '-'} / {bot.tpPercent ? <span className="text-emerald-400">{bot.tpPercent}%</span> : '-'}
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Label className="text-xs text-muted-foreground mb-2 block">Webhook Payload Template (POST to <code>/webhook</code>)</Label>
                <div className="flex gap-2">
                  <Input 
                    value={`{ "secret": "YOUR_SECRET", "botId": ${bot.id}, "side": "buy", "amount": "0.01"${bot.orderType === 'limit' ? ', "price": "60000"' : ''} }`} 
                    readOnly 
                    className="bg-background/50 font-mono text-xs" 
                  />
                  <Button variant="secondary" onClick={() => {
                    navigator.clipboard.writeText(`{ "secret": "YOUR_SECRET", "botId": ${bot.id}, "side": "buy", "amount": "0.01"${bot.orderType === 'limit' ? ', "price": "60000"' : ''} }`);
                    alert("Webhook payload copied!");
                  }}>Copy</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
