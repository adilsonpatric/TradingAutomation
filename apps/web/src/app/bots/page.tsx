'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Power, PowerOff, Trash2, ShieldAlert, Pencil, Link as LinkIcon, RefreshCcw, Check, ChevronsUpDown, Star } from "lucide-react";
import { useState, useEffect } from "react";
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
import { getBots, createBot, toggleBotStatus, deleteBot, updateBot } from "@/actions/bots";
import { getExchangeMarkets, getPairBalance, getExchangeConnectionInfo } from "@/actions/ccxt";
import { getUserPreferences } from "@/actions/users";
import { getApiKeys } from "@/actions/keys";
import { cn } from "@/lib/utils";

export default function BotsPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [webhookDomain, setWebhookDomain] = useState("http://localhost:4000");
  
  // Connection state
  const [apiKeyPreview, setApiKeyPreview] = useState<string>("");
  const [markets, setMarkets] = useState<string[]>([]);
  const [balances, setBalances] = useState({ base: 0, quote: 0 });
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  
  // Form state
  const [editBotId, setEditBotId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [apiKeyId, setApiKeyId] = useState<number | "">("");
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

  // Combobox state
  const [openPairDropdown, setOpenPairDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('favoritePairs');
    if (stored) {
      try { setFavorites(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  const toggleFavorite = (m: string, e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavs = favorites.includes(m) ? favorites.filter(p => p !== m) : [...favorites, m];
    setFavorites(newFavs);
    localStorage.setItem('favoritePairs', JSON.stringify(newFavs));
  };

  const loadBots = async () => {
    const [botsData, keysData, prefsData] = await Promise.all([
      getBots(),
      getApiKeys(),
      getUserPreferences()
    ]);
    setBots(botsData);
    setKeys(keysData);
    if (prefsData && prefsData.webhookDomain) setWebhookDomain(prefsData.webhookDomain);
  };

  useEffect(() => {
    loadBots();
  }, []);

  // Fetch connection info and markets when key or marketType changes
  useEffect(() => {
    if (isOpen && apiKeyId) {
      setLoadingMarkets(true);
      getExchangeConnectionInfo(1, Number(apiKeyId)).then(info => {
        setApiKeyPreview(info.isConnected ? info.apiKeyPreview : "Not Connected");
      });
      getExchangeMarkets(1, Number(apiKeyId), marketType).then(data => {
        setMarkets(data);
        setLoadingMarkets(false);
      });
    }
  }, [isOpen, apiKeyId, marketType]);

  // Fetch live balances when a valid pair is selected
  useEffect(() => {
    if (isOpen && pair && pair.includes('/') && apiKeyId) {
      getPairBalance(1, Number(apiKeyId), pair).then(data => {
        setBalances(data);
      });
    } else {
      setBalances({ base: 0, quote: 0 });
    }
  }, [isOpen, apiKeyId, pair]);

  const resetForm = () => {
    setEditBotId(null);
    setName("");
    setApiKeyId("");
    setPair("");
    setMarketType("spot");
    setIsPaperTrading("false");
    setLeverage("1");
    setOrderType("market");
    setSizeType("percentage");
    setSize("");
    setCooldown("0");
    setSl("");
    setTp("");
    setBalances({ base: 0, quote: 0 });
    setSearchQuery("");
  };

  const handleOpenNew = () => {
    resetForm();
    if (keys.length > 0) setApiKeyId(keys[0].id);
    setIsOpen(true);
  };

  const handleOpenEdit = (bot: any) => {
    setEditBotId(bot.id);
    setName(bot.name);
    setApiKeyId(bot.apiKeyId || (keys.length > 0 ? keys[0].id : ""));
    setPair(bot.pair);
    setMarketType(bot.marketType);
    setIsPaperTrading(bot.isPaperTrading ? "true" : "false");
    setLeverage(bot.leverage.toString());
    setOrderType(bot.orderType);
    setSizeType(bot.sizeType);
    setSize(bot.tradeSizePercent ? bot.tradeSizePercent.toString() : "");
    setCooldown(bot.cooldownSeconds.toString());
    setSl(bot.slPercent ? bot.slPercent.toString() : "");
    setTp(bot.tpPercent ? bot.tpPercent.toString() : "");
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!name || !apiKeyId || !pair || (!size && sizeType !== 'strategy')) return;
    
    // Extra validation: ensure the pair is actually in the exchange markets list
    if (!markets.includes(pair)) {
      toast.error(`Invalid Trading Pair: ${pair}`);
      return;
    }

    const selectedKey = keys.find(k => k.id === Number(apiKeyId));
    if (!selectedKey) return;

    if (editBotId) {
      await updateBot(
        editBotId,
        name, 
        selectedKey.exchange, 
        Number(apiKeyId),
        pair, 
        marketType, 
        isPaperTrading === "true", 
        parseInt(leverage) || 1, 
        orderType, 
        sizeType, 
        sizeType === 'strategy' ? 0 : parseFloat(size), 
        parseInt(cooldown) || 0,
        sl ? parseFloat(sl) : null,
        tp ? parseFloat(tp) : null
      );
    } else {
      await createBot(
        name, 
        selectedKey.exchange, 
        Number(apiKeyId),
        pair, 
        marketType, 
        isPaperTrading === "true", 
        parseInt(leverage) || 1, 
        orderType, 
        sizeType, 
        sizeType === 'strategy' ? 0 : parseFloat(size), 
        parseInt(cooldown) || 0,
        sl ? parseFloat(sl) : null,
        tp ? parseFloat(tp) : null
      );
    }
    
    setIsOpen(false);
    loadBots();
  };

  // Performance Optimization: Custom client side filter for Command to prevent UI lockup with 3000+ Binance pairs
  const filteredMarkets = markets
    .filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aFav = favorites.includes(a);
      const bFav = favorites.includes(b);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0; // maintain original alphabetical order
    })
    .slice(0, 100); // Display only top 100 matches to keep the dropdown super fast

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bots & Strategies</h1>
          <p className="text-muted-foreground">Manage your trading automation endpoints and sizes.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsOpen(open);
        }}>
          <DialogTrigger 
            render={<Button onClick={handleOpenNew} disabled={keys.length === 0} className="gap-2"><Plus className="w-4 h-4" /> New Bot</Button>} 
          />
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editBotId ? 'Edit Bot' : 'Create Advanced Bot'}</DialogTitle>
              {apiKeyPreview && (
                <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <LinkIcon className="w-3 h-3" /> Connected to API Key: ****{apiKeyPreview}
                </div>
              )}
            </DialogHeader>
            <div className="grid gap-4 py-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bot Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. BTC Scalper" />
                </div>
                <div className="space-y-2">
                  <Label>Subaccount Connection</Label>
                  <Select value={apiKeyId.toString()} onValueChange={(val) => setApiKeyId(Number(val))}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select Subaccount" />
                    </SelectTrigger>
                    <SelectContent>
                      {keys.map(key => (
                        <SelectItem key={key.id} value={key.id.toString()}>{key.name} ({key.exchange})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <Label className="flex justify-between items-center h-4">
                    <span>Trading Pair</span>
                    {loadingMarkets && <RefreshCcw className="w-3 h-3 animate-spin text-muted-foreground" />}
                  </Label>
                  
                  <Popover open={openPairDropdown} onOpenChange={setOpenPairDropdown}>
                    <PopoverTrigger 
                      render={
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPairDropdown}
                          className="w-full justify-between bg-background/50 border-input font-normal"
                          disabled={loadingMarkets || !apiKeyId}
                        >
                          {loadingMarkets ? "Loading pairs..." : (pair ? pair.split(':')[0] : "Select a pair...")}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      }
                    />
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput 
                          placeholder="Search pairs..." 
                          value={searchQuery}
                          onValueChange={setSearchQuery} 
                        />
                        <CommandList>
                          <CommandEmpty>No pair found.</CommandEmpty>
                          <CommandGroup>
                            {filteredMarkets.map((m) => (
                              <CommandItem
                                key={m}
                                value={m}
                                onSelect={(currentValue) => {
                                  // shadcn command returns lowercase by default, so we use the original market 'm'
                                  setPair(m === pair ? "" : m);
                                  setOpenPairDropdown(false);
                                  setSearchQuery("");
                                }}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        pair === m ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {m.split(':')[0]}
                                  </div>
                                  <div 
                                    onPointerDown={(e) => toggleFavorite(m, e)}
                                    onClick={(e) => toggleFavorite(m, e)}
                                    className="cursor-pointer p-1 rounded-full hover:bg-secondary transition-colors"
                                  >
                                    <Star 
                                      className={cn(
                                        "h-4 w-4", 
                                        favorites.includes(m) ? "fill-amber-400 text-amber-400" : "text-muted-foreground opacity-30 hover:opacity-100"
                                      )} 
                                    />
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                            {filteredMarkets.length === 100 && (
                               <div className="p-2 text-xs text-center text-muted-foreground border-t">Type to search for more pairs...</div>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {pair && !loadingMarkets && (
                    <div className="text-xs flex justify-between mt-1 px-1">
                      {markets.includes(pair) ? (
                        <>
                          <span className="text-muted-foreground">{pair.split('/')[0]} Bal: {balances.base.toFixed(4)}</span>
                          <span className="text-muted-foreground">{(pair.split('/')[1] || '').split(':')[0]} Bal: {balances.quote.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-red-400 font-medium">Invalid pair for this exchange</span>
                      )}
                    </div>
                  )}
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
                    <option value="strategy" className="bg-background">Let Strategy/Webhook Decide</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Trade Size</Label>
                  <Input type="number" value={sizeType === 'strategy' ? "" : size} onChange={e => setSize(e.target.value)} disabled={sizeType === 'strategy'} placeholder={sizeType === 'strategy' ? "Webhook determines size" : (sizeType === 'percentage' ? "e.g. 10%" : "e.g. 100 USDT")} />
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
              <Button onClick={handleSave} className="w-full">{editBotId ? 'Save Changes' : 'Create Bot'}</Button>
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
        
        {bots.map(bot => {
          const keyName = keys.find(k => k.id === bot.apiKeyId)?.name || bot.exchange;
          return (
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
                  {keyName} • {bot.marketType} {bot.leverage > 1 ? `(${bot.leverage}x)` : ''}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleOpenEdit(bot)}>
                  <Pencil className="w-4 h-4 text-primary" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="outline" size="icon" />}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Bot?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this bot? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={async () => {
                        await deleteBot(bot.id);
                        toast.success("Bot deleted successfully");
                        loadBots();
                      }}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {bot.isRunning ? (
                  <Button variant="destructive" size="icon" onClick={async () => {
                    await toggleBotStatus(bot.id, true);
                    loadBots();
                  }}><PowerOff className="w-4 h-4" /></Button>
                ) : (
                  <Button variant="default" size="icon" className="bg-emerald-500" onClick={async () => {
                    await toggleBotStatus(bot.id, false);
                    loadBots();
                  }}><Power className="w-4 h-4" /></Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-secondary/30 p-3 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Pair</Label>
                  <div className="text-sm font-medium">{bot.pair.split(':')[0]}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Order</Label>
                  <div className="text-sm font-medium capitalize">{bot.orderType}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Size</Label>
                  <div className="text-sm font-medium">{bot.sizeType === 'strategy' ? 'Dynamic (Strategy)' : `${bot.tradeSizePercent}${bot.sizeType === 'percentage' ? '%' : ' USDT'}`}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">SL / TP</Label>
                  <div className="text-sm font-medium">
                    {bot.slPercent ? <span className="text-red-400">{bot.slPercent}%</span> : '-'} / {bot.tpPercent ? <span className="text-emerald-400">{bot.tpPercent}%</span> : '-'}
                  </div>
                </div>
              </div>
              
              <div className="pt-2 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Full Webhook URL (POST)</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={webhookDomain.includes('smee.io') ? webhookDomain.replace(/\/$/, '') : `${webhookDomain.replace(/\/$/, '')}/webhook`} 
                      readOnly 
                      className="bg-background/50 font-mono text-xs border-primary/20 text-primary" 
                    />
                    <Button variant="secondary" onClick={() => {
                      navigator.clipboard.writeText(webhookDomain.includes('smee.io') ? webhookDomain.replace(/\/$/, '') : `${webhookDomain.replace(/\/$/, '')}/webhook`)
                        .then(() => toast.success("Webhook URL copied!"))
                        .catch(() => toast.error("Clipboard permission denied. Please select the text and copy manually."));
                    }}><LinkIcon className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">JSON Payload Template (Universal compatibility with Make.com, Zapier, etc.)</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={`{ "secret": "YOUR_SECRET", "botId": ${bot.id}, "side": "buy", "amount": "${bot.sizeType === 'strategy' ? '{{strategy.order.contracts}}' : '0.01'}"${bot.orderType === 'limit' ? ', "price": "{{strategy.order.price}}"' : ''} }`} 
                      readOnly 
                      className="bg-background/50 font-mono text-xs" 
                    />
                    <Button variant="secondary" onClick={() => {
                      const payload = `{ "secret": "YOUR_SECRET", "botId": ${bot.id}, "side": "buy", "amount": "${bot.sizeType === 'strategy' ? '{{strategy.order.contracts}}' : '0.01'}"${bot.orderType === 'limit' ? ', "price": "{{strategy.order.price}}"' : ''} }`;
                      navigator.clipboard.writeText(payload)
                        .then(() => toast.success("Webhook payload copied!"))
                        .catch(() => toast.error("Clipboard permission denied. Please select the text and copy manually."));
                    }}>Copy</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )})}
      </div>
    </div>
  );
}
