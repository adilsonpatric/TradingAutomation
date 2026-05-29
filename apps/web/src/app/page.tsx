import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getPortfolioBalance } from "@/actions/portfolio";
import { getBots } from "@/actions/bots";
import { getRecentTrades } from "@/actions/trades";

export default async function DashboardPage() {
  const portfolioValue = await getPortfolioBalance(1);
  const allBots = await getBots();
  const activeBots = allBots.filter(b => b.isRunning);
  const recentTrades = await getRecentTrades();
  
  const binanceCount = activeBots.filter(b => b.exchange === 'binance').length;
  const bybitCount = activeBots.filter(b => b.exchange === 'bybit').length;
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Monitor your trading automation performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/40 backdrop-blur-sm border-primary/20 shadow-[0_0_15px_rgba(0,100,255,0.05)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value (USDT)</CardTitle>
            <Wallet className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolioValue.toFixed(2)}</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" /> Live from Exchanges
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bots</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBots.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{binanceCount} Binance, {bybitCount} Bybit</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">24h PnL</CardTitle>
            <Activity className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">+$342.50</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +0.8%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrades.length === 0 && (
                <div className="text-muted-foreground text-sm text-center py-4">No recent trades.</div>
              )}
              {recentTrades.map(trade => (
                <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {trade.symbol} <Badge variant="outline" className="text-[10px] capitalize">{trade.exchange}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(trade.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium capitalize ${trade.side === 'buy' ? 'text-emerald-500' : 'text-red-500'}`}>{trade.side}</div>
                    <div className="text-sm">{trade.amount} @ ${trade.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Performance Chart</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border rounded-md border-dashed">
             <span className="text-muted-foreground">Chart Placeholder</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
