import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowRight, ExternalLink, Video } from "lucide-react";

export default function GuidePage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exchange Setup Guide</h1>
        <p className="text-muted-foreground mt-2">
          Step-by-step instructions to prepare your exchange accounts for automated trading.
        </p>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center space-y-4">
        <h2 className="text-xl font-semibold text-primary">We require each Bot to run on its own Subaccount!</h2>
        <p className="text-muted-foreground">
          This is best practice and avoids multiple issues later on. Keeping strategies isolated prevents conflicts with balances and positions.
        </p>
        <p className="text-sm text-muted-foreground">
          If you are <strong>migrating from another tool</strong>, you can use the Subaccounts you already have, just <strong>create a new API Key</strong> based on the instructions below.
        </p>
      </div>

      <Tabs defaultValue="bybit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bybit">Bybit Setup</TabsTrigger>
          <TabsTrigger value="binance">Binance Setup</TabsTrigger>
        </TabsList>
        
        {/* BYBIT CONTENT */}
        <TabsContent value="bybit" className="mt-6 space-y-6">
          <Card className="bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">1. Create Subaccount</CardTitle>
              <CardDescription>Isolate your bot's funds and positions using a dedicated subaccount.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Login to your <a href="https://www.bybit.com/" target="_blank" className="text-primary hover:underline">Bybit account</a> and go to your <strong>Subaccounts</strong> page.</li>
                <li>Click on the <strong>Create Subaccount</strong> button in the top right.</li>
                <li>Choose <strong>Standard Subaccount</strong> (Do not choose Custodial).</li>
                <li>Give it a descriptive name (e.g., <code className="bg-secondary px-1 py-0.5 rounded text-primary">TradeAuto_BTC</code>).</li>
                <li>Select <strong>Unified Trading Account (UTA)</strong> if prompted, as it supports both Spot and Futures smoothly.</li>
                <li>Click <strong>Confirm</strong>.</li>
              </ol>

              {/* Placeholder for real screenshot */}
              <div className="mt-6 border-2 border-dashed border-muted rounded-lg p-12 text-center flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
                <p className="font-medium mb-2">Screenshot Placeholder: Bybit Create Subaccount</p>
                <p className="text-xs">Save your screenshot as <code className="bg-background px-1 py-0.5 rounded">public/images/bybit-subaccount.png</code> and update this section.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">2. Create API Key</CardTitle>
              <CardDescription>Generate the keys needed for the platform to execute trades.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Inside your new Subaccount row, click on <strong>API Management</strong>.</li>
                <li>Click <strong>Create New Key</strong> and choose <strong>System-generated API Keys</strong>.</li>
                <li>Set the API Key usage to <strong>API Transaction</strong>.</li>
                <li>Name the API Key (e.g., <code className="bg-secondary px-1 py-0.5 rounded text-primary">Automation_Key</code>).</li>
                <li>Check the <strong>Read-Write</strong> permission.</li>
                <li>
                  Under permissions, you must check the following based on your bot type:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><strong className="text-foreground">For Spot Trading:</strong> Check <code className="text-primary">Spot Trade</code></li>
                    <li><strong className="text-foreground">For Futures/Derivatives:</strong> Check <code className="text-primary">Orders</code> and <code className="text-primary">Positions</code> under the Derivatives section.</li>
                  </ul>
                </li>
                <li>Submit and copy the <strong>API Key</strong> and <strong>API Secret</strong> into the Settings page of this app.</li>
              </ol>

              <div className="mt-6 border-2 border-dashed border-muted rounded-lg p-12 text-center flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
                <p className="font-medium mb-2">Screenshot Placeholder: Bybit API Permissions</p>
                <p className="text-xs">Save your screenshot as <code className="bg-background px-1 py-0.5 rounded">public/images/bybit-api.png</code> and update this section.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">3. Fund Account</CardTitle>
              <CardDescription>Transfer capital into your bot's isolated environment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Navigate to the <strong>Assets</strong> &gt; <strong>Transfer</strong> page on Bybit.</li>
                <li>Set the <strong>From</strong> account to your Main Account (Funding or Spot).</li>
                <li>Set the <strong>To</strong> account to your new Subaccount.</li>
                <li>Select the <strong>Unified Trading Account</strong> wallet of the Subaccount.</li>
                <li>Select the coin (e.g., USDT) and the amount to allocate to this specific bot.</li>
                <li>Click <strong>Confirm</strong>. You are now ready to trade!</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BINANCE CONTENT */}
        <TabsContent value="binance" className="mt-6 space-y-6">
          <Card className="bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">1. Create Subaccount</CardTitle>
              <CardDescription>Isolate your bot's funds and positions using a dedicated subaccount.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Login to your <a href="https://www.binance.com/" target="_blank" className="text-primary hover:underline">Binance account</a> and go to the <strong>Dashboard</strong> &gt; <strong>Sub-Accounts</strong>.</li>
                <li>Click on <strong>Create Sub Account</strong> in the top right.</li>
                <li>Choose <strong>Create with Virtual Email</strong> (simplest method).</li>
                <li>Enter a name for the subaccount (e.g., <code className="bg-secondary px-1 py-0.5 rounded text-primary">TradeAuto_ETH</code>).</li>
                <li>Click <strong>Create Sub Account</strong>.</li>
              </ol>

              {/* Placeholder for real screenshot */}
              <div className="mt-6 border-2 border-dashed border-muted rounded-lg p-12 text-center flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
                <p className="font-medium mb-2">Screenshot Placeholder: Binance Create Subaccount</p>
                <p className="text-xs">Save your screenshot as <code className="bg-background px-1 py-0.5 rounded">public/images/binance-subaccount.png</code> and update this section.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">2. Create API Key</CardTitle>
              <CardDescription>Generate the keys needed for the platform to execute trades.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Inside the Sub-Account Management menu, click on <strong>API Management</strong>.</li>
                <li>Click <strong>Create API</strong> and select your newly created Subaccount from the dropdown.</li>
                <li>Label the API key and complete the security verification.</li>
                <li>Click <strong>Edit Restrictions</strong> on the newly created key.</li>
                <li>
                  Check the following permissions based on your bot type:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><strong className="text-foreground">For Spot Trading:</strong> Check <code className="text-primary">Enable Spot & Margin Trading</code></li>
                    <li><strong className="text-foreground">For Futures:</strong> Check <code className="text-primary">Enable Futures</code>. (Note: You must enable Futures on the subaccount first in the Asset Management tab).</li>
                  </ul>
                </li>
                <li>Save and copy the <strong>API Key</strong> and <strong>Secret Key</strong> into the Settings page of this app.</li>
              </ol>

              <div className="mt-6 border-2 border-dashed border-muted rounded-lg p-12 text-center flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
                <p className="font-medium mb-2">Screenshot Placeholder: Binance API Permissions</p>
                <p className="text-xs">Save your screenshot as <code className="bg-background px-1 py-0.5 rounded">public/images/binance-api.png</code> and update this section.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">3. Fund Account</CardTitle>
              <CardDescription>Transfer capital into your bot's isolated environment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Navigate to the <strong>Sub-Accounts</strong> &gt; <strong>Asset Management</strong> page on Binance.</li>
                <li>Click <strong>Transfer In</strong> next to your Subaccount.</li>
                <li>Select the coin (e.g., USDT) and transfer from your Main Account Spot Wallet to the Subaccount Spot Wallet.</li>
                <li>
                  <strong>If trading Futures:</strong> You must do a second transfer from the Subaccount's Spot Wallet to the Subaccount's Futures Wallet using the <strong>Transfer</strong> button.
                </li>
                <li>You are now ready to trade!</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
