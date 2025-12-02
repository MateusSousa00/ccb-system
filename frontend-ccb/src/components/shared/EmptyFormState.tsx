import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyFormStateProps {
  message: string;
  actionLabel: string;
  actionHref: string;
}

export function EmptyFormState({
  message,
  actionLabel,
  actionHref,
}: EmptyFormStateProps) {
  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <p className="text-sm text-yellow-800">{message}</p>
      <Link href={actionHref}>
        <Button className="mt-4" size="sm">
          {actionLabel}
        </Button>
      </Link>
    </div>
  );
}
