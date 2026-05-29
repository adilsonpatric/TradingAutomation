import Link from 'next/link';
import { Home, Bot, Settings, Activity } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-card/50 h-screen flex flex-col p-4 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Activity className="w-6 h-6 text-primary" />
        <span className="font-bold text-lg tracking-tight">Signum HFT</span>
      </div>
      
      <nav className="flex-1 flex flex-col gap-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link href="/bots" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <Bot className="w-5 h-5" />
          <span>Bots & Strategies</span>
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors mt-auto">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  );
}
