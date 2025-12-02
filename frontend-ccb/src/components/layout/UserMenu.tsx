import { LogOut } from 'lucide-react';
import { useUser, useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const { data: data } = useUser();
  const logout = useLogout();

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <div className="hidden sm:block text-sm">
        <p className="font-medium text-gray-900">{data?.user?.name}</p>
        <p className="text-xs text-gray-500">{data?.user?.role}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={logout}
        title="Sair"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
