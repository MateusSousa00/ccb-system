'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useSimulations } from '@/hooks/useSimulations';
import { usePagination } from '@/hooks/usePagination';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { SimulationsTable } from '@/components/features/simulations/SimulationsTable';

export function SimulationsClient() {
  const { page, limit, nextPage, prevPage } = usePagination();
  const { data, isLoading, error } = useSimulations({ page, limit });

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-500">Erro ao carregar simulações</p>
      </div>
    );
  }

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulações"
        description="Gerencie as simulações de empréstimo"
        action={
          <Link href="/simulations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Simulação
            </Button>
          </Link>
        }
      />

      {!data?.simulations || data.simulations.length === 0 ? (
        <EmptyState
          message="Nenhuma simulação cadastrada"
          actionLabel="Criar Primeira Simulação"
          actionHref="/simulations/new"
        />
      ) : (
        <>
          <SimulationsTable simulations={data.simulations} />

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
