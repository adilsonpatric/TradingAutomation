"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Trash2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTransition } from "react"
import { deleteTrade, exportTradeToPortaIQ } from "@/actions/trades"
import { toast } from "sonner"
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
} from "@/components/ui/alert-dialog"

export type Trade = {
  id: number
  botName: string | null
  symbol: string
  side: string
  price: number
  amount: number
  timestamp: Date | null
  isPaperTrading: boolean
  status: string
  pnl: number | null
  portaiqSynced: boolean
}

const ActionsCell = ({ trade }: { trade: Trade }) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTrade(trade.id);
      toast.success("Trade deleted successfully");
    });
  };

  const handleExport = () => {
    startTransition(async () => {
      try {
        const res = await exportTradeToPortaIQ(trade.id);
        if (res.success) {
          toast.success("Trade exported to PortaIQ successfully!");
        }
      } catch (e: any) {
        toast.error("Failed to export: " + e.message);
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={handleExport} disabled={isPending} title="Export to PortaIQ Journal">
        <BookOpen className="h-4 w-4 text-blue-500" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="ghost" size="icon" disabled={isPending} title="Delete Trade" />}>
          <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this trade?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trade from your local database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export const columns: ColumnDef<Trade>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const rawTimestamp = row.getValue("timestamp") as Date | null
      if (!rawTimestamp) return <div className="text-muted-foreground">Unknown</div>;
      
      let timeMs = rawTimestamp.getTime();
      // Fix for sqlite integer millisecond bug (if year is 58389, it was multiplied by 1000)
      if (timeMs > 253402300799000) { 
        timeMs = Math.floor(timeMs / 1000);
      }
      
      return <div className="whitespace-nowrap text-muted-foreground">{new Date(timeMs).toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
    },
  },
  {
    accessorKey: "botName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bot
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("botName") || 'Deleted Bot'}</div>,
  },
  {
    accessorKey: "symbol",
    header: "Pair",
    cell: ({ row }) => <div className="font-medium">{row.getValue("symbol")}</div>,
  },
  {
    id: "type",
    accessorFn: (row) => row.isPaperTrading ? "Paper" : "Live",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return type === "Paper" ? (
        <Badge variant="outline" className="text-yellow-500 border-yellow-500/20 bg-yellow-500/10">Paper</Badge>
      ) : (
        <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">Live</Badge>
      )
    },
  },
  {
    accessorKey: "side",
    header: "Side",
    cell: ({ row }) => {
      const side = row.getValue("side") as string
      return (
        <span className={`font-semibold uppercase ${side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
          {side}
        </span>
      )
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="">{row.getValue("amount")}</div>,
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(price)
 
      return <div className="text-right font-mono text-muted-foreground">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const synced = row.original.portaiqSynced
      return (
        <div className="flex items-center gap-2">
          {status === "closed" ? (
            <Badge variant="outline" className="text-gray-400 border-gray-500/20 bg-gray-500/10 capitalize">{status}</Badge>
          ) : (
            <Badge variant="outline" className="text-blue-400 border-blue-500/20 bg-blue-500/10 capitalize">{status || 'open'}</Badge>
          )}
          {synced && (
            <Badge variant="outline" className="text-sky-500 border-sky-500/20 bg-sky-500/10" title="Synced to StockIQ">☁️</Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "pnl",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PnL ($)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const pnl = row.getValue("pnl") as number | null
      if (pnl === null || pnl === undefined) return <div className="text-right font-mono text-muted-foreground">-</div>
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        signDisplay: "always",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(pnl)
      const color = pnl >= 0 ? "text-green-500" : "text-red-500"
      return <div className={`text-right font-mono ${color}`}>{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell trade={row.original} />
  }
]
