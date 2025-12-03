'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers';
import { usePagination } from '@/hooks/usePagination';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { CustomersTable } from '@/components/features/customers/CustomersTable';
import { DeleteCustomerConfirmation } from '@/components/features/customers/DeleteCustomerConfirmation';

export function CustomersClient() {
  const { page, limit, nextPage, prevPage } = usePagination();
  const { data, isLoading, error } = useCustomers({ page, limit });
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; name: string } | null>(null);
  const deleteCustomer = useDeleteCustomer();

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteDialog({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog) return;

    try {
      await deleteCustomer.mutateAsync(deleteDialog.id);
      toast.success('Cliente deletado com sucesso!');
      setDeleteDialog(null);
    } catch (error) {
      toast.error('Erro ao deletar cliente');
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-500">Erro ao carregar clientes</p>
      </div>
    );
  }

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie os clientes do sistema"
        action={
          <Link href="/customers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </Link>
        }
      />

      {!data?.customers || data.customers.length === 0 ? (
        <EmptyState
          message="Nenhum cliente cadastrado"
          actionLabel="Cadastrar Primeiro Cliente"
          actionHref="/customers/new"
        />
      ) : (
        <>
          <CustomersTable customers={data.customers} onDelete={handleDeleteClick} />

          {data && data.totalPages > 1 && (
            <PaginationControls
              page={page}
              totalPages={data.totalPages}
              onPrevious={prevPage}
              onNext={nextPage}
            />
          )}
        </>
      )}

      <DeleteCustomerConfirmation
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
        customerName={deleteDialog?.name || ''}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteCustomer.isPending}
      />
    </div>
  );
}
