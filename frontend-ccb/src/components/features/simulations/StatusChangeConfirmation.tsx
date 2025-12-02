import { SimulationStatus } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StatusChangeConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: SimulationStatus;
  newStatus: SimulationStatus | null;
  onConfirm: () => void;
  isLoading: boolean;
}

const statusLabels: Record<SimulationStatus, string> = {
  [SimulationStatus.PENDING]: 'Pendente',
  [SimulationStatus.APPROVED]: 'Aprovada',
  [SimulationStatus.REJECTED]: 'Rejeitada',
  [SimulationStatus.CONVERTED]: 'Convertida',
};

const getStatusChangeConfig = (newStatus: SimulationStatus) => {
  switch (newStatus) {
    case SimulationStatus.APPROVED:
      return {
        title: 'Confirmar Aprovação',
        message: 'Esta simulação será marcada como aprovada. Deseja continuar?',
        confirmLabel: 'Aprovar',
        variant: 'default' as const,
      };
    case SimulationStatus.REJECTED:
      return {
        title: 'Confirmar Rejeição',
        message: '⚠️ Esta simulação será rejeitada. Deseja continuar?',
        confirmLabel: 'Rejeitar',
        variant: 'destructive' as const,
      };
    case SimulationStatus.CONVERTED:
      return {
        title: 'Confirmar Conversão',
        message: 'Esta simulação será convertida em contrato. Deseja continuar?',
        confirmLabel: 'Converter',
        variant: 'default' as const,
      };
    case SimulationStatus.PENDING:
    default:
      return {
        title: 'Reverter para Pendente',
        message: 'O status será alterado para pendente. Deseja continuar?',
        confirmLabel: 'Confirmar',
        variant: 'default' as const,
      };
  }
};

export function StatusChangeConfirmation({
  open,
  onOpenChange,
  currentStatus,
  newStatus,
  onConfirm,
  isLoading,
}: StatusChangeConfirmationProps) {
  if (!newStatus) return null;

  const config = getStatusChangeConfig(newStatus);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Status atual:</span> {statusLabels[currentStatus]}
            </div>
            <div className="text-sm">
              <span className="font-medium">Novo status:</span> {statusLabels[newStatus]}
            </div>
            <p className="mt-2">{config.message}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={
              config.variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
                : undefined
            }
          >
            {isLoading ? 'Atualizando...' : config.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
