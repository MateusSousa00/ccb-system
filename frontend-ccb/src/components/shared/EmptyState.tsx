import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <p className="text-gray-500">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button className="mt-4">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
