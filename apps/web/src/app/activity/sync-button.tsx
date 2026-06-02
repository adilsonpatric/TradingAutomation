"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SyncButton() {
    const [isSyncing, setIsSyncing] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setIsSyncing(true);
        toast.loading("Syncing with exchange...", { id: 'sync' });
        
        try {
            // Using the hardcoded execution engine URL or from env. Currently we assume engine is on 4000.
            const engineUrl = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:4000';
            
            const res = await fetch(`${engineUrl}/api/sync`, {
                method: 'POST',
            });
            
            if (!res.ok) throw new Error("Failed to sync");
            
            const data = await res.json();
            
            if (data.success) {
                toast.success(`Sync complete! Closed ${data.synced} trades.`, { id: 'sync' });
                router.refresh();
            } else {
                toast.error(data.error || "Sync failed", { id: 'sync' });
            }
        } catch (error: any) {
            toast.error(error.message, { id: 'sync' });
        } finally {
            setIsSyncing(false);
        }
    }

    return (
        <Button onClick={handleSync} disabled={isSyncing} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Force Sync'}
        </Button>
    )
}
