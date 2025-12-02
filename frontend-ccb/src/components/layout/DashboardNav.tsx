import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';

const navItems = [
  {
    href: '/simulations',
    label: 'Simulações',
    icon: Calculator,
  },
  {
    href: '/customers',
    label: 'Clientes',
    icon: Users,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex shrink-0 items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Sistema CCB
              </h1>
            </div>
            <div className="ml-4 flex space-x-2 sm:ml-10 sm:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                  >
                    <Icon className="mr-1 h-4 w-4 sm:mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
