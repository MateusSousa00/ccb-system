'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { usePagination } from '@/hooks/usePagination';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { CustomersTable } from '@/components/features/customers/CustomersTable';

export function CustomersClient() {
  const { page, limit, nextPage, prevPage } = usePagination();
  const { data, isLoading, error } = useCustomers({ page, limit });

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
          <CustomersTable customers={data.customers} />

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
    </div>
  );
}
