import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { type User } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  user: User;
  onSignOut: () => void;
}

export function DashboardHeader({ user, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Mini Motion</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <Button variant="outline" size="sm" onClick={onSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
