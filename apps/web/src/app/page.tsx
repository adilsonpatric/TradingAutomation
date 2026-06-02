'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, DollarSign, Activity, PieChart as PieChartIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getCompletePortfolio } from "@/actions/portfolio";
import { getBots } from "@/actions/bots";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [totalUsd, setTotalUsd] = useState(0);
  const [assets, setAssets] = useState<any[]>([]);
  const [subaccounts, setSubaccounts] = useState<any[]>([]);
  const [bots, setBots] = useState<any[]>([]);

  const loadDashboard = async () => {
    setLoading(true);
    const [portfolioData, botsData] = await Promise.all([
      getCompletePortfolio(1),
      getBots()
    ]);
    
    setTotalUsd(portfolioData.totalUsd);
    setAssets(portfolioData.assets);
    setSubaccounts(portfolioData.subaccounts || []);
    setBots(botsData);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Format data for Pie Chart
  const pieData = assets.map(a => ({
    name: a.asset,
    value: a.usdValue
  }));

  // Map bots to their respective assets (Quote and Base) for the Bot Assets table
  const botAssets = bots.flatMap(bot => {
    const [base, quote] = bot.pair.split('/');
    const baseAsset = assets.find(a => a.asset === base) || { balance: 0, usdValue: 0 };
    const quoteAsset = assets.find(a => a.asset === quote) || { balance: 0, usdValue: 0 };
    
    return [
      { botName: bot.name, status: bot.isRunning, asset: quote, balance: quoteAsset.balance, usdValue: quoteAsset.usdValue },
      { botName: bot.name, status: bot.isRunning, asset: base, balance: baseAsset.balance, usdValue: baseAsset.usdValue }
    ];
  }).filter(b => b.balance > 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Here is your automated portfolio.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={loadDashboard} disabled={loading}>
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
          Refresh Assets
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="backdrop-blur-sm bg-card/40 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Asset Value</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-primary">USD {totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-card/40 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Connected Subaccounts</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-primary">{subaccounts.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        
        <div className="space-y-6 flex flex-col">
            {/* Assets in % (Pie Chart) */}
            <Card className="backdrop-blur-sm bg-card/40 border-primary/10 flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-blue-400" /> Assets in %</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
                {assets.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">No assets found</div>
                ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend verticalAlign="top" height={36} formatter={(value, entry, index) => {
                        const percent = ((pieData[index].value / totalUsd) * 100).toFixed(0);
                        return <span className="text-foreground">{value} ({percent}%)</span>;
                    }}/>
                    </PieChart>
                </ResponsiveContainer>
                )}
            </CardContent>
            </Card>

            {/* Subaccounts Breakdown */}
            <Card className="backdrop-blur-sm bg-card/40 border-primary/10">
                <CardHeader className="py-4">
                <CardTitle className="text-lg">Subaccount Equity</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-secondary/30">
                    <TableRow>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Exchange</TableHead>
                        <TableHead className="text-right">Total Equity</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {subaccounts.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No subaccounts connected</TableCell></TableRow>
                    ) : (
                        subaccounts.map((sub) => (
                        <TableRow key={sub.id}>
                            <TableCell className="font-medium text-primary">{sub.name}</TableCell>
                            <TableCell className="capitalize">{sub.exchange}</TableCell>
                            <TableCell className="text-right">${sub.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>

        {/* Right Column Tables */}
        <div className="space-y-6 flex flex-col">
          
          {/* Assets in USD */}
          <Card className="backdrop-blur-sm bg-card/40 border-primary/10">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Assets in USD</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="w-[100px]">Asset</TableHead>
                    <TableHead>USD Value</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No assets found</TableCell></TableRow>
                  ) : (
                    assets.map((a) => (
                      <TableRow key={a.asset}>
                        <TableCell className="font-medium">{a.asset}</TableCell>
                        <TableCell>${a.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">{a.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Bot Assets in USD */}
          <Card className="backdrop-blur-sm bg-card/40 border-primary/10">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Bot Assets in USD</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead>Bot Name</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>USD Value</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="text-right">Bot Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {botAssets.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No active bot assets</TableCell></TableRow>
                  ) : (
                    botAssets.map((b, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-blue-400">{b.botName}</TableCell>
                        <TableCell>{b.asset}</TableCell>
                        <TableCell>${b.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell>{b.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={b.status ? 'text-emerald-400 border-emerald-400/20' : 'text-muted-foreground'}>
                            {b.status ? 'Active' : 'Stopped'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
