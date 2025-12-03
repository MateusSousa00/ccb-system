'use client';

import { use } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useCustomer } from '@/hooks/useCustomers';
import { useSimulations } from '@/hooks/useSimulations';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { CustomerDetailsCard } from '@/components/features/customers/CustomerDetailsCard';
import { CustomerSimulationsSection } from '@/components/features/customers/CustomerSimulationsSection';

export default function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: customer, isLoading, error } = useCustomer(id);
  const { data: simulationsData } = useSimulations({ customerId: id });

  if (isLoading) return <LoadingState />;

  if (error || !customer) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-500">Cliente não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description="Detalhes do cliente"
        backHref="/customers"
        action={
          <Link href={`/customers/${id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Editar Cliente
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6">
        <CustomerDetailsCard customer={customer} />

        {simulationsData?.simulations && (
          <CustomerSimulationsSection simulations={simulationsData.simulations} />
        )}
      </div>
    </div>
  );
}
