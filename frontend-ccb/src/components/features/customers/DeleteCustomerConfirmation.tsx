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

interface DeleteCustomerConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DeleteCustomerConfirmation({
  open,
  onOpenChange,
  customerName,
  onConfirm,
  isLoading,
}: DeleteCustomerConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Tem certeza que deseja excluir o cliente <span className="font-medium">{customerName}</span>?
              </p>
              <p className="text-destructive">
                ⚠️ Esta ação não pode ser desfeita. Todos os dados do cliente serão permanentemente removidos.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? 'Excluindo...' : 'Excluir Cliente'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
