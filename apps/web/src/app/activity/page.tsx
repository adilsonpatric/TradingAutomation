import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getRecentTrades } from "@/actions/trades";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { SyncButton } from "./sync-button";

export default async function ActivityPage() {
  const trades = await getRecentTrades();

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Activity</h1>
          <p className="text-muted-foreground mt-2">
            Real-time log of all trades executed by your bots.
          </p>
        </div>
        <SyncButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>Showing the last 100 trades across all bots</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={trades as any} />
        </CardContent>
      </Card>
    </div>
  );
}
