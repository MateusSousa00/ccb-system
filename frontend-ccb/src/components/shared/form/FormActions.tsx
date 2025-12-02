import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel?: () => void;
  cancelHref?: string;
  cancelLabel?: string;
  submitLabel: string;
  loadingLabel: string;
  isPending: boolean;
  disabled?: boolean;
}

export function FormActions({
  onCancel,
  cancelHref,
  cancelLabel = 'Cancelar',
  submitLabel,
  loadingLabel,
  isPending,
  disabled = false,
}: FormActionsProps) {
  const cancelButton = (
    <Button variant="outline" type="button" onClick={onCancel}>
      {cancelLabel}
    </Button>
  );

  return (
    <div className="flex justify-end gap-4">
      {(onCancel || cancelHref) && (
        cancelHref ? (
          <Link href={cancelHref}>{cancelButton}</Link>
        ) : (
          cancelButton
        )
      )}
      <Button type="submit" disabled={isPending || disabled}>
        {isPending ? loadingLabel : submitLabel}
      </Button>
    </div>
  );
}
